import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Address,
  beginCell,
  fromNano,
  JettonMaster,
  JettonWallet,
  TonClient,
} from '@ton/ton';
import {
  TON_BOT_API_KEY,
  TON_MASTER_WALLET_ADDRESS,
  TONClientRPC,
} from './constants';
import { GetTonTransactionDto } from './dto/get-ton-transaction.dto';
import axios from 'axios';
const TonWeb = require('tonweb');

@Injectable()
export class TonTransactionService {
  private baseUrl: string;
  private readonly tonClient: TonClient = new TonClient({
    endpoint: TONClientRPC.MAINNET,
  });

  private readonly masterWalletAddress: Address = Address.parse(
    TON_MASTER_WALLET_ADDRESS,
  );

  constructor() {
    this.baseUrl = 'https://tonapi.io/v2';
  }

  async getTransactions(body: GetTonTransactionDto) {
    try {
      return await this.tonClient.getTransactions(this.masterWalletAddress, {
        limit: body.limit || 100,
        hash: body.hash,
        lt: body.lt,
        to_lt: body.to_lt,
        inclusive: body.inclusive,
        archival: true,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  // async getTransactionJetton() {
  //   const walletAddress = '0QDegbTNJg_BlPcoQDnKML1NQj29Q-Px8wLgKaIslejEcS71'; // Replace with actual wallet address
  //   const limit = 10;
  //   const raw = this.masterWalletAddress.toRawString();

  //   const response = await axios.get(
  //     `${this.baseUrl}/accounts/${raw}/jettons/history`,
  //     {
  //       headers: {
  //         // Authorization: `Bearer ${this.tonApiKey}`,
  //       },
  //       params: { limit },
  //     },
  //   );
  //   const address = response.data.operations[0].destination;
  //   const rawwwwww = Address.parse(address.address).equals(
  //     this.masterWalletAddress,
  //   );

  //   return response.data;
  //   return raw;
  // }

  /**
   * Get specific Jetton transaction by hash for verification
   * @param hash - Transaction hash in base64 format
   * @returns Transaction details if found and valid
   */
  async getJettonTransactionByHash(hash: string) {
    try {
      // Convert hash to hex format for TON API
      const hashBuffer = Buffer.from(hash, 'base64');
      const hashHex = hashBuffer.toString('hex');

      // Query TON API v2 for transaction by hash
      const response = await axios.get(
        `${this.baseUrl}/blockchain/transactions/${hashHex}`,
        {
          headers: {
            Authorization: `Bearer ${TON_BOT_API_KEY}`,
          },
        },
      );

      if (!response.data) {
        throw new BadRequestException('Transaction not found');
      }

      const tx = response.data;

      // Check if this is a Jetton transfer
      const jettonAction = tx.actions?.find(
        (action: any) => action.type === 'JettonTransfer',
      );

      if (!jettonAction) {
        throw new BadRequestException('Not a Jetton transfer transaction');
      }

      const jettonTransfer = jettonAction.JettonTransfer;

      // Verify transaction was successful
      if (!tx.success) {
        throw new BadRequestException('Transaction failed on blockchain');
      }

      return {
        hash: tx.hash,
        success: tx.success,
        timestamp: tx.utime,
        sender: jettonTransfer.sender?.address,
        recipient: jettonTransfer.recipient?.address,
        amount: jettonTransfer.amount,
        jettonMaster: jettonTransfer.jetton?.address,
        jettonName: jettonTransfer.jetton?.name,
        jettonSymbol: jettonTransfer.jetton?.symbol,
        decimals: jettonTransfer.jetton?.decimals || 9,
        comment: jettonTransfer.comment,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      // Handle API errors
      if (error.response?.status === 404) {
        throw new BadRequestException('Transaction not found on blockchain');
      }

      throw new BadRequestException(
        `Failed to verify Jetton transaction: ${error?.message || error}`,
      );
    }
  }
}
