import mongoose, { Document, ObjectId, Schema } from 'mongoose';
import { User } from './user.model';

export enum RoomStatus {
  WAITING = 'WAITING',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export interface RoomInvitation extends Document {
  _id: ObjectId;
  from: ObjectId;
  to: ObjectId;
  room: ObjectId;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
}

export interface Room extends Document {
  _id: ObjectId;
  name: string;
  creator: ObjectId | User;
  invited?: ObjectId | User;
  status: RoomStatus;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const RoomInvitationSchema = new mongoose.Schema<RoomInvitation>(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'rooms',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(InvitationStatus),
      default: InvitationStatus.PENDING,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

export const RoomSchema = new mongoose.Schema<Room>(
  {
    name: {
      type: String,
      required: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    invited: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(RoomStatus),
      default: RoomStatus.WAITING,
      index: true,
    },
  },
  { timestamps: true },
);

RoomSchema.index({ creator: 1, status: 1 });
RoomSchema.index({ invited: 1, status: 1 });
RoomSchema.index({ status: 1, createdAt: 1 });

const RoomModel = mongoose.model('Room', RoomSchema);
const RoomInvitationModel = mongoose.model(
  'RoomInvitation',
  RoomInvitationSchema,
);

export { RoomModel, RoomInvitationModel };
export default RoomModel;
