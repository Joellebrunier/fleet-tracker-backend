import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { AlertType, AlertSeverity } from '@common/enums/alert-type.enum';

@Entity('alerts')
@Index(['vehicleId'])
@Index(['organizationId'])
@Index(['createdAt'])
export class AlertEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AlertType })
  type: AlertType;

  @Column({ type: 'enum', enum: AlertSeverity })
  severity: AlertSeverity;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isAcknowledged: boolean;

  @Column({ type: 'uuid', nullable: true })
  acknowledgedBy?: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
