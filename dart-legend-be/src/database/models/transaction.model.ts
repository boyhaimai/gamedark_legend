import { Document, model, ObjectId, Schema } from 'mongoose';
import { User } from './user.model';

export enum TransactionType {
  GAME = 'GAME',
  WIN_GAME = 'WIN_GAME',
  REFERRAL = 'REFERRAL',
  MISSION = 'MISSION',
  BUY_NFT = 'BUY_NFT',
  COMMISSION_REWARD = 'COMMISSION_REWARD',
  BUY_NFT_REWARD = 'BUY_NFT_REWARD',
  NFT_REWARD = 'NFT_REWARD',
  NFT_REWARD_SGC = 'NFT_REWARD_SGC',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCEED = 'SUCCEED',
  FAILED = 'FAILED',
}

export interface Transaction extends Document {
  from?: ObjectId;
  to?: ObjectId | User;
  game?: ObjectId | string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  depth?: number;
  share_reward?: boolean;
  mintNft?: boolean;
  params: {
    amount?: number;
    code?: string;
    username?: string;
    nftId?: ObjectId;
    index?: number;
    name?: string;
    image?: string;
    type?: string;
    wallet?: string;
    hash?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
const TransactionSchema = new Schema<Transaction>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      index: true,
    },
    game: {
      type: Schema.Types.ObjectId,
      ref: 'games',
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(TransactionType),
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(TransactionStatus),
      required: true,
      index: true,
      default: TransactionStatus.PENDING,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    depth: {
      type: Number,
      required: false,
      default: 10,
    },
    share_reward: {
      type: Boolean,
      required: false,
      default: true,
    },
    params: {
      type: Schema.Types.Mixed,
      required: false,
      default: {},
    },
    mintNft: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true },
);

TransactionSchema.index({ to: 1, type: 1 });
TransactionSchema.index({ share_reward: 1, type: 1, depth: 1 });
TransactionSchema.index({ mintNft: 1, type: 1 });
const TransactionModel = model<Transaction>('Transaction', TransactionSchema);

export default TransactionModel;
