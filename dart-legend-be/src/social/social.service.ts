import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FakeVerifyMissionDTO } from './dto/fake-verify-mission.dto';
import { CreateTaskDto } from './dto/mission.dto';
import MissionModel, { Mission } from 'src/database/models/mission.model';
import UserModel, { User } from 'src/database/models/user.model';
import TasksModel, { Tasks } from 'src/database/models/task.model';
import { Model } from 'mongoose';
import TransactionModel, {
  Transaction,
} from 'src/database/models/transaction.model';
import { taskDefault } from 'src/utils/task-default';
@Injectable()
export class SocialService implements OnModuleInit {
  constructor(
    @InjectModel(MissionModel.collection.name)
    private missionModel: Model<Mission>,
    @InjectModel(UserModel.collection.name)
    private userModel: Model<User>,
    @InjectModel(TasksModel.collection.name)
    private tasksModel: Model<Tasks>,
    @InjectModel(TransactionModel.collection.name)
    private transactionModel: Model<Transaction>,
  ) {}

  async onModuleInit() {
    const countTask = await this.tasksModel.countDocuments();
    if (countTask === 0) {
      await this.tasksModel.insertMany(taskDefault);
    }
  }

  // async addTask(body: CreateTaskDto) {
  //   const type = convertVNToKey(body.name);
  //   return await this.tasksModel.create({ ...body, type });
  // }

  async getAllTask() {
    const time = new Date();
    return await this.tasksModel.find({});
  }

  async fakeVerifiedSocial(_id: string, data: FakeVerifyMissionDTO) {
    const user = await this.userModel.findById(_id);
    if (!user) throw new NotFoundException('Not found user!');

    const mission = await this.missionModel.findOne({ user: _id });
    const tasks = await this.tasksModel.findOne({
      point: data.point,
      key: data.key,
    });

    if (!tasks) {
      throw new NotFoundException('Not found task!');
    }
    if (mission && mission.socials.includes(data.key)) {
      throw new BadRequestException('Task completed!');
    }

    await Promise.all([
      this.missionModel.updateOne(
        { user: _id },
        { socials: [...mission.socials, data.key] },
      ),
      this.userModel.updateOne({ _id }, { $inc: { point: data.point } }),
    ]);
    // if (user.referrer) {
    //   await this.transactionModel.create({
    //     from: user,
    //     to: user.referrer,
    //     type: TransactionType.MISSION,
    //     is_premium: user.is_premium,
    //     status: TransactionStatus.SUCCEED,
    //     params: { amount: data.point },
    //   });
    // }

    return { data: 'Send verified task.', message: 'Verify task successful!' };
  }

  async taskForUser(_id: string) {
    const user = await this.userModel.findById(_id);
    if (!user) throw new NotFoundException('Not found user!');

    const mission = await this.missionModel.findOne({
      user: _id,
    });
    if (mission) {
      return mission;
    }

    return await this.missionModel.create({
      user: _id,
      socials: [],
      daily: [],
    });
  }
}
