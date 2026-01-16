import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/guards/auth.guard';
import { TonWalletService } from './ton-wallet.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AcceptTransactionDto } from './dto/accept-transaction.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { TON_MASTER_WALLET_ADDRESS } from './constants';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { ConnectWalletDto } from './dto/connect-wallet.dto';
import { JwtPayload } from 'src/auth/jwt/type/jwt-payload.type';
import { TonPriceService } from './ton-price.service';
import { WithdrawDto } from './dto/withdraw.dto';

@ApiBearerAuth()
@ApiTags('Wallet')
@Controller('wallet')
export class TonWalletController {
  constructor(
    private readonly walletService: TonWalletService,
    private readonly tonPriceService: TonPriceService,
  ) {}

  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  @Get('dest-wallet')
  getDestinationWallet() {
    return { wallet: TON_MASTER_WALLET_ADDRESS };
  }

  @ApiOperation({
    description: 'User connect wallet',
    summary: 'User connect wallet',
  })
  @Post()
  connectWallet(
    @Body() body: ConnectWalletDto,
    @Req() req: { user: JwtPayload },
  ) {
    const _id = req?.user?._id;
    return this.walletService.connectWallet({ _id, body });
  }

  @ApiOperation({
    description: 'User disconnect wallet',
    summary: 'User disconnect wallet',
  })
  @Post('disconnect')
  disconnectWallet(@Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.walletService.disconnectWallet({ _id });
  }

  @Post('order')
  createOrder(@Body() body: CreateOrderDto, @Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.walletService.createOrder({ body, _id });
  }

  @Post('accept')
  acceptTransaction(
    @Body() body: AcceptTransactionDto,
    @Req() req: { user: JwtPayload },
  ) {
    const _id = req?.user?._id;
    return this.walletService.acceptTransaction({ body, _id });
  }

  @Post('cancel')
  cancelTransaction(@Body() body: CancelTransactionDto) {
    return this.walletService.cancelTransaction(body);
  }

  @Get('history')
  history(@Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.walletService.history(_id);
  }

  @Post('withdraw')
  withdraw(@Body() body: WithdrawDto, @Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.walletService.withdraw({ body, _id });
  }

  @ApiOperation({
    description: 'Transfer balance between users',
    summary: 'Transfer balance',
  })
  @Post('transfer')
  transferBalance(
    @Body() { amount, userName }: { amount: string; userName: string },
    @Req() req: { user: JwtPayload },
  ) {
    const _id = req?.user?._id;
    return this.walletService.transferBalance({ amount, userName, _id });
  }

  @Get('price')
  getPrice() {
    return this.tonPriceService.getTonPrice();
  }

  // @Post('withdraw-jetton')
  // withdrawJetton(@Body() body: WithdrawDto, @Req() req: { user: JwtPayload }) {
  //   const _id = req?.user?._id;
  //   return this.walletService.withdrawJetton({ body, _id });
  // }

  @ApiOperation({
    description: 'Get total SGC earned (sum of completed SGC deposits)',
    summary: 'Total SGC earned',
  })
  @Get('sgc-total')
  getTotalSgcEarned(@Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.walletService.getTotalSgcEarned(_id);
  }

  // @Get('jetton-transaction')
  // getJettonTransaction() {
  //   return this.walletService.getJettonTransaction();
  // }
}
