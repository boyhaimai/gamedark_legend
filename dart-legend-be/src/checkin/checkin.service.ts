import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import UserModel from 'src/database/models/user.model';
import DailyAttendanceModel from 'src/database/models/daily-attendance.model';
import { User } from 'src/database/models/user.model';
import { DailyAttendance } from 'src/database/models/daily-attendance.model';
import { differenceDay } from 'src/utils/dayDifference';
import { dailyAttendance } from 'src/utils/daily-default';

@Injectable()
export class CheckinService implements OnModuleInit {
  constructor(
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(DailyAttendanceModel.collection.name)
    private dailyModel: Model<DailyAttendance>,
  ) {}

  async onModuleInit() {
    const daily = await this.dailyModel.findOne({});
    if (!daily) {
      await this.dailyModel.create(dailyAttendance);
    }
  }

  async getDailyAttendance() {
    const daily = await this.dailyModel.findOne({});

    return daily;
  }

  async checkin(id: string) {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const today = new Date();
      const lastCheckin = user.lastCheckin || new Date(0);

      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const lastCheckinDay = new Date(
        lastCheckin.getFullYear(),
        lastCheckin.getMonth(),
        lastCheckin.getDate(),
      );

      if (todayDate < lastCheckinDay)
        throw new BadRequestException('You have already checked in today');

      const dayDifference = differenceDay({ todayDate, lastCheckinDay });
      if (dayDifference === 0) {
        throw new BadRequestException('You have already checked in today');
      }

      if (dayDifference > 1) {
        user.currentCheckin = 1;
      } else if (dayDifference === 1) {
        user.currentCheckin =
          user.currentCheckin === 7 ? 1 : (user.currentCheckin % 7) + 1;
      }

      if (dayDifference > 0) {
        const dailyAttendance = await this.dailyModel.findOne({});
        user.lastCheckin = today;
        user.$inc('point', dailyAttendance[`day_${user.currentCheckin}`]);
      }
      await user.save();

      return user;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getInfoCheckin(id: string) {
    try {
      const user = await this.userModel.findById(id);

      if (!user) {
        throw new BadRequestException('User not found');
      }

      let nextCheckinDay = user.currentCheckin;
      const foundNextCheckin = false;

      const today = new Date();
      const lastCheckin = user.lastCheckin || new Date(0);

      const todayDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const lastCheckinDay = new Date(
        lastCheckin.getFullYear(),
        lastCheckin.getMonth(),
        lastCheckin.getDate(),
      );

      const dayDifference = differenceDay({ todayDate, lastCheckinDay });

      if (dayDifference > 1) {
        nextCheckinDay = 1;
      } else {
        nextCheckinDay =
          user.currentCheckin === 7 ? 1 : (user.currentCheckin % 7) + 1;
      }

      const lastDate = user?.lastCheckin ? new Date(user.lastCheckin) : false;
      const currDate = new Date();

      return {
        id: user._id,
        userId: user.userId,
        nextCheckinDay,
        lastCheckin: user.lastCheckin || null,
        currentCheckin: lastDate
          ? lastDate.getMonth() === currDate.getMonth() &&
            lastDate.getDate() === currDate.getDate()
          : false,
      };
    } catch (err) {
      throw new BadRequestException(err);
    }
  }
}
