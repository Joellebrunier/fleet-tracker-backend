import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';

@Injectable()
export class GpsEventProducer {
  private readonly logger = new Logger(GpsEventProducer.name);

  constructor(@InjectQueue('gps-events') private gpsQueue: Queue) {}

  async produceGpsEvent(gpsData: NormalizedGPSData): Promise<void> {
    try {
      await this.gpsQueue.add('gps-position', gpsData, {
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      });
    } catch (error) {
      this.logger.error('Failed to produce GPS event:', error);
      throw error;
    }
  }

  async produceBatchGpsEvents(events: NormalizedGPSData[]): Promise<void> {
    try {
      const jobs = events.map((gpsData) => ({
        name: 'gps-position',
        data: gpsData,
        opts: {
          removeOnComplete: true,
          removeOnFail: false,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      }));

      await this.gpsQueue.addBulk(jobs);
    } catch (error) {
      this.logger.error('Failed to produce batch GPS events:', error);
      throw error;
    }
  }
}
