import { forwardRef, Module } from '@nestjs/common';
import { TonWalletController } from './ton-wallet.controller';
import { TonWalletService } from './ton-wallet.service';
import { CronTransactionWallet } from './cron-transaction.wallet';
import { TonTransactionService } from './ton-transaction.service';
import { CacheModule } from '@nestjs/cache-manager';
import { DatabaseModule } from 'src/database/database.module';
import { TonService } from './ton.service';
import { TonPriceService } from './ton-price.service';
import { HttpModule } from '@nestjs/axios';
import { BotTeleModule } from 'src/bot-tele/bot-tele.module';

@Module({
  imports: [
    CacheModule.register(),
    DatabaseModule,
    HttpModule,
    forwardRef(() => BotTeleModule),
  ],
  controllers: [TonWalletController],
  providers: [
    TonWalletService,
    CronTransactionWallet,
    TonTransactionService,
    TonService,
    TonPriceService,
  ],
  exports: [TonService, TonWalletService],
})
export class TonWalletModule {}
