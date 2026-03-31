import { IsString, IsEnum, IsObject, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertType } from '@common/enums/alert-type.enum';

export class CreateAlertRuleDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: AlertType })
  @IsEnum(AlertType)
  type: AlertType;

  @ApiProperty({ description: 'Conditions for alert trigger' })
  @IsObject()
  conditions: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  notificationChannels?: Record<string, any>;
}
