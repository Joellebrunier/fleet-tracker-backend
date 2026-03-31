import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { GpsHistoryEntity } from './entities/gps-history.entity';
import { Provider } from '@common/enums/provider.enum';

@Injectable()
export class GpsHistoryService {
  constructor(
    @InjectRepository(GpsHistoryEntity)
    private gpsHistoryRepository: Repository<GpsHistoryEntity>,
  ) {}

  async recordPosition(data: {
    vehicleId: string;
    organizationId: string;
    lat: number;
    lng: number;
    speed?: number;
    heading?: number;
    altitude?: number;
    accuracy?: number;
    provider: Provider;
    metadata?: Record<string, any>;
  }): Promise<GpsHistoryEntity> {
    const record = this.gpsHistoryRepository.create(data);
    return this.gpsHistoryRepository.save(record);
  }

  async getHistory(
    vehicleId: string,
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 100,
    interval?: number,
  ): Promise<{ data: GpsHistoryEntity[]; total: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.gpsHistoryRepository.findAndCount({
      where: {
        vehicleId,
        createdAt: Between(new Date(startDate), new Date(endDate)),
      },
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    if (interval && interval > 0 && data.length > 0) {
      return { data: this.applyIntervalSampling(data, interval), total };
    }

    return { data, total };
  }

  private applyIntervalSampling(records: GpsHistoryEntity[], intervalSeconds: number): GpsHistoryEntity[] {
    if (records.length === 0) return records;

    const sampled: GpsHistoryEntity[] = [records[0]];
    let lastTime = new Date(records[0].createdAt).getTime();
    const intervalMs = intervalSeconds * 1000;

    for (let i = 1; i < records.length; i++) {
      const currentTime = new Date(records[i].createdAt).getTime();
      if (currentTime - lastTime >= intervalMs) {
        sampled.push(records[i]);
        lastTime = currentTime;
      }
    }

    return sampled;
  }
}
