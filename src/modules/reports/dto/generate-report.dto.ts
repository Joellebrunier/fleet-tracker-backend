import { IsEnum, IsISO8601, IsOptional, IsUUID, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  CUSTOM = 'CUSTOM',
}

export enum ReportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
  JSON = 'JSON',
}

export class GenerateReportDto {
  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({ enum: ReportFormat, default: ReportFormat.PDF })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat = ReportFormat.PDF;

  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiPropertyOptional({ type: [String], description: 'Vehicle IDs to include' })
  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  vehicleIds?: string[];

  @ApiPropertyOptional({ description: 'Include geofence summary' })
  @IsOptional()
  includeGeofences?: boolean;

  @ApiPropertyOptional({ description: 'Include alerts summary' })
  @IsOptional()
  includeAlerts?: boolean;

  @ApiPropertyOptional({ description: 'Include distance and fuel metrics' })
  @IsOptional()
  includeMetrics?: boolean;
}
