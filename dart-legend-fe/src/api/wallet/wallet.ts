import { API_ROUTES } from "@/service/api-route.service";
import BaseRequest from "@/service/base-request.serivce";

const rq = new BaseRequest();

export const connectWallet = (wallet: string) => {
  return rq.post(API_ROUTES.WALLET, { wallet });
};

export const disconnectWallet = (wallet: string) => {
  return rq.post(API_ROUTES.WALLET_DISCONNECT, wallet);
};

export const depositUSDT = (amount: string) => {
  return rq.post(API_ROUTES.DEPOSIT, { amount });
};

export const walletOrder = (wallet: string, currency?: string) => {
  const payload: Record<string, string> = { wallet };
  if (currency) payload.currency = currency;
  return rq.post(API_ROUTES.WALLET_ORDER, payload);
};

export const walletAccept = (
  wallet: string,
  hash: string,
  order_id: string
) => {
  return rq.post(API_ROUTES.WALLET_ACCEPT, { wallet, hash, order_id });
};

export const walletCancel = (wallet: string, orderId: string) => {
  return rq.post(API_ROUTES.WALLET_CANCEL, { wallet, orderId });
};

export const getDestWallet = () => {
  return rq.get(API_ROUTES.WALLET_DEST);
};

export const getWalletHistory = () => {
  return rq.get(API_ROUTES.WALLET_HISTORY);
};

export const getHistoryTransaction = ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  return rq.get(API_ROUTES.HISTORY_TRANSACTION, { page, limit });
};

export const postWalletWithdraw = (address: string, amount: number) => {
  return rq.post(API_ROUTES.WALLET_WITHDRAW, { address, amount });
};

export const getWalletPrice = () => {
  return rq.get(API_ROUTES.WALLET_PRICE);
};

export const jettonTransfer = (
  wallet: string,
  amount: string,
  orderId?: string
) => {
  const payload: Record<string, string> = { wallet, amount };
  if (orderId) payload.orderId = orderId;
  return rq.post(API_ROUTES.JETTON_TRANSFER, payload);
};

export const sendTo = (userName: string, amount: string) => {
  return rq.post(API_ROUTES.SEND_TO, { userName, amount });
};

export const getEarnSGC = () => {
  return rq.get(API_ROUTES.EARN_SGC);
};
