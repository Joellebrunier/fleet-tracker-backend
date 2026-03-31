import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GpsHistoryService } from './gps-history.service';
import { GpsHistoryController } from './gps-history.controller';
import { GpsHistoryEntity } from './entities/gps-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GpsHistoryEntity])],
  controllers: [GpsHistoryController],
  providers: [GpsHistoryService],
  exports: [GpsHistoryService],
})
export class GpsHistoryModule {}
