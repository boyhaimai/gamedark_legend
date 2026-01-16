import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model } from 'mongoose';
import * as moment from 'moment';
import { SocketGateway } from 'src/socket/socket.gateway';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Game, GameStatus } from 'src/database/types/game.interface';
import GameModel from 'src/database/models/game.model';
import UserModel, { User } from 'src/database/models/user.model';
import TransactionModel, {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/database/models/transaction.model';
import { SocketEvent } from 'src/utils/socket';
import { MIN_BALANCE_FOR_GAME, COMMISSION_REWARD } from 'src/utils/constant';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TaskName } from 'src/queue/type';
import { randomIntFromInterval } from 'src/utils/random-number';
import { BigNumber } from 'bignumber.js';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(GameModel.collection.name)
    private gameModel: Model<Game>,
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
    private socketGateway: SocketGateway,
    // private roomService: RoomService,

    @InjectRedis()
    private readonly redis: Redis,
    @InjectQueue('nft_reward') private nftQueue: Queue,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  checkEndGame(game: Game) {
    const time_end_game = moment(game.createdAt).add(1, 'minutes').toDate();
    const isGameEnded = moment().isAfter(time_end_game);

    return isGameEnded;
  }

  async create({ _id }: { _id: string }) {
    let session: ClientSession = null;
    let game: mongoose.Document<unknown, {}, Game> & Game = null;
    try {
      session = await this.connection.startSession();
      session.startTransaction();

      const user = await this.userModel.findByIdAndUpdate(
        _id,
        { $inc: { nonce: 1 } },
        { session },
      );

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.gameModel.updateMany(
        {
          user_1: user,
          status: GameStatus.FIND_GAME,
          createdAt: { $lte: moment().subtract(5, 'minute').toDate() },
        },
        {
          status: GameStatus.CANCEL,
        },
      );

      const gameStart = await this.gameModel
        .findOne({
          $or: [
            { user_1: user, status: GameStatus.START_GAME },
            { user_2: user, status: GameStatus.START_GAME },
          ],
        })
        .populate('user_1 user_2');
      if (gameStart) {
        await session.commitTransaction();
        let data_game = JSON.parse(
          await this.redis.get(gameStart._id.toString()),
        );

        this.emitEventToRoom({
          room: gameStart._id.toString(),
          event: SocketEvent.START_GAME,
          data: data_game ? data_game : gameStart,
        });
        return data_game ? data_game : gameStart;
      }
      const expiredAt = moment().subtract(5, 'minute').toDate();

      const gameFind = await this.gameModel
        .findOne({
          user_1: user,
          status: GameStatus.FIND_GAME,
          createdAt: { $gte: expiredAt },
        })
        .populate('user_1 user_2');

      if (gameFind) {
        await session.commitTransaction();
        this.emitEventToRoom({
          room: gameFind._id.toString(),
          event: SocketEvent.FIND_GAME,
          data: gameFind,
        });
        return gameFind;
      }

      if (user.balance <= MIN_BALANCE_FOR_GAME) {
        throw new NotFoundException('User has not enough balance');
      }

      const findGame = await this.gameModel
        .findOne({
          user_1: { $ne: user._id },
          status: GameStatus.FIND_GAME,
          createdAt: { $gte: expiredAt },
        })
        .populate('user_1 user_2');

      if (findGame && !user.is_bot && !(findGame.user_1 as User).is_bot) {
        findGame.user_2 = user;
        findGame.status = GameStatus.START_GAME;
        findGame.detail = {
          ...findGame.detail,
          user_2: {
            _id: user._id,
            userId: user.userId,
            username: user.username,
            avatar: user?.avatar,
            is_premium: user.is_premium,
            turn_1: 0,
            turn_2: 0,
            turn_3: 0,
            turn_4: 0,
            turn_5: 0,
          },
        };

        game = await findGame.save({ session });
        await this.userModel.findByIdAndUpdate(
          user._id,
          { $inc: { balance: -MIN_BALANCE_FOR_GAME } },
          { session },
        );
        await this.userModel.findByIdAndUpdate(
          findGame.user_1,
          { $inc: { balance: -MIN_BALANCE_FOR_GAME } },
          { session },
        );

        const transactions = this.createTransaction(findGame);
        await this.transactionModel.create(transactions, {
          session,
          ordered: true,
        });
        this.emitEventToRoom({
          room: findGame._id.toString(),
          event: SocketEvent.START_GAME,
          data: game,
        });
        this.addTaskQueueRewardNft(findGame._id);
      } else {
        const newGame = await this.gameModel.create(
          [
            {
              user_1: user,
              status: GameStatus.FIND_GAME,
              detail: {
                user_1: {
                  _id: user._id,
                  userId: user.userId,
                  username: user.username,
                  is_premium: user.is_premium,
                  avatar: user?.avatar,
                  turn_1: 0,
                  turn_2: 0,
                  turn_3: 0,
                  turn_4: 0,
                  turn_5: 0,
                },
                user_2: {},
              },
              has_won_first_bot_game: user.has_won_first_bot_game,
              count_turn_user_1: 0,
              count_turn_user_2: 0,
              total_point_user_1: 0,
              total_point_user_2: 0,
            },
          ],
          { session },
        );

        game = newGame[0];

        this.emitEventToRoom({
          room: game._id.toString(),
          event: SocketEvent.FIND_GAME,
          data: game,
        });
      }

      await this.redis.set(
        game._id.toString(),
        JSON.stringify(game),
        'EX',
        600,
      );
      await session.commitTransaction();

      return game;
    } catch (error) {
      if (session) await session.abortTransaction();

      throw new BadRequestException(error);
    } finally {
      if (session) await session.endSession();
    }
  }

  addTaskQueueRewardNft(gameId: any) {
    this.nftQueue.add(TaskName.REWARD_NFT, {
      gameId,
    });
  }
  addDataRedisGame(game: any, roomId: string) {
    this.redis.set(roomId, JSON.stringify(game), 'EX', 600);
  }

  async getGameUser({ _id }: { _id: string }) {
    try {
      return await this.gameModel.find(
        {
          status: GameStatus.ENDED,
          $or: [{ user_1: _id }, { user_2: _id }],
        },
        {},
        { sort: { createdAt: -1 }, limit: 10 },
      );
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async emitEventToRoom({
    room,
    event,
    data,
  }: {
    room: string;
    event: SocketEvent;
    data: any;
  }) {
    this.socketGateway.emitEventToRoom({
      room,
      event,
      data,
    });
  }

  async userCancelGame({ _id, game_id }: { _id: string; game_id: string }) {
    try {
      const game = await this.gameModel.findById(game_id);
      if (!game) {
        throw new NotFoundException('Game not found');
      }
      if (game.status !== GameStatus.FIND_GAME) {
        return { message: 'DONE' };
      }
      await this.gameModel.findByIdAndUpdate(game_id, {
        status: GameStatus.CANCEL,
      });
      return { message: 'DONE' };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  @Cron(CronExpression.EVERY_5_SECONDS)
  async endGame() {
    if (process.env.NODE_ENV === 'development') return;
    try {
      const games = await this.gameModel.find({
        status: GameStatus.START_GAME,
        updatedAt: { $lte: moment().subtract(65, 'seconds').toDate() },
      });

      for (const game of games) {
        let data_game = JSON.parse(await this.redis.get(game._id.toString()));
        if (!data_game) {
          data_game = game;
        }

        // Use game room if exists, otherwise use game ID as room
        // const roomId = game.room ? game.room.toString() : game._id.toString();

        await this.socketGateway.socketEndGame({
          room: game._id.toString(),
          game: data_game,
        });

        // // Notify room service about game end
        // await this.roomService.onGameEnd(game._id.toString());
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async shareReward() {
    if (process.env.NODE_ENV === 'development') return;
    try {
      const transactions = await this.transactionModel
        .find({
          type: {
            $in: [
              TransactionType.BUY_NFT_REWARD,
              TransactionType.COMMISSION_REWARD,
            ],
          },
          share_reward: false,
          depth: { $gt: 1 },
        })
        .populate('to', '_id username code referrer');

      const updateUsers: any[] = [];
      const newTransactions = [];
      const updateTransactions = [];

      transactions.map((transaction) => {
        updateTransactions.push({
          updateOne: {
            filter: { _id: transaction._id },
            update: { share_reward: true },
          },
        });
        if ((transaction.to as User).referrer) {
          const amount = BigNumber(transaction.amount).div(2).toNumber();
          updateUsers.push({
            updateOne: {
              filter: { _id: (transaction.to as User).referrer },
              update: { $inc: { balance: amount } },
            },
          });
          newTransactions.push({
            from: (transaction.to as User)._id,
            to: (transaction.to as User).referrer,
            amount,
            game: transaction.game,
            depth: transaction.depth - 1,
            share_reward: false,
            type: transaction.type,
            status: TransactionStatus.SUCCEED,
            params: {
              amount,
              nftId: transaction?.params?.nftId,
              code: (transaction.to as User)?.code,
              username: (transaction.to as User)?.username,
            },
          });
        }
        return null;
      });
      if (updateUsers.length > 0) {
        await this.userModel.bulkWrite(updateUsers);
      }
      if (updateTransactions.length > 0) {
        await this.transactionModel.bulkWrite(updateTransactions);
      }

      if (newTransactions.length > 0) {
        await this.transactionModel.create(newTransactions);
      }
    } catch (error) {
      console.log(error);
    }
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async cancelGame() {
    await this.gameModel.updateMany(
      {
        status: GameStatus.FIND_GAME,
        createdAt: { $lte: moment().subtract(5, 'minute').toDate() },
      },
      {
        status: GameStatus.CANCEL,
      },
    );
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async botJoinGame() {
    if (process.env.NODE_ENV === 'development') return;
    const games = await this.gameModel
      .find({
        status: GameStatus.FIND_GAME,
        createdAt: { $lte: moment().subtract(15, 'second').toDate() },
      })
      .populate('user_1');
    if (games.length === 0) return;
    for (const game of games) {
      try {
        const bots = await this.userModel
          .find(
            {
              is_bot: true,
              _id: { $ne: (game.user_1 as User)._id },
              balance: { $gt: MIN_BALANCE_FOR_GAME },
            },
            { parents: 0, children: 0 },
          )
          .limit(10);

        const index = randomIntFromInterval(0, bots.length - 1);
        const member = bots[index];
        const botWin = Math.random() < 0.7;

        game.user_2 = member;
        game.status = GameStatus.START_GAME;
        game.detail = {
          ...game.detail,
          user_2: {
            _id: member._id,
            userId: member.userId,
            username: member.username,
            avatar: member?.avatar,
            is_premium: member.is_premium,
            turn_1: 0,
            turn_2: 0,
            turn_3: 0,
            turn_4: 0,
            turn_5: 0,
          },
        };
        game.bot_win = botWin;
        game.is_bot = true;
        await game.save();

        await this.userModel.findByIdAndUpdate((game.user_1 as User)._id, {
          $inc: { balance: -MIN_BALANCE_FOR_GAME },
        });

        await this.userModel.findByIdAndUpdate((game.user_2 as User)._id, {
          $inc: { balance: -MIN_BALANCE_FOR_GAME },
        });

        const transactions = this.createTransaction(game);
        await this.transactionModel.create(transactions);
        await this.redis.set(
          game._id.toString(),
          JSON.stringify(game),
          'EX',
          600,
        );
        this.emitEventToRoom({
          room: game._id.toString(),
          event: SocketEvent.START_GAME,
          data: game,
        });
        this.addTaskQueueRewardNft(game._id);

        return;
      } catch (error) {
        console.log('ddkjskdsd', error);
      }
    }
    return;
  }

  @Cron('*/7 * * * * *')
  async botAttackGame() {
    if (process.env.NODE_ENV === 'development') return;
    try {
      const games = await this.gameModel.find({
        status: GameStatus.START_GAME,
        is_bot: true,
        updatedAt: { $gte: moment().subtract(1, 'minute').toDate() },
      });

      // Allowed points: 1,2,3,4,5,6,8,11,12,13,15,16,17,18,20
      const lowPoints = [1, 2, 3, 4, 5, 6, 8, 11]; // Points for bot to lose
      const highPoints = [17, 18, 20]; // Points for bot to win

      for (const game of games) {
        let point: number;

        // Check if user has won first bot game
        if (!game.has_won_first_bot_game) {
          // First game vs bot: bot attack very low points (1-2) to ensure user wins
          const firstGamePoints = [1, 2, 3];
          const randomIndex = randomIntFromInterval(
            0,
            firstGamePoints.length - 1,
          );
          point = firstGamePoints[randomIndex];
        } else {
          // Subsequent games: 50/50 chance
          const shouldBotWin = game.bot_win;
          if (shouldBotWin) {
            // Bot attacks high to win
            const randomIndex = randomIntFromInterval(0, highPoints.length - 1);
            point = highPoints[randomIndex];
          } else {
            // Bot attacks low to lose
            const randomIndex = randomIntFromInterval(0, lowPoints.length - 1);
            point = lowPoints[randomIndex];
          }
        }

        await this.socketGateway.attack({
          game_id: game._id.toString(),
          user_id: game.user_2.toString(),
          point,
        });
      }
      return;
    } catch (error) {
      console.log(error);
    }
  }

  createTransaction(game: Game) {
    const transactions = [
      {
        from: game.user_1,
        to: game.user_1,
        amount: -MIN_BALANCE_FOR_GAME,
        type: TransactionType.GAME,
        game: game._id,
        status: TransactionStatus.SUCCEED,
        depth: 10,
        share_reward: true,
        params: {
          amount: -MIN_BALANCE_FOR_GAME,
          code: (game.user_1 as User)?.code,
          username: (game.user_1 as User)?.username,
        },
      },
      {
        from: game.user_2,
        to: game.user_2,
        amount: -MIN_BALANCE_FOR_GAME,
        game: game._id,
        type: TransactionType.GAME,
        status: TransactionStatus.SUCCEED,
        depth: 10,
        share_reward: true,
        params: {
          amount: -MIN_BALANCE_FOR_GAME,
          code: (game.user_2 as User)?.code,
          username: (game.user_2 as User)?.username,
        },
      },
    ];

    if ((game.user_1 as User)?.referrer) {
      transactions.push({
        from: game.user_1,
        to: (game.user_1 as User).referrer,
        game: game._id,
        amount: COMMISSION_REWARD,
        type: TransactionType.COMMISSION_REWARD,
        status: TransactionStatus.SUCCEED,
        depth: 10,
        share_reward: false,
        params: {
          amount: COMMISSION_REWARD,
          code: (game.user_1 as User)?.code,
          username: (game.user_1 as User)?.username,
        },
      });
    }
    if ((game.user_2 as User)?.referrer) {
      transactions.push({
        from: game.user_2,
        to: (game.user_2 as User).referrer,
        game: game._id,
        amount: COMMISSION_REWARD,
        type: TransactionType.COMMISSION_REWARD,
        status: TransactionStatus.SUCCEED,
        depth: 10,
        share_reward: false,
        params: {
          amount: COMMISSION_REWARD,
          code: (game.user_2 as User)?.code,
          username: (game.user_2 as User)?.username,
        },
      });
    }

    return transactions;
  }
}
