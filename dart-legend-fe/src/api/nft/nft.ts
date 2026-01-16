import { API_ROUTES } from "@/service/api-route.service";
import BaseRequest from "@/service/base-request.serivce";

export const getNFT = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.NFT);
};

export const getNFT_User = () => {
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.USER_NFT);
};

export const postBuyNft = (nftId: string) => {
  const rq = new BaseRequest();
  return rq.post(API_ROUTES.BUY_NFT, { nftId });
};

export const rewardsSGC = (page: number, limit: number)=>{
  const rq = new BaseRequest();
  return rq.get(API_ROUTES.HISTORY_TRANSACTION, {page, limit});
}
