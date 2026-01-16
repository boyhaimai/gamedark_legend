import { Schema, model } from 'mongoose';

export interface SaleConfig extends Document {
  saleStartAt?: Date | null;
  saleEndAt?: Date | null;
  discountPercent: number; // 0-100
}

const saleConfigSchema = new Schema<SaleConfig>(
  {
    saleStartAt: { type: Date, default: null },
    saleEndAt: { type: Date, default: null },
    discountPercent: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

const SaleConfigModel = model<SaleConfig>('SaleConfig', saleConfigSchema);

export default SaleConfigModel;
