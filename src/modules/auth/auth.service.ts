import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
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
import { OrganizationEntity } from '@modules/organizations/entities/organization.entity';
import { Role } from '@common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    @InjectRepository(OrganizationEntity)
    private organizationsRepository: Repository<OrganizationEntity>,
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

    return this.generateTokens(user);
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

    return this.generateTokens(savedUser);
  }

  async validateToken(token: string): Promise<UserPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return payload as UserPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateTokens(user: UserEntity): AuthResponseDto {
    const payload: UserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    };

    const expiresIn = this.configService.get('JWT_EXPIRATION');
    const accessToken = this.jwtService.sign(payload, { expiresIn });

    return {
      accessToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }
}
