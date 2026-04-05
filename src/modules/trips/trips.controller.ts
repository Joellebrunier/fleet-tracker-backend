import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

@ApiTags('trips')
@Controller('organizations/:organizationId/trips')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR, Role.SUPER_ADMIN)
@ApiBearerAuth()
export class TripsController {
  constructor(private tripsService: TripsService) {}

  @Get()
  @ApiOperation({ summary: 'List trips for an organization' })
  @ApiQuery({ name: 'vehicleId', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'offset', required: false })
  async listTrips(
    @Param('organizationId') organizationId: string,
    @Query('vehicleId') vehicleId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const opts = {
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };

    if (vehicleId) {
      return this.tripsService.findByVehicle(vehicleId, organizationId, opts);
    }
    return this.tripsService.findByOrganization(organizationId, opts);
  }

  @Get('vehicle/:vehicleId/stats')
  @ApiOperation({ summary: 'Get trip statistics for a vehicle' })
  async getVehicleStats(
    @Param('organizationId') organizationId: string,
    @Param('vehicleId') vehicleId: string,
  ) {
    return this.tripsService.getVehicleStats(vehicleId, organizationId);
  }
}
