import { ApiTags } from '@nestjs/swagger';
import { CheckinService } from './checkin.service';
import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { JwtPayload } from 'src/auth/jwt/type/jwt-payload.type';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiBearerAuth()
@ApiTags('Checkin')
@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get('daily-attendance')
  getDailyAttendance() {
    return this.checkinService.getDailyAttendance();
  }

  @Post()
  checkin(@Req() req: { user: JwtPayload }) {
    return this.checkinService.checkin(req.user._id);
  }

  @Get()
  getInfoCheckin(@Req() req: { user: JwtPayload }) {
    return this.checkinService.getInfoCheckin(req.user._id);
  }
}
