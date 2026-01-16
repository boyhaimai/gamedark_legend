import { Process, Processor } from '@nestjs/bull';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model } from 'mongoose';
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
import { TonService } from 'src/ton-wallet/ton.service';

@Processor('nft_reward_sgc')
export class NftRewardSGCProcessor {
  constructor(
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
    @InjectModel(UserNFTModel.collection.name)
    private userNftModel: Model<UserNFT>,
    @InjectConnection() private readonly connection: mongoose.Connection,
    private readonly tonService: TonService,
  ) {}
  // @Process({ name: TaskName.REWARD_NFT_SGC, concurrency: 1 })
  async shareRewardNFTSGC(job: Job) {
    const { userId, userNfts, totalRewardAmount, wallet } = job.data;
    let session: ClientSession = null;

    const transferSGC = await this.tonService.transferJetton(
      wallet,
      totalRewardAmount,
      `User ${userId}, id: ${userId}, transfer ${totalRewardAmount} SGC to ${wallet}`,
    );
    try {
      // Start transaction session
      session = await this.connection.startSession();

      session.startTransaction();

      // Prepare bulk operations for updating userNFTs
      const bulkOps = userNfts.map((userNft) => ({
        updateOne: {
          filter: { _id: userNft._id },
          update: {
            $inc: { claimed_reward_SGC: userNft.actualClaimAmount },
            $set: { share_reward: true },
          },
        },
      }));

      // Execute bulk write for userNFT updates
      if (bulkOps.length > 0) {
        await this.userNftModel.bulkWrite(bulkOps, { session });
      }

      // Create transaction for total reward amount
      const transaction = await this.transactionModel.create(
        [
          {
            to: userId,
            type: TransactionType.NFT_REWARD_SGC,
            status: TransactionStatus.SUCCEED,
            amount: totalRewardAmount,
            params: {
              amount: totalRewardAmount,
              userNfts: userNfts.map((nft) => ({
                userNftId: nft._id,
                nftId: nft.nft,
                amount: nft.actualClaimAmount,
              })),
            },
          },
        ],
        { session },
      );

      // Commit transaction
      await session.commitTransaction();
      console.log('share::::SUCCESS for user:', userId);
      return;
    } catch (error) {
      console.log('share::::ERROR', error);
      if (error.code === 112) {
        console.log('share::::ERROR:::WRITE_CONFLICT', error);
      }
      if (session) await session.abortTransaction();
    } finally {
      if (session) await session.endSession();
    }
  }
}
