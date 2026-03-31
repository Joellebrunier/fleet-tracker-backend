import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user || !user.organizationId) {
      throw new ForbiddenException('Organization context required');
    }

    // Extract organizationId from request params or query
    const organizationIdParam = request.params.organizationId || request.query.organizationId;

    // If specific org is being accessed, verify user belongs to it
    if (organizationIdParam && organizationIdParam !== user.organizationId) {
      throw new ForbiddenException('Cannot access other organizations');
    }

    // Attach organization context to request
    request.organizationId = user.organizationId;

    return true;
  }
}
