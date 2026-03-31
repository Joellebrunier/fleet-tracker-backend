import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Role } from '@common/enums/role.enum';
import { PaginationDto } from '@common/dto/pagination.dto';
import { IPaginatedResult } from '@common/interfaces/pagination.interface';

@Injectable()
export class UsersService {
  private users: Map<string, UserEntity> = new Map(); // Placeholder for DB

  async create(createUserDto: CreateUserDto, organizationId: string): Promise<UserEntity> {
    const existingUser = this.getUserByEmail(createUserDto.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user: UserEntity = {
      id: this.generateId(),
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      password: hashedPassword,
      role: createUserDto.role || Role.OPERATOR,
      organizationId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    return this.sanitizeUser(user);
  }

  async findAll(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<IPaginatedResult<UserEntity>> {
    const allUsers = Array.from(this.users.values()).filter(
      (u) => u.organizationId === organizationId,
    );

    const { page = 1, limit = 20, sort = 'createdAt', order = 'DESC' } = paginationDto;
    const skip = (page - 1) * limit;

    // Simple sorting
    allUsers.sort((a, b) => {
      const aVal = a[sort as keyof UserEntity] ?? '';
      const bVal = b[sort as keyof UserEntity] ?? '';

      if (aVal < bVal) return order === 'ASC' ? -1 : 1;
      if (aVal > bVal) return order === 'ASC' ? 1 : -1;
      return 0;
    });

    const data = allUsers.slice(skip, skip + limit).map((u) => this.sanitizeUser(u));
    const total = allUsers.length;

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async findById(id: string, organizationId: string): Promise<UserEntity> {
    const user = this.users.get(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.organizationId !== organizationId) {
      throw new ForbiddenException('Cannot access user from another organization');
    }

    return this.sanitizeUser(user);
  }

  async update(
    id: string,
    organizationId: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.findById(id, organizationId);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = this.getUserByEmail(updateUserDto.email);
      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    Object.assign(user, updateUserDto);
    user.updatedAt = new Date();
    this.users.set(id, user);

    return this.sanitizeUser(user);
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const user = await this.findById(id, organizationId);
    this.users.delete(id);
  }

  private getUserByEmail(email: string): UserEntity | undefined {
    const users = Array.from(this.users.values());
    return users.find((u) => u.email === email);
  }

  private sanitizeUser(user: UserEntity): UserEntity {
    const { password, ...rest } = user;
    return rest as UserEntity;
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}
