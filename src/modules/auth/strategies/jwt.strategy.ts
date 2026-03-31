import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IConfiguration } from '@config/configuration';
import { UserPayload } from '@common/interfaces/user-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService<IConfiguration>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || '',
    });
  }

  async validate(payload: UserPayload): Promise<UserPayload> {
    if (!payload.userId || !payload.email || !payload.organizationId) {
      throw new UnauthorizedException('Invalid token payload');
    }
    return payload;
  }
}
