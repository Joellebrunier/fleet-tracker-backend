import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesService } from './vehicles.service';
import { VehiclesController } from './vehicles.controller';
import { VehicleEntity } from './entities/vehicle.entity';
import { VehicleGroupEntity } from './entities/vehicle-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VehicleEntity, VehicleGroupEntity])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule {}
