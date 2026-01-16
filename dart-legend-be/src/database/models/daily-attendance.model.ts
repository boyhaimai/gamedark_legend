import mongoose, { Document } from 'mongoose';

export interface DailyAttendance extends Document {
  day_1: number;
  day_2: number;
  day_3: number;
  day_4: number;
  day_5: number;
  day_6: number;
  day_7: number;
}

const DailyAttendanceSchema = new mongoose.Schema<DailyAttendance>(
  {
    day_1: {
      type: Number,
      default: 0,
      require: true,
    },
    day_2: {
      type: Number,
      default: 0,
      require: true,
    },
    day_3: {
      type: Number,
      default: 0,
      require: true,
    },
    day_4: {
      type: Number,
      default: 0,
      require: true,
    },
    day_5: {
      type: Number,
      default: 0,
      require: true,
    },
    day_6: {
      type: Number,
      default: 0,
      require: true,
    },
    day_7: {
      type: Number,
      default: 0,
      require: true,
    },
  },
  { timestamps: true },
);

const DailyAttendanceModel = mongoose.model(
  'Daily_Attendance',
  DailyAttendanceSchema,
);

export default DailyAttendanceModel;
