import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrganizationEntity } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(OrganizationEntity)
    private organizationsRepository: Repository<OrganizationEntity>,
  ) {}

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
    return this.organizationsRepository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<OrganizationEntity> {
    const org = await this.organizationsRepository.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: string, updateDto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    const org = await this.findById(id);
    await this.organizationsRepository.update(id, updateDto);
    const result = await this.organizationsRepository.findOne({ where: { id } });
    return result!;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.organizationsRepository.delete(id);
  }
}
