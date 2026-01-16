import mongoose, { ObjectId, Schema } from 'mongoose';
import { User } from './user.model';

export interface UserNFT extends Document {
  _id: ObjectId;
  user: ObjectId | User;
  nft: ObjectId;
  count: number;
  total_earn?: number;
  reward?: number;
  unclaimed_reward?: number;
  reward_SGC?: number;
  claimed_reward_SGC?: number;
  share_reward: Boolean;
}

const UserNFTSchema = new mongoose.Schema<UserNFT>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    nft: {
      type: Schema.Types.ObjectId,
      ref: 'nfts',
      required: true,
    },
    count: {
      type: Number,
      default: 1,
    },
    total_earn: {
      type: Number,
      default: 0,
    },
    reward: {
      type: Number,
      default: 0,
    },
    unclaimed_reward: {
      type: Number,
      default: 0,
    },
    reward_SGC: {
      type: Number,
      default: 0,
    },
    claimed_reward_SGC: {
      type: Number,
      default: 0,
    },
    share_reward: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

UserNFTSchema.index({ unclaimed_reward: -1 });
UserNFTSchema.index({ user: 1, unclaimed_reward: -1 });
const UserNFTModel = mongoose.model('User_NFT', UserNFTSchema);

export default UserNFTModel;
