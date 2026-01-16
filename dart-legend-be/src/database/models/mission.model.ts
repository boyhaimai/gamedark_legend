import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export enum SocialType {
  TELEGRAM = 'TELEGRAM',
  TWITTER = 'TWITTER',
  FACEBOOK = 'FACEBOOK',
  INSTAGRAM = 'INSTAGRAM',
  DISCORD = 'DISCORD',
  WEBSITE = 'WEBSITE',
  YOUTUBE = 'YOUTUBE',
}

export interface Mission extends Document {
  _id: ObjectId;
  user: ObjectId;
  socials: Array<string>;
  daily: Array<string>;
}

const MissionSchema = new mongoose.Schema<Mission>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      indexes: true,
    },
    socials: {
      type: Schema.Types.Mixed,
      default: [],
    },
    daily: {
      type: Schema.Types.Mixed,
      default: [],
    },
  },
  { timestamps: true },
);

const MissionModel = mongoose.model('Mission', MissionSchema);

export default MissionModel;
