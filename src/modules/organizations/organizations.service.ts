import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationEntity } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  private organizations: Map<string, OrganizationEntity> = new Map();

  async create(createOrgDto: CreateOrganizationDto): Promise<OrganizationEntity> {
    const existing = this.getBySlug(createOrgDto.slug);
    if (existing) {
      throw new BadRequestException('Organization slug already exists');
    }

    const org: OrganizationEntity = {
      id: this.generateId(),
      name: createOrgDto.name,
      slug: createOrgDto.slug,
      settings: createOrgDto.settings || {},
      isActive: true,
      subscriptionStatus: 'active',
      apiKeys: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.organizations.set(org.id, org);
    return org;
  }

  async findAll(): Promise<OrganizationEntity[]> {
    return Array.from(this.organizations.values());
  }

  async findById(id: string): Promise<OrganizationEntity> {
    const org = this.organizations.get(id);
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: string, updateOrgDto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    const org = await this.findById(id);
    Object.assign(org, updateOrgDto);
    org.updatedAt = new Date();
    this.organizations.set(id, org);
    return org;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    this.organizations.delete(id);
  }

  private getBySlug(slug: string): OrganizationEntity | undefined {
    const orgs = Array.from(this.organizations.values());
    return orgs.find((o) => o.slug === slug);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
