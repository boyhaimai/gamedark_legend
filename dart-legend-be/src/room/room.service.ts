// import {
//   BadRequestException,
//   Injectable,
//   NotFoundException,
//   OnModuleInit,
// } from '@nestjs/common';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import mongoose, { ClientSession, Model } from 'mongoose';
// import * as moment from 'moment';
// import { Cron, CronExpression } from '@nestjs/schedule';
// import { SocketGateway } from 'src/socket/socket.gateway';
// import { SocketEvent } from 'src/utils/socket';
// import { MIN_BALANCE_FOR_GAME } from 'src/utils/constant';

// import RoomModel, {
//   Room,
//   RoomStatus,
//   RoomInvitation,
//   InvitationStatus,
//   RoomInvitationModel,
// } from 'src/database/models/room.model';
// import UserModel, { User } from 'src/database/models/user.model';
// import GameModel from 'src/database/models/game.model';
// import { Game, GameStatus } from 'src/database/types/game.interface';
// import TransactionModel, {
//   Transaction,
//   TransactionStatus,
//   TransactionType,
// } from 'src/database/models/transaction.model';
// import RoomMessageModel, {
//   RoomMessage,
// } from 'src/database/models/room-message.model';

// import { CreateRoomDto } from './dto/create-room.dto';
// import { SendInvitationDto } from './dto/send-invitation.dto';
// import { RespondInvitationDto } from './dto/respond-invitation.dto';
// import { ContinueGameDto } from './dto/continue-game.dto';
// import { GameService } from 'src/game/game.service';

// @Injectable()
// export class RoomService implements OnModuleInit {
//   constructor(
//     @InjectModel(RoomModel.collection.name)
//     private roomModel: Model<Room>,
//     @InjectModel(RoomInvitationModel.collection.name)
//     private invitationModel: Model<RoomInvitation>,
//     @InjectModel(UserModel.collection.name)
//     private userModel: Model<User>,
//     @InjectModel(GameModel.collection.name)
//     private gameModel: Model<Game>,
//     @InjectModel(TransactionModel.collection.name)
//     private transactionModel: Model<Transaction>,
//     @InjectModel(RoomMessageModel.collection.name)
//     private roomMessageModel: Model<RoomMessage>,
//     private socketGateway: SocketGateway,
//     private gameService: GameService,
//     @InjectConnection() private readonly connection: mongoose.Connection,
//   ) {}

//   async onModuleInit() {
//     // Clean up expired invitations on startup
//     await this.cleanupExpiredInvitations();
//   }

//   async sendMessage(userId: string, roomId: string, content: string) {
//     const room = await this.roomModel.findById(roomId);
//     if (!room) throw new NotFoundException('Room not found');

//     const isMember =
//       room.creator.toString() === userId ||
//       (room.invited && room.invited.toString() === userId);
//     if (!isMember) {
//       throw new BadRequestException('You are not a member of this room');
//     }

//     const message = await this.roomMessageModel.create({
//       room: room._id,
//       sender: userId as any,
//       content,
//     });

//     this.socketGateway.emitEventToRoom({
//       room: room._id.toString(),
//       event: SocketEvent.ROOM_CHAT_NEW_MESSAGE,
//       data: await message.populate('sender', '_id username avatar'),
//     });

//     return message;
//   }

//   async getMessages(
//     userId: string,
//     roomId: string,
//     limit = 30,
//     before?: string,
//   ) {
//     const room = await this.roomModel.findById(roomId);
//     if (!room) throw new NotFoundException('Room not found');

//     const isMember =
//       room.creator.toString() === userId ||
//       (room.invited && room.invited.toString() === userId);
//     if (!isMember) {
//       throw new BadRequestException('You are not a member of this room');
//     }

//     const query: any = { room: room._id };
//     if (before) query._id = { $lt: before } as any;

//     const messages = await this.roomMessageModel
//       .find(query)
//       .sort({ _id: -1 })
//       .limit(limit)
//       .populate('sender', '_id username avatar');

//     return messages;
//   }

