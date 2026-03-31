import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SuperAdminService } from './super-admin.service';
import { ManageOrganizationDto } from './dto/manage-organization.dto';
import { SystemConfigDto } from './dto/system-config.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

@ApiTags('super-admin')
@Controller('super-admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN)
@ApiBearerAuth()
export class SuperAdminController {
  constructor(private superAdminService: SuperAdminService) {}

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
}
