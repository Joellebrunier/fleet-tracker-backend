import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';
import { GeofenceEntity, GeofenceType } from './entities/geofence.entity';
import { VehicleGeofenceEntity } from './entities/vehicle-geofence.entity';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class GeofencesService {
  private geofences: Map<string, GeofenceEntity> = new Map();
  private vehicleGeofences: Map<string, VehicleGeofenceEntity[]> = new Map();

  async create(
    createGeofenceDto: CreateGeofenceDto,
    organizationId: string,
  ): Promise<GeofenceEntity> {
    const geofence: GeofenceEntity = {
      id: this.generateId(),
      name: createGeofenceDto.name,
      type: createGeofenceDto.type,
      geometry: createGeofenceDto.geometry,
      color: createGeofenceDto.color,
      organizationId,
      isActive: createGeofenceDto.isActive ?? true,
      schedule: createGeofenceDto.schedule,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.geofences.set(geofence.id, geofence);
    return geofence;
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<GeofenceEntity>> {
    const allGeofences = Array.from(this.geofences.values()).filter(
      (g) => g.organizationId === organizationId,
    );

    const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    allGeofences.sort((a, b) => {
      const aVal = a[sort as keyof GeofenceEntity] ?? '';
      const bVal = b[sort as keyof GeofenceEntity] ?? '';

      if (aVal < bVal) return order === 'ASC' ? -1 : 1;
      if (aVal > bVal) return order === 'ASC' ? 1 : -1;
      return 0;
    });

    const data = allGeofences.slice(skip, skip + limit);
    const total = allGeofences.length;

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
    const geofence = this.geofences.get(id);

    if (!geofence || geofence.organizationId !== organizationId) {
      throw new NotFoundException('Geofence not found');
    }

    return geofence;
  }

  async update(
    id: string,
    organizationId: string,
    updateGeofenceDto: UpdateGeofenceDto,
  ): Promise<GeofenceEntity> {
    const geofence = await this.findById(id, organizationId);

    Object.assign(geofence, updateGeofenceDto);
    geofence.updatedAt = new Date();
    this.geofences.set(id, geofence);

    return geofence;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    this.geofences.delete(id);
    this.vehicleGeofences.delete(id);
  }

  async assignToVehicle(
    geofenceId: string,
    vehicleId: string,
    organizationId: string,
    alertOnEntry = true,
    alertOnExit = true,
  ): Promise<VehicleGeofenceEntity> {
    const geofence = await this.findById(geofenceId, organizationId);

    const vgKey = `${vehicleId}-${geofenceId}`;
    const existing = this.vehicleGeofences.get(vgKey);

    if (existing) {
      throw new BadRequestException('Geofence already assigned to vehicle');
    }

    const vehicleGeofence: VehicleGeofenceEntity = {
      id: this.generateId(),
      vehicleId,
      geofenceId,
      alertOnEntry,
      alertOnExit,
      createdAt: new Date(),
    };

    if (!this.vehicleGeofences.has(geofenceId)) {
      this.vehicleGeofences.set(geofenceId, []);
    }

    this.vehicleGeofences.get(geofenceId)!.push(vehicleGeofence);
    return vehicleGeofence;
  }

  async checkContainment(lat: number, lng: number): Promise<GeofenceEntity[]> {
    const contained: GeofenceEntity[] = [];

    for (const geofence of this.geofences.values()) {
      if (!geofence.isActive) continue;

      if (geofence.type === GeofenceType.CIRCLE) {
        const centerLat = geofence.geometry.coordinates[0];
        const centerLng = geofence.geometry.coordinates[1];
        const radius = geofence.geometry.radius; // meters

        const distance = this.calculateDistance(lat, lng, centerLat, centerLng);
        if (distance <= radius) {
          contained.push(geofence);
        }
      } else if (geofence.type === GeofenceType.POLYGON) {
        if (this.isPointInPolygon(lat, lng, geofence.geometry.coordinates)) {
          contained.push(geofence);
        }
      } else if (geofence.type === GeofenceType.RECTANGLE) {
        const [minLat, minLng, maxLat, maxLng] = geofence.geometry.bounds;
        if (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng) {
          contained.push(geofence);
        }
      }
    }

    return contained;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private isPointInPolygon(lat: number, lng: number, polygon: number[][]): boolean {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [latI, lngI] = polygon[i];
      const [latJ, lngJ] = polygon[j];

      if (
        lngI > lng !== lngJ > lng &&
        lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI
      ) {
        inside = !inside;
      }
    }
    return inside;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
