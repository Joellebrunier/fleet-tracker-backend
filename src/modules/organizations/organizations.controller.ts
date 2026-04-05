import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateSubClientDto } from './dto/create-sub-client.dto';
import { UpsertProviderCredentialsDto } from './dto/upsert-provider-credentials.dto';
import { OrganizationEntity } from './entities/organization.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { TenantGuard } from '@common/guards/tenant.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';
import { Provider } from '@common/enums/provider.enum';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  // ─── TOP-LEVEL ORG CRUD (SUPER_ADMIN ONLY) ───────────────────────────

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create top-level organization (super-admin)' })
  @ApiResponse({ status: 201, type: OrganizationEntity })
  async create(@Body() createOrgDto: CreateOrganizationDto): Promise<OrganizationEntity> {
    return this.organizationsService.create(createOrgDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all organizations with sub-clients (super-admin)' })
  @ApiResponse({ status: 200, isArray: true })
  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization details' })
  @ApiResponse({ status: 200, type: OrganizationEntity })
  async findOne(@Param('id') id: string): Promise<OrganizationEntity> {
    return this.organizationsService.findById(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, type: OrganizationEntity })
  async update(
    @Param('id') id: string,
    @Body() updateOrgDto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.update(id, updateOrgDto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete organization (super-admin)' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.organizationsService.remove(id);
  }

  // ─── SUB-CLIENTS ─────────────────────────────────────────────────────

  @Post(':organizationId/sub-clients')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a sub-client under this organization' })
  @ApiResponse({ status: 201, type: OrganizationEntity })
  async createSubClient(
    @Param('organizationId') orgId: string,
    @Body() dto: CreateSubClientDto,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.createSubClient(orgId, dto);
  }

  @Get(':organizationId/sub-clients')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List sub-clients of this organization' })
  @ApiResponse({ status: 200, isArray: true })
  async findSubClients(
    @Param('organizationId') orgId: string,
  ): Promise<OrganizationEntity[]> {
    return this.organizationsService.findSubClients(orgId);
  }

  @Get(':organizationId/tree')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get full hierarchy tree for this organization' })
  async getOrganizationTree(
    @Param('organizationId') orgId: string,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.getOrganizationTree(orgId);
  }

  @Get(':organizationId/accessible-ids')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.MANAGER, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all org IDs this organization can access (recursive)' })
  async getAccessibleOrgIds(
    @Param('organizationId') orgId: string,
  ): Promise<string[]> {
    return this.organizationsService.getAccessibleOrgIds(orgId);
  }

  // ─── PROVIDER CREDENTIALS ────────────────────────────────────────────

  @Get(':organizationId/provider-credentials')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List GPS provider credentials for this organization' })
  async findProviderCredentials(
    @Param('organizationId') orgId: string,
  ): Promise<any[]> {
    const creds = await this.organizationsService.findProviderCredentials(orgId);
    // Mask sensitive credential values in response
    return creds.map((c) => ({
      ...c,
      credentials: this.maskCredentials(c.credentials),
    }));
  }

  @Post(':organizationId/provider-credentials')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create or update GPS provider credentials' })
  async upsertProviderCredentials(
    @Param('organizationId') orgId: string,
    @Body() dto: UpsertProviderCredentialsDto,
  ): Promise<any> {
    const saved = await this.organizationsService.upsertProviderCredentials(orgId, dto);
    return {
      ...saved,
      credentials: this.maskCredentials(saved.credentials),
    };
  }

  @Delete(':organizationId/provider-credentials/:provider')
  @UseGuards(TenantGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete GPS provider credentials' })
  async deleteProviderCredentials(
    @Param('organizationId') orgId: string,
    @Param('provider') provider: Provider,
  ): Promise<{ message: string }> {
    await this.organizationsService.deleteProviderCredentials(orgId, provider);
    return { message: `${provider} credentials deleted` };
  }

  // ─── HELPERS ──────────────────────────────────────────────────────────

  /**
   * Mask credential values for safe API response.
   * Shows only last 4 characters of each value.
   */
  private maskCredentials(creds: Record<string, string>): Record<string, string> {
    const masked: Record<string, string> = {};
    for (const [key, value] of Object.entries(creds)) {
      if (typeof value === 'string' && value.length > 4) {
        masked[key] = '***' + value.slice(-4);
      } else {
        masked[key] = '****';
      }
    }
    return masked;
  }
}
