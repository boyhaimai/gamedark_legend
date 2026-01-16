import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from 'src/database/database.module';
import { LeaderboardController } from './leaderboard.controller';
import { TreeSystemService } from './tree.service';

@Module({
  imports: [CacheModule.register(), DatabaseModule],
  controllers: [UserController, LeaderboardController],
  providers: [UserService, TreeSystemService],
  exports: [UserService],
})
export class UserModule {}
