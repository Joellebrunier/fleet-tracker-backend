import { Role } from '@common/enums/role.enum';

export interface UserPayload {
  userId: string;
  email: string;
  role: Role;
  organizationId: string;
  iat?: number;
  exp?: number;
}
