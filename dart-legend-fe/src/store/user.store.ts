import { atom } from "jotai";

export interface IUser {
  _id: string;
  code: string;
  userId: number;
  username: string;
  is_premium: boolean;
  avatar: string;
  balance: number;
  TON_balance: number;
  SGC_balance: number;
  depth: number;
  referrer: string | null;
  parents: string[];
  children: string[];
  nonce: number;
  friend: number;
  token: number;
  active: boolean;
  is_bot: boolean;
  role: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  currentCheckin: number;
  lastCheckin: string;
  rankTopEarn: number;
  rankTopReferral: number;
  wallet: string;
  point: number;
}

export const atomUser = atom<IUser | null>(null);

// Thêm action để cập nhật balance trực tiếp
export const updateUserBalanceAtom = atom(
  null,
  (get, set, newBalance: number) => {
    const user = get(atomUser);
    if (user) {
      set(atomUser, { ...user, point: newBalance });
    }
  }
);
