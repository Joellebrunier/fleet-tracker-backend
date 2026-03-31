import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * KeepTrace GPS Adapter
 *
 * API Documentation: https://customerapi.live.keeptrace.fr/Help
 * Auth: API Key passed in header or query parameter
 * Key: 3952311b-f982-46c4-a1a3-8ae691b855cc
 */
@Injectable()
export class KeepTraceAdapter implements IGpsProvider, OnModuleInit {
  private dataCallback: ((data: NormalizedGPSData) => void) | null = null;
  private connected = false;
  private lastUpdate: Date | null = null;
  private vehicleCount = 0;
  private readonly logger = new Logger(KeepTraceAdapter.name);

  private apiUrl: string;
  private apiKey: string;

  constructor(
    private configService: ConfigService,
    private normalizer: DataNormalizerService,
  ) {
    this.apiUrl = this.configService.get<string>('KEEPTRACE_API_URL', 'https://customerapi.live.keeptrace.fr');
    this.apiKey = this.configService.get<string>('KEEPTRACE_API_KEY', '');
  }

  async onModuleInit() {
    if (this.apiKey) {
      await this.connect();
    } else {
      this.logger.warn('KeepTrace API key not configured, adapter disabled');
    }
  }

  async connect(): Promise<void> {
    try {
      // Test connection by fetching vehicles
      const response = await fetch(`${this.apiUrl}/api/vehicles?apiKey=${this.apiKey}`, {
        headers: {
          'Accept': 'application/json',
          'X-Api-Key': this.apiKey,
        },
      });

      if (response.ok) {
        this.connected = true;
        this.logger.log('KeepTrace adapter connected');
      } else {
        this.logger.error(`KeepTrace connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('KeepTrace connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('KeepTrace adapter disconnected');
  }

  onData(callback: (data: NormalizedGPSData) => void): void {
    this.dataCallback = callback;
  }

  /**
   * Build request URL with API key
   */
  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.apiUrl}${path}`);
    url.searchParams.set('apiKey', this.apiKey);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  /**
   * Build auth headers for KeepTrace API
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'X-Api-Key': this.apiKey,
    };
  }

  /**
   * Poll KeepTrace API every 2 minutes
   */
  @Cron('*/2 * * * *')
  async pollKeepTraceApi(): Promise<void> {
    if (!this.connected || !this.dataCallback) return;

    try {
      const response = await fetch(this.buildUrl('/api/vehicles'), {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logger.warn('KeepTrace API key may be expired');
          this.connected = false;
        }
        this.logger.error(`KeepTrace API error: ${response.status} ${response.statusText}`);
        return;
      }

      const data = (await response.json()) as any;
      const vehicles = Array.isArray(data) ? data : (data.vehicles || data.items || data.results || []);
      let totalProcessed = 0;

      for (const vehicle of vehicles) {
        try {
          const normalized = this.normalizeKeepTraceData(vehicle);
          if (normalized && this.normalizer.validate(normalized)) {
            this.dataCallback(normalized);
            totalProcessed++;
          }
        } catch (err) {
          this.logger.warn(`Failed to normalize KeepTrace vehicle ${vehicle.id}: ${err}`);
        }
      }

      this.vehicleCount = totalProcessed;
      this.lastUpdate = new Date();
      this.logger.debug(`KeepTrace poll complete: ${totalProcessed} vehicles processed`);
    } catch (error) {
      this.logger.error('KeepTrace polling error:', error);
    }
  }

  /**
   * Fetch a single vehicle's latest position
   */
  async getVehiclePosition(vehicleId: string): Promise<any> {
    const response = await fetch(this.buildUrl(`/api/vehicles/${vehicleId}`), {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`KeepTrace API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch vehicle history/trips
   */
  async getVehicleHistory(vehicleId: string, startDate: string, endDate: string): Promise<any> {
    const response = await fetch(
      this.buildUrl(`/api/vehicles/${vehicleId}/trips`, {
        startDate,
        endDate,
      }),
      { headers: this.getAuthHeaders() },
    );

    if (!response.ok) {
      throw new Error(`KeepTrace API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Normalize KeepTrace vehicle data to standard GPS format
   */
  private normalizeKeepTraceData(vehicle: any): NormalizedGPSData | null {
    const lat = vehicle.latitude || vehicle.lat || vehicle.lastPosition?.latitude;
    const lng = vehicle.longitude || vehicle.lng || vehicle.lon || vehicle.lastPosition?.longitude;

    if (!lat || !lng) return null;

    return {
      vehicleId: String(vehicle.id || vehicle.trackerId || vehicle.imei),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(vehicle.speed || vehicle.lastPosition?.speed || 0),
      heading: parseFloat(vehicle.heading || vehicle.direction || vehicle.lastPosition?.heading || 0),
      altitude: vehicle.altitude ? parseFloat(vehicle.altitude) : undefined,
      timestamp: vehicle.lastPositionDate
        ? new Date(vehicle.lastPositionDate)
        : vehicle.timestamp
          ? new Date(vehicle.timestamp)
          : new Date(),
      provider: 'keeptrace' as any,
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
