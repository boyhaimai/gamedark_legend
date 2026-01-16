import { Module } from '@nestjs/common';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { SocketModule } from 'src/socket/socket.module';
import { DatabaseModule } from 'src/database/database.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'nft_reward',
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1,
        backoff: {
          type: 'fixed',
          delay: 5000,
        },
        priority: 1,
        stackTraceLimit: 10,
      },
    }),
    CacheModule.register(),
    SocketModule,
    DatabaseModule,
  ],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}
