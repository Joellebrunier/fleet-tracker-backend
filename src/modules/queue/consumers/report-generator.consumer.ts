import { Processor, Process, OnWorkerEvent, Cron, CronExpression } from '@nestjs/bull';
import { Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { ReportsService } from '@modules/reports/reports.service';
import { GenerateReportDto, ReportType } from '@modules/reports/dto/generate-report.dto';

@Processor('report-generation')
export class ReportGeneratorConsumer {
  private readonly logger = new Logger(ReportGeneratorConsumer.name);

  constructor(@Inject(ReportsService) private reportsService: ReportsService) {}

  @Process('generate-report')
  async generateReport(
    job: Job<{ organizationId: string; dto: GenerateReportDto }>,
  ): Promise<void> {
    const { organizationId, dto } = job.data;

    try {
      this.logger.log(`Generating ${dto.type} report for organization ${organizationId}`);

      const report = await this.reportsService.generateReport(organizationId, dto);

      this.logger.log(`Report generated: ${report.id}`);
      // TODO: Store report, trigger email/webhook notification
    } catch (error) {
      this.logger.error(`Failed to generate report:`, error);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailyReports(): Promise<void> {
    this.logger.log('Starting daily report generation');
    // TODO: Get all organizations and queue daily reports
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job): void {
    this.logger.debug(`Completed report generation job ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error): void {
    this.logger.error(`Failed report generation job ${job.id}: ${error.message}`);
  }
}
