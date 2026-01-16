import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import { User } from './user.model';

export interface Referral extends Document {
  _id: ObjectId;
  referrer: ObjectId | User;
  referred: ObjectId | User;
  referralCode: string;
  is_premium: boolean;
  reward: number;
  params: {
    amount?: number;
    code?: string;
    username?: string;
    reward?: number;
  };
  createdAt: Date;
}

export const ReferralSchema = new mongoose.Schema<Referral>(
  {
    referrer: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    referred: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    reward: {
      type: Number,
      default: 0,
    },
    params: {
      type: Schema.Types.Mixed,
      default: {},
    },
    createdAt: {
      type: Date,
      index: true,
    },
  },
  { timestamps: true },
);

const ReferralModel = mongoose.model('Referral', ReferralSchema);

export default ReferralModel;
