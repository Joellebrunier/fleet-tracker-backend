import { IsUUID, IsISO8601, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryHistoryDto {
  @ApiProperty()
  @IsUUID()
  vehicleId: string;

  @ApiProperty({ description: 'Start date (ISO 8601)' })
  @IsISO8601()
  startDate: string;

  @ApiProperty({ description: 'End date (ISO 8601)' })
  @IsISO8601()
  endDate: string;

  @ApiPropertyOptional({ description: 'Interval in seconds to aggregate data' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  interval?: number;

  @ApiPropertyOptional({ description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  limit: number = 100;
}
