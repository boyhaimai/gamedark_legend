import { Controller, Post } from '@nestjs/common';
import { BotTeleService } from './bot-tele.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/auth/guards/auth.guard';

@ApiBearerAuth()
@ApiTags('Bot-Tele')
@Controller('bot-tele')
export class BotTeleController {
  constructor(private readonly botTeleService: BotTeleService) {}

  @Public()
  @ApiOperation({
    description: 'Test send hello to telegram group',
    summary: 'Test telegram notification',
  })
  @Post('test-notify')
  testNotify() {
    return this.botTeleService.sendTestNotification();
  }
}
