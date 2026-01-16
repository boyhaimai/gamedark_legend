export enum ESocial {
  YOUTUBE = "YOUTUBE",
  TWITTER = "TWITTER",
  DISCORD = "DISCORD",
  TELEGRAM = "TELEGRAM",
  FACEBOOK = "FACEBOOK",
  INSTAGRAM = "INSTAGRAM",
  TIKTOK = "TIKTOK",
  TWITCH = "TWITCH",
}

export interface NFT {
  _id: string;
  name: string;
  avatar: string;
  price: number;
  description: string;
  createdAt: string;
  updatedAt: string;
  image?: string;
  type: string;
  total_sold: number;
  total: number;
}

export interface ICheckIn {
  _id: string;
  userId: string;
  nextCheckinDay: number;
  lastCheckin: string;
  currentCheckin: boolean;
}

export interface PNL {
  _id: string;
  username: string;
  balance: number;
}

export interface Referral {
  _id: string;
  username: string;
  friend: number;
}

export interface tasks {
  _id: string;
  type: string;
  key: string;
  name: string;
  point: number;
  uri: string;
  social: string;
  createdAt: string;
  updatedAt: string;
}

export interface Imission {
  _id: string;
  daily: string[];
  socials: string[];
  createdAt: string;
  updatedAt: string;
  user: string;
}

export interface Iinventory {
  createdAt: string;
  nft: NFT;
  updatedAt: string;
  user: string;
  _id: string;
  count: number;
  reward_SGC: number;
  reward: number;
  unclaimed_reward: number;
}

export interface IHistory {
  _id: string;
  count_turn_user_1: number;
  count_turn_user_2: number;
  createdAt: string;
  detail: {
    user_1: {
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
    };
    user_2: {
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
    };
  };
  status: "PENDING" | "ONGOING" | "ENDED";
  total_point_user_1: number;
  total_point_user_2: number;
  updatedAt: string;
  user_1: string;
  user_2: string;
  win: string;
  winner: {
    _id: string;
    userId: number;
    username: string;
    is_premium: boolean;
    avatar: string;
    point: number;
  };
}

export interface IDailyAttendance {
  _id: string;
  day_1: number;
  day_2: number;
  day_3: number;
  day_4: number;
  day_5: number;
  day_6: number;
  day_7: number;
  createdAt: string;
  updatedAt: string;
}

export interface IReferral {
  _id: string;
  referrer: string;
  referred: string;
  is_premium: boolean;
  params: {
    amount: number;
    code: string;
    username: string;
  };
  reward: number;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  GAME = "GAME",
  WIN_GAME = "WIN_GAME",
  REFERRAL = "REFERRAL",
  MISSION = "MISSION",
  BUY_NFT = "BUY_NFT",
  COMMISSION_REWARD = "COMMISSION_REWARD",
  BUY_NFT_REWARD = "BUY_NFT_REWARD",
  NFT_REWARD = "NFT_REWARD",
  NFT_REWARD_SGC = "NFT_REWARD_SGC",
}

export interface IWalletHistory {
  _id: string;
  amount: number;
  createdAt: string;
  createdLt?: string;
  forwardFee?: string;
  from?: string;
  hash?: string;
  ihr_fee?: string;
  lt?: string;
  order?: string;
  params: {
    amount: number;
    value?: number;
  };
  rate?: number;
  status?: "done";
  to?: string;
  totalFees?: string;
  type: TransactionType | string;
  currency?: string;
  updatedAt?: string;
  user?: string;
  value?: number;
}