//   async createRoom(userId: string, createRoomDto: CreateRoomDto) {
//     const user = await this.userModel.findById(userId, {
//       code: 1,
//       username: 1,
//       avatar: 1,
//       userId: 1,
//       balance: 1,
//     });
//     if (!user) {
//       throw new NotFoundException('User not found');
//     }

//     if (user.balance < MIN_BALANCE_FOR_GAME) {
//       throw new BadRequestException('Insufficient balance');
//     }

//     await this.roomModel.updateMany(
//       {
//         creator: user._id,
//         status: { $in: [RoomStatus.WAITING] },
//       },
//       { status: RoomStatus.CANCELLED },
//     );

//     const room = await this.roomModel.create({
//       name: createRoomDto.name,
//       creator: user,
//       invited: undefined,
//     });

//     // Emit socket event
//     this.socketGateway.emitEventToRoom({
//       room: room._id.toString(),
//       event: SocketEvent.ROOM_CREATED,
//       data: room,
//     });

//     return room;
//   }

//   async sendInvitation(
//     userId: string,
//     roomId: string,
//     sendInvitationDto: SendInvitationDto,
//   ) {
//     // let session: ClientSession = null;
//     try {
//       const user = await this.userModel.findById(userId, {
//         userId: 1,
//         username: 1,
//         avatar: 1,
//         balance: 1,
//         code: 1,
//         is_premium: 1,
//       });
//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       const room = await this.roomModel.findById(roomId);
//       if (!room) {
//         throw new NotFoundException('Room not found');
//       }

//       if (room.creator.toString() !== userId) {
//         throw new BadRequestException('Only room creator can send invitations');
//       }

//       if (room.status !== RoomStatus.WAITING) {
//         throw new BadRequestException('Room is not in waiting status');
//       }

//       if (room.invited) {
//         throw new BadRequestException('Room already has an invited user');
//       }

//       const invitedUser = await this.userModel.findById(
//         sendInvitationDto.toUserId,
//       );
//       if (!invitedUser) {
//         throw new NotFoundException('Invited user not found');
//       }

//       if (room.creator.toString() === invitedUser._id.toString()) {
//         throw new BadRequestException('User is already the room creator');
//       }

//       // Check if there's already a pending invitation
//       const existingInvitation = await this.invitationModel.findOne({
//         from: user._id,
//         to: invitedUser._id,
//         room: room._id,
//         status: InvitationStatus.PENDING,
//       });

//       if (existingInvitation) {
//         return existingInvitation;
//       }
//       // session = await this.connection.startSession();
//       // session.startTransaction();

//       // Create invitation with 5 minutes expiry and mark invited on room
//       const invitation = await this.invitationModel.create([
//         {
//           from: user._id,
//           to: invitedUser._id,
//           room: room._id,
//           expiresAt: moment().add(5, 'minutes').toDate(),
//         },
//       ]);

//       // Emit socket event to invited user
//       this.socketGateway.emitEventToUser({
//         userId: invitedUser._id.toString(),
//         event: SocketEvent.ROOM_INVITATION,
//         data: {
//           invitation: invitation[0],
//           room,
//           from: user,
//         },
//       });

//       return invitation[0];
//     } catch (error) {
//       throw new BadRequestException(error);
//     } finally {
//     }
//   }

//   async respondToInvitation(
//     userId: string,
//     respondInvitationDto: RespondInvitationDto,
//   ) {
//     let session: ClientSession = null;

//     try {
//       const user = await this.userModel.findById(userId);
//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       if (user.balance < MIN_BALANCE_FOR_GAME) {
//         throw new BadRequestException('Insufficient balance');
//       }
//       const invitation = await this.invitationModel.findById(
//         respondInvitationDto.invitationId,
//       );
//       if (!invitation) {
//         throw new NotFoundException('Invitation not found');
//       }

//       if (invitation.to.toString() !== userId) {
//         throw new BadRequestException(
//           'You can only respond to invitations sent to you',
//         );
//       }

