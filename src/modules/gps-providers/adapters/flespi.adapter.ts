import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { IConfiguration } from '@config/configuration';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * Flespi GPS Adapter — HTTP REST polling mode
 *
 * Uses the Flespi REST API to poll device telemetry instead of MQTT,
 * since MQTT (port 8883) is blocked on many PaaS hosts (Railway, etc.)
 *
 * API: GET /gw/devices/all/telemetry/all
 * Auth: Header "Authorization: FlespiToken <token>"
 * Docs: https://flespi.io/docs/#/gw/devices
 */
@Injectable()
export class FlespiAdapter implements IGpsProvider, OnModuleInit {
  private dataCallback: ((data: NormalizedGPSData) => void) | null = null;
  private connected = false;
  private lastUpdate: Date | null = null;
  private vehicleCount = 0;
  private readonly logger = new Logger(FlespiAdapter.name);

  private apiUrl: string;
  private token: string;

  constructor(
    private configService: ConfigService<IConfiguration>,
    private normalizer: DataNormalizerService,
  ) {
    this.apiUrl = 'https://flespi.io';
    this.token = this.configService.get('FLESPI_TOKEN') || '';
  }

  async onModuleInit() {
    if (this.token) {
      await this.connect();
    } else {
      this.logger.warn('Flespi token not configured, adapter disabled');
    }
  }

  async connect(): Promise<void> {
    try {
      // Test connection by fetching account info
      const response = await fetch(`${this.apiUrl}/platform/customer`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = (await response.json()) as any;
        const customer = data.result?.[0];
        this.connected = true;
        this.logger.log(`Flespi adapter connected (Account: ${customer?.name || 'unknown'}, CID: ${customer?.id || 'unknown'})`);
      } else {
        const body = await response.text();
        this.logger.error(`Flespi connection failed: ${response.status} - ${body.substring(0, 200)}`);
      }
    } catch (error) {
      this.logger.error('Flespi connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.logger.log('Flespi adapter disconnected');
  }

  onData(callback: (data: NormalizedGPSData) => void): void {
    this.dataCallback = callback;
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `FlespiToken ${this.token}`,
      'Accept': 'application/json',
    };
  }

  /**
   * Poll Flespi REST API every 2 minutes
   * Fetches all devices with their latest telemetry
   */
  @Cron('*/2 * * * *')
  async pollFlespiApi(): Promise<void> {
    if (!this.connected || !this.dataCallback) return;

    try {
      // Fetch all devices with their latest telemetry
      const response = await fetch(
        `${this.apiUrl}/gw/devices/all/telemetry/position`,
        { headers: this.getAuthHeaders() },
      );

      if (!response.ok) {
        if (response.status === 401) {
          this.logger.warn('Flespi token may be expired');
          this.connected = false;
        }
        this.logger.error(`Flespi API error: ${response.status}`);
        return;
      }

      const data = (await response.json()) as any;
      const devices = data.result || [];
      let totalProcessed = 0;

      for (const device of devices) {
        try {
          const normalized = this.normalizeFlespiData(device);
          if (normalized && this.normalizer.validate(normalized)) {
            this.dataCallback(normalized);
            totalProcessed++;
          }
        } catch (err) {
          this.logger.warn(`Failed to normalize Flespi device ${device.id}: ${err}`);
        }
      }

      this.vehicleCount = totalProcessed;
      this.lastUpdate = new Date();
      this.logger.debug(`Flespi poll complete: ${totalProcessed} devices processed`);
    } catch (error) {
      this.logger.error('Flespi polling error:', error);
    }
  }

  /**
   * Normalize Flespi device telemetry to standard GPS format
   */
  private normalizeFlespiData(device: any): NormalizedGPSData | null {
    const telemetry = device.telemetry?.position?.value || device.telemetry || device;

    const lat = telemetry.latitude || telemetry.lat;
    const lng = telemetry.longitude || telemetry.lng || telemetry.lon;

    if (!lat || !lng) return null;

    return {
      vehicleId: String(device.id || device.device_id),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(telemetry.speed || 0),
      heading: parseFloat(telemetry.direction || telemetry.heading || telemetry.course || 0),
      altitude: telemetry.altitude ? parseFloat(telemetry.altitude) : undefined,
      timestamp: telemetry.timestamp
        ? new Date(telemetry.timestamp * 1000)
        : new Date(),
      provider: 'FLESPI' as any,
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
