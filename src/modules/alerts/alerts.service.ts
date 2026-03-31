import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AlertEntity } from './entities/alert.entity';
import { AlertRuleEntity } from './entities/alert-rule.entity';
import { CreateAlertRuleDto } from './dto/create-alert-rule.dto';
import { QueryAlertsDto } from './dto/query-alerts.dto';
import { AlertType, AlertSeverity } from '@common/enums/alert-type.enum';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class AlertsService {
  private alerts: Map<string, AlertEntity> = new Map();
  private alertRules: Map<string, AlertRuleEntity> = new Map();

  async createAlert(
    type: AlertType,
    severity: AlertSeverity,
    vehicleId: string,
    organizationId: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<AlertEntity> {
    const alert: AlertEntity = {
      id: this.generateId(),
      type,
      severity,
      vehicleId,
      organizationId,
      message,
      data,
      isAcknowledged: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.alerts.set(alert.id, alert);
    return alert;
  }

  async getAlerts(
    organizationId: string,
    query: QueryAlertsDto,
  ): Promise<IPaginatedResult<AlertEntity>> {
    let allAlerts = Array.from(this.alerts.values()).filter(
      (a) => a.organizationId === organizationId,
    );

    // Apply filters
    if (query.vehicleId) {
      allAlerts = allAlerts.filter((a) => a.vehicleId === query.vehicleId);
    }

    if (query.type) {
      allAlerts = allAlerts.filter((a) => a.type === query.type);
    }

    if (query.severity) {
      allAlerts = allAlerts.filter((a) => a.severity === query.severity);
    }

    if (query.isAcknowledged !== undefined) {
      allAlerts = allAlerts.filter((a) => a.isAcknowledged === query.isAcknowledged);
    }

    // Sort
    const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = query;
    const skip = (page - 1) * limit;

    allAlerts.sort((a, b) => {
      const aVal = a[sort as keyof AlertEntity] ?? '';
      const bVal = b[sort as keyof AlertEntity] ?? '';

      if (aVal < bVal) return order === 'ASC' ? -1 : 1;
      if (aVal > bVal) return order === 'ASC' ? 1 : -1;
      return 0;
    });

    const data = allAlerts.slice(skip, skip + limit);
    const total = allAlerts.length;

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

  async acknowledgeAlert(id: string, organizationId: string, userId: string): Promise<AlertEntity> {
    const alert = this.alerts.get(id);

    if (!alert || alert.organizationId !== organizationId) {
      throw new NotFoundException('Alert not found');
    }

    alert.isAcknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date();
    alert.updatedAt = new Date();

    this.alerts.set(id, alert);
    return alert;
  }

  async acknowledgeMultiple(
    ids: string[],
    organizationId: string,
    userId: string,
  ): Promise<void> {
    for (const id of ids) {
      const alert = this.alerts.get(id);
      if (alert && alert.organizationId === organizationId) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = userId;
        alert.acknowledgedAt = new Date();
        alert.updatedAt = new Date();
        this.alerts.set(id, alert);
      }
    }
  }

  async createAlertRule(
    createRuleDto: CreateAlertRuleDto,
    organizationId: string,
  ): Promise<AlertRuleEntity> {
    const rule: AlertRuleEntity = {
      id: this.generateId(),
      name: createRuleDto.name,
      type: createRuleDto.type,
      conditions: createRuleDto.conditions,
      organizationId,
      isActive: createRuleDto.isActive ?? true,
      notificationChannels: createRuleDto.notificationChannels,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.alertRules.set(rule.id, rule);
    return rule;
  }

  async getAlertRules(organizationId: string): Promise<AlertRuleEntity[]> {
    return Array.from(this.alertRules.values()).filter(
      (r) => r.organizationId === organizationId,
    );
  }

  async updateAlertRule(
    id: string,
    organizationId: string,
    updates: Partial<AlertRuleEntity>,
  ): Promise<AlertRuleEntity> {
    const rule = this.alertRules.get(id);

    if (!rule || rule.organizationId !== organizationId) {
      throw new NotFoundException('Alert rule not found');
    }

    Object.assign(rule, updates);
    rule.updatedAt = new Date();
    this.alertRules.set(id, rule);

    return rule;
  }

  async deleteAlertRule(id: string, organizationId: string): Promise<void> {
    const rule = this.alertRules.get(id);

    if (!rule || rule.organizationId !== organizationId) {
      throw new NotFoundException('Alert rule not found');
    }

    this.alertRules.delete(id);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
