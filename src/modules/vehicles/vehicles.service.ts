import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleEntity } from './entities/vehicle.entity';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';
import { VehicleStatus } from '@common/enums/vehicle-status.enum';

@Injectable()
export class VehiclesService {
  private vehicles: Map<string, VehicleEntity> = new Map();

  async create(
    createVehicleDto: CreateVehicleDto,
    organizationId: string,
  ): Promise<VehicleEntity> {
    const existing = this.getByPlateAndOrg(createVehicleDto.plate, organizationId);
    if (existing) {
      throw new BadRequestException('Vehicle with this plate already exists in organization');
    }

    const vehicle: VehicleEntity = {
      id: this.generateId(),
      name: createVehicleDto.name,
      plate: createVehicleDto.plate,
      vin: createVehicleDto.vin,
      brand: createVehicleDto.brand,
      model: createVehicleDto.model,
      year: createVehicleDto.year,
      type: createVehicleDto.type,
      groupId: createVehicleDto.groupId,
      organizationId,
      deviceImei: createVehicleDto.deviceImei,
      currentSpeed: 0,
      status: createVehicleDto.status || VehicleStatus.ACTIVE,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.vehicles.set(vehicle.id, vehicle);
    return vehicle;
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<VehicleEntity>> {
    const allVehicles = Array.from(this.vehicles.values()).filter(
      (v) => v.organizationId === organizationId,
    );

    const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    allVehicles.sort((a, b) => {
      const aVal = a[sort as keyof VehicleEntity] ?? '';
      const bVal = b[sort as keyof VehicleEntity] ?? '';

      if (aVal < bVal) return order === 'ASC' ? -1 : 1;
      if (aVal > bVal) return order === 'ASC' ? 1 : -1;
      return 0;
    });

    const data = allVehicles.slice(skip, skip + limit);
    const total = allVehicles.length;

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

  async findById(id: string, organizationId: string): Promise<VehicleEntity> {
    const vehicle = this.vehicles.get(id);

    if (!vehicle || vehicle.organizationId !== organizationId) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async update(
    id: string,
    organizationId: string,
    updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleEntity> {
    const vehicle = await this.findById(id, organizationId);

    Object.assign(vehicle, updateVehicleDto);
    vehicle.updatedAt = new Date();
    this.vehicles.set(id, vehicle);

    return vehicle;
  }

  async updatePosition(
    id: string,
    organizationId: string,
    lat: number,
    lng: number,
    speed: number,
    heading?: number,
  ): Promise<VehicleEntity> {
    const vehicle = await this.findById(id, organizationId);

    vehicle.currentLat = lat;
    vehicle.currentLng = lng;
    vehicle.currentSpeed = speed;
    if (heading !== undefined) {
      vehicle.currentHeading = heading;
    }
    vehicle.lastCommunication = new Date();
    vehicle.updatedAt = new Date();

    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    this.vehicles.delete(id);
  }

  private getByPlateAndOrg(plate: string, organizationId: string): VehicleEntity | undefined {
    const vehicles = Array.from(this.vehicles.values());
    return vehicles.find((v) => v.plate === plate && v.organizationId === organizationId);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
