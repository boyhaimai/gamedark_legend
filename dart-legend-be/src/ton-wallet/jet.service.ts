// import { Address } from '@ton/core';
// import axios from 'axios';
// import { TON_BOT_API_KEY } from './constants';

// export interface JettonTransactionResult {
//   txHash: string;
//   from: string;
//   to: string;
//   amount: string;
//   timestamp: number;
// }

// export interface JettonTransaction {
//   txHash: string;
//   timestamp: number;
//   from: string;
//   to: string;
//   amount: string;
//   jettonMaster: string;
//   jettonName?: string;
//   jettonSymbol?: string;
//   decimals?: number;
//   usdValue?: number;
// }

// export class JettonService {
//   private tonApiKey: string;
//   private baseUrl: string;

//   constructor() {
//     this.tonApiKey = TON_BOT_API_KEY;
//     this.baseUrl = 'https://tonapi.io/v2';
//   }

//   async getJettonTransactions() {
//     const walletAddress = '0QDegbTNJg_BlPcoQDnKML1NQj29Q-Px8wLgKaIslejEcS71'; // Replace with actual wallet address
//     const limit = 10; // Adjust as needed

//     const raw = Address.parseFriendly(walletAddress).address.toRawString();

//     try {
//       const response = await axios.get(
//         `${this.baseUrl}/accounts/${raw}/jettons/history`,
//         {
//           headers: {
//             Authorization: `Bearer ${this.tonApiKey}`,
//           },
//           params: { limit },
//         },
//       );

//       const transactions = response.data.events || [];

//       return transactions
//         .map((tx: any) => {
//           const jettonAction = tx.actions.find((a: any) => a.JettonTransfer);
//           const transfer = jettonAction?.JettonTransfer;

//           return (
//             transfer && {
//               txHash: tx.event_id,
//               timestamp: tx.timestamp,
//               from: transfer.sender?.address || 'unknown',
//               to: transfer.recipient?.address || 'unknown',
//               amount: transfer.amount || '0',
//               jettonMaster: transfer.jetton?.address,
//               jettonName: transfer.jetton?.name,
//               jettonSymbol: transfer.jetton?.symbol,
//               decimals: transfer.jetton?.decimals,
//             }
//           );
//         })
//         .filter(Boolean);
//     } catch (error: any) {
//       console.error(
//         '❌ Error fetching jetton history:',
//         error.response?.data || error.message,
//       );
//       console.log(error);

//       throw error;
//     }
//   }
// }
