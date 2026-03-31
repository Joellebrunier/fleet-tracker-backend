import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { TenantGuard } from '@common/guards/tenant.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserPayload } from '@common/interfaces/user-payload.interface';
import { Role } from '@common/enums/role.enum';
import { PaginationDto } from '@common/dto/pagination.dto';

@ApiTags('users')
@Controller('organizations/:organizationId/users')
@UseGuards(JwtAuthGuard, TenantGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({ status: 201, type: UserEntity })
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createUserDto: CreateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.create(createUserDto, organizationId);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'List users' })
  @ApiResponse({ status: 200, isArray: true })
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.usersService.findAll(organizationId, paginationDto);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, type: UserEntity })
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<UserEntity> {
    return this.usersService.findById(id, organizationId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: UserEntity })
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    return this.usersService.update(id, organizationId, updateUserDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete user' })
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.usersService.remove(id, organizationId);
  }
}
