import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { AlertEntity } from './entities/alert.entity';
import { AlertRuleEntity } from './entities/alert-rule.entity';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { QueryAlertsDto } from './dto/query-alerts.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TenantGuard } from '@common/guards/tenant.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Role } from '@common/enums/role.enum';
import { UserPayload } from '@common/interfaces/user-payload.interface';

@ApiTags('alerts')
@Controller('organizations/:organizationId/alerts')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class AlertsController {
  constructor(private alertsService: AlertsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'List alerts' })
  @ApiResponse({ status: 200, isArray: true })
  async getAlerts(
    @Param('organizationId') organizationId: string,
    @Query() query: QueryAlertsDto,
  ) {
    return this.alertsService.getAlerts(organizationId, query);
  }

  @Patch(':id/acknowledge')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Acknowledge alert' })
  @ApiResponse({ status: 200, type: AlertEntity })
  async acknowledgeAlert(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<AlertEntity> {
    return this.alertsService.acknowledgeAlert(id, organizationId, user.userId);
  }

  @Post('acknowledge-multiple')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Acknowledge multiple alerts' })
  async acknowledgeMultiple(
    @Param('organizationId') organizationId: string,
    @Body() body: { ids: string[] },
    @CurrentUser() user: UserPayload,
  ): Promise<void> {
    return this.alertsService.acknowledgeMultiple(body.ids, organizationId, user.userId);
  }

  @Post('rules')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create alert rule' })
  @ApiResponse({ status: 201, type: AlertRuleEntity })
  async createRule(
    @Param('organizationId') organizationId: string,
    @Body() createRuleDto: CreateAlertRuleDto,
  ): Promise<AlertRuleEntity> {
    return this.alertsService.createAlertRule(createRuleDto, organizationId);
  }

  @Get('rules')
  @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR)
  @ApiOperation({ summary: 'Get alert rules' })
  @ApiResponse({ status: 200, isArray: true })
  async getRules(
    @Param('organizationId') organizationId: string,
  ): Promise<AlertRuleEntity[]> {
    return this.alertsService.getAlertRules(organizationId);
  }

  @Patch('rules/:ruleId')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Update alert rule' })
  async updateRule(
    @Param('organizationId') organizationId: string,
    @Param('ruleId') ruleId: string,
    @Body() updates: Partial<AlertRuleEntity>,
  ): Promise<AlertRuleEntity> {
    return this.alertsService.updateAlertRule(ruleId, organizationId, updates);
  }

  @Delete('rules/:ruleId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete alert rule' })
  async deleteRule(
    @Param('organizationId') organizationId: string,
    @Param('ruleId') ruleId: string,
  ): Promise<void> {
    return this.alertsService.deleteAlertRule(ruleId, organizationId);
  }
}
