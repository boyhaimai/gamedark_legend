import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { TonTransactionService } from './ton-transaction.service';
import { AcceptTransactionDto } from './dto/accept-transaction.dto';
import { CancelTransactionDto } from './dto/cancel-transaction.dto';
import { Address, toNano } from '@ton/ton';
import { ConnectWalletDto } from './dto/connect-wallet.dto';

import OrderModel, {
  CurrencyType,
  Order,
  OrderStatus,
} from 'src/database/models/order.model';
import UserModel, { User } from 'src/database/models/user.model';
import WalletTransactionModel, {
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from 'src/database/models/walletTransaction.model';
import { WithdrawDto } from './dto/withdraw.dto';
import { TonService } from './ton.service';
import { TON_MASTER_WALLET_ADDRESS, TONClientRPC } from './constants';
import ConfigModel, {
  Config,
  ConfigKey,
} from 'src/database/models/config.model';
import { WITHDRAW_FEE_PERCENT } from 'src/utils/constant';
import {
  TransactionStatus,
  TransactionType,
  Transaction,
} from 'src/database/models/transaction.model';
import TransactionModel from 'src/database/models/transaction.model';
import UserNFTModel, { UserNFT } from 'src/database/models/user-NFT.model';
import { BotTeleService } from 'src/bot-tele/bot-tele.service';

@Injectable()
export class TonWalletService {
  constructor(
    @InjectModel(WalletTransactionModel.collection.name)
    private walletTransactionModel: Model<WalletTransaction>,
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(OrderModel.collection.name)
    private orderModel: Model<Order>,
    @InjectModel(ConfigModel.collection.name)
    private configModel: Model<Config>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
    @InjectModel(UserNFTModel.collection.name)
    private userNftModel: Model<UserNFT>,

    private readonly tonTransactionService: TonTransactionService,
    private readonly tonService: TonService,
    @Inject(forwardRef(() => BotTeleService))
    private readonly botTeleService: BotTeleService,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async connectWallet({ body, _id }: { _id: string; body: ConnectWalletDto }) {
    const user = await this.userModel.findById(_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    user.wallet = body.wallet;
    await user.save();
    return { data: 'DONE' };
  }

  async disconnectWallet({ _id }: { _id: string }) {
    const user = await this.userModel.findByIdAndUpdate(_id, { wallet: null });
    return { data: 'DONE' };
  }

  async createOrder({ body, _id }: { _id: string; body: CreateOrderDto }) {
    try {
      const user = await this.userModel.findOne({
        _id,
        wallet: body.wallet,
      });

      const tonPrice = await this.configModel.findOne({
        key: ConfigKey.TON_PRICE,
      });

      if (!user) {
        throw new NotFoundException('User has not connected Wallet');
      }

      // const amount = toNano(1);

      const payload = {
        user: user,
        // amount: amount,
        wallet: body.wallet,
        currency: body.currency ? body.currency : CurrencyType.TON,
        status: OrderStatus.PENDING,
        rate: body.currency === CurrencyType.SGC ? 1 : tonPrice.value,
      };

      const newOrder = await this.orderModel.create(payload);

      // Calculate Jetton Wallet address for SGC orders
      let jettonWalletAddress: string | undefined;
      if (body.currency === CurrencyType.SGC) {
        jettonWalletAddress = await this.tonService.getJettonWalletAddress(
          body.wallet,
        );
      }

      return {
        ...newOrder.toObject(),
        jettonWalletAddress,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async acceptTransaction({
    body,
    _id,
  }: {
    _id: string;
    body: AcceptTransactionDto;
  }) {
    const user = await this.userModel.findOne(
      {
        _id,
        wallet: body.wallet,
      },
      { parents: 0, children: 0 },
    );
    if (!user) {
      throw new NotFoundException('User has not connected Wallet');
    }

    const order = await this.orderModel.findById(body.order_id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Route to appropriate handler based on currency type
    // if (order.currency === CurrencyType.SGC) {
    //   return this.acceptJettonTransaction({ body, _id, user, order });
    // } else {
    return this.acceptTonTransaction({ body, _id, user, order });
    // }
  }

  private async acceptJettonTransaction({
    body,
    _id,
    user,
    order,
  }: {
    _id: string;
    body: AcceptTransactionDto;
    user: User;
    order: Order;
  }) {
    let session: ClientSession = null;

    try {
      // Verify Jetton transaction on blockchain
      const jettonTx =
        await this.tonTransactionService.getJettonTransactionByHash(body.hash);

      // Verify sender matches order wallet
      const senderAddress = Address.parse(jettonTx.sender);
      const orderAddress = Address.parse(order.wallet);
      if (!senderAddress.equals(orderAddress)) {
        throw new BadRequestException(
          'Transaction sender does not match order wallet',
        );
      }

      // Verify recipient is master wallet
      const recipientAddress = Address.parse(jettonTx.recipient);
      const masterAddress = Address.parse(TON_MASTER_WALLET_ADDRESS);
      if (!recipientAddress.equals(masterAddress)) {
        throw new BadRequestException(
          'Transaction recipient is not master wallet',
        );
      }

      // Verify jetton type (SGC)
      if (jettonTx.jettonSymbol !== 'SGC' || jettonTx.jettonName !== 'SGC') {
        throw new BadRequestException('Invalid jetton type');
      }

      // Calculate amount
      const amount = Number(jettonTx.amount) / Math.pow(10, jettonTx.decimals);

      // Verify comment contains orderId (optional but recommended)
      if (
        jettonTx.comment &&
        !jettonTx.comment.includes(order._id.toString())
      ) {
        console.warn(
          `Jetton transaction comment does not contain orderId: ${jettonTx.comment}`,
        );
      }

      // Start database transaction
      session = await this.connection.startSession();
      session.startTransaction();

      // Create wallet transaction record
      const payload = {
        from: jettonTx.sender,
        to: jettonTx.recipient,
        user: user._id,
        order,
        value: jettonTx.amount,
        rate: order.rate,
        hash: body.hash,
        type: WalletTransactionType.DEPOSIT,
        status: WalletTransactionStatus.DONE,
        currency: CurrencyType.SGC,
        amount,
        params: {
          amount,
          value: jettonTx.amount,
          jettonMaster: jettonTx.jettonMaster,
          jettonName: jettonTx.jettonName,
          jettonSymbol: jettonTx.jettonSymbol,
          decimals: jettonTx.decimals,
        },
      };

      await this.walletTransactionModel.create([payload], { session });

      // Update order
      order.accept = true;
      order.status = OrderStatus.SUCCEED;
      order.hash = body.hash;
      order.amount = amount;
      await order.save({ session });

      // Update user balance
      user.$inc('balance', amount);
      await user.save({ session });

      await session.commitTransaction();

      // Send telegram notification
      this.botTeleService.sendNotification(payload);

      return { message: 'OK' };
    } catch (error) {
      if (session) await session.abortTransaction();

      // Handle duplicate hash - transaction already processed by cron
      if (error.code === 11000 && error.message?.includes('hash')) {
        console.log(
          'Jetton transaction already processed by cron (duplicate hash)',
        );
        return {
          message: 'Transaction already processed',
          alreadyProcessed: true,
        };
      }

      throw new BadRequestException(error);
    } finally {
      if (session) await session.endSession();
    }
  }

  private async acceptTonTransaction({
    body,
    _id,
    user,
    order,
  }: {
    _id: string;
    body: AcceptTransactionDto;
    user: User;
    order: Order;
  }) {
    let session: ClientSession = null;

    try {
      const txRs = await this.tonTransactionService.getTransactions({
        limit: 1,
        hash: body.hash,
      });

      const tx = txRs[0];
      const value = tx.inMessage.info?.['value']?.['coins'];
      const fromAddress = tx.inMessage.info?.src;

      if (
        !fromAddress ||
        // @ts-ignore
        !Address.parse(body.wallet).equals(fromAddress) ||
        !value ||
        !tx.inMessage.body.toBoc().toString().includes(order._id.toString()) ||
        // @ts-ignore
        !tx?.aborted ||
        // @ts-ignore
        !tx?.destroyed
      ) {
        order.accept = true;
        order.hash = body.hash;
        await order.save();
        return { message: 'OK' };
      }

      const amount = Number(value) / 1e9;

      const payload = {
        from: fromAddress,
        to: tx.inMessage.info.dest,
        value,
        user: user._id,
        order,
        rate: order.rate,
        forwardFee: tx.inMessage.info['forwardFee'],
        ihr_fee: tx.inMessage.info['ihrFee'],
        createdLt: tx.inMessage.info['createdLt'],
        lt: tx.lt,
        createdAtUtime: tx.inMessage.info['createdAt'],
        hash: Buffer.from(tx.hash()).toString('base64'),
        totalFees: tx?.totalFees?.['coins'],
        type: WalletTransactionType.DEPOSIT,
        status: WalletTransactionStatus.DONE,
        amount,
        params: {
          amount,
          value,
        },
      };

      session = await this.connection.startSession();
      session.startTransaction();

      await this.walletTransactionModel.create([payload], { session });

      order.accept = true;
      order.status = OrderStatus.SUCCEED;
      order.hash = body.hash;
      order.amount = amount;
      await order.save({ session });
      user.$inc('balance', amount);

      await user.save({ session });

      await session.commitTransaction();

      // Send telegram notification
      this.botTeleService.sendNotification(payload);

      return { message: 'OK' };
    } catch (error) {
      if (session) await session.abortTransaction();

      // Handle duplicate hash - transaction already processed by cron
      if (error.code === 11000 && error.message?.includes('hash')) {
        console.log('Transaction already processed by cron (duplicate hash)');
        return {
          message: 'Transaction already processed',
          alreadyProcessed: true,
        };
      }

      throw new BadRequestException(error);
    } finally {
      if (session) await session.endSession();
    }
  }

  async cancelTransaction(body: CancelTransactionDto) {
    try {
      await this.orderModel.findByIdAndUpdate(body.orderId, {
        $set: { status: OrderStatus.CANCEL },
      });

      return { message: 'OK' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async history(_id: string) {
    const transactions = await this.walletTransactionModel.find(
      {
        user: _id,
        status: WalletTransactionStatus.DONE,
      },
      {},
      {
        sort: {
          createdAt: -1,
        },
        limit: 20,
      },
    );
    return transactions;
  }

  async withdraw({ body, _id }: { body: WithdrawDto; _id: string }) {
    const user = await this.userModel.findById(_id, {
      balance: 1,
      username: 1,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.tonService.verifyWalletAddress(body.address);

    // const tonPrice = await this.configModel.findOne({
    //   key: ConfigKey.TON_PRICE,
    // });
    if (Number(user.balance) < Number(body.amount))
      throw new BadRequestException('Not enough balance');

    // Calculate fee (1%)
    const fee = Number(body.amount) * WITHDRAW_FEE_PERCENT;
    const actualAmount = Number(body.amount) - fee;

    const balance = await this.tonService.getBalance();
    if (Number(balance || 0) < actualAmount)
      throw new BadRequestException('Not enough balance');

    const tx = await this.tonService.transfer(
      body.address,
      actualAmount,
      `User ${user.username}, id: ${user._id}, withdraw ${body.amount} TON (fee: ${fee} TON) to ${body.address}`,
    );

    this.walletTransactionModel.create({
      from: TON_MASTER_WALLET_ADDRESS,
      to: body.address,
      user,
      amount: -body.amount,
      rate: 1,
      value: toNano(actualAmount),
      hash: tx.hash().toString('base64'),
      type: WalletTransactionType.WITHDRAW,
      status: WalletTransactionStatus.DONE,
      params: {
        amount: -body.amount,
        actualAmount: actualAmount,
        fee: fee,
        feePercent: WITHDRAW_FEE_PERCENT,
        value: toNano(actualAmount),
        rpc: TONClientRPC.MAINNET,
      },
    });

    user.$inc('balance', -body.amount);
    await user.save();

    // Send telegram notification
    this.botTeleService.sendNotification({
      user,
      amount: -body.amount,
      type: WalletTransactionType.WITHDRAW,
      status: WalletTransactionStatus.DONE,
      hash: tx.hash().toString('base64'),
    });

    return {
      data: {
        hash: tx.hash().toString('base64'),
        amount: body.amount,
        actualAmount: actualAmount,
        fee: fee,
      },
      message: 'OK',
    };
  }

  async withdrawJetton({ body, _id }: { body: WithdrawDto; _id: string }) {
    const user = await this.userModel.findById(_id, {
      balance: 1,
      username: 1,
    });

    const tonPrice = await this.configModel.findOne({
      key: ConfigKey.SGC_PRICE,
    });
    if (Number(user.balance) < Number(body.amount * tonPrice.value))
      throw new BadRequestException('Not enough balance');

    const tx = await this.tonService.transferJetton(
      body.address,
      body.amount,
      `User ${user.username}, id: ${user._id}, withdraw ${body.amount} Jetton to ${body.address}`,
    );

    const data = await this.walletTransactionModel.create({
      from: TON_MASTER_WALLET_ADDRESS,
      to: body.address,
      user,
      type: WalletTransactionType.WITHDRAW_SGC,
      status: WalletTransactionStatus.DONE,
      currency: CurrencyType.SGC,
      params: {
        amount: -body.amount,
        value: toNano(body.amount),
        rpc: TONClientRPC.MAINNET,
      },
      amount: -body.amount,
      rate: tonPrice.value,
      value: toNano(body.amount),
      hash: tx.hash().toString('base64'),
    });

    user.$inc('balance', -body.amount * tonPrice.value);
    await user.save();

    return { message: 'OK' };
  }

  // async getJettonTransaction() {
  //   const data = await this.tonTransactionService.getTransactionJetton();
  //   return data;
  // }

  async getTotalSgcEarned(_id: string) {
    const [result] = await this.userNftModel.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(_id),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$reward_SGC' },
        },
      },
    ]);

    return { total: result?.total || 0 };
  }

  async transferBalance({
    _id,
    amount,
    userName,
  }: {
    _id: string;
    amount: string;
    userName: string;
  }) {
    let session: ClientSession = null;
    try {
      session = await this.connection.startSession();
      session.startTransaction();

      const sender = await this.userModel
        .findById(_id, { balance: 1, username: 1 })
        .session(session);
      if (!sender) {
        throw new NotFoundException('User not found');
      }

      const receiver = await this.userModel
        .findOne({ username: userName }, { balance: 1, username: 1 })
        .session(session);
      if (!receiver) {
        throw new NotFoundException('Receiver not found');
      }

      if (sender.username === receiver.username) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      if (Number(sender.balance) < Number(amount)) {
        throw new BadRequestException('Not enough balance');
      }

      sender.$inc('balance', -Number(amount));
      receiver.$inc('balance', Number(amount));

      await sender.save({ session });
      await receiver.save({ session });

      const transferId = new mongoose.Types.ObjectId().toString();
      await this.walletTransactionModel.create(
        [
          {
            from: sender.username,
            to: receiver.username,
            user: sender._id,
            amount: -amount,
            rate: 1,
            hash: `transfer-${transferId}-out`,
            type: WalletTransactionType.TRANSFER,
            status: WalletTransactionStatus.DONE,
            currency: CurrencyType.TON,
            params: {
              direction: 'out',
            },
          },
          {
            from: sender.username,
            to: receiver.username,
            user: receiver._id,
            amount: amount,
            rate: 1,
            hash: `transfer-${transferId}-in`,
            type: WalletTransactionType.TRANSFER,
            status: WalletTransactionStatus.DONE,
            currency: CurrencyType.TON,
            params: {
              direction: 'in',
            },
          },
        ],
        { session, ordered: true },
      );

      await session.commitTransaction();

      return {
        data: {
          from: sender.username,
          to: receiver.username,
          amount: amount,
        },
        message: 'OK',
      };
    } catch (error) {
      if (session) {
        await session.abortTransaction();
      }
      throw new BadRequestException(error?.message || error);
    } finally {
      if (session) {
        await session.endSession();
      }
    }
  }
}
