import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum GeofenceType {
  CIRCLE = 'CIRCLE',
  POLYGON = 'POLYGON',
  RECTANGLE = 'RECTANGLE',
}

@Entity('geofences')
@Index(['organizationId'])
export class GeofenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'enum', enum: GeofenceType })
  type: GeofenceType;

  @Column({ type: 'jsonb' })
  geometry: Record<string, any>; // GeoJSON-like: { type: 'circle', coordinates: [lat, lng], radius: meters } or { type: 'polygon', coordinates: [[lat, lng], ...] }

  @Column({ type: 'varchar', nullable: true })
  color?: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  schedule?: Record<string, any>; // { dayOfWeek: [1-7], startTime: '09:00', endTime: '17:00' }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
