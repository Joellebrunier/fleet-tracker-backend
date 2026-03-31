import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VehicleEntity } from '@modules/vehicles/entities/vehicle.entity';
import { GpsHistoryEntity } from '@modules/gps-history/entities/gps-history.entity';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';
import { Provider } from '@common/enums/provider.enum';

/**
 * Direct GPS data pipeline - persists GPS positions to the database
 * without requiring Redis/Bull queues.
 *
 * Flow: GPS Adapter → onData callback → GpsDataPipelineService.processGpsData()
 *   1. Looks up the vehicle by external ID (deviceImei or metadata mapping)
 *   2. Updates the vehicle's current position
 *   3. Records the position in gps_history
 */
@Injectable()
export class GpsDataPipelineService implements OnModuleInit {
  private readonly logger = new Logger(GpsDataPipelineService.name);

  // Cache: externalId → { vehicleId, organizationId }
  // Refreshed periodically to avoid DB lookups on every GPS event
  private vehicleCache = new Map<string, { vehicleId: string; organizationId: string }>();
  private cacheRefreshInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(VehicleEntity)
    private vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(GpsHistoryEntity)
    private gpsHistoryRepository: Repository<GpsHistoryEntity>,
  ) {}

  async onModuleInit() {
    await this.refreshVehicleCache();
    // Refresh cache every 5 minutes
    this.cacheRefreshInterval = setInterval(() => {
      this.refreshVehicleCache().catch((err) =>
        this.logger.error('Failed to refresh vehicle cache:', err),
      );
    }, 5 * 60 * 1000);
  }

  /**
   * Load all vehicles with device IMEIs into a lookup cache.
   * Maps both deviceImei and vehicle ID for flexible matching.
   */
  async refreshVehicleCache(): Promise<void> {
    try {
      const vehicles = await this.vehiclesRepository.find({
        select: ['id', 'organizationId', 'deviceImei', 'metadata'],
      });

      this.vehicleCache.clear();

      for (const v of vehicles) {
        // Map by deviceImei (primary lookup key for GPS trackers)
        if (v.deviceImei) {
          this.vehicleCache.set(v.deviceImei, {
            vehicleId: v.id,
            organizationId: v.organizationId,
          });
        }

        // Also map by vehicle UUID for direct references
        this.vehicleCache.set(v.id, {
          vehicleId: v.id,
          organizationId: v.organizationId,
        });

        // Map by external provider IDs stored in metadata
        if (v.metadata) {
          const externalIds = [
            v.metadata.echoesUid,
            v.metadata.ubiwanId,
            v.metadata.keeptraceId,
            v.metadata.flespiChannelId,
          ].filter(Boolean);

          for (const extId of externalIds) {
            this.vehicleCache.set(String(extId), {
              vehicleId: v.id,
              organizationId: v.organizationId,
            });
          }
        }
      }

      this.logger.log(`Vehicle cache refreshed: ${this.vehicleCache.size} entries`);
    } catch (error) {
      this.logger.error('Failed to refresh vehicle cache:', error);
    }
  }

  /**
   * Main entry point: process a normalized GPS data point.
   * Called by GPS adapters via onData callback.
   */
  async processGpsData(data: NormalizedGPSData): Promise<void> {
    try {
      // Look up internal vehicle by external ID
      const mapping = this.vehicleCache.get(data.vehicleId);

      if (!mapping) {
        this.logger.debug(
          `No vehicle mapping for external ID "${data.vehicleId}" from ${data.provider} - skipping`,
        );
        return;
      }

      const { vehicleId, organizationId } = mapping;

      // 1. Update vehicle's current position
      await this.vehiclesRepository.update(vehicleId, {
        currentLat: data.lat,
        currentLng: data.lng,
        currentSpeed: data.speed || 0,
        currentHeading: data.heading,
        lastCommunication: new Date(),
      });

      // 2. Record position in GPS history
      const historyRecord = this.gpsHistoryRepository.create({
        vehicleId,
        organizationId,
        lat: data.lat,
        lng: data.lng,
        speed: data.speed,
        heading: data.heading,
        altitude: data.altitude,
        accuracy: data.accuracy,
        provider: data.provider as Provider,
        metadata: data.raw ? { raw: data.raw } : undefined,
      });

      await this.gpsHistoryRepository.save(historyRecord);

      this.logger.debug(
        `GPS data persisted for vehicle ${vehicleId} (${data.provider}): ${data.lat},${data.lng} @ ${data.speed} km/h`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process GPS data for ${data.vehicleId} (${data.provider}):`,
        error,
      );
    }
  }

  /**
   * Process a batch of GPS data points.
   */
  async processGpsBatch(dataPoints: NormalizedGPSData[]): Promise<void> {
    for (const data of dataPoints) {
      await this.processGpsData(data);
    }
  }

  /**
   * Get the current vehicle cache size (for monitoring).
   */
  getCacheSize(): number {
    return this.vehicleCache.size;
  }
}
