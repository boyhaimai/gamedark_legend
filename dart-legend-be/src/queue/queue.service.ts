import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { TaskName } from './type';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import UserNFTModel, { UserNFT } from 'src/database/models/user-NFT.model';
import { Model } from 'mongoose';
import { BigNumber } from 'bignumber.js';
import { User } from 'src/database/models/user.model';

@Injectable()
export class QueueService {
  constructor(
    @InjectModel(UserNFTModel.collection.name)
    private userNftModel: Model<UserNFT>,
    @InjectQueue('nft_reward_sgc') private queue: Queue,
  ) {}

  // @Cron('0 0 1 * *')
  async shareRewardNFT() {
    try {
      await this.userNftModel.updateMany(
        { share_reward: true },
        { $set: { share_reward: false } },
      );
    } catch (error) {
      console.log({ error });
    }
  }

  // @Cron(CronExpression.EVERY_DAY_AT_1AM)
  // @Cron(CronExpression.EVERY_10_SECONDS)
  async shareRewardNFTsGC() {
    if (process.env.NODE_ENV === 'development') return;
    try {
      console.log('shareRewardNFTsGC::::');

      const nftUnshared = await this.userNftModel
        .find({
          share_reward: false,
          $expr: { $lt: ['$claimed_reward_SGC', '$reward_SGC'] },
        })
        .populate('user', '_id username wallet');

      // Group by user
      const userGroups = new Map();
      for (const userNft of nftUnshared) {
        const user = userNft.user as User;
        const userId = user._id.toString();
        const wallet = user.wallet;
        if (!wallet) {
          continue;
        }
        if (!userGroups.has(userId)) {
          userGroups.set(userId, []);
        }
        userGroups.get(userId).push(userNft);
      }

      // Add to queue grouped by user
      for (const [userId, userNfts] of userGroups) {
        let totalRewardAmount = new BigNumber(0);
        const wallet = (userNfts[0].user as User).wallet;
        if (!wallet) {
          continue;
        }
        const userNftsWithAmount = userNfts.map((nft) => {
          const baseClaimAmount = new BigNumber(
            nft.reward_SGC || 0,
          ).multipliedBy(0.05);
          const remainingReward = new BigNumber(nft.reward_SGC || 0).minus(
            nft.claimed_reward_SGC || 0,
          );
          const actualClaimAmount = BigNumber.minimum(
            baseClaimAmount,
            remainingReward,
          );

          totalRewardAmount = totalRewardAmount.plus(actualClaimAmount);

          return {
            _id: nft._id,
            user: nft.user,
            nft: nft.nft,
            reward_SGC: nft.reward_SGC,
            claimed_reward_SGC: nft.claimed_reward_SGC,
            claimAmount: baseClaimAmount.toNumber(),
            actualClaimAmount: actualClaimAmount.toNumber(),
          };
        });

        await this.queue.add(TaskName.REWARD_NFT_SGC, {
          userId,
          userNfts: userNftsWithAmount,
          totalRewardAmount: totalRewardAmount.toNumber(),
          wallet,
        });
      }
    } catch (error) {
      console.log({ error });
    }
  }
}
