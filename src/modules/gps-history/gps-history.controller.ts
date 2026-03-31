import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { GpsHistoryService } from './gps-history.service';
import { QueryHistoryDto } from './dto/query-history.dto';
import { GpsHistoryEntity } from './entities/gps-history.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TenantGuard } from '@common/guards/tenant.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

@ApiTags('gps-history')
@Controller('organizations/:organizationId/gps-history')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class GpsHistoryController {
  constructor(private gpsHistoryService: GpsHistoryService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Query GPS history by vehicle and date range' })
  @ApiResponse({ status: 200, isArray: true })
  async getHistory(
    @Param('organizationId') organizationId: string,
    @Query() query: QueryHistoryDto,
  ) {
    return this.gpsHistoryService.getHistory(
      query.vehicleId,
      query.startDate,
      query.endDate,
      query.page,
      query.limit,
      query.interval,
    );
  }

  @Get(':vehicleId/playback')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Get playback data for vehicle' })
  async getPlaybackData(
    @Param('organizationId') organizationId: string,
    @Param('vehicleId') vehicleId: string,
    @Query() query: QueryHistoryDto,
  ) {
    const result = await this.gpsHistoryService.getHistory(
      vehicleId,
      query.startDate,
      query.endDate,
      query.page,
      query.limit,
      query.interval,
    );
    return {
      vehicleId,
      data: result.data,
      total: result.total,
    };
  }
}
