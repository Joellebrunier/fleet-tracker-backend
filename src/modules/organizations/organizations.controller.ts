import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationEntity } from './entities/organization.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/role.enum';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create organization' })
  @ApiResponse({ status: 201, type: OrganizationEntity })
  async create(@Body() createOrgDto: CreateOrganizationDto): Promise<OrganizationEntity> {
    return this.organizationsService.create(createOrgDto);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all organizations' })
  @ApiResponse({ status: 200, isArray: true })
  async findAll(): Promise<OrganizationEntity[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization' })
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
  @ApiOperation({ summary: 'Delete organization' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.organizationsService.remove(id);
  }
}
