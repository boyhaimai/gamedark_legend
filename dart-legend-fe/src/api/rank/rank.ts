import { API_ROUTES } from "@/service/api-route.service";
import BaseRequest from "@/service/base-request.serivce";

export const getLeaderBoardReferral = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.TOP_REFERRAL);
};

export const getLeaderBoardEarn = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.TOP_EARN);
};
