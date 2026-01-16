import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Process, Processor } from '@nestjs/bull';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
import mongoose, { ClientSession, Model } from 'mongoose';
import { TaskName } from './type';
import { Job } from 'bull';
import TransactionModel, {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/database/models/transaction.model';
import UserModel, { User } from 'src/database/models/user.model';
import GameModel from 'src/database/models/game.model';
import { Game, GameStatus } from 'src/database/types/game.interface';
import { REWARD_WIN_GAME } from 'src/utils/constant';

@Processor('cronjob-queue')
export class CronjobProcessor {
  constructor(
    @InjectModel(GameModel.collection.name)
    private gameModel: Model<Game>,
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
    @InjectConnection() private readonly connection: mongoose.Connection,

    @InjectRedis()
    private readonly redis: Redis,
  ) {}
  @Process(TaskName.REWARD_ENDGAME)
  async handleShareJackpotPrivateReward(job: Job) {
    let session: ClientSession = null;

    try {
      const game = job.data as Game;

      session = await this.connection.startSession();
      session.startTransaction();

      const updateGame = await this.gameModel.findByIdAndUpdate(
        game._id,
        {
          winner: game.winner,
          detail: game.detail,
          status: GameStatus.ENDED,
          total_point_user_1: game.total_point_user_1,
          total_point_user_2: game.total_point_user_2,
          count_turn_user_1: game.count_turn_user_1,
          count_turn_user_2: game.count_turn_user_2,
          win: game.winner._id,
        },
        { session },
      );
      await this.transactionModel.create(
        [
          {
            status: TransactionStatus.SUCCEED,
            type: TransactionType.WIN_GAME,
            from: game.winner._id,
            to: game.winner._id,
            game: updateGame._id,
            amount: REWARD_WIN_GAME,
            is_premium: game.winner.is_premium,
            params: { amount: REWARD_WIN_GAME },
          },
        ],
        { session },
      );

      // Update user balance
      const updateUserData: any = {
        $inc: { balance: REWARD_WIN_GAME },
      };

      // If this is a bot game and user_1 (real player) won their first bot game
      if (
        !updateGame.has_won_first_bot_game &&
        game.winner._id.toString() === updateGame.user_1.toString()
      ) {
        updateUserData.has_won_first_bot_game = true;
      }

      await this.userModel.findByIdAndUpdate(game.winner._id, updateUserData, {
        session,
      });
      await session.commitTransaction();

      await this.redis.del(game?._id.toString());
    } catch (error) {
      console.log('share::::ERROR', error);
      if (error.code === 112) {
        console.log('share::::ERROR:::WRITE_CONFLICT', error);
      }
      await session.abortTransaction();
    } finally {
      if (session) await session.endSession();
    }
  }
}
