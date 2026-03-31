import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TenantGuard } from '@common/guards/tenant.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

@ApiTags('reports')
@Controller('organizations/:organizationId/reports')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post('generate')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Generate report' })
  @ApiResponse({ status: 201 })
  async generateReport(
    @Param('organizationId') organizationId: string,
    @Body() generateReportDto: GenerateReportDto,
  ): Promise<any> {
    return this.reportsService.generateReport(organizationId, generateReportDto);
  }
}
