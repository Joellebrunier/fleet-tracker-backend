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

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar' })
  type: string;

  // PostGIS geometry column - stored as GeoJSON text, read back as GeoJSON
  @Column({ type: 'geometry', spatialFeatureType: 'Geometry', srid: 4326, nullable: true })
  geometry?: any;

  @Column({ type: 'float', nullable: true })
  radius?: number;

  @Column({ type: 'varchar', nullable: true })
  color?: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isTemporary: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  schedule?: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  priority: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
