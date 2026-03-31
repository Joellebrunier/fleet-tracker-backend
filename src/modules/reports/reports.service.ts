import { Injectable } from '@nestjs/common';
import { GenerateReportDto, ReportType, ReportFormat } from './dto/generate-report.dto';

@Injectable()
export class ReportsService {
  async generateReport(
    organizationId: string,
    generateReportDto: GenerateReportDto,
  ): Promise<any> {
    const { type, format, startDate, endDate, vehicleIds, includeGeofences, includeAlerts, includeMetrics } =
      generateReportDto;

    // Parse dates
    const start = startDate ? new Date(startDate) : this.getDefaultStartDate(type);
    const end = endDate ? new Date(endDate) : new Date();

    // Build report structure
    const report: any = {
      id: this.generateId(),
      organizationId,
      type,
      format,
      generatedAt: new Date(),
      period: {
        start,
        end,
      },
      summary: {
        totalVehicles: vehicleIds?.length || 0,
        distanceTraveled: 0,
        durationTracked: 0,
        averageSpeed: 0,
      },
      vehicles: [],
      geofenceSummary: null,
      alertsSummary: null,
      metrics: null,
    };

    // Add sections if requested
    if (includeGeofences) {
      report.geofenceSummary = {
        totalGeofences: 0,
        entries: 0,
        exits: 0,
      };
    }

    if (includeAlerts) {
      report.alertsSummary = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      };
    }

    if (includeMetrics) {
      report.metrics = {
        fuelConsumed: 0,
        maintenanceCost: 0,
        driverBehavior: {
          harshBraking: 0,
          speeding: 0,
          hardAcceleration: 0,
        },
      };
    }

    return report;
  }

  private getDefaultStartDate(type: ReportType): Date {
    const now = new Date();

    switch (type) {
      case ReportType.DAILY:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case ReportType.WEEKLY:
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return weekStart;
      case ReportType.MONTHLY:
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case ReportType.CUSTOM:
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
