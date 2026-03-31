import { Processor, Process } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';
import { GpsHistoryService } from '@modules/gps-history/gps-history.service';
import { VehiclesService } from '@modules/vehicles/vehicles.service';

@Processor('gps-events')
export class GpsProcessorConsumer {
  private readonly logger = new Logger(GpsProcessorConsumer.name);

  constructor(
    @Inject(GpsHistoryService) private gpsHistoryService: GpsHistoryService,
    @Inject(VehiclesService) private vehiclesService: VehiclesService,
  ) {}

  @Process('gps-position')
  async processGpsPosition(job: Job<NormalizedGPSData>): Promise<void> {
    const { data } = job;

    try {
      this.logger.debug(`Processing GPS position for vehicle ${data.vehicleId}`);

      // In production, would need to extract organizationId from vehicle lookup
      // For now, storing GPS history
      // await this.gpsHistoryService.recordPosition(data, organizationId);

      // Update vehicle current position
      // await this.vehiclesService.updatePosition(
      //   data.vehicleId,
      //   organizationId,
      //   data.lat,
      //   data.lng,
      //   data.speed,
      //   data.heading,
      // );

      this.logger.debug(`GPS position processed for vehicle ${data.vehicleId}`);
    } catch (error) {
      this.logger.error(`Failed to process GPS position:`, error);
      throw error;
    }
  }

}
