import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

import { configuration, getConfiguration } from '@config/configuration';
import { configValidationSchema } from '@config/validation.schema';

// Explicit entity imports (required for webpack bundling)
import { UserEntity } from '@modules/users/entities/user.entity';
import { OrganizationEntity } from '@modules/organizations/entities/organization.entity';
import { VehicleEntity } from '@modules/vehicles/entities/vehicle.entity';
import { VehicleGroupEntity } from '@modules/vehicles/entities/vehicle-group.entity';
import { GpsHistoryEntity } from '@modules/gps-history/entities/gps-history.entity';
import { GeofenceEntity } from '@modules/geofences/entities/geofence.entity';
import { VehicleGeofenceEntity } from '@modules/geofences/entities/vehicle-geofence.entity';
import { AlertEntity } from '@modules/alerts/entities/alert.entity';
import { AlertRuleEntity } from '@modules/alerts/entities/alert-rule.entity';

import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { GpsHistoryModule } from '@modules/gps-history/gps-history.module';
import { GeofencesModule } from '@modules/geofences/geofences.module';
import { AlertsModule } from '@modules/alerts/alerts.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { GpsProvidersModule } from '@modules/gps-providers/gps-providers.module';
// QueueModule removed: GPS pipeline now persists directly to DB (no Redis needed)
// import { QueueModule } from '@modules/queue/queue.module';
import { SuperAdminModule } from '@modules/super-admin/super-admin.module';

const entities = [
  UserEntity,
  OrganizationEntity,
  VehicleEntity,
  VehicleGroupEntity,
  GpsHistoryEntity,
  GeofenceEntity,
  VehicleGeofenceEntity,
  AlertEntity,
  AlertRuleEntity,
];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: (config) => {
        try {
          return configValidationSchema.parse(config);
        } catch (error) {
          throw new Error(`Config validation error: ${error}`);
        }
      },
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      useFactory: () => {
        const config = getConfiguration();
        return {
          type: 'postgres' as const,
          url: config.DATABASE_URL,
          entities,
          namingStrategy: new SnakeNamingStrategy(),
          synchronize: false,
          logging: config.isDevelopment,
          dropSchema: false,
          ssl: config.isProduction ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    OrganizationsModule,
    VehiclesModule,
    GpsHistoryModule,
    GeofencesModule,
    AlertsModule,
    ReportsModule,
    GpsProvidersModule,
    // QueueModule, // Disabled: requires Redis; GPS data pipeline uses direct DB persistence
    SuperAdminModule,
  ],
})
export class AppModule {}
