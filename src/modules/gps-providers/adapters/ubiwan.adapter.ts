import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * Ubiwan GPS Adapter (api-fleet.moncoyote.com / api.ubiwan.net v53)
 *
 * Auth: GET /v53/auth?u={username}&l={license}&k={serverKey}&p={md5password}
 * Returns { result: 201, token: "...", auth: { ... } }
 *
 * Positions: GET /v53/location?token={token}&timestamp=0
 * Returns { location: { data: [ { uid, registration, latitude, longitude, speed_current, course, location_date, dev_hw_id, ... } ] } }
 *
 * The password is already MD5-hashed in the env var.
 */
@Injectable()
export class UbiwanAdapter implements IGpsProvider, OnModuleInit {
  private dataCallback: ((data: NormalizedGPSData) => void) | null = null;
  private connected = false;
  private lastUpdate: Date | null = null;
  private vehicleCount = 0;
  private authToken: string | null = null;
  private tokenExpiry: number = 0; // re-auth every 4 hours
  private readonly logger = new Logger(UbiwanAdapter.name);

  private apiUrl: string;
  private username: string;
  private md5Password: string;
  private serverKey: string;
  private license: string;

  constructor(
    private configService: ConfigService,
    private normalizer: DataNormalizerService,
  ) {
    // api.ubiwan.net redirects 301 → api-fleet.moncoyote.com
    this.apiUrl = this.configService.get<string>(
      'UBIWAN_API_URL',
      'https://api-fleet.moncoyote.com',
    );
    this.username = this.configService.get<string>('UBIWAN_USERNAME', '');
    // The password env var stores the MD5 hash directly
    this.md5Password = this.configService.get<string>('UBIWAN_PASSWORD', '');
    this.serverKey = this.configService.get<string>('UBIWAN_SERVER_KEY', '');
    this.license = this.configService.get<string>('UBIWAN_LICENSE', '');
  }

  async onModuleInit() {
    if (this.username && this.md5Password && this.license) {
      await this.connect();
    } else {
      this.logger.warn('Ubiwan credentials not configured, adapter disabled');
    }
  }

  /**
   * Authenticate with Ubiwan API
   * GET /v53/auth?u={username}&l={license}&k={serverKey}&p={md5password}
   * Response: { result: 201, token: "hex", auth: { uid, company, ... } }
   */
  async connect(): Promise<void> {
    try {
      const authUrl = `${this.apiUrl}/v53/auth?u=${encodeURIComponent(this.username)}&l=${encodeURIComponent(this.license)}&k=${encodeURIComponent(this.serverKey)}&p=${this.md5Password}`;

      this.logger.log(`Ubiwan: authenticating as ${this.username}...`);

      const response = await fetch(authUrl, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.error(
          `Ubiwan auth failed: ${response.status} - ${body.substring(0, 300)}`,
        );
        return;
      }

      const authData = (await response.json()) as any;

      if (authData.result === 201 && authData.token) {
        this.authToken = authData.token;
        this.connected = true;
        this.tokenExpiry = Date.now() + 4 * 60 * 60 * 1000; // 4h
        const company = authData.auth?.company || 'unknown';
        this.logger.log(
          `Ubiwan adapter connected (company: ${company}, uid: ${authData.auth?.uid})`,
        );
      } else {
        this.logger.error(
          `Ubiwan auth unexpected result: ${JSON.stringify(authData).substring(0, 300)}`,
        );
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
   * Ensure we have a valid token, re-auth if expired
   */
  private async ensureAuth(): Promise<boolean> {
    if (!this.authToken || Date.now() > this.tokenExpiry) {
      this.logger.log('Ubiwan: token expired or missing, re-authenticating...');
      await this.connect();
    }
    return !!this.authToken;
  }

  /**
   * Poll Ubiwan API every 2 minutes using the /location endpoint
   * GET /v53/location?token={token}&timestamp=0
   *
   * Returns all devices with their last known position:
   * {
   *   location: {
   *     data: [{
   *       uid, registration, summary, latitude, longitude,
   *       speed_current, course, location_date, dev_hw_id,
   *       mileage, battery_level, address, ...
   *     }]
   *   }
   * }
   */
  @Cron('*/2 * * * *')
  async pollUbiwanApi(): Promise<void> {
    if (!this.dataCallback) return;

    const hasAuth = await this.ensureAuth();
    if (!hasAuth) return;

    try {
      const response = await fetch(
        `${this.apiUrl}/v53/location?token=${encodeURIComponent(this.authToken!)}&timestamp=0`,
        { headers: { Accept: 'application/json' } },
      );

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          this.logger.warn('Ubiwan session expired, reconnecting...');
          this.authToken = null;
          await this.connect();
          return;
        }
        this.logger.error(
          `Ubiwan API error: ${response.status} ${response.statusText}`,
        );
        return;
      }

      const data = (await response.json()) as any;

      // /location returns { result, location: { data: [...], summary: [...] } }
      const devices: any[] = data.location?.data || [];

      let totalProcessed = 0;

      for (const device of devices) {
        try {
          const normalized = this.normalizeUbiwanData(device);
          if (normalized && this.normalizer.validate(normalized)) {
            this.dataCallback(normalized);
            totalProcessed++;
          }
        } catch (err) {
          this.logger.warn(
            `Failed to normalize Ubiwan device ${device.uid}: ${err}`,
          );
        }
      }

      this.vehicleCount = totalProcessed;
      this.lastUpdate = new Date();
      this.logger.log(
        `Ubiwan poll complete: ${totalProcessed}/${devices.length} vehicles with GPS`,
      );
    } catch (error) {
      this.logger.error('Ubiwan polling error:', error);
    }
  }

  /**
   * Normalize Ubiwan /location device data to standard GPS format
   *
   * Key fields from Ubiwan:
   *   uid          - device UID (used as vehicleId → maps to metadata.ubiwanId)
   *   latitude     - decimal
   *   longitude    - decimal
   *   speed_current - km/h
   *   course       - heading in degrees
   *   location_date - Unix timestamp (seconds)
   *   dev_hw_id    - IMEI
   *   registration - license plate
   *   summary      - vehicle description
   */
  private normalizeUbiwanData(device: any): NormalizedGPSData | null {
    const lat = device.latitude;
    const lng = device.longitude;

    // Skip devices without GPS position
    if (lat == null || lng == null) return null;

    return {
      vehicleId: String(device.uid),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(device.speed_current || 0),
      heading: parseFloat(device.course || 0),
      altitude: undefined,
      timestamp: device.location_date
        ? new Date(device.location_date * 1000)
        : new Date(),
      provider: 'UBIWAN' as any,
      raw: {
        uid: device.uid,
        registration: device.registration,
        summary: device.summary,
        dev_hw_id: device.dev_hw_id,
        mileage: device.mileage,
        battery_level: device.battery_level,
        battery_volt: device.battery_volt,
        address: device.address,
        hardware: device.hardware,
      },
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
