import { Injectable, Logger } from '@nestjs/common';
import { IGpsProvider } from './interfaces/gps-provider.interface';
import { FlespiAdapter } from './adapters/flespi.adapter';
import { EchoesAdapter } from './adapters/echoes.adapter';
import { UbiwanAdapter } from './adapters/ubiwan.adapter';
import { DataNormalizerService } from './normalizer/data-normalizer.service';

@Injectable()
export class GpsProvidersService {
  private providers: Map<string, IGpsProvider> = new Map();
  private readonly logger = new Logger(GpsProvidersService.name);

  constructor(
    private flespiAdapter: FlespiAdapter,
    private echoesAdapter: EchoesAdapter,
    private ubiwanAdapter: UbiwanAdapter,
    private normalizer: DataNormalizerService,
  ) {
    this.registerProviders();
  }

  private registerProviders(): void {
    this.providers.set('FLESPI', this.flespiAdapter);
    this.providers.set('ECHOES', this.echoesAdapter);
    this.providers.set('UBIWAN', this.ubiwanAdapter);
  }

  async initializeProviders(): Promise<void> {
    for (const [name, provider] of this.providers) {
      try {
        await provider.connect();
        this.logger.log(`${name} provider initialized`);
      } catch (error) {
        this.logger.error(`Failed to initialize ${name} provider:`, error);
      }
    }
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

    return status;
  }

  getNormalizer(): DataNormalizerService {
    return this.normalizer;
  }
}
