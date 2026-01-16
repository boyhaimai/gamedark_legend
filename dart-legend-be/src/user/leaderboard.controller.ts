import { Controller, Get, Req, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiBearerAuth()
@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get('top-referral')
  async getTopReferral() {
    return this.userService.getTopReferral();
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get('top-earn')
  async getTopEarn() {
    return this.userService.getTopEarn();
  }
}
