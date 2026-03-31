import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GpsProvidersService } from './gps-providers.service';
import { FlespiAdapter } from './adapters/flespi.adapter';
import { EchoesAdapter } from './adapters/echoes.adapter';
import { UbiwanAdapter } from './adapters/ubiwan.adapter';
import { KeepTraceAdapter } from './adapters/keeptrace.adapter';
import { DataNormalizerService } from './normalizer/data-normalizer.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    GpsProvidersService,
    FlespiAdapter,
    EchoesAdapter,
    UbiwanAdapter,
    KeepTraceAdapter,
    DataNormalizerService,
  ],
  exports: [GpsProvidersService, DataNormalizerService, FlespiAdapter, EchoesAdapter, UbiwanAdapter, KeepTraceAdapter],
})
export class GpsProvidersModule {}
