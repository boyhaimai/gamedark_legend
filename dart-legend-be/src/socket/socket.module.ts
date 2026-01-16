import { Module } from '@nestjs/common';
import { SocketService } from './socket.service';
import { SocketGateway } from './socket.gateway';
import { SocketController } from './socket.controller';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { BullModule } from '@nestjs/bull';
import { WsJwtGuard } from './guards/jwt.guard';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'cronjob-queue',
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
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async () => {
        return {
          secret:
            process.env.JWT_SECRET_KEY ?? 'AAF3ewpE7z99nSNY5OSnXjh1InXwAH02m9s',
          signOptions: { expiresIn: '1d' },
        };
      },
    }),
    RedisModule,
  ],
  controllers: [SocketController],
  providers: [SocketGateway, SocketService, WsJwtGuard],
  exports: [SocketGateway],
})
export class SocketModule {}
