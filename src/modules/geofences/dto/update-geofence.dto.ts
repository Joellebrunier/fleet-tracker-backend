import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { GeofenceType } from '../entities/geofence.entity';

export class UpdateGeofenceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: GeofenceType })
  @IsOptional()
  @IsEnum(GeofenceType)
  type?: GeofenceType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  geometry?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  schedule?: Record<string, any>;
}
