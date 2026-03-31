import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlertEntity } from './entities/alert.entity';
import { AlertRuleEntity } from './entities/alert-rule.entity';
import { AlertType, AlertSeverity } from '@common/enums/alert-type.enum';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(AlertEntity)
    private alertsRepository: Repository<AlertEntity>,
    @InjectRepository(AlertRuleEntity)
    private alertRulesRepository: Repository<AlertRuleEntity>,
  ) {}

  async createAlert(data: {
    type: AlertType;
    severity: AlertSeverity;
    vehicleId: string;
    organizationId: string;
    message: string;
    data?: Record<string, any>;
  }): Promise<AlertEntity> {
    const alert = this.alertsRepository.create(data);
    return this.alertsRepository.save(alert);
  }

  async getAlerts(
    organizationId: string,
    filters: {
      vehicleId?: string;
      type?: AlertType;
      severity?: AlertSeverity;
      isAcknowledged?: boolean;
    },
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<AlertEntity>> {
    const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };
    if (filters.vehicleId) where.vehicleId = filters.vehicleId;
    if (filters.type) where.type = filters.type;
    if (filters.severity) where.severity = filters.severity;
    if (filters.isAcknowledged !== undefined) where.isAcknowledged = filters.isAcknowledged;

    const [data, total] = await this.alertsRepository.findAndCount({
      where,
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

  async acknowledgeAlert(id: string, userId: string): Promise<AlertEntity> {
    const alert = await this.alertsRepository.findOne({ where: { id } });
    if (!alert) throw new NotFoundException('Alert not found');

    await this.alertsRepository.update(id, {
      isAcknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    });

    const result = await this.alertsRepository.findOne({ where: { id } });
    return result!;
  }

  async acknowledgeMultiple(ids: string[], userId: string): Promise<void> {
    await this.alertsRepository
      .createQueryBuilder()
      .update()
      .set({
        isAcknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      })
      .whereInIds(ids)
      .execute();
  }

  // Alert Rules
  async createAlertRule(data: Partial<AlertRuleEntity>, organizationId: string): Promise<AlertRuleEntity> {
    const rule = this.alertRulesRepository.create({
      ...data,
      organizationId,
    });
    return this.alertRulesRepository.save(rule);
  }

  async getAlertRules(organizationId: string): Promise<AlertRuleEntity[]> {
    return this.alertRulesRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateAlertRule(id: string, data: Partial<AlertRuleEntity>): Promise<AlertRuleEntity> {
    const rule = await this.alertRulesRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Alert rule not found');

    await this.alertRulesRepository.update(id, data);
    const result = await this.alertRulesRepository.findOne({ where: { id } });
    return result!;
  }

  async deleteAlertRule(id: string): Promise<void> {
    const rule = await this.alertRulesRepository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException('Alert rule not found');
    await this.alertRulesRepository.delete(id);
  }
}
