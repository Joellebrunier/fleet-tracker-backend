import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import { ProviderCredentialsEntity } from './entities/provider-credentials.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CreateSubClientDto } from './dto/create-sub-client.dto';
import { UpsertProviderCredentialsDto } from './dto/upsert-provider-credentials.dto';
import { Provider } from '@common/enums/provider.enum';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationsRepository: Repository<OrganizationEntity>,
    @InjectRepository(ProviderCredentialsEntity)
    private providerCredentialsRepository: Repository<ProviderCredentialsEntity>,
  ) {}

  // ─── ORGANIZATIONS CRUD ──────────────────────────────────────────────

  async create(createDto: CreateOrganizationDto): Promise<OrganizationEntity> {
    const existing = await this.organizationsRepository.findOne({
      where: { slug: createDto.slug },
    });
    if (existing) {
      throw new BadRequestException('Organization with this slug already exists');
    }

    const org = this.organizationsRepository.create(createDto);
    return this.organizationsRepository.save(org);
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['children'],
    });
  }

  async findById(id: string): Promise<OrganizationEntity> {
    const org = await this.organizationsRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: string, updateDto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    await this.findById(id);
    await this.organizationsRepository.update(id, updateDto);
    return this.findById(id);
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.organizationsRepository.delete(id);
  }

  // ─── SUB-CLIENTS ─────────────────────────────────────────────────────

  /**
   * Create a sub-client under a parent organization.
   * The caller must be ADMIN of the parent org or SUPER_ADMIN.
   */
  async createSubClient(
    parentOrgId: string,
    dto: CreateSubClientDto,
  ): Promise<OrganizationEntity> {
    // Verify parent exists
    const parent = await this.findById(parentOrgId);

    // Check slug uniqueness
    const existing = await this.organizationsRepository.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new BadRequestException('Organization with this slug already exists');
    }

    const subClient = this.organizationsRepository.create({
      name: dto.name,
      slug: dto.slug,
      settings: dto.settings,
      parentOrganizationId: parentOrgId,
      isActive: true,
      subscriptionStatus: 'active',
    });

    return this.organizationsRepository.save(subClient);
  }

  /**
   * List all sub-clients of a parent organization.
   */
  async findSubClients(parentOrgId: string): Promise<OrganizationEntity[]> {
    return this.organizationsRepository.find({
      where: { parentOrganizationId: parentOrgId },
      order: { name: 'ASC' },
      relations: ['children'],
    });
  }

  /**
   * Get all organization IDs that a parent org can access
   * (itself + all descendants recursively, unlimited depth).
   * Uses a recursive CTE for performance.
   */
  async getAccessibleOrgIds(orgId: string): Promise<string[]> {
    const result = await this.organizationsRepository.query(
      `
      WITH RECURSIVE org_tree AS (
        SELECT id FROM organizations WHERE id = $1
        UNION ALL
        SELECT o.id FROM organizations o
        INNER JOIN org_tree t ON o.parent_organization_id = t.id
      )
      SELECT id FROM org_tree
      `,
      [orgId],
    );
    return result.map((r: any) => r.id);
  }

  /**
   * Get the full hierarchy tree for an organization (with children nested).
   */
  async getOrganizationTree(orgId: string): Promise<OrganizationEntity> {
    const org = await this.findById(orgId);
    await this.loadChildrenRecursive(org);
    return org;
  }

  private async loadChildrenRecursive(org: OrganizationEntity): Promise<void> {
    const children = await this.organizationsRepository.find({
      where: { parentOrganizationId: org.id },
      order: { name: 'ASC' },
    });
    org.children = children;
    for (const child of children) {
      await this.loadChildrenRecursive(child);
    }
  }

  /**
   * Check if orgA is an ancestor of orgB (or same org).
   * Works for unlimited depth.
   */
  async isAncestorOrSelf(ancestorOrgId: string, targetOrgId: string): Promise<boolean> {
    if (ancestorOrgId === targetOrgId) return true;
    const accessibleIds = await this.getAccessibleOrgIds(ancestorOrgId);
    return accessibleIds.includes(targetOrgId);
  }

  // ─── PROVIDER CREDENTIALS ────────────────────────────────────────────

  /**
   * List all provider credentials for an organization.
   * Credentials values are masked in the response.
   */
  async findProviderCredentials(orgId: string): Promise<ProviderCredentialsEntity[]> {
    return this.providerCredentialsRepository.find({
      where: { organizationId: orgId },
      order: { provider: 'ASC' },
    });
  }

  /**
   * Get raw (unmasked) credentials for a specific provider+org.
   * Used internally by adapters — not exposed via API.
   */
  async getProviderCredentials(
    orgId: string,
    provider: Provider,
  ): Promise<ProviderCredentialsEntity | null> {
    return this.providerCredentialsRepository.findOne({
      where: { organizationId: orgId, provider, isActive: true },
    });
  }

  /**
   * Get all active credentials for a given provider across all organizations.
   * Used by TrackerDiscoveryService to discover trackers per org.
   */
  async getAllActiveCredentialsByProvider(
    provider: Provider,
  ): Promise<ProviderCredentialsEntity[]> {
    return this.providerCredentialsRepository.find({
      where: { provider, isActive: true },
    });
  }

  /**
   * Get all active credentials across all providers and orgs.
   */
  async getAllActiveCredentials(): Promise<ProviderCredentialsEntity[]> {
    return this.providerCredentialsRepository.find({
      where: { isActive: true },
    });
  }

  /**
   * Upsert (create or update) provider credentials for an organization.
   */
  async upsertProviderCredentials(
    orgId: string,
    dto: UpsertProviderCredentialsDto,
  ): Promise<ProviderCredentialsEntity> {
    // Validate credential fields per provider
    this.validateCredentialFields(dto.provider, dto.credentials);

    let existing = await this.providerCredentialsRepository.findOne({
      where: { organizationId: orgId, provider: dto.provider },
    });

    if (existing) {
      existing.credentials = dto.credentials;
      if (dto.label !== undefined) existing.label = dto.label;
      if (dto.isActive !== undefined) existing.isActive = dto.isActive;
      return this.providerCredentialsRepository.save(existing);
    }

    const entity = this.providerCredentialsRepository.create({
      organizationId: orgId,
      provider: dto.provider,
      credentials: dto.credentials,
      label: dto.label,
      isActive: dto.isActive ?? true,
    });
    return this.providerCredentialsRepository.save(entity);
  }

  /**
   * Delete provider credentials for an org+provider.
   */
  async deleteProviderCredentials(orgId: string, provider: Provider): Promise<void> {
    const result = await this.providerCredentialsRepository.delete({
      organizationId: orgId,
      provider,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`No ${provider} credentials found for this organization`);
    }
  }

  /**
   * Validate that required fields are present for each provider type.
   */
  private validateCredentialFields(provider: Provider, credentials: Record<string, string>): void {
    const requiredFields: Record<string, string[]> = {
      [Provider.FLESPI]: ['token'],
      [Provider.ECHOES]: ['apiKey', 'accountId'],
      [Provider.KEEPTRACE]: ['apiKey'],
      [Provider.UBIWAN]: ['username', 'password', 'license'],
    };

    const required = requiredFields[provider];
    if (!required) return;

    const missing = required.filter((f) => !credentials[f]);
    if (missing.length > 0) {
      throw new BadRequestException(
        `Missing required credential fields for ${provider}: ${missing.join(', ')}`,
      );
    }
  }
}
