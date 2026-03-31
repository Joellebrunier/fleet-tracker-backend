import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeofencesService } from './geofences.service';
import { GeofencesController } from './geofences.controller';
import { GeofenceEntity } from './entities/geofence.entity';
import { VehicleGeofenceEntity } from './entities/vehicle-geofence.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GeofenceEntity, VehicleGeofenceEntity])],
  controllers: [GeofencesController],
  providers: [GeofencesService],
  exports: [GeofencesService],
})
export class GeofencesModule {}
