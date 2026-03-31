import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { Provider } from '@common/enums/provider.enum';

@Entity('gps_history')
@Index(['vehicleId'])
@Index(['organizationId'])
@Index(['createdAt'])
@Index(['vehicleId', 'createdAt'])
export class GpsHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'float' })
  lat: number;

  @Column({ type: 'float' })
  lng: number;

  @Column({ type: 'float', nullable: true })
  speed?: number;

  @Column({ type: 'float', nullable: true })
  heading?: number;

  @Column({ type: 'float', nullable: true })
  altitude?: number;

  @Column({ type: 'float', nullable: true })
  accuracy?: number;

  @Column({ type: 'enum', enum: Provider })
  provider: Provider;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ precision: 6 })
  createdAt: Date;
}
