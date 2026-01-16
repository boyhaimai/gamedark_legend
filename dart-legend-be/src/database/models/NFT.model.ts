import mongoose, { ObjectId } from 'mongoose';

export enum NFTType {
  COMMON = 'Common',
  RARE = 'Rare',
  LEGENDARY = 'Legendary',
}
export interface NFT extends Document {
  _id: ObjectId;
  name: string;
  description: string;
  price: number;
  total: number;
  total_sold: number;
  reward: number;
  reward_SGC: number;
  current_index: number;
  type: NFTType;
  image: string;
}

const NFTSchema = new mongoose.Schema<NFT>(
  {
    name: {
      type: String,
      require: true,
    },
    price: {
      type: Number,
      require: true,
    },
    type: {
      type: String,
      require: true,
      enum: NFTType,
    },
    reward: {
      type: Number,
      require: true,
    },
    reward_SGC: {
      type: Number,
      require: true,
    },
    total: {
      type: Number,
      require: true,
    },
    total_sold: {
      type: Number,
      require: true,
      default: 0,
    },
    current_index: {
      type: Number,
      require: true,
      default: 0,
    },
    description: {
      type: String,
      require: false,
    },
    image: {
      type: String,
      require: false,
    },
  },
  {
    timestamps: true,
  },
);

const NFTModel = mongoose.model('NFT', NFTSchema);

export default NFTModel;
