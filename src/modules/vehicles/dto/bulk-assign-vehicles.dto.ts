import { IsArray, IsUUID, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BulkAssignVehiclesDto {
  @ApiProperty({ description: 'Array of vehicle IDs to reassign', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  vehicleIds: string[];

  @ApiProperty({ description: 'Target organization (sub-client) ID' })
  @IsUUID()
  targetOrganizationId: string;
}
