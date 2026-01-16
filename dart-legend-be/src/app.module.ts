import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { BotTeleModule } from './bot-tele/bot-tele.module';
import { CheckinModule } from './checkin/checkin.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/response-transform-interceptor.interceptor';
import { DatabaseModule } from './database/database.module';
import { GameModule } from './game/game.module';
import { NftModule } from './nft/nft.module';
import { QueueModule } from './queue/queue.module';
import { SocialModule } from './social/social.module';
import { TonWalletModule } from './ton-wallet/ton-wallet.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        config: {
          host: configService.get<string>('QUEUE_HOST'),
          port: configService.get<number>('QUEUE_PORT'),
          username: configService.get<string>('QUEUE_USERNAME'),
          password: configService.get<string>('QUEUE_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('QUEUE_HOST'),
          port: configService.get<number>('QUEUE_PORT'),
          username: configService.get<string>('QUEUE_USERNAME'),
          password: configService.get<string>('QUEUE_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    BotTeleModule,
    TonWalletModule,
    QueueModule,
    GameModule,
    NftModule,
    SocialModule,
    CheckinModule,
    // CronProgramModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
