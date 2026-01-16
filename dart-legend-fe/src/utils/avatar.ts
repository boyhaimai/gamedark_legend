import { logo } from "@/assets";
import { IHistory } from "@/utils/type";

export const getAvatarUrl = (url: string | null | undefined) => {
  if (!url) return logo;
  return `https://images.weserv.nl/?url=${encodeURIComponent(
    url.replace(/^https?:\/\//, "")
  )}`;
};

export const getOpponentAvatar = (game: IHistory, userId?: string): string => {
  if (!userId) return logo;
  if (game.user_1 === userId) {
    return game.detail.user_2.avatar || logo;
  } else if (game.user_2 === userId) {
    return game.detail.user_1.avatar || logo;
  }
  return logo;
};
