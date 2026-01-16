import * as dotenv from 'dotenv';
dotenv.config();

export enum TONClientRPC {
  MAINNET = 'https://toncenter.com/api/v2/jsonRPC',
  TESTNET = 'https://testnet.toncenter.com/api/v2/jsonRPC',
}

export const TON_MASTER_WALLET_ADDRESS = process.env.TON_MASTER_WALLET_ADDRESS;
export const TON_BOT_API_KEY = process.env.TON_BOT_API_KEY;
export const TON_MASTER_WALLET_MNEMONIC =
  process.env.TON_MASTER_WALLET_MNEMONIC;
export const JETTON_MASTER_ADDRESS = process.env.JETTON_MASTER_ADDRESS;
