import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('vehicle_geofences')
@Index(['vehicleId'])
@Index(['geofenceId'])
@Index(['vehicleId', 'geofenceId'], { unique: true })
export class VehicleGeofenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'uuid' })
  geofenceId: string;

  @Column({ type: 'boolean', default: true })
  alertOnEntry: boolean;

  @Column({ type: 'boolean', default: true })
  alertOnExit: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
