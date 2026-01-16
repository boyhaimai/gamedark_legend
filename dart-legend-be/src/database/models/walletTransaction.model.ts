import { ObjectId, Schema, model } from 'mongoose';
import { CurrencyType, Order } from './order.model';
import { User } from './user.model';

export interface WalletTransaction {
  _id?: ObjectId | string;
  from: string;
  to: string;
  user: ObjectId | User;
  order?: ObjectId | Order;
  type: WalletTransactionType;
  hash: string | null;
  status: WalletTransactionStatus;
  currency: CurrencyType;
  params: any;
  // params: Partial<WalletTxParams>;
  rawAmount?: number;
  amount: number;
  createdAt?: string;
  createdLt?: string;
  lt?: string;
  forwardFee?: string;
  ihr_fee?: string;
  totalFees?: string;
  value?: string;
  rate?: number;
}

export enum WalletTransactionType {
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  WITHDRAW_SGC = 'withdraw_sgc',
  WITHDRAW_FEE_RECALL = 'withdraw_fee_recall',
}

export enum WalletTransactionStatus {
  NEW = 'new',
  PENDING = 'pending',
  DONE = 'done',
  REFUND = 'refund',
  EXPIRED = 'expired',
  ERROR = 'error',
}

const walletTransactionSchema = new Schema<WalletTransaction>(
  {
    from: {
      type: String,
    },
    to: {
      type: String,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: 'orders',
      required: false,
    },
    hash: {
      type: String,
      default: null,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(WalletTransactionType),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(WalletTransactionStatus),
      required: true,
    },
    currency: {
      type: String,
      enum: Object.values(CurrencyType),
      required: false,
      default: CurrencyType.TON,
    },
    params: {
      type: Schema.Types.Mixed,
      required: false,
    },
    amount: {
      type: Number,
      required: false,
    },
    rawAmount: {
      type: Number,
    },
    createdLt: {
      type: String,
    },
    lt: {
      type: String,
      index: true,
    },
    forwardFee: {
      type: String,
    },
    ihr_fee: {
      type: String,
    },
    totalFees: {
      type: String,
    },
    value: {
      type: String,
    },
    rate: {
      type: Number,
    },
  },
  { timestamps: true },
);

walletTransactionSchema.index({ createdAt: -1 });
const WalletTransactionModel = model<WalletTransaction>(
  'WalletTransaction',
  walletTransactionSchema,
);

export default WalletTransactionModel;
