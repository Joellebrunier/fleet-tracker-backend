import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { IConfiguration } from '@config/configuration';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserPayload } from '@common/interfaces/user-payload.interface';
import { Role } from '@common/enums/role.enum';

// Placeholder for user database service - would be injected in real scenario
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: Role;
  organizationId: string;
  isActive: boolean;
}

@Injectable()
export class AuthService {
  private users: Map<string, User> = new Map(); // Placeholder for DB

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<IConfiguration>,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = this.getUserByEmail(loginDto.email);

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

    return this.generateTokens(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const existingUser = this.getUserByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const userId = crypto.randomUUID();
    const organizationId = crypto.randomUUID();

    const newUser: User = {
      id: userId,
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      password: hashedPassword,
      role: Role.ADMIN, // First user is admin
      organizationId,
      isActive: true,
    };

    this.users.set(userId, newUser);

    return this.generateTokens(newUser);
  }

  async validateToken(token: string): Promise<UserPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return payload as UserPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private generateTokens(user: User): AuthResponseDto {
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

  private getUserByEmail(email: string): User | undefined {
    const users = Array.from(this.users.values());
    return users.find((u) => u.email === email);
  }
}
