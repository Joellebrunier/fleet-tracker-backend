import { IsString, IsOptional, IsObject, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSubClientDto {
  @ApiProperty({ description: 'Sub-client organization name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL-friendly slug (lowercase, numbers, hyphens)' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @ApiPropertyOptional({ description: 'Optional settings for the sub-client' })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}
