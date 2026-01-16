import mongoose, { Document, ObjectId, Schema } from 'mongoose';

export interface RoomMessage extends Document {
  _id: ObjectId;
  room: ObjectId;
  sender: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RoomMessageSchema = new mongoose.Schema<RoomMessage>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'rooms',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

RoomMessageSchema.index({ room: 1, createdAt: -1 });

const RoomMessageModel = mongoose.model('RoomMessage', RoomMessageSchema);
export default RoomMessageModel;
