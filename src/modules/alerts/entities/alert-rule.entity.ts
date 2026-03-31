import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { AlertType } from '@common/enums/alert-type.enum';

@Entity('alert_rules')
@Index(['organizationId'])
export class AlertRuleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'jsonb' })
  conditions: Record<string, any>; // { speedLimit: 100, geofenceId: '...', etc. }

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  notificationChannels?: Record<string, any>; // { email: ['admin@example.com'], sms: ['+1234567890'], webhook: 'https://...' }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
