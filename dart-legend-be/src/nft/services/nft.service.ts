import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import NFTModel, { NFT } from 'src/database/models/NFT.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import UserModel, { User } from 'src/database/models/user.model';
import TransactionModel, {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/database/models/transaction.model';
import { nftDefault } from 'src/utils/nft-default';
import UserNFTModel, { UserNFT } from 'src/database/models/user-NFT.model';
import { BigNumber } from 'bignumber.js';
import { MintNftService } from './mint-nft.service';
import * as moment from 'moment';
import { PaginationQuery } from 'src/common/dto/pagination.dto';

@Injectable()
export class NftService implements OnModuleInit {
  constructor(
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
    @InjectModel(NFTModel.collection.name)
    private nftModel: Model<NFT>,
    @InjectModel(UserNFTModel.collection.name)
    private userNftModel: Model<UserNFT>,

    private readonly mintNftService: MintNftService,
  ) {}

  async onModuleInit() {
    const nfts = await this.nftModel.countDocuments();
    if (nfts === 0) {
      await this.nftModel.create(nftDefault);
    }
  }
  async findAll() {
    return this.nftModel.find({}, {}, { sort: { price: 1 } });
  }

  async findOne(id: string) {
    return this.nftModel.findById(id);
  }

  async findUserNFTs(userId: string) {
    return this.userNftModel.find({ user: userId }).populate('nft');
  }

  async getTransactionHistory(userId: string, pagination: PaginationQuery) {
    const { skip, limit, page } = pagination;

    const query = {
      to: userId,
      type: {
        $in: [
          TransactionType.GAME,
          TransactionType.WIN_GAME,
          TransactionType.BUY_NFT,
          TransactionType.COMMISSION_REWARD,
          TransactionType.BUY_NFT_REWARD,
          TransactionType.NFT_REWARD,
        ],
      },
      status: TransactionStatus.SUCCEED,
    };

    const [rewardHistory, total] = await Promise.all([
      this.transactionModel
        .find(query, {
          _id: 1,
          type: 1,
          amount: 1,
          params: 1,
          createdAt: 1,
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.transactionModel.countDocuments(query),
    ]);

    return {
      data: rewardHistory,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async buyNFT(userId: string, nftId: string) {
    try {
      const user = await this.userModel.findById(userId, {
        parent: 0,
        children: 0,
      });
      if (!user.wallet) {
        throw new BadRequestException('User not connected to wallet');
      }
      const nft = await this.nftModel.findById(nftId);
      if (!user || !nft) {
        throw new NotFoundException('User or NFT not found');
      }

      if (nft.total_sold >= nft.total) {
        throw new BadRequestException('NFT is sold out');
      }

      const userNftExist = await this.userNftModel.findOne({
        user: user._id,
        nft: nft._id,
      });

      if (user.balance < nft.price) {
        throw new BadRequestException('User balance is not enough');
      }

      user.$inc('balance', -nft.price);
      await user.save();

      let userNft;

      if (userNftExist) {
        userNftExist.$inc('count', 1);
        userNftExist.reward = BigNumber(nft.reward)
          .plus(userNftExist.reward)
          .toNumber();
        userNftExist.unclaimed_reward = BigNumber(nft.reward)
          .plus(userNftExist.unclaimed_reward)
          .toNumber();
        userNftExist.reward_SGC = BigNumber(nft.reward_SGC)
          .plus(userNftExist.reward_SGC || 0)
          .toNumber();
        await userNftExist.save();
        userNft = userNftExist;
      } else {
        userNft = await this.userNftModel.create({
          user: user._id,
          nft: nft._id,
          count: 1,
          reward: BigNumber(nft.reward).toNumber(),
          total_earn: BigNumber(0).toNumber(),
          unclaimed_reward: BigNumber(nft.reward).toNumber(),
          reward_SGC: BigNumber(nft.reward_SGC).toNumber(),
          claimed_reward_SGC: BigNumber(0).toNumber(),
        });
      }
      const txs: any = [
        {
          from: user._id,
          to: user._id,
          type: TransactionType.BUY_NFT,
          amount: -nft.price,
          params: {
            nftId: nft._id,
            index: nft.current_index,
            name: nft.name,
            image: nft.image,
            type: nft.type,
            wallet: user.wallet,
          },
          status: TransactionStatus.SUCCEED,
          mintNft: false,
        },
      ];

      if (user.referrer) {
        const referrerReward = BigNumber(nft.price)
          .multipliedBy(0.2)
          .toNumber();

        txs.push({
          from: user._id,
          to: user.referrer as ObjectId,
          type: TransactionType.BUY_NFT_REWARD,
          amount: referrerReward,
          depth: 10,
          share_reward: false,
          params: {
            nftId: nft._id,
            name: nft.name,
            type: nft.type,
            amount: referrerReward,
            code: user.code,
            username: user.username,
          },
          status: TransactionStatus.SUCCEED,
          mintNft: false,
        });

        await this.userModel.findByIdAndUpdate(user.referrer, {
          $inc: { balance: referrerReward },
        });
      }

      await this.transactionModel.create(txs);

      nft.$inc('total_sold', 1);
      nft.$inc('current_index', 1);
      await nft.save();
      return userNft;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async mintNft() {
    if (process.env.NODE_ENV === 'development') return;
    const deadline = moment().subtract(30, 'minute').toDate();

    try {
      const transaction = await this.transactionModel
        .findOne({
          mintNft: false,
          type: TransactionType.BUY_NFT,
          status: TransactionStatus.SUCCEED,
          createdAt: {
            $gte: deadline,
          },
        })
        .sort({ createdAt: -1 });
      if (!transaction) {
        return;
      }

      // Check if wallet address exists
      if (!transaction.params.wallet) {
        console.log(
          'Transaction wallet address is missing, skipping NFT transfer',
        );
        return;
      }
      const result = await this.mintNftService.deployAndMint(
        transaction.params.image,
      );
      if (!result.success) {
        console.log('Failed to send NFT to user:');
        return;
      }

      // const txs = await this.mintNftService.getTransactions();

      const transferNFT = await this.mintNftService.transferNFT(
        transaction.params.wallet,
        result.itemIndex,
        transaction.params.image,
      );

      transaction.mintNft = true;
      transaction.params = {
        ...transaction.params,
        index: result.itemIndex,
        // hash: Buffer.from(txs[0].hash()).toString('base64'),
      };
      await transaction.save();
    } catch (error) {
      console.log('Error minting NFT:', error);
    }
  }

  // async transferNFT() {
  //   const data = await this.mintNftService.transferNFT(
  //     'UQAtAU0TAWDR8v_H0yIKYw0MNQpOwF6xtD5-0hlT-oFWragf',
  //     1,
  //     'https://sucosun-s3.s3.ap-southeast-1.amazonaws.com/redNFT.json',
  //   );
  //   console.log('Transfer NFT result:', data.result);
  // }
}
