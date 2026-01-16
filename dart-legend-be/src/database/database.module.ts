import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import UserModel from './models/user.model';
import MissionModel from './models/mission.model';
import ReferralModel from './models/referral.model';
import TransactionModel from './models/transaction.model';
import OrderModel from './models/order.model';
import TasksModel from './models/task.model';
import VerifyModel from './models/verify-mission.model';
import GameModel from './models/game.model';
import WalletTransactionModel from './models/walletTransaction.model';
import NFTModel from './models/NFT.model';
import UserNFTModel from './models/user-NFT.model';
import RoomModel, {
  RoomSchema,
  RoomInvitationSchema,
  RoomInvitationModel,
} from './models/room.model';
import DailyAttendanceModel from './models/daily-attendance.model';
import ConfigModel from './models/config.model';
import RoomMessageModel from './models/room-message.model';
import SaleConfigModel from './models/sale-config.model';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get('MONGO_URL'),
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: UserModel.collection.name, schema: UserModel.schema },
      {
        name: TransactionModel.collection.name,
        schema: TransactionModel.schema,
      },
      { name: ReferralModel.collection.name, schema: ReferralModel.schema },
      { name: MissionModel.collection.name, schema: MissionModel.schema },
      { name: OrderModel.collection.name, schema: OrderModel.schema },

      { name: TasksModel.collection.name, schema: TasksModel.schema },
      { name: VerifyModel.collection.name, schema: VerifyModel.schema },
      { name: GameModel.collection.name, schema: GameModel.schema },
      {
        name: WalletTransactionModel.collection.name,
        schema: WalletTransactionModel.schema,
      },
      { name: NFTModel.collection.name, schema: NFTModel.schema },
      { name: UserNFTModel.collection.name, schema: UserNFTModel.schema },
      { name: RoomModel.collection.name, schema: RoomModel.schema },
      {
        name: RoomInvitationModel.collection.name,
        schema: RoomInvitationModel.schema,
      },
      {
        name: DailyAttendanceModel.collection.name,
        schema: DailyAttendanceModel.schema,
      },
      { name: ConfigModel.collection.name, schema: ConfigModel.schema },
      {
        name: RoomMessageModel.collection.name,
        schema: RoomMessageModel.schema,
      },
      { name: SaleConfigModel.collection.name, schema: SaleConfigModel.schema },
    ]),
  ],
  providers: [],
  exports: [MongooseModule],
})
export class DatabaseModule {}
