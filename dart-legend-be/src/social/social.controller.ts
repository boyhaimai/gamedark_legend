import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { FakeVerifyMissionDTO } from './dto/fake-verify-mission.dto';
import { SocialService } from './social.service';
import { JwtPayload } from 'src/auth/jwt/type/jwt-payload.type';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiBearerAuth()
@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // TODO: Bỏ khi lên prod
  // @Post('tasks')
  // async addTask(@Body() body: CreateTaskDto) {
  //   return await this.socialService.addTask(body);
  // }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @Get('tasks')
  async getAllTaskForUser() {
    return await this.socialService.getAllTask();
  }

  @ApiOperation({
    description: 'Get mission for user',
    summary: 'Mission',
  })
  @Get('mission')
  fakeMissionUser(@Req() req: { user: JwtPayload }) {
    return this.socialService.taskForUser(req.user._id);
  }

  @ApiOperation({
    description: 'User check mission',
    summary: 'User check mission',
  })
  @Post('check-mission')
  checkMissionUser(
    @Req() req: { user: JwtPayload },
    @Body() body: FakeVerifyMissionDTO,
  ) {
    return this.socialService.fakeVerifiedSocial(req.user._id, body);
  }
}
