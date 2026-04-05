import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '@modules/organizations/entities/organization.entity';
import { Role } from '@common/enums/role.enum';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationsRepository: Repository<OrganizationEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user || !user.organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // SUPER_ADMIN bypasses tenant checks entirely
    if (user.role === Role.SUPER_ADMIN) {
      const organizationIdParam =
        request.params.organizationId || request.query.organizationId;
      request.organizationId = organizationIdParam || user.organizationId;
      return true;
    }

    // Extract organizationId from request params or query
    const organizationIdParam =
      request.params.organizationId || request.query.organizationId;

    if (!organizationIdParam) {
      // No specific org requested — use user's org
      request.organizationId = user.organizationId;
      return true;
    }

    // Same org — always allowed
    if (organizationIdParam === user.organizationId) {
      request.organizationId = user.organizationId;
      return true;
    }

    // Check if user's org is the parent of the requested org (parent → sub-client access)
    const targetOrg = await this.organizationsRepository.findOne({
      where: { id: organizationIdParam },
      select: ['id', 'parentOrganizationId'],
    });

    if (targetOrg && targetOrg.parentOrganizationId === user.organizationId) {
      // User's org is the parent of the target — allowed (ADMIN/MANAGER only)
      if (user.role === Role.ADMIN || user.role === Role.MANAGER) {
        request.organizationId = organizationIdParam;
        return true;
      }
    }

    throw new ForbiddenException('Cannot access other organizations');
  }
}
