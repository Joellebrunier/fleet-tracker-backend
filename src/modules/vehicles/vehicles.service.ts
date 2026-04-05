import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { VehicleEntity } from './entities/vehicle.entity';
import { VehicleGroupEntity } from './entities/vehicle-group.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { BulkAssignVehiclesDto } from './dto/bulk-assign-vehicles.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';
import { GpsHistoryEntity } from '@modules/gps-history/entities/gps-history.entity';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(VehicleEntity)
    private vehiclesRepository: Repository<VehicleEntity>,
    @InjectRepository(VehicleGroupEntity)
    private vehicleGroupsRepository: Repository<VehicleGroupEntity>,
    @InjectRepository(GpsHistoryEntity)
    private gpsHistoryRepository: Repository<GpsHistoryEntity>,
  ) {}

  async create(createDto: CreateVehicleDto, organizationId: string): Promise<VehicleEntity> {
    const existing = await this.vehiclesRepository.findOne({
      where: { plate: createDto.plate, organizationId },
    });
    if (existing) {
      throw new BadRequestException('Vehicle with this plate already exists in your organization');
    }

    const vehicle = this.vehiclesRepository.create({
      ...createDto,
      organizationId,
    });
    return this.vehiclesRepository.save(vehicle);
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<VehicleEntity>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.vehiclesRepository.findAndCount({
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

  async findById(id: string, organizationId: string): Promise<VehicleEntity> {
    const vehicle = await this.vehiclesRepository.findOne({ where: { id } });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    if (vehicle.organizationId !== organizationId) {
      throw new ForbiddenException('Cannot access vehicle from another organization');
    }

    return vehicle;
  }

  async update(id: string, organizationId: string, updateDto: UpdateVehicleDto): Promise<VehicleEntity> {
    await this.findById(id, organizationId);
    await this.vehiclesRepository.update(id, updateDto);
    const result = await this.vehiclesRepository.findOne({ where: { id } });
    return result!;
  }

  async updatePosition(
    id: string,
    lat: number,
    lng: number,
    speed?: number,
    heading?: number,
  ): Promise<VehicleEntity> {
    await this.vehiclesRepository.update(id, {
      currentLat: lat,
      currentLng: lng,
      currentSpeed: speed || 0,
      currentHeading: heading,
      lastCommunication: new Date(),
    });
    const result = await this.vehiclesRepository.findOne({ where: { id } });
    return result!;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    await this.vehiclesRepository.delete(id);
  }

  // Vehicle Groups
  async createGroup(name: string, organizationId: string, parentGroupId?: string): Promise<VehicleGroupEntity> {
    const group = this.vehicleGroupsRepository.create({
      name,
      organizationId,
      parentGroupId,
    });
    return this.vehicleGroupsRepository.save(group);
  }

  async findAllGroups(organizationId: string): Promise<VehicleGroupEntity[]> {
    return this.vehicleGroupsRepository.find({
      where: { organizationId },
      order: { name: 'ASC' },
    });
  }

  async findGroupById(id: string, organizationId: string): Promise<VehicleGroupEntity> {
    const group = await this.vehicleGroupsRepository.findOne({ where: { id } });
    if (!group || group.organizationId !== organizationId) {
      throw new NotFoundException('Vehicle group not found');
    }
    return group;
  }

  async removeGroup(id: string, organizationId: string): Promise<void> {
    await this.findGroupById(id, organizationId);
    await this.vehicleGroupsRepository.delete(id);
  }

  // ─── BULK ASSIGN ─────────────────────────────────────────────────────

  /**
   * Bulk reassign vehicles from current org to a target sub-client org.
   * Also moves the associated GPS history records.
   * The caller must own the vehicles (be in their organizationId).
   */
  async bulkAssignVehicles(
    callerOrgId: string,
    dto: BulkAssignVehiclesDto,
  ): Promise<{ assigned: number }> {
    const { vehicleIds, targetOrganizationId } = dto;

    // Verify all vehicles belong to caller's org
    const vehicles = await this.vehiclesRepository.find({
      where: { id: In(vehicleIds) },
    });

    const notOwned = vehicles.filter((v) => v.organizationId !== callerOrgId);
    if (notOwned.length > 0) {
      throw new ForbiddenException(
        `Cannot assign vehicles that don't belong to your organization`,
      );
    }

    const missing = vehicleIds.filter((id) => !vehicles.find((v) => v.id === id));
    if (missing.length > 0) {
      throw new NotFoundException(`Vehicles not found: ${missing.join(', ')}`);
    }

    // Reassign vehicles
    await this.vehiclesRepository.update(
      { id: In(vehicleIds) },
      { organizationId: targetOrganizationId },
    );

    // Also reassign GPS history records for these vehicles
    await this.gpsHistoryRepository.update(
      { vehicleId: In(vehicleIds) },
      { organizationId: targetOrganizationId },
    );

    return { assigned: vehicleIds.length };
  }

  /**
   * Bulk unassign vehicles — move them back from sub-client to parent org.
   */
  async bulkUnassignVehicles(
    callerOrgId: string,
    vehicleIds: string[],
  ): Promise<{ unassigned: number }> {
    const vehicles = await this.vehiclesRepository.find({
      where: { id: In(vehicleIds) },
    });

    // Reassign back to caller's org
    await this.vehiclesRepository.update(
      { id: In(vehicleIds) },
      { organizationId: callerOrgId },
    );

    await this.gpsHistoryRepository.update(
      { vehicleId: In(vehicleIds) },
      { organizationId: callerOrgId },
    );

    return { unassigned: vehicleIds.length };
  }
}
