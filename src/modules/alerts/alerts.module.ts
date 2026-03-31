import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { AlertEntity } from './entities/alert.entity';
import { AlertRuleEntity } from './entities/alert-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AlertEntity, AlertRuleEntity])],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
