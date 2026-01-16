import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface User extends Document {
  _id: ObjectId;
  userId: number;
  code: string;
  avatar?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  password?: string;
  balance: number;
  point: number;
  TON_balance: number;
  SGC_balance: number;
  is_premium: boolean;
  depth: number;
  referrer: ObjectId | User;
  parents: ObjectId[];
  children: ObjectId[];
  nonce: number;
  friend: number;
  token: number;
  active: boolean;
  is_bot: boolean;
  role?: UserRole;
  wallet?: string;
  currentCheckin: number;
  lastCheckin: Date;
  has_won_first_bot_game: boolean;
}

export const UserSchema = new mongoose.Schema<User>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Number,
      unique: true,
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: false,
      trim: true,
    },
    first_name: {
      type: String,
      required: false,
    },
    last_name: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
      select: false,
    },
    is_premium: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      required: false,
      default: null,
    },
    point: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    TON_balance: {
      type: Number,
      default: 0,
    },
    SGC_balance: {
      type: Number,
      default: 0,
    },
    depth: {
      type: Number,
      required: true,
      default: 0,
    },
    referrer: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      require: false,
      default: null,
    },
    parents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
    children: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
      },
    ],

    nonce: {
      type: Number,
      default: 0,
    },
    friend: {
      type: Number,
      default: 0,
    },
    token: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: false,
      index: true,
    },
    is_bot: {
      type: Boolean,
      default: false,
      index: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    wallet: {
      type: String,
      required: false,
      index: true,
    },
    currentCheckin: {
      type: Number,
      default: 0,
    },
    lastCheckin: {
      type: Date,
      default: null,
    },
    has_won_first_bot_game: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

UserSchema.index({ balance: -1 });
UserSchema.index({ is_bot: 1, balance: 1 });

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
