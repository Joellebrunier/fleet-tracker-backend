import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Role } from '@common/enums/role.enum';
import { UserOrganizationEntity } from './user-organization.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  firstName: string;

  @Column({ type: 'varchar' })
  lastName: string;

  /**
   * Legacy role field — kept for backward compat.
   * The effective role is now per-organization in user_organizations.
   * This field stores the "default" role (set at registration).
   */
  @Column({ type: 'enum', enum: Role, default: Role.OPERATOR })
  role: Role;

  /**
   * Legacy primary organization — kept for backward compat.
   * When a user belongs to multiple orgs, this is their "home" org
   * (the one they registered with or were first added to).
   */
  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @OneToMany(() => UserOrganizationEntity, (uo) => uo.userId)
  organizationMemberships?: UserOrganizationEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