//       if (invitation.status !== InvitationStatus.PENDING) {
//         throw new BadRequestException('Invitation is no longer valid');
//       }
//       const room = await this.roomModel
//         .findById(invitation.room)
//         .populate('creator invited');
//       if (!room) {
//         throw new NotFoundException('Room not found');
//       }

//       if (room.status !== RoomStatus.WAITING) {
//         throw new BadRequestException('Room is not in waiting status');
//       }

//       session = await this.connection.startSession();
//       session.startTransaction();

//       if (respondInvitationDto.action === 'REJECT') {
//         invitation.status = InvitationStatus.REJECTED;
//         await invitation.save({ session });
//         await session.commitTransaction();

//         // // Emit socket event to inviter
//         // this.socketGateway.emitEventToUser({
//         //   userId: invitation.from.toString(),
//         //   event: SocketEvent.INVITATION_REJECTED,
//         //   data: { invitation, room },
//         // });

//         return { message: 'Invitation rejected' };
//       }

//       room.invited = user;

//       invitation.status = InvitationStatus.ACCEPTED;
//       await invitation.save({ session });

//       // Cancel all other pending invitations for this room
//       await this.invitationModel.updateMany(
//         {
//           room: room._id,
//           _id: { $ne: invitation._id },
//           status: InvitationStatus.PENDING,
//         },
//         { status: InvitationStatus.REJECTED },
//         { session },
//       );

//       // Emit socket events
//       this.socketGateway.emitEventToUser({
//         userId: invitation.from.toString(),
//         event: SocketEvent.INVITATION_ACCEPTED,
//         data: { invitation, room },
//       });
//       this.socketGateway.emitEventToRoom({
//         room: room._id.toString(),
//         event: SocketEvent.USER_JOINED_ROOM,
//         data: { room, user },
//       });

//       // If both creator and invited present, start game
//       const game = await this.createGameInRoom(room, session);
//       room.status = RoomStatus.PLAYING;
//       await room.save({ session });

//       // Emit socket events
//       this.socketGateway.emitEventToRoom({
//         room: room._id.toString(),
//         event: SocketEvent.ROOM_GAME_STARTED,
//         data: { room, game },
//       });
//       this.gameService.addTaskQueueRewardNft(game._id);

//       await session.commitTransaction();
//       this.gameService.addDataRedisGame(game, room._id.toString());
//       return { room, game };
//     } catch (error) {
//       if (session) await session.abortTransaction();

//       throw new BadRequestException(error);
//     } finally {
//       if (session) await session.endSession();
//     }
//   }

//   async continueGame(userId: string, continueGameDto: ContinueGameDto) {
//     const session = await this.connection.startSession();
//     session.startTransaction();

//     try {
//       const user = await this.userModel.findById(userId);
//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       const room = await this.roomModel.findById(continueGameDto.roomId);
//       if (!room) {
//         throw new NotFoundException('Room not found');
//       }

//       const isMember =
//         room.creator.toString() === userId ||
//         (room.invited && room.invited.toString() === userId);
//       if (!isMember) {
//         throw new BadRequestException('You are not a member of this room');
//       }

//       if (room.status !== RoomStatus.PLAYING) {
//         throw new BadRequestException('Room is not in playing status');
//       }

//       if (continueGameDto.action === 'CANCEL') {
//         // Close room and clear invited
//         room.status = RoomStatus.FINISHED;
//         room.invited = undefined as any;
//         await room.save({ session });

//         await session.commitTransaction();

//         // Emit socket event
//         this.socketGateway.emitEventToRoom({
//           room: room._id.toString(),
//           event: SocketEvent.ROOM_CLOSED,
//           data: { room },
//         });

//         return { message: 'Room closed' };
//       }

//       // Continue playing - create new game
//       if (!room.creator || !room.invited) {
//         throw new BadRequestException('Need exactly 2 players to continue');
//       }

//       const game = await this.createGameInRoom(room, session);
//       await room.save({ session });

//       await session.commitTransaction();

//       // Emit socket event
//       this.socketGateway.emitEventToRoom({
//         room: room._id.toString(),
//         event: SocketEvent.ROOM_GAME_STARTED,
//         data: { room, game },
//       });

