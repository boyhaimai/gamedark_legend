import { TON_BOT_API_KEY, TONClientRPC } from 'src/ton-wallet/constants';

const TonWeb = require('tonweb');

export const apiKey = TON_BOT_API_KEY;

export const tonApiUrl = TONClientRPC.MAINNET;

export const tonweb = new TonWeb(
  new TonWeb.HttpProvider(tonApiUrl, { apiKey }),
);

export const wc = 0;
export const sendMode = 3;
export const version = 'v4R2';
export const TX_AMOUNT = '0.05';
export const startIndex = -1;

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export { TonWeb };
