import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeofenceEntity } from './entities/geofence.entity';
import { VehicleGeofenceEntity } from './entities/vehicle-geofence.entity';
import { CreateGeofenceDto } from './dto/create-geofence.dto';
import { UpdateGeofenceDto } from './dto/update-geofence.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class GeofencesService {
  constructor(
    @InjectRepository(GeofenceEntity)
    private geofencesRepository: Repository<GeofenceEntity>,
    @InjectRepository(VehicleGeofenceEntity)
    private vehicleGeofencesRepository: Repository<VehicleGeofenceEntity>,
  ) {}

  async create(createDto: CreateGeofenceDto, organizationId: string): Promise<GeofenceEntity> {
    const { center, radius, coordinates, ...rest } = createDto;

    // Build PostGIS geometry from input
    let geometrySql: string;
    const params: any[] = [];

    if (createDto.type === 'CIRCLE' && center) {
      // For circles, store as a Point geometry + radius column
      geometrySql = `ST_SetSRID(ST_MakePoint($1, $2), 4326)`;
      params.push(center.lng, center.lat);
    } else if ((createDto.type === 'POLYGON' || createDto.type === 'RECTANGLE') && coordinates && coordinates.length >= 3) {
      // Build polygon from coordinate array
      const coordStr = coordinates
        .map((c) => `${c.lng} ${c.lat}`)
        .join(', ');
      // Close the ring
      const firstCoord = coordinates[0];
      geometrySql = `ST_SetSRID(ST_GeomFromText('POLYGON((${coordStr}, ${firstCoord.lng} ${firstCoord.lat}))'), 4326)`;
    } else {
      // Store NULL geometry if no valid input
      geometrySql = 'NULL';
    }

    // Use raw query for PostGIS geometry insertion
    const result = await this.geofencesRepository.query(
      `INSERT INTO geofences (name, description, type, geometry, radius, color, organization_id, is_active, schedule, priority)
       VALUES ($${params.length + 1}, $${params.length + 2}, $${params.length + 3}, ${geometrySql}, $${params.length + 4}, $${params.length + 5}, $${params.length + 6}, $${params.length + 7}, $${params.length + 8}, $${params.length + 9})
       RETURNING id, name, description, type, radius, color, organization_id as "organizationId", is_active as "isActive", schedule, priority, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        ...params,
        rest.name,
        rest.description || null,
        rest.type,
        radius || null,
        rest.color || null,
        organizationId,
        rest.isActive !== undefined ? rest.isActive : true,
        rest.schedule ? JSON.stringify(rest.schedule) : null,
        rest.priority || 0,
      ],
    );

    return result[0];
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<GeofenceEntity>> {
    const { page = 1, limit = 20, order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    // Use raw query to convert PostGIS geometry to GeoJSON for the response
    const [data, countResult] = await Promise.all([
      this.geofencesRepository.query(
        `SELECT id, name, description, type,
                ST_AsGeoJSON(geometry)::jsonb as geometry,
                radius, color, organization_id as "organizationId",
                is_active as "isActive", schedule, priority,
                created_at as "createdAt", updated_at as "updatedAt"
         FROM geofences
         WHERE organization_id = $1
         ORDER BY created_at ${order === 'ASC' ? 'ASC' : 'DESC'}
         LIMIT $2 OFFSET $3`,
        [organizationId, limit, skip],
      ),
      this.geofencesRepository.query(
        `SELECT COUNT(*) as total FROM geofences WHERE organization_id = $1`,
        [organizationId],
      ),
    ]);

    const total = parseInt(countResult[0]?.total || '0', 10);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string, organizationId: string): Promise<GeofenceEntity> {
    const results = await this.geofencesRepository.query(
      `SELECT id, name, description, type,
              ST_AsGeoJSON(geometry)::jsonb as geometry,
              radius, color, organization_id as "organizationId",
              is_active as "isActive", schedule, priority,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM geofences WHERE id = $1`,
      [id],
    );

    if (!results || results.length === 0) {
      throw new NotFoundException('Geofence not found');
    }

    const geofence = results[0];

    if (geofence.organizationId !== organizationId) {
      throw new ForbiddenException('Cannot access geofence from another organization');
    }

    return geofence;
  }

  async update(id: string, organizationId: string, updateDto: UpdateGeofenceDto): Promise<GeofenceEntity> {
    await this.findById(id, organizationId);

    const setClauses: string[] = [];
    const params: any[] = [id];
    let paramIndex = 2;

    if (updateDto.name !== undefined) {
      setClauses.push(`name = $${paramIndex++}`);
      params.push(updateDto.name);
    }
    if (updateDto.description !== undefined) {
      setClauses.push(`description = $${paramIndex++}`);
      params.push(updateDto.description);
    }
    if (updateDto.type !== undefined) {
      setClauses.push(`type = $${paramIndex++}`);
      params.push(updateDto.type);
    }
    if (updateDto.color !== undefined) {
      setClauses.push(`color = $${paramIndex++}`);
      params.push(updateDto.color);
    }
    if (updateDto.isActive !== undefined) {
      setClauses.push(`is_active = $${paramIndex++}`);
      params.push(updateDto.isActive);
    }
    if (updateDto.schedule !== undefined) {
      setClauses.push(`schedule = $${paramIndex++}`);
      params.push(JSON.stringify(updateDto.schedule));
    }

    setClauses.push('updated_at = NOW()');

    if (setClauses.length > 1) {
      await this.geofencesRepository.query(
        `UPDATE geofences SET ${setClauses.join(', ')} WHERE id = $1`,
        params,
      );
    }

    return this.findById(id, organizationId);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    await this.findById(id, organizationId);
    await this.vehicleGeofencesRepository.delete({ geofenceId: id });
    await this.geofencesRepository.delete(id);
  }

  async assignToVehicle(
    geofenceId: string,
    vehicleId: string,
    alertOnEntry: boolean = true,
    alertOnExit: boolean = true,
  ): Promise<VehicleGeofenceEntity> {
    const existing = await this.vehicleGeofencesRepository.findOne({
      where: { geofenceId, vehicleId },
    });
    if (existing) {
      await this.vehicleGeofencesRepository.update(existing.id, { alertOnEntry, alertOnExit });
      const result = await this.vehicleGeofencesRepository.findOne({ where: { id: existing.id } });
      return result!;
    }

    const vg = this.vehicleGeofencesRepository.create({
      geofenceId,
      vehicleId,
      alertOnEntry,
      alertOnExit,
    });
    return this.vehicleGeofencesRepository.save(vg);
  }

  /**
   * Check which active geofences contain the given point.
   * Uses PostGIS ST_DWithin for circles and ST_Contains for polygons.
   */
  async checkContainment(
    lat: number,
    lng: number,
    organizationId: string,
  ): Promise<GeofenceEntity[]> {
    const results = await this.geofencesRepository.query(
      `SELECT id, name, description, type,
              ST_AsGeoJSON(geometry)::jsonb as geometry,
              radius, color, organization_id as "organizationId",
              is_active as "isActive", priority,
              created_at as "createdAt", updated_at as "updatedAt"
       FROM geofences
       WHERE organization_id = $1
         AND is_active = true
         AND (
           (type = 'CIRCLE' AND ST_DWithin(
             geometry::geography,
             ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
             COALESCE(radius, 0)
           ))
           OR
           (type IN ('POLYGON', 'RECTANGLE') AND ST_Contains(
             geometry,
             ST_SetSRID(ST_MakePoint($2, $3), 4326)
           ))
         )`,
      [organizationId, lng, lat],
    );

    return results;
  }
}
