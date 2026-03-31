import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';

import { configuration, getConfiguration } from '@config/configuration';
import { configValidationSchema } from '@config/validation.schema';

import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { OrganizationsModule } from '@modules/organizations/organizations.module';
import { VehiclesModule } from '@modules/vehicles/vehicles.module';
import { GpsHistoryModule } from '@modules/gps-history/gps-history.module';
import { GeofencesModule } from '@modules/geofences/geofences.module';
import { AlertsModule } from '@modules/alerts/alerts.module';
import { ReportsModule } from '@modules/reports/reports.module';
import { GpsProvidersModule } from '@modules/gps-providers/gps-providers.module';
import { QueueModule } from '@modules/queue/queue.module';
import { SuperAdminModule } from '@modules/super-admin/super-admin.module';

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
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: config.isDevelopment,
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
    QueueModule,
    SuperAdminModule,
  ],
})
export class AppModule {}
