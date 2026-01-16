import mongoose, { Document, ObjectId } from 'mongoose';

export interface Tasks extends Document {
  _id: ObjectId;
  key: string;
  name: string;
  point: number;
  uri?: string;
  social: string;
  type: TypeTask;
}

export enum TypeTask {
  SOCIAL = 'SOCIAL',
  DAILY_QUEST = 'DAILY_QUEST',
}

const TasksSchema = new mongoose.Schema<Tasks>(
  {
    key: {
      type: String,
      unique: true,
      require: true,
    },
    name: {
      type: String,
      require: true,
    },
    point: {
      type: Number,
      require: true,
    },
    uri: {
      type: String,
    },
    social: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      enum: Object.values(TypeTask),
      default: TypeTask.SOCIAL,
    },
  },
  { timestamps: true },
);

const TasksModel = mongoose.model('Task', TasksSchema);
export default TasksModel;
