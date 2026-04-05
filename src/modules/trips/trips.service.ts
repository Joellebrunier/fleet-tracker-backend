import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TripEntity } from './entities/trip.entity';

@Injectable()
export class TripsService {
  private readonly logger = new Logger(TripsService.name);

  constructor(
    @InjectRepository(TripEntity)
    private tripsRepository: Repository<TripEntity>,
  ) {}

  async findByVehicle(
    vehicleId: string,
    organizationId: string,
    options?: { startDate?: string; endDate?: string; limit?: number; offset?: number },
  ) {
    const qb = this.tripsRepository
      .createQueryBuilder('trip')
      .where('trip.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('trip.organization_id = :organizationId', { organizationId });

    if (options?.startDate) {
      qb.andWhere('trip.start_date_time >= :startDate', { startDate: new Date(options.startDate) });
    }
    if (options?.endDate) {
      qb.andWhere('trip.end_date_time <= :endDate', { endDate: new Date(options.endDate) });
    }

    qb.orderBy('trip.start_date_time', 'DESC');
    qb.take(options?.limit || 50);
    qb.skip(options?.offset || 0);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, limit: options?.limit || 50, offset: options?.offset || 0 } };
  }

  async findByOrganization(
    organizationId: string,
    options?: { startDate?: string; endDate?: string; limit?: number; offset?: number },
  ) {
    const qb = this.tripsRepository
      .createQueryBuilder('trip')
      .where('trip.organization_id = :organizationId', { organizationId });

    if (options?.startDate) {
      qb.andWhere('trip.start_date_time >= :startDate', { startDate: new Date(options.startDate) });
    }
    if (options?.endDate) {
      qb.andWhere('trip.end_date_time <= :endDate', { endDate: new Date(options.endDate) });
    }

    qb.orderBy('trip.start_date_time', 'DESC');
    qb.take(options?.limit || 50);
    qb.skip(options?.offset || 0);

    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, limit: options?.limit || 50, offset: options?.offset || 0 } };
  }

  async getVehicleStats(vehicleId: string, organizationId: string) {
    const result = await this.tripsRepository
      .createQueryBuilder('trip')
      .select([
        'COUNT(trip.id) as "totalTrips"',
        'SUM(trip.distance) as "totalDistance"',
        'SUM(trip.duration) as "totalDuration"',
        'MAX(trip.end_mileage) as "lastMileage"',
        'MIN(trip.start_date_time) as "firstTrip"',
        'MAX(trip.end_date_time) as "lastTrip"',
        'AVG(trip.distance) as "avgDistance"',
        'AVG(trip.duration) as "avgDuration"',
      ])
      .where('trip.vehicle_id = :vehicleId', { vehicleId })
      .andWhere('trip.organization_id = :organizationId', { organizationId })
      .getRawOne();

    return {
      totalTrips: parseInt(result?.totalTrips || '0'),
      totalDistanceKm: Math.round((parseInt(result?.totalDistance || '0') / 1000) * 10) / 10,
      totalDurationHours: Math.round((parseInt(result?.totalDuration || '0') / 3600) * 10) / 10,
      lastMileageKm: result?.lastMileage ? Math.round(parseInt(result.lastMileage) / 1000) : null,
      firstTrip: result?.firstTrip,
      lastTrip: result?.lastTrip,
      avgDistanceKm: Math.round((parseFloat(result?.avgDistance || '0') / 1000) * 10) / 10,
      avgDurationMin: Math.round((parseFloat(result?.avgDuration || '0') / 60) * 10) / 10,
    };
  }
}
