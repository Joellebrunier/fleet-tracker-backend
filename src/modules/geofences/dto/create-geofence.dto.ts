import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GeofenceType } from '../entities/geofence.entity';

export class CreateGeofenceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: GeofenceType })
  @IsEnum(GeofenceType)
  type: GeofenceType;

  @ApiProperty({ description: 'GeoJSON-like geometry object' })
  @IsObject()
  geometry: Record<string, any>;

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
