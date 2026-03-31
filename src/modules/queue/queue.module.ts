import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { IConfiguration } from '@config/configuration';
import { GpsEventProducer } from './producers/gps-event.producer';
import { GpsProcessorConsumer } from './consumers/gps-processor.consumer';
import { AlertCheckerConsumer } from './consumers/alert-checker.consumer';
import { ReportGeneratorConsumer } from './consumers/report-generator.consumer';
import { GpsHistoryModule } from '@modules/gps-history/gps-history.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { AlertsModule } from '@modules/alerts/alerts.module';
import { GeofencesModule } from '@modules/geofences/geofences.module';
import { ReportsModule } from '@modules/reports/reports.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfiguration>) => ({
        redis: configService.get('REDIS_URL'),
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: 'gps-events' },
      { name: 'alert-checks' },
      { name: 'report-generation' },
    ),
    GpsHistoryModule,
    VehiclesModule,
    AlertsModule,
    GeofencesModule,
    ReportsModule,
  ],
  providers: [
    GpsEventProducer,
    GpsProcessorConsumer,
    AlertCheckerConsumer,
    ReportGeneratorConsumer,
  ],
  exports: [GpsEventProducer],
})
export class QueueModule {}
