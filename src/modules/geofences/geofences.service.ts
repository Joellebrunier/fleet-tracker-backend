import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeofenceEntity } from './entities/geofence.entity';
import { VehicleGeofenceEntity } from './entities/vehicle-geofence.entity';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class GeofencesService {
  constructor(
    @InjectRepository(GeofenceEntity)
    private geofencesRepository: Repository<GeofenceEntity>,
    @InjectRepository(VehicleGeofenceEntity)
    private vehicleGeofencesRepository: Repository<VehicleGeofenceEntity>,
  ) {}

  async create(createDto: CreateGeofenceDto, organizationId: string): Promise<GeofenceEntity> {
    const geofence = this.geofencesRepository.create({
      ...createDto,
      organizationId,
    });
    return this.geofencesRepository.save(geofence);
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<GeofenceEntity>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.geofencesRepository.findAndCount({
      where: { organizationId },
      order: { [sort]: order },
      skip,
      take: limit,
    });

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

  async findById(id: string, organizationId: string): Promise<GeofenceEntity> {
    const geofence = await this.geofencesRepository.findOne({ where: { id } });

    if (!geofence) {
      throw new NotFoundException('Geofence not found');
    }

    if (geofence.organizationId !== organizationId) {
      throw new ForbiddenException('Cannot access geofence from another organization');
    }

    return geofence;
  }

  async update(id: string, organizationId: string, updateDto: UpdateGeofenceDto): Promise<GeofenceEntity> {
    await this.findById(id, organizationId);
    await this.geofencesRepository.update(id, updateDto);
    const result = await this.geofencesRepository.findOne({ where: { id } });
    return result!;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    await this.vehicleGeofencesRepository.delete({ geofenceId: id });
    await this.geofencesRepository.delete(id);
  }

  async assignToVehicle(
    geofenceId: string,
    vehicleId: string,
    alertOnEntry: boolean = true,
    alertOnExit: boolean = true,
  ): Promise<VehicleGeofenceEntity> {
    const existing = await this.vehicleGeofencesRepository.findOne({
      where: { geofenceId, vehicleId },
    });
    if (existing) {
      await this.vehicleGeofencesRepository.update(existing.id, { alertOnEntry, alertOnExit });
      const result = await this.vehicleGeofencesRepository.findOne({ where: { id: existing.id } });
      return result!;
    }

    const vg = this.vehicleGeofencesRepository.create({
      geofenceId,
      vehicleId,
      alertOnEntry,
      alertOnExit,
    });
    return this.vehicleGeofencesRepository.save(vg);
  }

  async checkContainment(
    lat: number,
    lng: number,
    organizationId: string,
  ): Promise<GeofenceEntity[]> {
    const geofences = await this.geofencesRepository.find({
      where: { organizationId, isActive: true },
    });

    return geofences.filter((geofence) => {
      const geo = geofence.geometry;
      if (!geo) return false;

      switch (geofence.type) {
        case 'CIRCLE':
          if (geo.center && geo.radius) {
            const distance = this.calculateDistance(lat, lng, geo.center.lat, geo.center.lng);
            return distance <= geo.radius;
          }
          return false;
        case 'POLYGON':
          if (geo.coordinates && Array.isArray(geo.coordinates)) {
            return this.isPointInPolygon(lat, lng, geo.coordinates);
          }
          return false;
        case 'RECTANGLE':
          if (geo.bounds) {
            return (
              lat >= geo.bounds.south &&
              lat <= geo.bounds.north &&
              lng >= geo.bounds.west &&
              lng <= geo.bounds.east
            );
          }
          return false;
        default:
          return false;
      }
    });
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371e3;
    const f1 = (lat1 * Math.PI) / 180;
    const f2 = (lat2 * Math.PI) / 180;
    const df = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(df / 2) ** 2 + Math.cos(f1) * Math.cos(f2) * Math.sin(dl / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private isPointInPolygon(lat: number, lng: number, polygon: { lat: number; lng: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lat, yi = polygon[i].lng;
      const xj = polygon[j].lat, yj = polygon[j].lng;
      const intersect = yi > lng !== yj > lng && lat < ((xj - xi) * (lng - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }
}
