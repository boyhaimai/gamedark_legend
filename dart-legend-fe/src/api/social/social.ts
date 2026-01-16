import { API_ROUTES } from "@/service/api-route.service";
import BaseRequest from "@/service/base-request.serivce";

export const getSocialTasks = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.SOCIAL_TASKS);
};

export const getSocialMission = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.MISSION);
};

export const postCheckIn = () => {
  const rq = new BaseRequest();
  return rq.post(API_ROUTES.CHECK_IN);
};

export const getCheckIn = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.CHECK_IN);
};

export const postCheckMission = (payload: { key: string; point: number }) => {
  const rq = new BaseRequest();
  return rq.post(API_ROUTES.CHECK_MISSION, payload);
};

export const getDailyAttendance = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.DAILY_ATTENDANCE);
};
