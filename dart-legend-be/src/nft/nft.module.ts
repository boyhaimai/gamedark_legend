import { Module } from '@nestjs/common';
import { NftService } from './services/nft.service';
import { NftController } from './nft.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MintNftService } from './services/mint-nft.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NftController],
  providers: [NftService, MintNftService],
  exports: [MintNftService],
})
export class NftModule {}
