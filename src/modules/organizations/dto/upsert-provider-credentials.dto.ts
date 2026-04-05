import { IsEnum, IsObject, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Provider } from '@common/enums/provider.enum';

export class UpsertProviderCredentialsDto {
  @ApiProperty({ enum: Provider, description: 'GPS provider type' })
  @IsEnum(Provider)
  provider: Provider;

  @ApiProperty({
    description:
      'Provider-specific credentials. FLESPI: {token}. ECHOES: {apiUrl,accountId,apiKey}. KEEPTRACE: {apiUrl,apiKey}. UBIWAN: {apiUrl,username,password,license,serverKey}.',
  })
  @IsObject()
  credentials: Record<string, string>;

  @ApiPropertyOptional({ description: 'Display label for this credential set' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Whether this credential set is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
