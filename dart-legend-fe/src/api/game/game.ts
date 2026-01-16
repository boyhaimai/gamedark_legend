import { API_ROUTES } from "@/service/api-route.service";
import BaseRequest from "@/service/base-request.serivce";

export const findGame = () => {
  const rq = new BaseRequest();
  return rq.post(API_ROUTES.GAME_MATCH, {});
};
export const getGame = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.GAME);
};

export const cancelGame = (game_id: string) => {
  const rq = new BaseRequest();
  return rq.post(API_ROUTES.GAME_CANCEL, { game_id });
};
