import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mqtt from 'mqtt';
import { IConfiguration } from '@config/configuration';
import { IGpsProvider } from '../interfaces/gps-provider.interface';
import { DataNormalizerService } from '../normalizer/data-normalizer.service';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

@Injectable()
export class FlespiAdapter implements IGpsProvider {
  private client: mqtt.MqttClient | null = null;
  private dataCallback: ((data: NormalizedGPSData) => void) | null = null;
  private readonly logger = new Logger(FlespiAdapter.name);

  constructor(
    private configService: ConfigService<IConfiguration>,
    private normalizer: DataNormalizerService,
  ) {}

  async connect(): Promise<void> {
    try {
      const host = this.configService.get('FLESPI_MQTT_HOST');
      const port = this.configService.get('FLESPI_MQTT_PORT', 8883);
      const token = this.configService.get('FLESPI_TOKEN');

      this.client = mqtt.connect(`mqtts://${host}:${port}`, {
        username: 'flespi',
        password: token,
        reconnectPeriod: 5000,
      });

      this.client.on('connect', () => {
        this.logger.log('Connected to Flespi MQTT');
        // Subscribe to all device channels
        this.client!.subscribe('flespi/gps/+/data', (err) => {
          if (err) {
            this.logger.error('Subscribe error:', err);
          }
        });
      });

      this.client.on('message', (topic: string, message: Buffer) => {
        try {
          const data = JSON.parse(message.toString());
          // Extract vehicle ID from topic: flespi/gps/{channelId}/data
          const channelId = topic.split('/')[2];

          const normalized = this.normalizer.normalizeFromFlespi(data, channelId);

          if (this.normalizer.validate(normalized) && this.dataCallback) {
            this.dataCallback(normalized);
          }
        } catch (error) {
          this.logger.error('Error processing Flespi message:', error);
        }
      });

      this.client.on('error', (error) => {
        this.logger.error('Flespi connection error:', error);
      });
    } catch (error) {
      this.logger.error('Failed to connect to Flespi:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      this.client.unsubscribe('flespi/gps/+/data');
      this.client.end();
      this.client = null;
      this.logger.log('Disconnected from Flespi');
    }
  }

  onData(callback: (data: NormalizedGPSData) => void): void {
    this.dataCallback = callback;
  }

  async getStatus(): Promise<{
    connected: boolean;
    lastUpdate?: Date;
    vehicleCount?: number;
  }> {
    return {
      connected: this.client ? this.client.connected : false,
    };
  }
}
