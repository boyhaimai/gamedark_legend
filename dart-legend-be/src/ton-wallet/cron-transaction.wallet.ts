import { Injectable } from '@nestjs/common';
import { Address, beginCell, toNano, TonClient } from '@ton/ton';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TON_MASTER_WALLET_ADDRESS, TONClientRPC } from './constants';
import * as moment from 'moment';
import UserModel, { User } from 'src/database/models/user.model';

import OrderModel, {
  CurrencyType,
  Order,
  OrderStatus,
} from 'src/database/models/order.model';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import WalletTransactionModel, {
  WalletTransaction,
  WalletTransactionStatus,
  WalletTransactionType,
} from 'src/database/models/walletTransaction.model';
import axios from 'axios';

@Injectable()
export class CronTransactionWallet {
  private readonly tonClient: TonClient = new TonClient({
    endpoint: TONClientRPC.MAINNET,
    // endpoint: TONClientRPC.MAINNET,
  });

  constructor(
    @InjectModel(WalletTransactionModel.collection.name)
    private transactionModel: Model<WalletTransaction>,
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(OrderModel.collection.name)
    private orderModel: Model<Order>,
    private readonly configService: ConfigService,
  ) {}

  async getTransactions() {
    return await this.tonClient.getTransactions(
      Address.parse(TON_MASTER_WALLET_ADDRESS),
      {
        limit: 5,
        archival: true,
      },
    );
  }

