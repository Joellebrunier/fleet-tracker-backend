import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantGuard } from './tenant.guard';
import { OrganizationEntity } from '@modules/organizations/entities/organization.entity';

/**
 * Global module that provides TenantGuard with its required dependencies.
 * TenantGuard needs OrganizationEntity repository to check parent-child
 * organization relationships for multi-tenant access control.
 */
@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity])],
  providers: [TenantGuard],
  exports: [TenantGuard, TypeOrmModule],
})
export class GuardsModule {}
