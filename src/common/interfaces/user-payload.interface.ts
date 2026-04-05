import { Role } from '@common/enums/role.enum';

export interface UserPayload {
  userId: string;
  email: string;
  /** Role in the currently active organization */
  role: Role;
  /** Currently active organization */
  organizationId: string;
  /** Home organization (the one the user registered with) */
  homeOrganizationId?: string;
  iat?: number;
  exp?: number;
}
