import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * Echoes GPS Adapter
 *
 * API Documentation: https://api.neutral-server.com/
 * Auth: Header "Authorization: Apikey <key>" or "Authorization: Privacykey <key>"
 * Vehicles endpoint: GET /api/assets (paginated, limit=100, offset=0)
 * Single vehicle: GET /api/assets/{uid}
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

  constructor(
    private configService: ConfigService,
    private normalizer: DataNormalizerService,
  ) {
    this.apiUrl = this.configService.get<string>('ECHOES_API_URL', 'https://api.neutral-server.com');
    this.apiKey = this.configService.get<string>('ECHOES_API_KEY', '');
    this.accountId = this.configService.get<string>('ECHOES_ACCOUNT_ID', '');
  }

  async onModuleInit() {
    if (this.apiKey) {
      await this.connect();
    } else {
      this.logger.warn('Echoes API key not configured, adapter disabled');
    }
  }

  async connect(): Promise<void> {
    try {
      // Test connection by fetching account info
      const response = await fetch(`${this.apiUrl}/api/accounts/me`, {
        headers: {
          'Authorization': this.apiKey,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        this.connected = true;
        this.logger.log(`Echoes adapter connected (Account ID: ${this.accountId})`);
      } else {
        this.logger.error(`Echoes connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Echoes connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('Echoes adapter disconnected');
  }

  onData(callback: (data: NormalizedGPSData) => void): void {
    this.dataCallback = callback;
  }

  /**
   * Poll Echoes API every 2 minutes
   * Fetches all vehicles with their latest positions
   * API: GET /api/assets?limit=100&offset=0
   * Pagination: iterate with offset until all vehicles are fetched
   */
  @Cron('*/2 * * * *')
  async pollEchoesApi(): Promise<void> {
    if (!this.connected || !this.dataCallback) return;

    try {
      let offset = 0;
      const limit = 100;
      let hasMore = true;
      let totalProcessed = 0;

      while (hasMore) {
        const response = await fetch(
          `${this.apiUrl}/api/assets?limit=${limit}&offset=${offset}`,
          {
            headers: {
              'Authorization': this.apiKey,
              'Accept': 'application/json',
            },
          },
        );

        if (!response.ok) {
          this.logger.error(`Echoes API error: ${response.status} ${response.statusText}`);
          break;
        }

        const data = (await response.json()) as any;
        const vehicles = data.items || data || [];

        if (!Array.isArray(vehicles) || vehicles.length === 0) {
          hasMore = false;
          break;
        }

        for (const vehicle of vehicles) {
          try {
            const normalized = this.normalizeEchoesData(vehicle);
            if (normalized && this.normalizer.validate(normalized)) {
              this.dataCallback(normalized);
              totalProcessed++;
            }
          } catch (err) {
            this.logger.warn(`Failed to normalize Echoes vehicle ${vehicle.uid || vehicle.id}: ${err}`);
          }
        }

        offset += limit;
        if (vehicles.length < limit) {
          hasMore = false;
        }
      }

      this.vehicleCount = totalProcessed;
      this.lastUpdate = new Date();
      this.logger.debug(`Echoes poll complete: ${totalProcessed} vehicles processed`);
    } catch (error) {
      this.logger.error('Echoes polling error:', error);
    }
  }

  /**
   * Fetch a single vehicle's latest data by UID
   */
  async getVehicleByUid(uid: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/api/assets/${uid}`, {
      headers: {
        'Authorization': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Echoes API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch a single vehicle's latest data by VIN
   */
  async getVehicleByVin(vin: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/api/assets/vin/${vin}`, {
      headers: {
        'Authorization': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Echoes API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Create a vehicle on Echoes platform
   * Required: name, typeId (3304 legacy)
   * Optional: fleetId, deviceTypeId, vin, brandName
   */
  async createVehicle(params: {
    name: string;
    vin?: string;
    brandName?: string;
    fleetId?: number;
    deviceTypeId?: number;
  }): Promise<any> {
    const body: any = {
      name: params.name,
      typeId: 3304, // Legacy field, required
    };

    if (params.vin) body.vin = params.vin;
    if (params.brandName) body.brandName = params.brandName;
    if (params.fleetId) body.fleetId = params.fleetId;
    if (params.deviceTypeId) body.deviceTypeId = params.deviceTypeId;

    const response = await fetch(`${this.apiUrl}/api/assets`, {
      method: 'POST',
      headers: {
        'Authorization': this.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Echoes create vehicle error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Normalize Echoes vehicle data to standard GPS format
   */
  private normalizeEchoesData(vehicle: any): NormalizedGPSData | null {
    // Echoes returns vehicle with lastPosition or embedded GPS data
    const position = vehicle.lastPosition || vehicle.position || vehicle;

    const lat = position.latitude || position.lat;
    const lng = position.longitude || position.lng || position.lon;

    if (!lat || !lng) return null;

    return {
      vehicleId: String(vehicle.uid || vehicle.id),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(position.speed || 0),
      heading: parseFloat(position.heading || position.course || 0),
      altitude: position.altitude ? parseFloat(position.altitude) : undefined,
      timestamp: position.timestamp ? new Date(position.timestamp) : new Date(),
      provider: 'echoes' as any,
      raw: vehicle,
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
