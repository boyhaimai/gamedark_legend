import { Document, model, ObjectId, Schema } from 'mongoose';
import { User } from './user.model';

export enum OrderStatus {
  PENDING = 'PENDING',
  SUCCEED = 'SUCCEED',
  CANCEL = 'CANCEL',
}

export enum CurrencyType {
  SGC = 'SGC',
  TON = 'TON',
}

export interface Order extends Document {
  user: ObjectId | User;
  amount: number;
  hash?: string;
  wallet: string;
  status: OrderStatus;
  currency: CurrencyType;
  accept: boolean;
  value?: string;
  rate?: number;
}

const OrderSchema = new Schema<Order>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
    amount: {
      type: Number,
    },
    hash: {
      type: String,
      default: '',
    },
    wallet: {
      type: String,
      default: '',
    },
    currency: {
      type: String,
      enum: Object.values(CurrencyType),
      required: false,
      default: CurrencyType.TON,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
      default: OrderStatus.PENDING,
      index: true,
    },
    accept: {
      type: Boolean,
      default: false,
      index: true,
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

const OrderModel = model<Order>('Order', OrderSchema);

export default OrderModel;
