import { Schema, model } from 'mongoose';

export enum ConfigKey {
  TON_PRICE = 'ton_price',
  SGC_PRICE = 'sgc_price',
}
export interface Config extends Document {
  key: ConfigKey;
  value: number;
}
const configSchema = new Schema<Config>(
  {
    key: {
      type: String,
      enum: Object.values(ConfigKey),
      required: true,
      unique: true,
    },
    value: {
      type: Number,
      required: true,
      default: 2,
    },
  },
  { timestamps: true },
);

const ConfigModel = model<Config>('Config', configSchema);

export default ConfigModel;
