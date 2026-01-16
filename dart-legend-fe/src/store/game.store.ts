// stores/gameStore.ts
import { atom } from "jotai";
import { IUser } from "./user.store";

export interface PlayerDetail {
  _id: string;
  userId: number;
  username: string;
  is_premium: boolean;
  avatar: string;
  turn_1: number;
  turn_2: number;
  turn_3: number;
  turn_4: number;
  turn_5: number;
}

export interface Game {
  _id: string;
  user_1: IUser;
  user_2: IUser;
  status: "PENDING" | "ONGOING" | "ENDED";
  winner: {
    _id: string;
    userId: number;
    username: string;
    is_premium: boolean;
    point: number;
    avatar: string;
  } | null;
  detail: {
    user_1: PlayerDetail;
    user_2: PlayerDetail;
  };
  total_point_user_1: number;
  total_point_user_2: number;
  count_turn_user_1: number;
  count_turn_user_2: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Atom chính lưu trữ game hiện tại
export const gameAtom = atom<Game | null>(null);

// Atom để cập nhật từng phần nếu cần
export const updateGameAtom = atom(null, (get, set, update: Partial<Game>) => {
  const current = get(gameAtom);
  if (!current) return;
  set(gameAtom, { ...current, ...update });
});
