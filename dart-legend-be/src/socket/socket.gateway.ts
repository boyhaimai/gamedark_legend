import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { BadRequestException, Inject, Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketEvent } from 'src/utils/socket';
import Redis from 'ioredis';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import mongoose, { ObjectId } from 'mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TaskName } from 'src/queue/type';
import {
  DetailUser,
  Game,
  GameStatus,
} from 'src/database/types/game.interface';
import { User } from 'src/database/models/user.model';
import { AttackDto } from './dto/attack.dto';
import { MAX_TURN_FOR_GAME, REWARD_WIN_GAME } from 'src/utils/constant';
import { ConnectedClientResponseDto } from './dto/socket-management.dto';

const SOCKET_PORT = parseInt(process.env.WEBSOCKET_PORT) || 8080;

@WebSocketGateway(SOCKET_PORT, { cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    @InjectRedis()
    private readonly redis: Redis,
    @InjectQueue('cronjob-queue') private cronjobQueue: Queue,
  ) {}

  @WebSocketServer()
  private server: Server;
  private logger = new Logger('SocketGateway');

  afterInit(server: Socket) {
    this.logger.debug('Server initialized');
  }

  async handleConnection(client: Socket, ...args: any[]) {
    // Store connection timestamp
    client.data.connectedAt = new Date();

    // You can also extract userId from query params or headers if needed
    // client.data.userId = client.handshake.query.userId;

    this.logger.debug(
      `User ${client.id} connect socket at ${client.data.connectedAt}`,
    );
  }

  private getUserBySocketId(searchValue: string) {
    // for (const [key, value] of this.userConnected.entries()) {
    //   if (value === searchValue) return key;
    // }
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    const userId = this.getUserBySocketId(socket.id);
    // if (userId) this.userConnected.delete(userId);
  }

  getAllConnectedClients() {
    const sockets = this.server.sockets.sockets;
    const clientList = [];

    sockets.forEach((socket, socketId) => {
      clientList.push({
        id: socketId,
        userId: socket.data.userId, // nếu bạn lưu userId trong socket.data
        rooms: Array.from(socket.rooms),
      });
    });

    return clientList;
  }

  getConnectedClientsCount() {
    return this.server.sockets.sockets.size;
  }

  // New methods for socket management
  getAllConnectedClientsDetailed(): ConnectedClientResponseDto[] {
    const sockets = this.server.sockets.sockets;
    const clientList: ConnectedClientResponseDto[] = [];

    sockets.forEach((socket, socketId) => {
      clientList.push({
        id: socketId,
        userId: socket.data.userId,
        rooms: Array.from(socket.rooms),
        connectedAt: socket.data.connectedAt || new Date(),
      });
    });

    return clientList;
  }

  disconnectAllClients(): number {
    const connectedCount = this.getConnectedClientsCount();
    this.server.disconnectSockets();
    this.logger.log(`Disconnected all ${connectedCount} clients`);
    return connectedCount;
  }

  disconnectClientBySocketId(socketId: string): boolean {
    const socket = this.server.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
      this.logger.log(`Disconnected client with socket ID: ${socketId}`);
      return true;
    }
    this.logger.warn(`Socket ID ${socketId} not found`);
    return false;
  }

  disconnectClientsByUserId(userId: string): number {
    let disconnectedCount = 0;
    const sockets = this.server.sockets.sockets;

    sockets.forEach((socket, socketId) => {
      if (socket.data.userId === userId) {
        socket.disconnect(true);
        disconnectedCount++;
        this.logger.log(`Disconnected socket ${socketId} for user ${userId}`);
      }
    });

    if (disconnectedCount === 0) {
      this.logger.warn(`No sockets found for user ID: ${userId}`);
    }

    return disconnectedCount;
  }

  getClientsByUserId(userId: string): ConnectedClientResponseDto[] {
    const sockets = this.server.sockets.sockets;
    const userClients: ConnectedClientResponseDto[] = [];

    sockets.forEach((socket, socketId) => {
      if (socket.data.userId === userId) {
        userClients.push({
          id: socketId,
          userId: socket.data.userId,
          rooms: Array.from(socket.rooms),
          connectedAt: socket.data.connectedAt || new Date(),
        });
      }
    });

    return userClients;
  }

  @SubscribeMessage(SocketEvent.ATTACK)
  async attack(
    @MessageBody() data: AttackDto,
    @ConnectedSocket() client?: Socket,
  ) {
    try {
      const game = JSON.parse(await this.redis.get(data?.game_id)) as Game;

      if (
        !game ||
        game.status !== GameStatus.START_GAME ||
        (game.count_turn_user_1 >= MAX_TURN_FOR_GAME &&
          game.count_turn_user_2 >= MAX_TURN_FOR_GAME)
      ) {
        return;
      }
      if (
        data.user_id === (game.user_1 as User)?._id?.toString() &&
        game.count_turn_user_1 < MAX_TURN_FOR_GAME
      ) {
        game.total_point_user_1 += data.point;
        game.count_turn_user_1 += 1;
        game.detail.user_1[`turn_${game.count_turn_user_1}`] = data.point;
      } else if (
        data.user_id === (game.user_2 as User)?._id?.toString() &&
        game.count_turn_user_2 < MAX_TURN_FOR_GAME
      ) {
        game.total_point_user_2 += data.point;
        game.count_turn_user_2 += 1;
        game.detail.user_2[`turn_${game.count_turn_user_2}`] = data.point;
      }

      this.redis.set(game._id.toString(), JSON.stringify(game), 'EX', 600);
      this.server.to(data.game_id).emit(SocketEvent.ATTACK, game);

      if (
        game.count_turn_user_1 >= MAX_TURN_FOR_GAME &&
        game.count_turn_user_2 >= MAX_TURN_FOR_GAME
      ) {
        await this.socketEndGame({ room: game._id.toString(), game });
      }
    } catch (error) {
      console.log({ error });
    }
  }

  @SubscribeMessage(SocketEvent.GET_GAME)
  async getGame(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const game = JSON?.parse(await this.redis.get(roomId)) as Game;

    client.emit(SocketEvent.SEND_DATA_GAME, game);
    return;
  }

  async emitEventToRoom({
    room,
    event,
    data,
  }: {
    room: string;
    event: SocketEvent;
    data: any;
  }) {
    this.server.to(room).emit(event, data);
  }

  emitEventToUser({
    userId,
    event,
    data,
  }: {
    userId: string;
    event: SocketEvent;
    data: any;
  }) {
    // Find socket by userId and emit event
    // This is a simplified implementation - in a real app you'd need to maintain a mapping of userId to socketId
    this.server.emit(event, data);
  }

  @SubscribeMessage(SocketEvent.JOIN_GAME)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    client.emit('joinedRoom', roomId);
  }

  @SubscribeMessage(SocketEvent.JOIN_ROOM_PRIVATE)
  handleJoinGameRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    client.join(roomId);
    client.emit(SocketEvent.JOIN_ROOM_PRIVATE, roomId);
  }

  async emitJoinGame({ room, event }: { room: string; event: SocketEvent }) {
    this.server.emit(event, room);
  }

  async socketEndGame({ room, game }: { room: string; game: any }) {
    const end_game = await this.endGame({ game });

    this.server.to(room).emit(SocketEvent.END_GAME, end_game);

    await this.redis.set(
      end_game._id.toString(),
      JSON.stringify(end_game),
      'EX',
      600,
    );
    await this.cronjobQueue.add(TaskName.REWARD_ENDGAME, end_game);
    const socketsInRoom = await this.server.in(room).fetchSockets();
    for (const socket of socketsInRoom) {
      socket.leave(room);
      socket.disconnect(true);
    }
  }

  async endGame({
    game,
  }: {
    game: mongoose.Document<unknown, {}, Game> & Game;
  }) {
    try {
      const user_1 = game.detail.user_1;
      const user_2 = game.detail.user_2;

      // user 2 win
      if (game.total_point_user_1 < game.total_point_user_2) {
        this.updateWinnerGame(game, user_2);
      }
      // user 1 win
      else {
        this.updateWinnerGame(game, user_1);
      }
      game.status = GameStatus.ENDED;

      return game;
    } catch (error) {
      console.log('EROOOOOOOOOOOORRRRRR::::END GAME', error);
    }
  }

  async updateWinnerGame(game: Game, winner: DetailUser) {
    game.winner = {
      _id: winner._id,
      userId: winner.userId,
      username: winner?.username,
      is_premium: winner?.is_premium,
      point: REWARD_WIN_GAME,
      avatar: winner?.avatar,
    };
    game.win = winner._id;

    // game.detail = {
    //   user_1: {
    //     _id: winner._id,
    //     userId: winner.userId,
    //     turn_1: game.detail.user_1.turn_1,
    //     turn_2: game.detail.user_1.turn_2,
    //     turn_3: game.detail.user_1.turn_3,
    //     turn_4: game.detail.user_1.turn_4,
    //     turn_5: game.detail.user_1.turn_5,
    //   },
    //   user_2: {
    //     _id: game.user_2 as ObjectId,
    //     userId: winner.userId,
    //     turn_1: game.detail.user_2.turn_1,
    //     turn_2: game.detail.user_2.turn_2,
    //     turn_3: game.detail.user_2.turn_3,
    //     turn_4: game.detail.user_2.turn_4,
    //     turn_5: game.detail.user_2.turn_5,
    //   },
    // };
  }
}
