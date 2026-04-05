import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@common/enums/role.enum';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken?: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role;
    organizationId: string;
  };

  /** All organizations the user is a member of */
  @ApiProperty({ required: false })
  organizations?: Array<{
    organizationId: string;
    role: Role;
  }>;
}
