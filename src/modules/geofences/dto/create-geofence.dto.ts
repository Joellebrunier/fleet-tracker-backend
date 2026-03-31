import { IsString, IsObject, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGeofenceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ['CIRCLE', 'POLYGON', 'RECTANGLE'] })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Center point for circle geofences: { lat, lng }' })
  @IsOptional()
  @IsObject()
  center?: { lat: number; lng: number };

  @ApiPropertyOptional({ description: 'Radius in meters for circle geofences' })
  @IsOptional()
  @IsNumber()
  radius?: number;

  @ApiPropertyOptional({ description: 'Array of {lat, lng} points for polygon geofences' })
  @IsOptional()
  coordinates?: { lat: number; lng: number }[];

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  priority?: number;
}
