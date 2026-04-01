import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * Echoes GPS Adapter (Neutral Server API)
 *
 * Swagger: https://api.neutral-server.com/
 * 2-step authentication:
 *   1. API Key → GET /api/accounts/{id}/privacy_key to list keys,
 *      or POST with {"features":[...]} to create one
 *   2. Privacy Key → all subsequent calls with "Authorization: Privacykey <token>"
 *
 * Endpoints:
 *   - Assets:          GET /api/accounts/{id}/assets
 *   - Last positions:  GET /api/accounts/{id}/reports/assets/{assetId}/last_locations?nbLocations=1
 *   - Locations:       GET /api/accounts/{id}/assets/{assetId}/locations?period={"start":ms,"end":ms}
 *   - Trips:           GET /api/accounts/{id}/assets/{assetId}/trips?period={"start":ms,"end":ms}
 */
@Injectable()
export class EchoesAdapter implements IGpsProvider, OnModuleInit {
  private dataCallback: ((data: NormalizedGPSData) => void) | null = null;
  private connected = false;
  private lastUpdate: Date | null = null;
  private vehicleCount = 0;
  private readonly logger = new Logger(EchoesAdapter.name);

  private apiUrl: string;
  private apiKey: string;
  private accountId: string;

  // Privacy Key cache (valid for 24h, we refresh at 20h)
  private privacyKey: string | null = null;
  private privacyKeyExpiry: number = 0;
  private readonly PRIVACY_KEY_REFRESH_MS = 20 * 60 * 60 * 1000; // 20 hours

  // Asset ID list cache (refreshed every poll)
  private assetIds: number[] = [];

  constructor(
    private configService: ConfigService,
    private normalizer: DataNormalizerService,
  ) {
    this.apiUrl = this.configService.get<string>('ECHOES_API_URL', 'https://api.neutral-server.com');
    this.apiKey = this.configService.get<string>('ECHOES_API_KEY', '');
    this.accountId = this.configService.get<string>('ECHOES_ACCOUNT_ID', '');
  }

  async onModuleInit() {
    if (this.apiKey && this.accountId) {
      await this.connect();
    } else {
      this.logger.warn('Echoes API key or account ID not configured, adapter disabled');
    }
  }

