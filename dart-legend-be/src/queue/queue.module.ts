import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
// import { SocketModule } from "../socket/socket.module";
import { CronjobProcessor } from './cronjob.processor';
import { QueueService } from './queue.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { DatabaseModule } from 'src/database/database.module';
import { NftRewardProcessor } from './nft-reward.processor';
import { NftRewardSGCProcessor } from './nft-reward-SGC.processor';
import { TonWalletModule } from 'src/ton-wallet/ton-wallet.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue(
      {
        name: 'cronjob-queue',
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 3, // Number of retry attempts
          backoff: {
            type: 'fixed', // You can also use 'exponential' for exponential backoff
            delay: 5000, // 5 seconds
          },
          priority: 1,
          stackTraceLimit: 10,
        },
      },
      {
        name: 'nft_reward',
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 3, // Number of retry attempts
          backoff: {
            type: 'fixed', // You can also use 'exponential' for exponential backoff
            delay: 5000, // 5 seconds
          },
          priority: 1,
          stackTraceLimit: 10,
        },
      },
      {
        name: 'nft_reward_sgc',
        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 3, // Number of retry attempts
          backoff: {
            type: 'fixed', // You can also use 'exponential' for exponential backoff
            delay: 5000, // 5 seconds
          },
          priority: 1,
          stackTraceLimit: 10,
        },
      },
    ),
    RedisModule,
    TonWalletModule,
  ],
  providers: [
    QueueService,
    CronjobProcessor,
    NftRewardProcessor,
    NftRewardSGCProcessor,
  ],
  exports: [QueueService],
})
export class QueueModule {}
