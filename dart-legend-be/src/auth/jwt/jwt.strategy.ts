import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(protected readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: process.env.NODE_ENV === 'development' ? true : false,
      secretOrKey:
        process.env.JWT_SECRET_KEY ?? 'AAF3ewpE7z99nSNY5OSnXjh1InXwAH02m9s',
    });
  }

  async validate(payload: any) {
    if (!payload._id) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
