import { Injectable } from '@nestjs/common';
import { GpsHistoryEntity } from './entities/gps-history.entity';
import { QueryHistoryDto } from './dto/query-history.dto';
import { NormalizedGPSData } from '@common/interfaces/gps-data.interface';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class GpsHistoryService {
  private gpsHistory: GpsHistoryEntity[] = [];

  async recordPosition(gpsData: NormalizedGPSData, organizationId: string): Promise<GpsHistoryEntity> {
    const record: GpsHistoryEntity = {
      id: this.generateId(),
      vehicleId: gpsData.vehicleId,
      organizationId,
      lat: gpsData.lat,
      lng: gpsData.lng,
      speed: gpsData.speed,
      heading: gpsData.heading,
      altitude: gpsData.altitude,
      accuracy: gpsData.accuracy,
      provider: gpsData.provider,
      metadata: gpsData.raw,
      createdAt: gpsData.timestamp,
    };

    this.gpsHistory.push(record);
    return record;
  }

  async getHistory(
    organizationId: string,
    query: QueryHistoryDto,
  ): Promise<IPaginatedResult<GpsHistoryEntity>> {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);

    let records = this.gpsHistory.filter(
      (r) =>
        r.vehicleId === query.vehicleId &&
        r.organizationId === organizationId &&
        r.createdAt >= startDate &&
        r.createdAt <= endDate,
    );

    records.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Apply interval-based sampling if specified
    if (query.interval) {
      records = this.applyIntervalSampling(records, query.interval);
    }

    const page = query.page || 1;
    const limit = query.limit || 100;
    const skip = (page - 1) * limit;
    const total = records.length;

    const data = records.slice(skip, skip + limit);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  private applyIntervalSampling(records: GpsHistoryEntity[], intervalSeconds: number): GpsHistoryEntity[] {
    if (records.length === 0) return [];

    const sampled: GpsHistoryEntity[] = [];
    let lastTimestamp = records[0].createdAt.getTime();

    sampled.push(records[0]);

    for (let i = 1; i < records.length; i++) {
      const currentTime = records[i].createdAt.getTime();
      if (currentTime - lastTimestamp >= intervalSeconds * 1000) {
        sampled.push(records[i]);
        lastTimestamp = currentTime;
      }
    }

    return sampled;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
