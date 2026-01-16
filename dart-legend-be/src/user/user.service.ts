import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import mongoose, { ClientSession, Model } from 'mongoose';
import UserModel, { User, UserRole } from 'src/database/models/user.model';
import TransactionModel, {
  Transaction,
  TransactionStatus,
  TransactionType,
} from 'src/database/models/transaction.model';
import ReferralModel, { Referral } from 'src/database/models/referral.model';
import { customAlphabet } from 'nanoid';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PaginationQuery } from 'src/common/dto/pagination.dto';
import MissionModel from 'src/database/models/mission.model';
import { Mission } from 'src/database/models/mission.model';
import { REFERRAL_REWARD, REFERRAL_REWARD_PREMIUM } from 'src/utils/constant';
import { CreateUserDto } from './dto/create-user.dto';
@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
    @InjectModel(ReferralModel.collection.name)
    private referralModel: Model<Referral>,
    @InjectModel(MissionModel.collection.name)
    private missionModel: Model<Mission>,
    private readonly configService: ConfigService,

    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  async generateCode(): Promise<string> {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);

    while (true) {
      const code = nanoid();

      if (!(await this.userModel.findOne({ code }))) {
        return code;
      }
    }
  }

  async botUser(
    user: User & {
      referrerCode?: string;
      first_name?: string;
      last_name?: string;
    },
  ) {
    let session: ClientSession = null;

    try {
      const oldUser = await this.userModel.findOne({ userId: user.userId });

      if (oldUser) return oldUser;

      session = await this.connection.startSession();
      session.startTransaction();

      let referrer: User = null;
      // const keypair = await generateAddress();
      const pass_default =
        (await this.configService.get('PASS_DEFAULT')) ?? '1739957205485637633';
      const salt = await bcrypt.genSalt();
      const hashed = await bcrypt.hash(pass_default, salt);

      const userData = {
        userId: user.userId,
        username: user?.username,
        password: hashed,
        is_premium: user.is_premium,
        avatar: user?.avatar,
        depth: 0,
        balance: 0,
        point: 0,
        referrer: null,
        code: null,
        parents: [],
      };

      if (user?.referrerCode) {
        referrer = await this.userModel.findOne({ code: user.referrerCode });
        if (referrer) {
          userData.referrer = referrer;
          userData.depth = referrer?.depth + 1;
          userData.parents = [...referrer?.parents, referrer._id];
        }
      }
      const code = await this.generateCode();
      userData.code = code;

      if (!user.username) {
        userData.username = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`;
      }

      const newUser = await this.userModel.create([userData], { session });
      if (referrer) {
        referrer.children.push(newUser[0]?._id);
        referrer.$inc('friend', 1);
        referrer.$inc(
          'point',
          user.is_premium ? REFERRAL_REWARD_PREMIUM : REFERRAL_REWARD,
        );
        await this.transactionModel.create(
          [
            {
              from: newUser[0]?._id,
              to: referrer._id,
              type: TransactionType.REFERRAL,
              status: TransactionStatus.SUCCEED,
              amount: user.is_premium
                ? REFERRAL_REWARD_PREMIUM
                : REFERRAL_REWARD,
              params: {
                amount: user.is_premium
                  ? REFERRAL_REWARD_PREMIUM
                  : REFERRAL_REWARD,
                referral: newUser[0]?._id,
                code,
                username: userData?.username,
              },
            },
          ],
          { session },
        );
        await this.referralModel.create(
          [
            {
              referrer: referrer._id,
              referred: newUser[0]?._id,
              referralCode: code,
              reward: user.is_premium
                ? REFERRAL_REWARD_PREMIUM
                : REFERRAL_REWARD,
              is_premium: user.is_premium,
              params: {
                amount: user.is_premium
                  ? REFERRAL_REWARD_PREMIUM
                  : REFERRAL_REWARD,
                code,
                username: userData?.username,
              },
            },
          ],
          { session },
        );

        await referrer.save({ session });
      }

      await this.missionModel.create(
        [
          {
            user: newUser[0]?._id,
          },
        ],
        { session },
      );

      await session.commitTransaction();

      return newUser[0];
    } catch (error) {
      if (session) await session.abortTransaction();

      throw new BadRequestException(error);
    } finally {
      if (session) await session.endSession();
    }
  }

  async createUser(body: CreateUserDto) {
    let session: ClientSession = null;

    try {
      const oldUser = await this.userModel.findOne({ userId: body.userId });

      if (oldUser) {
        throw new BadRequestException('User already exists');
      }

      session = await this.connection.startSession();
      session.startTransaction();

      // const keypair = await generateAddress();
      const pass_default =
        (await this.configService.get('PASS_DEFAULT')) ?? '1739957205485637633';
      const salt = await bcrypt.genSalt();
      const hashed = await bcrypt.hash(pass_default, salt);

      const userData = {
        userId: body.userId,
        username: body?.username,
        first_name: body?.first_name,
        last_name: body?.last_name,
        password: hashed,
        is_premium: body.is_premium,
        depth: body.depth,
        balance: body.balance,
        friend: body.friend,
        active: body.active,
        is_bot: body.is_bot,
        code: null,
        parents: [],
        // address: keypair.address,
        // prvKey: keypair.key,
      };

      const code = await this.generateCode();
      userData.code = code;

      const newUser = await this.userModel.create([userData], { session });

      await this.missionModel.create(
        [
          {
            user: newUser[0]?._id,
          },
        ],
        { session },
      );

      await session.commitTransaction();

      return newUser[0];
    } catch (error) {
      if (session) await session.abortTransaction();

      throw new BadRequestException(error);
    } finally {
      if (session) await session.endSession();
    }
  }

  async findById(id: string): Promise<{ user: User }> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { user };
  }

  async getUserProfile(userId: string) {
    const { user } = await this.findById(userId);

    const transaction = await this.transactionModel.find(
      { to: user._id },
      {},
      { sort: { createdAt: -1 }, limit: 10 },
    );
    return {
      user,
      transaction,
    };
  }

  async getAllUsers(pagination: PaginationQuery): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { skip, limit, page } = pagination;

    const [users, total] = await Promise.all([
      this.userModel
        .find({}, { password: 0, prvKey: 0, parents: 0, children: 0 })
        .sort({ tokens: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Search users by username or code using a case-insensitive regex.
   * Accepts a search string `q`. Supports pagination via PaginationQuery.
   */
  async searchUsers(
    q: string,
    pagination: PaginationQuery,
  ): Promise<{
    users: User[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { skip, limit, page } = pagination;

    const filter: any = {};
    if (q && q.trim() !== '') {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { username: { $regex: regex } },
        { code: { $regex: regex } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter, { password: 0, prvKey: 0, parents: 0, children: 0 })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAdmin(userId: number): Promise<User> {
    const user = await this.userModel.findOne(
      { userId },
      { userId: 1, avatar: 1, username: 1, role: 1, password: 1, _id: 1 },
    );
    return user;
  }

  async updateAvatar({ userId, avatar }: { userId: number; avatar: string }) {
    try {
      const user = await this.userModel.findOneAndUpdate(
        { userId },
        { avatar },
        { new: true },
      );
      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getTopReferral() {
    const users = await this.userModel.find(
      { friend: { $gt: 0 } },
      { _id: 1, friend: 1, username: 1 },
      { sort: { friend: -1 }, limit: 100 },
    );
    return users;
  }

  async getTopEarn() {
    const users = await this.userModel.find(
      { balance: { $gt: 0 } },
      { _id: 1, balance: 1, username: 1 },
      { sort: { balance: -1 }, limit: 100 },
    );
    return users;
  }

  async getReferral(id: string) {
    return await this.referralModel.find(
      { referrer: id },
      {},
      { sort: { createdAt: -1 }, limit: 20 },
    );
  }

  async getRankUser(user_id: string) {
    try {
      const user = await this.userModel.findById(user_id);
      const rankTopReferral = await this.userModel.countDocuments({
        friend: { $gte: user.friend, $ne: 0 },
      });

      const rankTopEarn = await this.userModel.countDocuments({
        balance: { $gte: user.balance },
      });
      return {
        rankTopReferral: user.friend === 0 ? 0 : rankTopReferral,
        rankTopEarn: user.balance === 0 ? 0 : rankTopEarn,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async adminSetBot(_id: string, is_bot: boolean) {
    const user = await this.userModel.findByIdAndUpdate(
      _id,
      { is_bot },
      { new: true },
    );
    return user;
  }

  async getAllBot() {
    const users = await this.userModel.find(
      { is_bot: true },
      { password: 0, prvKey: 0, parents: 0, children: 0 },
      { sort: { createdAt: -1 }, limit: 100 },
    );
    return users;
  }

  async adminUpdate(key: any, is_bot: boolean) {
    try {
      const user = await this.userModel.findOneAndUpdate(
        {
          $or: [{ username: key }, { code: key }],
        },
        { is_bot },
        { new: true },
      );

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async getBot() {
    const bots = await this.userModel.find(
      { is_bot: true },
      { code: 1, username: 1 },
    );
    return bots;
  }
}