//       return { room, game };
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       await session.endSession();
//     }
//   }

//   async getMyRooms(userId: string) {
//     const rooms = await this.roomModel
//       .find({
//         creator: userId,
//         status: { $in: [RoomStatus.WAITING, RoomStatus.PLAYING] },
//       })
//       .populate('creator invited')
//       .sort({ createdAt: -1 });

//     return rooms;
//   }

//   async getRoomDetails(roomId: string, userId: string) {
//     const room = await this.roomModel
//       .findById(roomId)
//       .populate('creator invited');

//     if (!room) {
//       throw new NotFoundException('Room not found');
//     }

//     const isMember =
//       room.creator.toString() === userId ||
//       (room.invited && room.invited.toString() === userId);
//     if (!isMember) {
//       throw new BadRequestException('You are not a member of this room');
//     }

//     // Get current game if room is playing
//     let currentGame = null;
//     if (room.status === RoomStatus.PLAYING) {
//       currentGame = await this.gameModel.findOne({
//         room: room._id,
//         status: 'START_GAME',
//       });
//     }

//     // Get all games in this room
//     const games = await this.gameModel
//       .find({
//         room: room._id,
//       })
//       .sort({ createdAt: -1 });

//     return {
//       ...room.toObject(),
//       currentGame,
//       games,
//     };
//   }

//   async getMyInvitations(userId: string) {
//     const invitations = await this.invitationModel
//       .find({
//         to: userId,
//         status: InvitationStatus.PENDING,
//         expiresAt: { $gt: new Date() },
//       })
//       .populate('from room');

//     return invitations;
//   }

//   async getRoomGames(roomId: string, userId: string) {
//     const room = await this.roomModel.findById(roomId);
//     if (!room) {
//       throw new NotFoundException('Room not found');
//     }

//     const isMember =
//       room.creator.toString() === userId ||
//       (room.invited && room.invited.toString() === userId);
//     if (!isMember) {
//       throw new BadRequestException('You are not a member of this room');
//     }

//     const games = await this.gameModel
//       .find({ room: roomId })
//       .populate('user_1 user_2 win')
//       .sort({ createdAt: -1 });

//     return games;
//   }

//   async leaveRoom(userId: string, roomId: string) {
//     const session = await this.connection.startSession();
//     session.startTransaction();

//     try {
//       const user = await this.userModel.findById(userId);
//       if (!user) {
//         throw new NotFoundException('User not found');
//       }

//       const room = await this.roomModel.findById(roomId);
//       if (!room) {
//         throw new NotFoundException('Room not found');
//       }

//       const isCreator = room.creator.toString() === userId;
//       const isInvited = room.invited && room.invited.toString() === userId;
//       if (!isCreator && !isInvited) {
//         throw new BadRequestException('You are not a member of this room');
//       }

//       if (isCreator) {
//         // Creator leaving -> close room
//         room.status = RoomStatus.FINISHED;
//         room.invited = undefined as any;
//       } else if (isInvited) {
//         // Invited leaving -> remove invited
//         // If playing, cancel current game
//         if (room.status === RoomStatus.PLAYING) {
//           const currentGame = await this.gameModel.findOne({
//             room: room._id,
//             status: 'START_GAME',
//           });
//           if (currentGame) {
//             await this.gameModel.findByIdAndUpdate(currentGame._id, {
//               status: 'CANCEL',
//             });
//           }
//           room.status = RoomStatus.WAITING;
//         }
//         room.invited = undefined as any;
//       }

//       await room.save({ session });

//       // Cancel all pending invitations for this room
//       await this.invitationModel.updateMany(
//         { room: room._id, status: InvitationStatus.PENDING },
//         { status: InvitationStatus.EXPIRED },
//         { session },
//       );

//       await session.commitTransaction();

//       // Emit socket event
//       this.socketGateway.emitEventToRoom({
//         room: room._id.toString(),
//         event: SocketEvent.USER_LEFT_ROOM,
//         data: { room, user },
//       });

//       return { message: 'Left room successfully' };
//     } catch (error) {
//       await session.abortTransaction();
//       throw error;
//     } finally {
//       await session.endSession();
//     }
//   }

