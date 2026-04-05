import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Role } from '@common/enums/role.enum';

/**
 * UserOrganizationEntity
 *
 * Junction table enabling many-to-many relationship between users and organizations.
 * Each row represents a user's membership in one organization, with a role specific
 * to that organization. A user can belong to multiple organizations with different
 * roles in each.
 */
@Entity('user_organizations')
@Unique(['userId', 'organizationId'])
export class UserOrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  /** Role within this specific organization */
  @Column({ type: 'enum', enum: Role, default: Role.OPERATOR })
  role: Role;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
