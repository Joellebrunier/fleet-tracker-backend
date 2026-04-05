import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { BulkAssignVehiclesDto } from './dto/bulk-assign-vehicles.dto';
import { VehicleEntity } from './entities/vehicle.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TenantGuard } from '@common/guards/tenant.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { PaginationDto } from '@common/dto/pagination.dto';

@ApiTags('vehicles')
@Controller('organizations/:organizationId/vehicles')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class VehiclesController {
  constructor(private vehiclesService: VehiclesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create vehicle' })
  @ApiResponse({ status: 201, type: VehicleEntity })
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createVehicleDto: CreateVehicleDto,
  ): Promise<VehicleEntity> {
    return this.vehiclesService.create(createVehicleDto, organizationId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'List vehicles' })
  @ApiResponse({ status: 200, isArray: true })
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.vehiclesService.findAll(organizationId, paginationDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Get vehicle by ID' })
  @ApiResponse({ status: 200, type: VehicleEntity })
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<VehicleEntity> {
    return this.vehiclesService.findById(id, organizationId);
  }

  @Get(':id/position')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Get current vehicle position' })
  async getCurrentPosition(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<any> {
    const vehicle = await this.vehiclesService.findById(id, organizationId);
    return {
      lat: vehicle.currentLat,
      lng: vehicle.currentLng,
      speed: vehicle.currentSpeed,
      heading: vehicle.currentHeading,
      timestamp: vehicle.lastCommunication,
    };
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update vehicle' })
  @ApiResponse({ status: 200, type: VehicleEntity })
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ): Promise<VehicleEntity> {
    return this.vehiclesService.update(id, organizationId, updateVehicleDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete vehicle' })
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.vehiclesService.remove(id, organizationId);
  }

  // ─── BULK ASSIGN ─────────────────────────────────────────────────────

  @Post('bulk-assign')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bulk assign vehicles to a sub-client organization' })
  @ApiResponse({ status: 200 })
  async bulkAssign(
    @Param('organizationId') organizationId: string,
    @Body() dto: BulkAssignVehiclesDto,
  ): Promise<{ assigned: number }> {
    return this.vehiclesService.bulkAssignVehicles(organizationId, dto);
  }

  @Post('bulk-unassign')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Bulk unassign vehicles back to parent organization' })
  @ApiResponse({ status: 200 })
  async bulkUnassign(
    @Param('organizationId') organizationId: string,
    @Body() body: { vehicleIds: string[] },
  ): Promise<{ unassigned: number }> {
    return this.vehiclesService.bulkUnassignVehicles(organizationId, body.vehicleIds);
  }
}