//   private async createGameInRoom(room: Room, session: ClientSession) {
//     if (!room.creator || !room.invited) {
//       throw new BadRequestException('Need exactly 2 players to create a game');
//     }

//     const player1 = room.creator as User;
//     const player2 = room.invited as User;

//     // Check balance
//     if (
//       player1.balance < MIN_BALANCE_FOR_GAME ||
//       player2.balance < MIN_BALANCE_FOR_GAME
//     ) {
//       throw new BadRequestException(
//         'One or both players have insufficient balance',
//       );
//     }

//     // Create game
//     const game = await this.gameModel.create(
//       [
//         {
//           user_1: player1._id,
//           user_2: player2._id,
//           status: GameStatus.START_GAME,
//           room: room._id,
//           detail: {
//             user_1: {
//               _id: player1._id,
//               userId: player1.userId,
//               username: player1.username,
//               avatar: player1.avatar,
//               is_premium: player1.is_premium,
//               turn_1: 0,
//               turn_2: 0,
//               turn_3: 0,
//               turn_4: 0,
//               turn_5: 0,
//             },
//             user_2: {
//               _id: player2._id,
//               userId: player2.userId,
//               username: player2.username,
//               avatar: player2.avatar,
//               is_premium: player2.is_premium,
//               turn_1: 0,
//               turn_2: 0,
//               turn_3: 0,
//               turn_4: 0,
//               turn_5: 0,
//             },
//           },
//           count_turn_user_1: 0,
//           count_turn_user_2: 0,
//           total_point_user_1: 0,
//           total_point_user_2: 0,
//         },
//       ],
//       { session },
//     );

//     // Deduct balance from players
//     await this.userModel.findByIdAndUpdate(
//       player1._id,
//       { $inc: { balance: -MIN_BALANCE_FOR_GAME } },
//       { session },
//     );
//     await this.userModel.findByIdAndUpdate(
//       player2._id,
//       { $inc: { balance: -MIN_BALANCE_FOR_GAME } },
//       { session },
//     );

//     // Create transactions
//     const transactions = this.gameService.createTransaction(game[0]);
//     await this.transactionModel.create(transactions, {
//       session,
//       ordered: true,
//     });
//     return game[0];
//   }

//   // @Cron(CronExpression.EVERY_MINUTE)
//   async cleanupExpiredInvitations() {
//     try {
//       await this.invitationModel.updateMany(
//         {
//           status: InvitationStatus.PENDING,
//           expiresAt: { $lt: new Date() },
//         },
//         {
//           status: InvitationStatus.EXPIRED,
//         },
//       );
//     } catch (error) {
//       console.error('Error cleaning up expired invitations:', error);
//     }
//   }

//   // @Cron(CronExpression.EVERY_MINUTE)
//   async cleanupExpiredRooms() {
//     try {
//       await this.roomModel.updateMany(
//         {
//           status: RoomStatus.WAITING,
//           createdAt: { $lt: moment().subtract(10, 'minutes').toDate() },
//         },
//         {
//           status: RoomStatus.EXPIRED,
//         },
//       );
//     } catch (error) {
//       console.error('Error cleaning up expired rooms:', error);
//     }
//   }

//   // Method to handle game end and update room status
//   async onGameEnd(gameId: string) {
//     const game = await this.gameModel.findById(gameId);
//     if (game && game.room) {
//       const room = await this.roomModel.findById(game.room);
//       if (room && room.status === RoomStatus.PLAYING) {
//         room.status = RoomStatus.WAITING;
//         await room.save();

//         // Emit socket event
//         this.socketGateway.emitEventToRoom({
//           room: room._id.toString(),
//           event: SocketEvent.ROOM_GAME_ENDED,
//           data: { room, gameId },
//         });
//       }
//     }
//   }

//   getConnectedClients() {
//     return {
//       clients: this.socketGateway.getAllConnectedClients(),
//       totalCount: this.socketGateway.getConnectedClientsCount(),
//     };
//   }
// }
