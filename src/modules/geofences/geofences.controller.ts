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
import { GeofencesService } from './geofences.service';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';
import { GeofenceEntity } from './entities/geofence.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TenantGuard } from '@common/guards/tenant.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { PaginationDto } from '@common/dto/pagination.dto';

@ApiTags('geofences')
@Controller('organizations/:organizationId/geofences')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class GeofencesController {
  constructor(private geofencesService: GeofencesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create geofence' })
  @ApiResponse({ status: 201, type: GeofenceEntity })
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createGeofenceDto: CreateGeofenceDto,
  ): Promise<GeofenceEntity> {
    return this.geofencesService.create(createGeofenceDto, organizationId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'List geofences' })
  @ApiResponse({ status: 200, isArray: true })
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.geofencesService.findAll(organizationId, paginationDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Get geofence by ID' })
  @ApiResponse({ status: 200, type: GeofenceEntity })
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<GeofenceEntity> {
    return this.geofencesService.findById(id, organizationId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update geofence' })
  @ApiResponse({ status: 200, type: GeofenceEntity })
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateGeofenceDto: UpdateGeofenceDto,
  ): Promise<GeofenceEntity> {
    return this.geofencesService.update(id, organizationId, updateGeofenceDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete geofence' })
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.geofencesService.remove(id, organizationId);
  }

  @Post(':id/assign-vehicle/:vehicleId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Assign geofence to vehicle' })
  async assignToVehicle(
    @Param('organizationId') organizationId: string,
    @Param('id') geofenceId: string,
    @Param('vehicleId') vehicleId: string,
  ): Promise<any> {
    return this.geofencesService.assignToVehicle(geofenceId, vehicleId, organizationId);
  }
}
