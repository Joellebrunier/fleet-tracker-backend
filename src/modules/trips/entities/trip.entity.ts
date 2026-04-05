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
import { VehicleEntity } from '@modules/vehicles/entities/vehicle.entity';
import { OrganizationEntity } from '@modules/organizations/entities/organization.entity';

@Entity('trips')
@Unique(['vehicleId', 'externalTripId'])
@Index(['vehicleId'])
@Index(['organizationId'])
@Index(['startDateTime'])
export class TripEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'vehicle_id', type: 'uuid' })
  vehicleId: string;

  @ManyToOne(() => VehicleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vehicle_id' })
  vehicle?: VehicleEntity;

  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization?: OrganizationEntity;

  @Column({ type: 'enum', enum: Provider })
  provider: Provider;

  @Column({ name: 'external_trip_id', type: 'varchar', nullable: true })
  externalTripId?: string;

  @Column({ name: 'start_date_time', type: 'timestamp' })
  startDateTime: Date;

  @Column({ name: 'end_date_time', type: 'timestamp' })
  endDateTime: Date;

  @Column({ name: 'start_lat', type: 'float' })
  startLat: number;

  @Column({ name: 'start_lng', type: 'float' })
  startLng: number;

  @Column({ name: 'end_lat', type: 'float' })
  endLat: number;

  @Column({ name: 'end_lng', type: 'float' })
  endLng: number;

  @Column({ name: 'start_altitude', type: 'float', nullable: true })
  startAltitude?: number;

  @Column({ name: 'end_altitude', type: 'float', nullable: true })
  endAltitude?: number;

  @Column({ name: 'start_heading', type: 'int', nullable: true })
  startHeading?: number;

  @Column({ name: 'end_heading', type: 'int', nullable: true })
  endHeading?: number;

  @Column({ name: 'start_address', type: 'jsonb', nullable: true })
  startAddress?: Record<string, any>;

  @Column({ name: 'end_address', type: 'jsonb', nullable: true })
  endAddress?: Record<string, any>;

  @Column({ name: 'start_mileage', type: 'int', nullable: true })
  startMileage?: number;

  @Column({ name: 'end_mileage', type: 'int', nullable: true })
  endMileage?: number;

  @Column({ name: 'distance', type: 'int', nullable: true })
  distance?: number;

  @Column({ name: 'duration', type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
