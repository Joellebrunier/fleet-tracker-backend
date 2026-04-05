import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { IConfiguration } from '@config/configuration';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserPayload } from '@common/interfaces/user-payload.interface';
import { UserEntity } from '@modules/users/entities/user.entity';
import { UserOrganizationEntity } from '@modules/users/entities/user-organization.entity';
import { OrganizationEntity } from '@modules/organizations/entities/organization.entity';
import { Role } from '@common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private organizationsRepository: Repository<OrganizationEntity>,
    @InjectRepository(UserOrganizationEntity)
    private userOrganizationsRepository: Repository<UserOrganizationEntity>,
    private jwtService: JwtService,
    private configService: ConfigService<IConfiguration>,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    // Update last login
    await this.usersRepository.update(user.id, { lastLogin: new Date() });

    // Get all organizations this user belongs to
    const memberships = await this.userOrganizationsRepository.find({
      where: { userId: user.id, isActive: true },
    });

    // If user has memberships, use the home org's role; otherwise fallback to legacy
    const homeOrgMembership = memberships.find((m) => m.organizationId === user.organizationId);
    const activeRole = homeOrgMembership?.role || user.role;

    return this.generateTokens(user, user.organizationId, activeRole, memberships);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Create organization
    const slug = registerDto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const organization = this.organizationsRepository.create({
      name: registerDto.organizationName,
      slug: slug + '-' + Date.now().toString(36),
      isActive: true,
    });
    const savedOrg = await this.organizationsRepository.save(organization);

    // Create user
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      role: Role.ADMIN,
      organizationId: savedOrg.id,
      isActive: true,
    });
    const savedUser = await this.usersRepository.save(user);

    // Create user-organization membership
    const membership = this.userOrganizationsRepository.create({
      userId: savedUser.id,
      organizationId: savedOrg.id,
      role: Role.ADMIN,
      isActive: true,
    });
    await this.userOrganizationsRepository.save(membership);

    return this.generateTokens(savedUser, savedOrg.id, Role.ADMIN, [membership]);
  }

  /**
   * Switch active organization for a user.
   * Returns a new JWT token scoped to the target organization.
   */
  async switchOrganization(
    userId: string,
    targetOrganizationId: string,
  ): Promise<AuthResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check user has membership in target org
    const membership = await this.userOrganizationsRepository.findOne({
      where: { userId, organizationId: targetOrganizationId, isActive: true },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Verify the org exists and is active
    const org = await this.organizationsRepository.findOne({
      where: { id: targetOrganizationId, isActive: true },
    });
    if (!org) {
      throw new ForbiddenException('Organization is not active');
    }

    // Get all memberships for the response
    const allMemberships = await this.userOrganizationsRepository.find({
      where: { userId, isActive: true },
    });

    return this.generateTokens(user, targetOrganizationId, membership.role, allMemberships);
  }

  /**
   * Get all organizations a user belongs to.
   */
  async getUserOrganizations(userId: string): Promise<any[]> {
    const memberships = await this.userOrganizationsRepository.find({
      where: { userId, isActive: true },
    });

    const orgIds = memberships.map((m) => m.organizationId);
    if (orgIds.length === 0) return [];

    const orgs = await this.organizationsRepository
      .createQueryBuilder('o')
      .where('o.id IN (:...orgIds)', { orgIds })
      .getMany();

    return orgs.map((org) => {
      const membership = memberships.find((m) => m.organizationId === org.id)!;
      return {
        id: org.id,
        name: org.name,
        slug: org.slug,
        role: membership.role,
        isActive: org.isActive,
        parentOrganizationId: org.parentOrganizationId,
      };
    });
  }

  async validateToken(token: string): Promise<UserPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return payload as UserPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateTokens(
    user: UserEntity,
    activeOrgId: string,
    activeRole: Role,
    memberships: UserOrganizationEntity[],
  ): AuthResponseDto {
    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      role: activeRole,
      organizationId: activeOrgId,
      homeOrganizationId: user.organizationId,
    };

    const expiresIn = this.configService.get('JWT_EXPIRATION');
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    // Include list of user's organizations in response
    const organizations = memberships.map((m) => ({
      organizationId: m.organizationId,
      role: m.role,
    }));

    return {
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: activeRole,
        organizationId: activeOrgId,
      },
      organizations,
    };
  }
}
