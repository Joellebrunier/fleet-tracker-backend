import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripEntity } from './entities/trip.entity';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TripEntity])],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