  async getTransactionJetton() {
    try {
      const masterWalletAddress = Address.parse(
        TON_MASTER_WALLET_ADDRESS,
      ).toRawString();
      const response = await axios.get(
        `https://tonapi.io/v2/accounts/${masterWalletAddress}/jettons/history`,
        {
          headers: {
            // Authorization: `Bearer ${this.tonApiKey}`,
          },
          params: { limit: 10 },
        },
      );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  async findOrderPending() {
    try {
      const deadline = moment().subtract(5, 'minute').toDate();

      await this.orderModel.updateMany(
        {
          status: OrderStatus.PENDING,
          createdAt: { $lte: deadline },
        },
        { status: OrderStatus.CANCEL },
      );
      const order = await this.orderModel
        .find({
          status: OrderStatus.PENDING,
          currency: CurrencyType.TON,
          // accept: true,
          createdAt: {
            $gte: deadline,
          },
        })
        .populate('user');

      return order;
    } catch (error) {
      console.log(error);
    }
  }

  async findOrderJettonPending() {
    try {
      const deadline = moment().subtract(5, 'minute').toDate();

      return await this.orderModel
        .find({
          status: OrderStatus.PENDING,
          currency: CurrencyType.SGC,
          // accept: true,
          createdAt: {
            $gte: deadline,
          },
        })
        .populate('user');
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async onProcess() {
    if (this.configService.getOrThrow<string>('NODE_ENV') === 'development') {
      return;
    }
    try {
      const orders = await this.findOrderPending();

      if (orders?.length == 0) {
        return;
      }

      const txs = await this.getTransactions();

      // const body = beginCell()
      //   .storeUint(0, 32)
      //   .storeStringTail('2018402345 claimed Reward!')
      //   .endCell();
      // console.log(
      //   txs[3],
      //   txs[3].inMessage.info['value']['coins'],
      //   txs[3].inMessage.info['value'],
      //   // txs[4].inMessage.body.toBoc().toString().includes('2018402345'),
      //   Number(txs[3].inMessage.info['value']['coins']) / 1e9,
      //   // body.equals(txs[4].inMessage.body),
      // );
      const transaction = await this.transactionModel.findOne(
        { status: WalletTransactionStatus.DONE },
        {},
        { sort: { createdAt: -1 } },
      );
      let lt = '36321545000006';
      if (transaction) {
        lt = transaction?.lt;
      }

      for (const order of orders) {
        const orderTx = txs.find((tx) => {
          const fromAddress = tx.inMessage?.info?.src as Address;
          const value = tx.inMessage?.info?.['value']?.['coins'];

          return (
            value &&
            fromAddress &&
            Address.parse(order.wallet).equals(fromAddress) &&
            tx.lt > BigInt(lt) &&
            tx.inMessage.body
              .toBoc()
              .toString()
              .includes(order._id.toString()) &&
            // @ts-ignore
            !tx?.aborted &&
            // @ts-ignore
            !tx?.destroyed
          );
        });

        if (orderTx) {
          const session = await this.transactionModel.db.startSession();
          session.startTransaction();

          try {
            const user = order.user as User;
            const value = orderTx.inMessage?.info?.['value']?.['coins'];
            const amount = Number(value) / 1e9;
            const payload = {
              from: orderTx.inMessage.info.src,
              to: orderTx.inMessage.info.dest,
              user: user._id,
              order,
              value,
              rate: order.rate,
              forwardFee: orderTx.inMessage.info['forwardFee'],
              ihr_fee: orderTx.inMessage.info['ihrFee'],
              createdLt: orderTx.inMessage.info['createdLt'],
              lt: orderTx.lt,
              createdAtUtime: orderTx.inMessage.info?.['createdAt'],
              hash: Buffer.from(orderTx.hash()).toString('base64'),
              totalFees: orderTx.totalFees['coins'],
              amount,
              type: WalletTransactionType.DEPOSIT,
              status: WalletTransactionStatus.DONE,
              params: {
                amount,
                value,
              },
            };

            await this.transactionModel.insertMany([payload], { session });

            order.status = OrderStatus.SUCCEED;
            order.amount = amount;
            order.hash = Buffer.from(orderTx.hash()).toString('base64');
            await order.save({ session });

            user.$inc('balance', amount);
            await user.save({ session });

            await session.commitTransaction();
          } catch (error) {
            await session.abortTransaction();
            
            // Skip if already processed by acceptTransaction
            // This prevents double balance credit
            if (error.code === 11000 && error.message?.includes('hash')) {
              console.log('Transaction already processed by acceptTransaction (duplicate hash)');
            } else {
              console.log('------------------ERROR (TON)------------------');
              console.log(error);
            }
          } finally {
            await session.endSession();
          }
        }
        continue;
      }
    } catch (error) {
      console.log('------------------ERROR------------------');
      console.log(error);
    } finally {
    }
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async onProcessJetton() {
    if (this.configService.getOrThrow<string>('NODE_ENV') === 'development') {
      return;
    }
    try {
      const orders = await this.findOrderJettonPending();
      if (orders?.length == 0) {
        return;
      }

      const txs = await this.getTransactionJetton();

      const transaction = await this.transactionModel.findOne(
        { status: WalletTransactionStatus.DONE },
        {},
        { sort: { createdAt: -1 } },
      );
      let lt = '36321545000006';
      if (transaction) {
        lt = transaction?.lt;
      }

      for (const order of orders) {
        const orderTx = txs.operations.find((tx) => {
          const fromAddress = tx.source?.address;
          const value = tx.amount;

          const nameJetton = tx?.jetton?.name;
          const symbol = tx?.jetton?.symbol;

          return (
            value &&
            fromAddress &&
            Address.parse(order.wallet).equals(Address.parse(fromAddress)) &&
            tx.lt > BigInt(lt) &&
            nameJetton == 'SGC' &&
            symbol == 'SGC' &&
            // Verify comment contains orderId
            (tx.comment && tx.comment.includes(order._id.toString()))
          );
        });

        if (orderTx) {
          const session = await this.transactionModel.db.startSession();
          session.startTransaction();

          try {
            const user = order.user as User;
            const value = orderTx.amount;
            const amount = Number(value) / 1e9;
            const payload = {
              from: Address.parse(orderTx.source.address).toString(),
              to: Address.parse(orderTx.destination.address).toString(),
              user: user._id,
              order,
              value,
              rate: 1,
              forwardFee: orderTx?.forwardFee,
              ihr_fee: orderTx?.ihrFee,
              createdLt: orderTx?.createdLt,
              lt: orderTx.lt,
              createdAtUtime: orderTx?.utime,
              hash: Buffer.from(orderTx.transaction_hash).toString('base64'),
              amount,
              type: WalletTransactionType.DEPOSIT,
              currency: CurrencyType.SGC,
              status: WalletTransactionStatus.DONE,
              params: {
                amount,
                value,
              },
            };

            await this.transactionModel.insertMany([payload], { session });

            order.status = OrderStatus.SUCCEED;
            order.amount = amount;
            order.hash = Buffer.from(orderTx.transaction_hash).toString('base64');
            await order.save({ session });

            user.$inc('balance', amount);
            await user.save({ session });

            await session.commitTransaction();
          } catch (error) {
            await session.abortTransaction();
            
            // Skip if already processed (rare case)
            if (error.code === 11000 && error.message?.includes('hash')) {
              console.log('Transaction already processed (Jetton duplicate hash)');
            } else {
              console.log('------------------ERROR (Jetton)------------------');
              console.log(error);
            }
          } finally {
            await session.endSession();
          }
        }
        continue;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
