import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

/**
 * KeepTrace GPS Adapter
 *
 * API Documentation: https://customerapi.live.keeptrace.fr/Help
 * Auth: Header "Authorization-Key: <apiKey>"
 *
 * Endpoints:
 *   GET  api/Vehicle/GetVehicles         - List equipped vehicles
 *   POST api/RealTime/GetLastPositions   - Last positions for all vehicles
 *   POST api/RealTime/GetLastPosition    - Last position for one vehicle
 *   POST api/RealTime/GetAllPositions    - Positions since a date/ID
 *   POST api/History/GetJourneys         - Journey history for a vehicle
 *   POST api/History/GetJourneysLocations - GPS locations during journeys
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
      // Test connection by fetching vehicle list
      const response = await fetch(`${this.apiUrl}/api/Vehicle/GetVehicles`, {
        headers: this.getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        this.connected = true;
        const count = Array.isArray(data) ? data.length : 0;
        this.logger.log(`KeepTrace adapter connected (${count} vehicles found)`);
      } else {
        const body = await response.text();
        this.logger.error(`KeepTrace connection failed: ${response.status} ${response.statusText} - ${body}`);
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
   * Build auth headers for KeepTrace API
   * Uses "Authorization-Key" header as per official docs
   */
  private getAuthHeaders(): Record<string, string> {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization-Key': this.apiKey,
    };
  }

  /**
   * Poll KeepTrace API every 2 minutes
   * Uses POST api/RealTime/GetLastPositions for real-time positions
   */
  @Cron('*/2 * * * *')
  async pollKeepTraceApi(): Promise<void> {
    if (!this.connected || !this.dataCallback) return;

    try {
      // Use GetLastPositions for all vehicle positions
      const response = await fetch(`${this.apiUrl}/api/RealTime/GetLastPositions`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({}),
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
          this.logger.warn(`Failed to normalize KeepTrace vehicle ${vehicle.id || vehicle.VehicleId}: ${err}`);
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
    const response = await fetch(`${this.apiUrl}/api/RealTime/GetLastPosition`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ VehicleId: vehicleId }),
    });

    if (!response.ok) {
      throw new Error(`KeepTrace API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Fetch vehicle journey history
   */
  async getVehicleHistory(vehicleId: string, startDate: string, endDate: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/api/History/GetJourneys`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        VehicleId: vehicleId,
        StartDate: startDate,
        EndDate: endDate,
      }),
    });

    if (!response.ok) {
      throw new Error(`KeepTrace API error: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Normalize KeepTrace vehicle data to standard GPS format
   * KeepTrace returns fields like: VehicleId, Latitude, Longitude, Speed, Direction, Date
   */
  private normalizeKeepTraceData(vehicle: any): NormalizedGPSData | null {
    const lat = vehicle.Latitude || vehicle.latitude || vehicle.lat || vehicle.lastPosition?.latitude;
    const lng = vehicle.Longitude || vehicle.longitude || vehicle.lng || vehicle.lon || vehicle.lastPosition?.longitude;

    if (!lat || !lng) return null;

    return {
      vehicleId: String(vehicle.VehicleId || vehicle.Id || vehicle.id || vehicle.trackerId || vehicle.imei),
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      speed: parseFloat(vehicle.Speed || vehicle.speed || vehicle.lastPosition?.speed || 0),
      heading: parseFloat(vehicle.Direction || vehicle.heading || vehicle.direction || vehicle.lastPosition?.heading || 0),
      altitude: vehicle.Altitude || vehicle.altitude ? parseFloat(vehicle.Altitude || vehicle.altitude) : undefined,
      timestamp: vehicle.Date
        ? new Date(vehicle.Date)
        : vehicle.lastPositionDate
          ? new Date(vehicle.lastPositionDate)
          : new Date(),
      provider: 'KEEPTRACE' as any,
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
