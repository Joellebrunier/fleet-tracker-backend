import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * Ubiwan GPS Adapter (now api-fleet.moncoyote.com)
 *
 * API Docs: https://api-fleet.moncoyote.com/doc/public/index.html
 * Auth: GET /auth?u={username}&l={license}&k={serverKey}&p={md5password}
 * Returns a token for subsequent requests.
 *
 * Vehicles/positions: GET /user_session?token={token}&uid_device={id}&start_time=...&end_time=...
 */
@Injectable()
export class UbiwanAdapter implements IGpsProvider, OnModuleInit {
  private dataCallback: ((data: NormalizedGPSData) => void) | null = null;
  private connected = false;
  private lastUpdate: Date | null = null;
  private vehicleCount = 0;
  private authToken: string | null = null;
  private readonly logger = new Logger(UbiwanAdapter.name);

  private apiUrl: string;
  private username: string;
  private password: string;
  private serverName: string;
  private serverKey: string;
  private license: string;

  constructor(
    private configService: ConfigService,
    private normalizer: DataNormalizerService,
  ) {
    // API has been redirected from api.ubiwan.net to api-fleet.moncoyote.com
    this.apiUrl = this.configService.get<string>('UBIWAN_API_URL', 'https://api-fleet.moncoyote.com');
    this.username = this.configService.get<string>('UBIWAN_USERNAME', '');
    this.password = this.configService.get<string>('UBIWAN_PASSWORD', '');
    this.serverName = this.configService.get<string>('UBIWAN_SERVER_NAME', 'Phoenix');
    this.serverKey = this.configService.get<string>('UBIWAN_SERVER_KEY', '');
    this.license = this.configService.get<string>('UBIWAN_LICENSE', '');
  }

  async onModuleInit() {
    if (this.username && this.password && this.license) {
      await this.connect();
    } else {
      this.logger.warn('Ubiwan credentials not configured, adapter disabled');
    }
  }

