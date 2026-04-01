import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { GpsProvidersService } from './gps-providers.service';
import { GpsDataPipelineService } from './gps-data-pipeline.service';
import { FlespiAdapter } from './adapters/flespi.adapter';
import { EchoesAdapter } from './adapters/echoes.adapter';
import { UbiwanAdapter } from './adapters/ubiwan.adapter';
import { KeepTraceAdapter } from './adapters/keeptrace.adapter';
import { DataNormalizerService } from './normalizer/data-normalizer.service';
import { TrackerDiscoveryService } from './tracker-discovery.service';
import { VehicleEntity } from '@modules/vehicles/entities/vehicle.entity';
import { GpsHistoryEntity } from '@modules/gps-history/entities/gps-history.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([VehicleEntity, GpsHistoryEntity]),
  ],
  providers: [
    GpsProvidersService,
    GpsDataPipelineService,
    FlespiAdapter,
    EchoesAdapter,
    UbiwanAdapter,
    KeepTraceAdapter,
    DataNormalizerService,
    TrackerDiscoveryService,
  ],
  exports: [
    GpsProvidersService,
    GpsDataPipelineService,
    DataNormalizerService,
    FlespiAdapter,
    EchoesAdapter,
    UbiwanAdapter,
    KeepTraceAdapter,
  ],
})
export class GpsProvidersModule {}
