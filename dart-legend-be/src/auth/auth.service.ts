import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthUserLoginDto, LoginDevDto, LoginDto } from './dto/login.dto';
import * as crypto from 'crypto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from 'src/database/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    protected readonly jwtService: JwtService,
    private configService: ConfigService,
    private userService: UserService,
  ) {}
  async createToken(body: LoginDto) {
    const { verify, user, code } = await this.auth(body);

    // if (!verify) {
    //   throw new UnauthorizedException('Unauthorized')
    // }

    const findUser = await this.userService.updateAvatar({
      userId: user.id,
      avatar: user?.photo_url,
    });

    const access_token = await this.jwtService.signAsync({
      _id: findUser._id,
      username: findUser.username,
      is_premium: findUser.is_premium,
      userId: findUser.userId,
      role: findUser.role,
    });

    return { access_token };
  }

  async createTokenDev(body: LoginDevDto) {
    if (this.configService.getOrThrow<string>('NODE_ENV') === 'production') {
      return { access_token: '' };
    }
    const access_token = await this.jwtService.signAsync({
      _id: body.id,
      role: UserRole.ADMIN,
    });

    return { access_token };
  }

  async auth(body: LoginDto) {
    const initData = new URLSearchParams(body.initData);

    const TELEGRAM_BOT_API_KEY = this.configService.get<string>(
      'TELEGRAM_BOT_API_KEY',
    );

    initData.sort();
    const referrerCode = initData.get('start_param');

    const hash = initData.get('hash');
    initData.delete('hash');

    const dataToCheck = [...initData.entries()]
      .map(([key, value]) => key + '=' + value)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(TELEGRAM_BOT_API_KEY)
      .digest();

    const _hash = crypto
      .createHmac('sha256', secretKey)
      .update(dataToCheck)
      .digest('hex');

    return {
      verify: hash === _hash,
      user: JSON.parse(initData.get('user')),
      code: referrerCode,
    };
  }
}
