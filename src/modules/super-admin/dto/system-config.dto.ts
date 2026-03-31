import { IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class SystemConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  gpsProviders?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  queue?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  notifications?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  retention?: Record<string, any>;
}
