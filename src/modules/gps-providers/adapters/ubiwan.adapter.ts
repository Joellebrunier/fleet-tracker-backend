import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * Ubiwan GPS Adapter
 *
 * API Documentation: https://api.ubiwan.net/doc/public/index.html
 * Auth: Basic auth (username/password) or session token
 * Server: Phoenix (key: 2311-AA22)
 */
@Injectable()
export class UbiwanAdapter implements IGpsProvider, OnModuleInit {
  private dataCallback: ((data: NormalizedGPSData) => void) | null = null;
  private connected = false;
  private lastUpdate: Date | null = null;
  private vehicleCount = 0;
  private sessionToken: string | null = null;
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
    this.apiUrl = this.configService.get<string>('UBIWAN_API_URL', 'https://api.ubiwan.net');
    this.username = this.configService.get<string>('UBIWAN_USERNAME', '');
    this.password = this.configService.get<string>('UBIWAN_PASSWORD', '');
    this.serverName = this.configService.get<string>('UBIWAN_SERVER_NAME', 'Phoenix');
    this.serverKey = this.configService.get<string>('UBIWAN_SERVER_KEY', '');
    this.license = this.configService.get<string>('UBIWAN_LICENSE', '');
  }

  async onModuleInit() {
    if (this.username && this.password) {
      await this.connect();
    } else {
      this.logger.warn('Ubiwan credentials not configured, adapter disabled');
    }
  }

  async connect(): Promise<void> {
    try {
      // Authenticate with Ubiwan API to get session token
      const authResponse = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password,
          serverName: this.serverName,
          serverKey: this.serverKey,
        }),
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        this.sessionToken = authData.token || authData.sessionId || authData.access_token;
        this.connected = true;
        this.logger.log(`Ubiwan adapter connected (Server: ${this.serverName}, Account: INEHA FINANCE)`);
      } else {
        // Fallback: try Basic Auth
        const basicAuth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        const testResponse = await fetch(`${this.apiUrl}/api/vehicles`, {
          headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Accept': 'application/json',
          },
        });

        if (testResponse.ok) {
          this.connected = true;
          this.logger.log(`Ubiwan adapter connected via Basic Auth (Server: ${this.serverName})`);
        } else {
          this.logger.error(`Ubiwan auth failed: ${authResponse.status} ${authResponse.statusText}`);
        }
      }
    } catch (error) {
      this.logger.error('Ubiwan connection error:', error);
    }
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.sessionToken = null;
    this.logger.log('Ubiwan adapter disconnected');
  }

  onData(callback: (data: NormalizedGPSData) => void): void {
    this.dataCallback = callback;
  }

  /**
   * Build auth headers for Ubiwan API requests
   */
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    } else {
      const basicAuth = Buffer.from(`${this.username}:${this.password}`).toString('base64');
      headers['Authorization'] = `Basic ${basicAuth}`;
    }

    return headers;
  }

  /**
   * Poll Ubiwan API every 2 minutes
   * Fetches all vehicles with their latest GPS positions
   */
  @Cron(CronExpression.EVERY_2_MINUTES)
  async pollUbiwanApi(): Promise<void> {
    if (!this.connected || !this.dataCallback) return;

    try {
      const response = await fetch(`${this.apiUrl}/api/vehicles`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        // If 401, try to reconnect
        if (response.status === 401) {
          this.logger.warn('Ubiwan session expired, reconnecting...');
          await this.connect();
          return;
        }
        this.logger.error(`Ubiwan API error: ${response.status} ${response.statusText}`);
        return;
      }

      const data = await response.json();
      const vehicles = Array.isArray(data) ? data : (data.vehicles || data.items || data.results || []);
      let totalProcessed = 0;

      for (const vehicle of vehicles) {
        try {
          const normalized = this.normalizeUbiwanData(vehicle);
          if (normalized && this.normalizer.validate(normalized)) {
            this.dataCallback(normalized);
            totalProcessed++;
          }
        } catch (err) {
          this.logger.warn(`Failed to normalize Ubiwan vehicle ${vehicle.id || vehicle.name}: ${err}`);
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
   * Fetch a specific vehicle's position by ID
   */
  async getVehiclePosition(vehicleId: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/api/vehicles/${vehicleId}/position`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Ubiwan API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch vehicle history between two dates
   */
  async getVehicleHistory(vehicleId: string, startDate: string, endDate: string): Promise<any> {
    const response = await fetch(
      `${this.apiUrl}/api/vehicles/${vehicleId}/history?from=${startDate}&to=${endDate}`,
      { headers: this.getAuthHeaders() },
    );

    if (!response.ok) {
      throw new Error(`Ubiwan API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Normalize Ubiwan vehicle data to standard GPS format
   */
  private normalizeUbiwanData(vehicle: any): NormalizedGPSData | null {
    const lat = vehicle.latitude || vehicle.lat || vehicle.position?.latitude;
    const lng = vehicle.longitude || vehicle.lng || vehicle.lon || vehicle.position?.longitude;

    if (!lat || !lng) return null;

    return {
      vehicleId: String(vehicle.id || vehicle.vehicleId || vehicle.imei),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(vehicle.speed || vehicle.position?.speed || 0),
      heading: parseFloat(vehicle.heading || vehicle.cap || vehicle.position?.heading || 0),
      altitude: vehicle.altitude ? parseFloat(vehicle.altitude) : undefined,
      timestamp: vehicle.timestamp
        ? new Date(vehicle.timestamp)
        : vehicle.lastUpdate
          ? new Date(vehicle.lastUpdate)
          : new Date(),
      provider: 'ubiwan',
      ignition: vehicle.ignition ?? vehicle.contactOn,
      batteryVoltage: vehicle.batteryVoltage || vehicle.battery,
      odometer: vehicle.odometer || vehicle.totalDistance || vehicle.km,
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
