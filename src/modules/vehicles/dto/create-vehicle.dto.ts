import { IsString, IsOptional, IsEnum, IsUUID, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VehicleStatus } from '@common/enums/vehicle-status.enum';

export class CreateVehicleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  plate: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vin?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deviceImei?: string;

  @ApiPropertyOptional({ enum: VehicleStatus, default: VehicleStatus.ACTIVE })
  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @ApiPropertyOptional({ description: 'Provider-specific metadata (flespiChannelId, keeptraceId, echoesUid, etc.)' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
