import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayload } from 'src/auth/jwt/type/jwt-payload.type';
import { BuyNftDto } from './dto/buy-nft.dto';
import { NftService } from './services/nft.service';
import { MintNftService } from './services/mint-nft.service';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import {
  PaginationParams,
  PaginationQuery,
} from 'src/common/dto/pagination.dto';

@ApiBearerAuth()
@ApiTags('NFT')
@Controller('nft')
export class NftController {
  constructor(
    private readonly nftService: NftService,
    private readonly mintNftService: MintNftService,
  ) {}

  @Get()
  findAll() {
    return this.nftService.findAll();
  }

  @Get('user')
  findUserNFTs(@Req() req: { user: JwtPayload }) {
    return this.nftService.findUserNFTs(req.user._id);
  }

  @Get('transaction-history')
  getNftTransactionHistory(
    @Req() req: { user: JwtPayload },
    @Pagination() pagination: PaginationParams,
  ) {
    return this.nftService.getTransactionHistory(
      req.user._id,
      new PaginationQuery(pagination),
    );
  }

  @Post('buy')
  buyNFT(@Req() req: { user: JwtPayload }, @Body() body: BuyNftDto) {
    return this.nftService.buyNFT(req.user._id, body.nftId);
  }

  // @Post('mint')
  // mintNFT(@Req() req: { user: JwtPayload }) {
  //   return this.nftService.transferNFT();
  //   // return this.mintNftService.deployAndMint(
  //   //   'https://sucosun-s3.s3.ap-southeast-1.amazonaws.com/redNFT.json',
  //   // );
  // }
}
