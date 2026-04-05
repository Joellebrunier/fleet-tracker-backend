import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { OrganizationEntity } from './entities/organization.entity';
import { ProviderCredentialsEntity } from './entities/provider-credentials.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity, ProviderCredentialsEntity])],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
