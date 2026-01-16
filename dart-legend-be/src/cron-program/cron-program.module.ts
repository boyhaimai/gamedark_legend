import { Module } from '@nestjs/common';
import { CronProgramService } from './cron-program.service';
import { TonWalletModule } from 'src/ton-wallet/ton-wallet.module';
import { GameModule } from 'src/game/game.module';
import { GameService } from 'src/game/game.service';
import { TonPriceService } from 'src/ton-wallet/ton-price.service';
import { CronTransactionWallet } from 'src/ton-wallet/cron-transaction.wallet';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [TonWalletModule, GameModule, DatabaseModule],
  controllers: [],
  providers: [
    CronProgramService,
    GameService,
    TonPriceService,
    CronTransactionWallet,
  ],
})
export class CronProgramModule {}
