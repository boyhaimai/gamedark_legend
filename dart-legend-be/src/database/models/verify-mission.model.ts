import mongoose, { ObjectId, Schema } from 'mongoose';
export enum MissionType {
  DAILY_SHARE_X = 'DAILY_SHARE_X',
  DAILY_SHARE_TELEGRAM = 'DAILY_SHARE_TELEGRAM',
}
export interface VerifyMission extends Document {
  _id: ObjectId;
  user: ObjectId;
  type: MissionType;
}

const VerifySchema = new mongoose.Schema<VerifyMission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(MissionType),
      required: true,
    },
  },
  { timestamps: true },
);

const VerifyModel = mongoose.model('Verify_Mission', VerifySchema);

export default VerifyModel;
