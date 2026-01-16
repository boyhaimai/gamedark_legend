import { Process, Processor } from '@nestjs/bull';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TaskName } from './type';
import { Job } from 'bull';
import TransactionModel, {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/database/models/transaction.model';
import UserModel, { User } from 'src/database/models/user.model';
import { TOTAL_REWARD_NFT } from 'src/utils/constant';
import UserNFTModel, { UserNFT } from 'src/database/models/user-NFT.model';
import { BigNumber } from 'bignumber.js';

@Processor('nft_reward')
export class NftRewardProcessor {
  constructor(
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
    @InjectModel(UserNFTModel.collection.name)
    private userNftModel: Model<UserNFT>,
    // @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}
  @Process({ name: TaskName.REWARD_NFT, concurrency: 1 })
  async handleShareJackpotPrivateReward(job: Job) {
    try {
      const { gameId } = job.data;

      const nftUsers = await this.userNftModel.aggregate([
        {
          $match: {
            unclaimed_reward: { $gte: 0 },
          },
        },
        {
          $facet: {
            perUser: [
              {
                $group: {
                  _id: '$user',
                  totalCount: { $sum: '$count' },
                  nfts: {
                    $push: {
                      _id: '$_id',
                      count: '$count',
                    },
                  },
                },
              },
              {
                $project: {
                  userId: '$_id',
                  totalCount: 1,
                  nfts: 1,
                  _id: 0,
                },
              },
            ],
            overall: [
              {
                $group: {
                  _id: null,
                  totalCount: { $sum: '$count' },
                },
              },
              {
                $project: {
                  _id: 0,
                  totalCount: 1,
                },
              },
            ],
          },
        },
      ]);

      if (nftUsers[0]?.overall[0]?.totalCount === 0) {
        console.log('No users with unclaimed rewards');
        return;
      }
      const rewardPerNft = BigNumber(TOTAL_REWARD_NFT).div(
        nftUsers[0].overall[0].totalCount,
      );

      const updateUsers: any[] = [];
      const updateNfts: any[] = [];

      const newTransactions: any[] = [];

      nftUsers[0].perUser.map((nftUser) => {
        const amount = rewardPerNft.multipliedBy(nftUser.totalCount).toNumber();
        newTransactions.push({
          status: TransactionStatus.SUCCEED,
          type: TransactionType.NFT_REWARD,
          to: nftUser.userId,
          game: gameId,
          amount,
          depth: 0,
          share_reward: true,
          params: {
            amount,
          },
        });
        updateUsers.push({
          updateOne: {
            filter: { _id: nftUser.userId },
            update: {
              $inc: { balance: amount },
            },
          },
        });
        nftUser.nfts.map((nft) => {
          const amountNft = rewardPerNft.multipliedBy(nft.count).toNumber();

          updateNfts.push({
            updateOne: {
              filter: { _id: nft._id },
              update: {
                $inc: { unclaimed_reward: -amountNft },
              },
            },
          });
        });
      });

      await this.transactionModel.create(newTransactions);
      await this.userModel.bulkWrite(updateUsers);
      await this.userNftModel.bulkWrite(updateNfts);
      return;
    } catch (error) {
      console.log('share::::ERROR', error);
      if (error.code === 112) {
        console.log('share::::ERROR:::WRITE_CONFLICT', error);
      }
    }
  }
}
