import { Controller, Get, Post, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { ManageOrganizationDto } from './dto/manage-organization.dto';
import { SystemConfigDto } from './dto/system-config.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { TrackerDiscoveryService } from '@modules/gps-providers/tracker-discovery.service';

@ApiTags('super-admin')
@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@ApiBearerAuth()
export class SuperAdminController {
  constructor(
    private superAdminService: SuperAdminService,
    private trackerDiscovery: TrackerDiscoveryService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Get system health status' })
  @ApiResponse({ status: 200 })
  async getHealth(): Promise<any> {
    return this.superAdminService.getSystemHealth();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get system statistics' })
  @ApiResponse({ status: 200 })
  async getStats(): Promise<any> {
    return this.superAdminService.getSystemStats();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200 })
  async getAuditLogs(): Promise<any> {
    return this.superAdminService.getAuditLogs();
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update system configuration' })
  @ApiResponse({ status: 200 })
  async updateConfig(@Body() config: SystemConfigDto): Promise<any> {
    return this.superAdminService.updateSystemConfig(config);
  }

  @Post('backfill-gps-history')
  @ApiOperation({ summary: 'Backfill GPS history for all existing vehicles with missing data' })
  @ApiResponse({ status: 200 })
  async backfillGpsHistory(): Promise<any> {
    // Fire and forget — backfill runs in background
    this.trackerDiscovery.backfillAllExistingVehicles().catch((err) => {
      console.error('Backfill error:', err);
    });
    return { success: true, message: 'Backfill started in background. Check server logs for progress.' };
  }

  @Post('enrich-vehicles')
  @ApiOperation({ summary: 'Enrich existing vehicles with VIN, plate, brand, model from GPS providers' })
  @ApiResponse({ status: 200 })
  async enrichVehicles(): Promise<any> {
    // Fire and forget — enrichment runs in background
    this.trackerDiscovery.enrichAllVehicles().catch((err) => {
      console.error('Enrich error:', err);
    });
    return { success: true, message: 'Vehicle enrichment started in background. Check server logs for progress.' };
  }

  @Get('debug-echoes-assets')
  @ApiOperation({ summary: 'Debug: fetch raw asset data from Echoes API to inspect available fields' })
  @ApiResponse({ status: 200 })
  async debugEchoesAssets(): Promise<any> {
    return this.trackerDiscovery.debugEchoesAssets();
  }
}