  /**
   * Get a valid Privacy Key, reusing cached one if not expired.
   * Step 1: GET existing keys with Apikey auth
   * Step 2: Pick the latest valid key, or create a new one
   */
  private async getPrivacyKey(): Promise<string> {
    const now = Date.now();

    // Return cached key if still valid
    if (this.privacyKey && now < this.privacyKeyExpiry) {
      return this.privacyKey;
    }

    this.logger.log('Refreshing Echoes Privacy Key...');

    // List existing privacy keys
    const listResponse = await fetch(
      `${this.apiUrl}/api/accounts/${this.accountId}/privacy_key`,
      {
        headers: {
          Authorization: `Apikey ${this.apiKey}`,
          Accept: 'application/json',
        },
      },
    );

    if (!listResponse.ok) {
      throw new Error(`Failed to list privacy keys: ${listResponse.status}`);
    }

    const keys = (await listResponse.json()) as any[];

    // Find valid key with LOCATION feature, expiring furthest in the future
    const validKeys = keys
      .filter(
        (k) =>
          k.expiredAt > now &&
          k.features &&
          k.features.includes('LOCATION'),
      )
      .sort((a, b) => b.expiredAt - a.expiredAt);

    if (validKeys.length > 0) {
      const best = validKeys[0];
      this.privacyKey = best.token;
      // Refresh when the key is 80% through its lifetime or after 20h, whichever is sooner
      this.privacyKeyExpiry = Math.min(
        now + this.PRIVACY_KEY_REFRESH_MS,
        best.expiredAt - 3600000, // 1h before actual expiry
      );
      this.logger.log(
        `Using existing Privacy Key (expires at ${new Date(best.expiredAt).toISOString()})`,
      );
      return this.privacyKey!;
    }

    // No valid key found — create a new one with LOCATION feature
    this.logger.log('Creating new Echoes Privacy Key...');
    const createResponse = await fetch(
      `${this.apiUrl}/api/accounts/${this.accountId}/privacy_key`,
      {
        method: 'POST',
        headers: {
          Authorization: `Apikey ${this.apiKey}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: [
            'LOCATION',
            'TRIPS',
            'SPEED',
            'ODOMETER',
            'GEOFENCING',
            'ENERGY',
          ],
        }),
      },
    );

    if (!createResponse.ok) {
      const body = await createResponse.text();
      throw new Error(`Failed to create privacy key: ${createResponse.status} - ${body}`);
    }

    const newKey = (await createResponse.json()) as any;
    this.privacyKey = newKey.token;
    this.privacyKeyExpiry = now + this.PRIVACY_KEY_REFRESH_MS;
    this.logger.log(`Created new Privacy Key: ${newKey.token?.substring(0, 8)}...`);
    return this.privacyKey!;
  }

  /**
   * Make an authenticated API call using the Privacy Key
   */
  private async apiCall(path: string): Promise<any> {
    const token = await this.getPrivacyKey();
    const response = await fetch(`${this.apiUrl}${path}`, {
      headers: {
        Authorization: `Privacykey ${token}`,
        Accept: 'application/json',
      },
    });

    if (response.status === 401) {
      // Privacy key expired, clear cache and retry once
      this.privacyKey = null;
      this.privacyKeyExpiry = 0;
      const newToken = await this.getPrivacyKey();
      const retryResponse = await fetch(`${this.apiUrl}${path}`, {
        headers: {
          Authorization: `Privacykey ${newToken}`,
          Accept: 'application/json',
        },
      });
      if (!retryResponse.ok) {
        throw new Error(`Echoes API error after retry: ${retryResponse.status}`);
      }
      return retryResponse.json();
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Echoes API error: ${response.status} - ${body.substring(0, 200)}`);
    }

    return response.json();
  }

  /**
   * Fetch all assets with pagination (100 per page).
   */
  private async fetchAllAssetIds(): Promise<number[]> {
    const ids: number[] = [];
    let offset = 0;
    const limit = 100;

    while (true) {
      const assets = await this.apiCall(
        `/api/accounts/${this.accountId}/assets?limit=${limit}&offset=${offset}`,
      );

      if (!Array.isArray(assets) || assets.length === 0) break;

      for (const a of assets) {
        ids.push(a.id);
      }

      if (assets.length < limit) break;
      offset += limit;
    }

    return ids;
  }

  async connect(): Promise<void> {
    try {
      // Verify we can get a privacy key and list all assets (paginated)
      await this.getPrivacyKey();
      this.assetIds = await this.fetchAllAssetIds();
      this.connected = true;
      this.logger.log(
        `Echoes adapter connected (Account: ${this.accountId}, ${this.assetIds.length} assets)`,
      );
    } catch (error) {
      this.logger.error('Echoes connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.privacyKey = null;
    this.privacyKeyExpiry = 0;
    this.logger.log('Echoes adapter disconnected');
  }

  onData(callback: (data: NormalizedGPSData) => void): void {
    this.dataCallback = callback;
  }

  /**
   * Poll Echoes API every 2 minutes.
   * Uses /reports/assets/{id}/last_locations for each asset to get latest position.
   * Processes assets in batches to avoid overwhelming the API.
   */
  @Cron('*/2 * * * *')
  async pollEchoesApi(): Promise<void> {
    if (!this.connected || !this.dataCallback) return;

    try {
      // Refresh asset list if empty (paginated fetch)
      if (this.assetIds.length === 0) {
        this.assetIds = await this.fetchAllAssetIds();
        this.logger.log(`Echoes: refreshed asset list, ${this.assetIds.length} assets`);
      }

      let totalProcessed = 0;

      // Fetch last_locations for each asset (batch of 5 concurrent)
      const batchSize = 5;
      for (let i = 0; i < this.assetIds.length; i += batchSize) {
        const batch = this.assetIds.slice(i, i + batchSize);

        const results = await Promise.allSettled(
          batch.map(async (assetId) => {
            try {
              const data = await this.apiCall(
                `/api/accounts/${this.accountId}/reports/assets/${assetId}/last_locations?nbLocations=1`,
              );

              if (Array.isArray(data) && data.length > 0) {
                const entry = data[0];
                const loc = entry.location || entry;
                const lat = loc.latitude;
                const lng = loc.longitude;

                if (lat && lng) {
                  const normalized: NormalizedGPSData = {
                    vehicleId: String(assetId),
                    lat: parseFloat(lat),
                    lng: parseFloat(lng),
                    speed: loc.speed ? parseFloat(loc.speed) : 0,
                    heading: loc.heading ? parseFloat(loc.heading) : 0,
                    altitude: loc.altitude ? parseFloat(loc.altitude) : undefined,
                    timestamp: loc.dateTime
                      ? new Date(loc.dateTime)
                      : new Date(),
                    provider: 'ECHOES' as any,
                    raw: entry,
                  };

                  if (this.normalizer.validate(normalized) && this.dataCallback) {
                    this.dataCallback(normalized);
                    return true;
                  }
                }
              }
              return false;
            } catch {
              return false;
            }
          }),
        );

        for (const r of results) {
          if (r.status === 'fulfilled' && r.value) totalProcessed++;
        }
      }

      this.vehicleCount = totalProcessed;
      this.lastUpdate = new Date();
      this.logger.debug(
        `Echoes poll complete: ${totalProcessed}/${this.assetIds.length} assets with positions`,
      );
    } catch (error) {
      this.logger.error('Echoes polling error:', error);
    }
  }

  async getStatus(): Promise<{
    connected: boolean;
    lastUpdate?: Date;
    vehicleCount?: number;
  }> {
    return {
      connected: this.connected,
      lastUpdate: this.lastUpdate || undefined,
      vehicleCount: this.vehicleCount,
    };
  }
}
