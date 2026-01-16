import { DatabaseModule } from 'src/database/database.module';
import { CheckinController } from './checkin.controller';
import { CheckinService } from './checkin.service';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register(), DatabaseModule],
  controllers: [CheckinController],
  providers: [CheckinService],
})
export class CheckinModule {}
