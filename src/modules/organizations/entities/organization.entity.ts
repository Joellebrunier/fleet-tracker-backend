import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  /**
   * Parent organization ID — null for top-level clients.
   * When set, this org is a sub-client of the parent.
   */
  @Column({ name: 'parent_organization_id', type: 'uuid', nullable: true })
  @Index()
  parentOrganizationId?: string;

  @ManyToOne(() => OrganizationEntity, (org) => org.children, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'parent_organization_id' })
  parentOrganization?: OrganizationEntity;

  @OneToMany(() => OrganizationEntity, (org) => org.parentOrganization)
  children?: OrganizationEntity[];

  @Column({ type: 'jsonb', nullable: true })
  settings?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', default: 'active' })
  subscriptionStatus: 'active' | 'paused' | 'canceled';

  @Column({ type: 'jsonb', nullable: true })
  apiKeys?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
