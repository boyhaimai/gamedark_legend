import { API_ROUTES } from "@/service/api-route.service";
import BaseRequest from "@/service/base-request.serivce";

export const getMe = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.USER);
};
export const getUserAll = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.USER_ALL);
};
export const getUserProfile = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.USER_PROFILE);
};
export const getUserReferral = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.USER_REFERRAL);
};
