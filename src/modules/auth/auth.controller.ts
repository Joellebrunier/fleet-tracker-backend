import { Controller, Post, Get, Body, UseGuards, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { UserPayload } from '@common/interfaces/user-payload.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user info' })
  async getMe(@CurrentUser() user: UserPayload): Promise<any> {
    return {
      id: user.userId,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      homeOrganizationId: user.homeOrganizationId,
    };
  }

  /**
   * Get all organizations the current user belongs to.
   * Used by the frontend to display the org switcher.
   */
  @Get('organizations')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get organizations the user belongs to' })
  async getUserOrganizations(@CurrentUser() user: UserPayload): Promise<any> {
    return this.authService.getUserOrganizations(user.userId);
  }

  /**
   * Switch to a different organization.
   * Returns a new JWT scoped to the target org.
   */
  @Post('switch-organization')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Switch active organization' })
  async switchOrganization(
    @CurrentUser() user: UserPayload,
    @Body() body: { organizationId: string },
  ): Promise<AuthResponseDto> {
    return this.authService.switchOrganization(user.userId, body.organizationId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(200)
  @ApiOperation({ summary: 'Logout' })
  async logout(): Promise<{ message: string }> {
    return { message: 'Logged out successfully' };
  }
}
