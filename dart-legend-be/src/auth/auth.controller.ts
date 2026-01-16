import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { LoginDevDto, LoginDto } from './dto/login.dto';
import { Public } from './guards/auth.guard';

@ApiTags('Auth - Xác thực')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post()
  async login(@Body() body: LoginDto) {
    const { access_token } = await this.authService.createToken(body);
    return {
      access_token,
    };
  }

  @Public()
  @Post('dev')
  async createTokenDev(@Body() body: LoginDevDto) {
    const { access_token } = await this.authService.createTokenDev(body);
    return {
      access_token,
    };
  }
}
