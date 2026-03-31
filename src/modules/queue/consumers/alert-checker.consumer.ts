import { Processor, Process } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';
import { AlertsService } from '@modules/alerts/alerts.service';
import { GeofencesService } from '@modules/geofences/geofences.service';
import { AlertType, AlertSeverity } from '@common/enums/alert-type.enum';

@Processor('alert-checks')
export class AlertCheckerConsumer {
  private readonly logger = new Logger(AlertCheckerConsumer.name);

  constructor(
    @Inject(AlertsService) private alertsService: AlertsService,
    @Inject(GeofencesService) private geofencesService: GeofencesService,
  ) {}

  @Process('check-geofence')
  async checkGeofence(job: Job<{ gpsData: NormalizedGPSData; organizationId: string }>): Promise<void> {
    const { gpsData, organizationId } = job.data;

    try {
      this.logger.debug(`Checking geofences for vehicle ${gpsData.vehicleId}`);

      // Check which geofences contain the position
      const containingGeofences = await this.geofencesService.checkContainment(
        gpsData.lat,
        gpsData.lng,
        organizationId,
      );

      for (const geofence of containingGeofences) {
        // TODO: Check previous position to determine entry/exit
        // and only create alert if state changed

        await this.alertsService.createAlert({
          type: AlertType.GEOFENCE_ENTRY,
          severity: AlertSeverity.MEDIUM,
          vehicleId: gpsData.vehicleId,
          organizationId,
          message: `Vehicle entered geofence: ${geofence.name}`,
          data: { geofenceId: geofence.id, geofenceName: geofence.name },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to check geofences:`, error);
      throw error;
    }
  }

  @Process('check-speed')
  async checkSpeed(
    job: Job<{ gpsData: NormalizedGPSData; speedLimit: number; organizationId: string }>,
  ): Promise<void> {
    const { gpsData, speedLimit, organizationId } = job.data;

    try {
      if (gpsData.speed > speedLimit) {
        await this.alertsService.createAlert({
          type: AlertType.OVERSPEED,
          severity: AlertSeverity.HIGH,
          vehicleId: gpsData.vehicleId,
          organizationId,
          message: `Vehicle exceeding speed limit: ${gpsData.speed} km/h (limit: ${speedLimit} km/h)`,
          data: { currentSpeed: gpsData.speed, speedLimit },
        });
      }
    } catch (error) {
      this.logger.error(`Failed to check speed:`, error);
      throw error;
    }
  }

}
