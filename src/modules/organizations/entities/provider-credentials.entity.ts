import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Provider } from '@common/enums/provider.enum';
import { OrganizationEntity } from './organization.entity';

/**
 * ProviderCredentialsEntity
 *
 * Stores GPS provider API credentials per organization.
 * Each organization can have one set of credentials per provider.
 *
 * Credentials are stored as JSONB, with provider-specific fields:
 *
 * FLESPI:    { token }
 * ECHOES:    { apiUrl, accountId, apiKey }
 * KEEPTRACE: { apiUrl, apiKey }
 * UBIWAN:    { apiUrl, username, password, license, serverKey }
 */
@Entity('provider_credentials')
@Unique(['organizationId', 'provider'])
export class ProviderCredentialsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'organization_id', type: 'uuid' })
  @Index()
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization?: OrganizationEntity;

  @Column({ type: 'enum', enum: Provider })
  provider: Provider;

  /**
   * Provider-specific credentials.
   * Structure depends on the provider type:
   *
   * FLESPI:    { token: string }
   * ECHOES:    { apiUrl: string, accountId: string, apiKey: string }
   * KEEPTRACE: { apiUrl: string, apiKey: string }
   * UBIWAN:    { apiUrl: string, username: string, password: string, license: string, serverKey: string }
   */
  @Column({ type: 'jsonb' })
  credentials: Record<string, string>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /** Label for display (e.g. "Flespi Production", "Echoes EU") */
  @Column({ type: 'varchar', nullable: true })
  label?: string;

  /** Last time this provider was successfully polled */
  @Column({ name: 'last_sync_at', type: 'timestamp', nullable: true })
  lastSyncAt?: Date;

  /** Last error message if sync failed */
  @Column({ name: 'last_error', type: 'text', nullable: true })
  lastError?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
