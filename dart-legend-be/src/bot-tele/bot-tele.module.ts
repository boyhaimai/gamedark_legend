import { forwardRef, Module } from '@nestjs/common';
import { BotTeleService } from './bot-tele.service';
import { BotTeleController } from './bot-tele.controller';
import { UserModule } from 'src/user/user.module';
import { TonWalletModule } from 'src/ton-wallet/ton-wallet.module';
import { DatabaseModule } from 'src/database/database.module';
import { NftModule } from 'src/nft/nft.module';
import { NftService } from 'src/nft/services/nft.service';

@Module({
  imports: [
    UserModule,
    forwardRef(() => TonWalletModule),
    DatabaseModule,
    NftModule,
  ],
  controllers: [BotTeleController],
  providers: [BotTeleService, NftService],
  exports: [BotTeleService],
})
export class BotTeleModule {}
