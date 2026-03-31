import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import { VehicleStatus } from '@common/enums/vehicle-status.enum';

@Entity('vehicles')
@Index(['organizationId'])
@Index(['groupId'])
@Index(['deviceImei'])
export class VehicleEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  plate: string;

  @Column({ type: 'varchar', nullable: true })
  vin?: string;

  @Column({ type: 'varchar', nullable: true })
  brand?: string;

  @Column({ type: 'varchar', nullable: true })
  model?: string;

  @Column({ type: 'int', nullable: true })
  year?: number;

  @Column({ type: 'varchar', nullable: true })
  type?: string; // sedan, truck, van, etc.

  @Column({ type: 'uuid', nullable: true })
  groupId?: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'varchar', nullable: true })
  deviceImei?: string;

  @Column({ type: 'float', nullable: true })
  currentLat?: number;

  @Column({ type: 'float', nullable: true })
  currentLng?: number;

  @Column({ type: 'float', nullable: true, default: 0 })
  currentSpeed: number;

  @Column({ type: 'float', nullable: true })
  currentHeading?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastCommunication?: Date;

  @Column({ type: 'enum', enum: VehicleStatus, default: VehicleStatus.ACTIVE })
  status: VehicleStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
