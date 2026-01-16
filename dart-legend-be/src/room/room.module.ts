// import { Module } from '@nestjs/common';
// import { RoomController } from './room.controller';
// import { RoomService } from './room.service';
// import { DatabaseModule } from 'src/database/database.module';
// import { SocketModule } from 'src/socket/socket.module';
// import { GameModule } from 'src/game/game.module';
// import { GameService } from 'src/game/game.service';
// import { BullModule } from '@nestjs/bull';

// @Module({
//   imports: [
//     BullModule.registerQueue({
//       name: 'nft_reward',
//       defaultJobOptions: {
//         removeOnComplete: true,
//         removeOnFail: true,
//         attempts: 1,
//         backoff: {
//           type: 'fixed',
//           delay: 5000,
//         },
//         priority: 1,
//         stackTraceLimit: 10,
//       },
//     }),
//     DatabaseModule,
//     SocketModule,
//     GameModule,
//   ],
//   controllers: [RoomController],
//   providers: [RoomService, GameService],
//   exports: [RoomService],
// })
// export class RoomModule {}
