import { ObjectId } from 'mongoose';
import { User } from '../models/user.model';
import { Room } from '../models/room.model';

export enum GameStatus {
  FIND_GAME = 'FIND_GAME',
  START_GAME = 'START_GAME',
  ENDED = 'ENDED',
  FAIL = 'FAIL',
  CANCEL = 'CANCEL',
}

export enum GameType {
  ROOM_GAME = 'ROOM_GAME',
  SOLO_GAME = 'SOLO_GAME',
}

type Winner = {
  _id: ObjectId;
  userId: number;
  username?: string;
  avatar?: string;
  code?: string;
  is_premium: boolean;
  point: number;
};

export type DetailUser = {
  _id?: ObjectId;
  userId?: number;
  username?: string;
  avatar?: string;
  code?: string;
  is_premium?: boolean;
  turn_1: number;
  turn_2: number;
  turn_3: number;
  turn_4: number;
  turn_5: number;
};

type DetailGame = {
  user_1: DetailUser;
  user_2: DetailUser;
};

export type Game = {
  _id: ObjectId | string;
  user_1: ObjectId | User;
  user_2: ObjectId | User;
  win: ObjectId | User;
  status: GameStatus;
  winner: Winner | null;
  detail: DetailGame | null;
  total_point_user_1: number;
  total_point_user_2: number;
  count_turn_user_1: number;
  count_turn_user_2: number;
  room?: ObjectId | Room;
  createdAt: Date;
  is_bot?: boolean;
  has_won_first_bot_game: boolean;
  bot_win: boolean;
};
