import { Schema, model } from 'mongoose';
import { Game, GameStatus } from '../types/game.interface';

const gameSchema = new Schema<Game>(
  {
    user_1: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      index: true,
    },
    user_2: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: false,
      index: true,
    },
    win: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: false,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(GameStatus),
      default: GameStatus.FIND_GAME,
      index: true,
    },
    winner: {
      type: Schema.Types.Mixed,
      default: null,
    },
    detail: {
      type: Schema.Types.Mixed,
      default: null,
    },
    total_point_user_1: {
      type: Number,
      default: 0,
    },
    total_point_user_2: {
      type: Number,
      default: 0,
    },
    count_turn_user_1: {
      type: Number,
      default: 0,
    },
    count_turn_user_2: {
      type: Number,
      default: 0,
    },
    is_bot: {
      type: Boolean,
      default: false,
    },
    has_won_first_bot_game: {
      type: Boolean,
      default: true,
    },
    bot_win: {
      type: Boolean,
      default: false,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'rooms',
      required: false,
      index: true,
    },
  },
  { timestamps: true },
);

gameSchema.index({ user_1: 1, status: 1 });
gameSchema.index({ user_2: 1, status: 1 });
gameSchema.index({ is_bot: 1, status: 1 });
gameSchema.index({ room: 1, status: 1 });

const GameModel = model<Game>('Game', gameSchema);

export default GameModel;
