import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { IGpsProvider } from './interfaces/gps-provider.interface';
import { FlespiAdapter } from './adapters/flespi.adapter';
import { EchoesAdapter } from './adapters/echoes.adapter';
import { UbiwanAdapter } from './adapters/ubiwan.adapter';
import { KeepTraceAdapter } from './adapters/keeptrace.adapter';
import { DataNormalizerService } from './normalizer/data-normalizer.service';
import { GpsDataPipelineService } from './gps-data-pipeline.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

@Injectable()
export class GpsProvidersService implements OnModuleInit, OnModuleDestroy {
  private providers: Map<string, IGpsProvider> = new Map();
  private readonly logger = new Logger(GpsProvidersService.name);

  constructor(
    private flespiAdapter: FlespiAdapter,
    private echoesAdapter: EchoesAdapter,
    private ubiwanAdapter: UbiwanAdapter,
    private keepTraceAdapter: KeepTraceAdapter,
    private normalizer: DataNormalizerService,
    private pipeline: GpsDataPipelineService,
  ) {
    this.registerProviders();
  }

  private registerProviders(): void {
    this.providers.set('FLESPI', this.flespiAdapter);
    this.providers.set('ECHOES', this.echoesAdapter);
    this.providers.set('UBIWAN', this.ubiwanAdapter);
    this.providers.set('KEEPTRACE', this.keepTraceAdapter);
  }

  /**
   * Wire all providers' onData callbacks to the data pipeline.
   * Called after module initialization.
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Wiring GPS providers to data pipeline...');

    const dataHandler = async (data: NormalizedGPSData) => {
      try {
        await this.pipeline.processGpsData(data);
      } catch (error) {
        this.logger.error(`Pipeline error for ${data.provider}:`, error);
      }
    };

    // Wire each adapter's onData to the pipeline
    for (const [name, provider] of this.providers) {
      provider.onData(dataHandler);
      this.logger.log(`${name} adapter wired to data pipeline`);
    }

    this.logger.log(`${this.providers.size} GPS providers configured`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdownProviders();
  }

  async shutdownProviders(): Promise<void> {
    for (const [name, provider] of this.providers) {
      try {
        await provider.disconnect();
        this.logger.log(`${name} provider shut down`);
      } catch (error) {
        this.logger.error(`Failed to shutdown ${name} provider:`, error);
      }
    }
  }

  getProvider(name: string): IGpsProvider | undefined {
    return this.providers.get(name.toUpperCase());
  }

  async getProvidersStatus(): Promise<Record<string, any>> {
    const status: Record<string, any> = {};

    for (const [name, provider] of this.providers) {
      try {
        status[name] = await provider.getStatus();
      } catch (error) {
        status[name] = { connected: false, error: error instanceof Error ? error.message : 'Unknown error' };
      }
    }

    status.pipeline = {
      cacheSize: this.pipeline.getCacheSize(),
    };

    return status;
  }

  getNormalizer(): DataNormalizerService {
    return this.normalizer;
  }
}