  /**
   * Authenticate with Ubiwan API
   * GET /auth?u={username}&l={license}&k={serverKey}&p={md5password}
   */
  async connect(): Promise<void> {
    try {
      const md5Password = createHash('md5').update(this.password).digest('hex');

      const authUrl = `${this.apiUrl}/auth?u=${encodeURIComponent(this.username)}&l=${encodeURIComponent(this.license)}&k=${encodeURIComponent(this.serverKey)}&p=${md5Password}`;

      this.logger.log(`Ubiwan: authenticating as ${this.username} on ${this.serverName}...`);

      const authResponse = await fetch(authUrl, {
        headers: { 'Accept': 'application/json' },
      });

      if (authResponse.ok) {
        const authData = (await authResponse.json()) as any;
        // API returns token in the response
        this.authToken = authData.token || authData.sessionId || authData.access_token || authData.result;

        if (this.authToken) {
          this.connected = true;
          this.logger.log(`Ubiwan adapter connected (Server: ${this.serverName}, Account: INEHA FINANCE)`);
        } else {
          this.logger.warn(`Ubiwan auth returned OK but no token found in response: ${JSON.stringify(authData).substring(0, 200)}`);
          // Try using the whole response as token if it's a string
          if (typeof authData === 'string') {
            this.authToken = authData;
            this.connected = true;
            this.logger.log('Ubiwan: using raw response as token');
          }
        }
      } else {
        const body = await authResponse.text();
        this.logger.error(`Ubiwan auth failed: ${authResponse.status} - ${body.substring(0, 300)}`);

        // Fallback: try the old API URL
        if (this.apiUrl !== 'https://api.ubiwan.net') {
          this.logger.log('Ubiwan: trying fallback to api.ubiwan.net...');
          const fallbackUrl = `https://api.ubiwan.net/auth?u=${encodeURIComponent(this.username)}&l=${encodeURIComponent(this.license)}&k=${encodeURIComponent(this.serverKey)}&p=${md5Password}`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: { 'Accept': 'application/json' },
            redirect: 'follow',
          });
          if (fallbackResponse.ok) {
            const fallbackData = (await fallbackResponse.json()) as any;
            this.authToken = fallbackData.token || fallbackData.result;
            if (this.authToken) {
              this.connected = true;
              this.apiUrl = 'https://api.ubiwan.net';
              this.logger.log('Ubiwan: connected via fallback URL');
            }
          }
        }
      }
    } catch (error) {
      this.logger.error('Ubiwan connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.authToken = null;
    this.logger.log('Ubiwan adapter disconnected');
  }

  onData(callback: (data: NormalizedGPSData) => void): void {
    this.dataCallback = callback;
  }

  /**
   * Poll Ubiwan API every 2 minutes
   * Uses the /site endpoint or similar to list devices, then fetches positions
   */
  @Cron('*/2 * * * *')
  async pollUbiwanApi(): Promise<void> {
    if (!this.connected || !this.dataCallback || !this.authToken) return;

    try {
      // Try fetching site/device list
      const response = await fetch(
        `${this.apiUrl}/site?token=${encodeURIComponent(this.authToken)}`,
        { headers: { 'Accept': 'application/json' } },
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logger.warn('Ubiwan session expired, reconnecting...');
          await this.connect();
          return;
        }
        this.logger.error(`Ubiwan API error: ${response.status} ${response.statusText}`);
        return;
      }

      const data = (await response.json()) as any;

      // The API structure may vary - handle different response shapes
      const devices = Array.isArray(data)
        ? data
        : data.devices || data.vehicles || data.items || data.result || [];

      let totalProcessed = 0;

      for (const device of (Array.isArray(devices) ? devices : [])) {
        try {
          const normalized = this.normalizeUbiwanData(device);
          if (normalized && this.normalizer.validate(normalized)) {
            this.dataCallback(normalized);
            totalProcessed++;
          }
        } catch (err) {
          this.logger.warn(`Failed to normalize Ubiwan device ${device.uid_device || device.id || device.name}: ${err}`);
        }
      }

      this.vehicleCount = totalProcessed;
      this.lastUpdate = new Date();
      this.logger.debug(`Ubiwan poll complete: ${totalProcessed} vehicles processed`);
    } catch (error) {
      this.logger.error('Ubiwan polling error:', error);
    }
  }

  /**
   * Fetch vehicle session/history between two dates
   * GET /user_session?token={token}&uid_device={deviceId}&start_time={start}&end_time={end}
   */
  async getVehicleHistory(deviceId: string, startDate: string, endDate: string): Promise<any> {
    if (!this.authToken) throw new Error('Not authenticated');

    const response = await fetch(
      `${this.apiUrl}/user_session?token=${encodeURIComponent(this.authToken)}&uid_device=${encodeURIComponent(deviceId)}&start_time=${encodeURIComponent(startDate)}&end_time=${encodeURIComponent(endDate)}`,
      { headers: { 'Accept': 'application/json' } },
    );

    if (!response.ok) {
      throw new Error(`Ubiwan API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Normalize Ubiwan device data to standard GPS format
   */
  private normalizeUbiwanData(device: any): NormalizedGPSData | null {
    const lat = device.latitude || device.lat || device.gps?.latitude || device.position?.latitude;
    const lng = device.longitude || device.lng || device.lon || device.gps?.longitude || device.position?.longitude;

    if (!lat || !lng) return null;

    return {
      vehicleId: String(device.uid_device || device.id || device.vehicleId || device.imei),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(device.speed || device.gps?.speed || device.position?.speed || 0),
      heading: parseFloat(device.heading || device.cap || device.gps?.heading || device.position?.heading || 0),
      altitude: device.altitude ? parseFloat(device.altitude) : undefined,
      timestamp: device.timestamp
        ? new Date(device.timestamp)
        : device.lastUpdate
          ? new Date(device.lastUpdate)
          : device.date
            ? new Date(device.date)
            : new Date(),
      provider: 'UBIWAN' as any,
      raw: device,
    };
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
