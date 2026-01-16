import { Injectable, Logger } from '@nestjs/common';
import { Address, OpenedContract } from '@ton/core';
import { KeyPair, mnemonicToPrivateKey } from '@ton/crypto';
import { TonClient, WalletContractV4 } from '@ton/ton';

import {
  TON_BOT_API_KEY,
  TON_MASTER_WALLET_ADDRESS,
  TON_MASTER_WALLET_MNEMONIC,
  TONClientRPC,
} from 'src/ton-wallet/constants';
import { deployCollection } from '../scripts/deployCollection';
import {
  getNextIndexNFT,
  mintNFT,
  transferNFTSimple,
} from '../scripts/mintNFT';

export interface MintResult {
  success: boolean;
  transactionHash?: string;
  nftAddress?: string;
  nftIndex?: number;
  error?: string;
}

export interface NftInfo {
  owner?: string;
  index?: number;
  content?: string;
  error?: string;
}

export interface NftMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export enum NftType {
  RED = 'red',
  WHITE = 'white',
  YELLOW = 'yellow',
}

export interface NftPathConfig {
  [key: string]: string;
}

@Injectable()
export class MintNftService {
  constructor() {
    this.initializeClient();
  }

  private readonly logger = new Logger(MintNftService.name);
  private client: TonClient;
  private wallet: WalletContractV4;
  private openedWallet: OpenedContract<WalletContractV4>;
  private key: KeyPair;
  private readonly tonClient: TonClient = new TonClient({
    endpoint: TONClientRPC.MAINNET,
    // endpoint: TONClientRPC.MAINNET,
  });
  private readonly mnemonic = TON_MASTER_WALLET_MNEMONIC;
  private readonly apiKey = TON_BOT_API_KEY;
  private readonly endpoint = TONClientRPC.MAINNET;
  private readonly config: {
    wallet: {
      address: string;
      mnemonic: string;
    };
    collectionData: {
      royalty: number;
      royaltyAddress: string;
      collectionJson: string;
      nftJsonBase: string;
    };
  } = {
    wallet: {
      address: TON_MASTER_WALLET_ADDRESS,
      mnemonic: TON_MASTER_WALLET_MNEMONIC,
    },
    collectionData: {
      royalty: 0,
      royaltyAddress: TON_MASTER_WALLET_ADDRESS,
      collectionJson:
        'https://sucosun-s3.s3.ap-southeast-1.amazonaws.com/collection.json',
      nftJsonBase: '',
    },
  };

  async getTransactions() {
    return await this.tonClient.getTransactions(
      Address.parse(TON_MASTER_WALLET_ADDRESS),
      {
        limit: 1,
        archival: true,
      },
    );
  }

  private async initializeClient() {
    try {
      // Initialize TON client
      this.client = new TonClient({
        endpoint: this.endpoint,
        apiKey: this.apiKey,
      });

      // Initialize wallet
      const keyMnemonic = await mnemonicToPrivateKey(this.mnemonic.split(' '));
      this.wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyMnemonic.publicKey,
      });
      this.openedWallet = this.client.open(this.wallet);
      this.key = keyMnemonic;
    } catch (error) {
      this.logger.error('Failed to initialize TON NFT Service:', error);
    }
  }

  async deployAndMint(nftMetadata: string) {
    const config = this.config;
    config.collectionData.nftJsonBase = nftMetadata;
    try {
      // // Bước 1: Deploy Collection
      // console.log('📦 Đang deploy NFT collection...');
      // const collectionAddress = await deployCollection(config);

      // if (!collectionAddress) {
      //   console.error('❌ Deploy collection thất bại!');
      //   return;
      // }

      // console.log('✅ Deploy collection thành công!');
      // console.log(`📍 Collection address: ${collectionAddress}`);
      // console.log(
      //   `🔗 Xem trên TONScan: https://tonscan.org/address/${collectionAddress}\n`,
      // );

      // // Đợi 30 giây để network xử lý
      // console.log('⏳ Đang đợi 30 giây để network xử lý...');

      // Bước 2: Mint NFT
      console.log('🎨 Đang mint NFT...');
      const itemOwnerAddress = config.wallet.address;

      const mintResult = await mintNFT(config, itemOwnerAddress);

      if (mintResult.success) {
        console.log('✅ Mint NFT thành công!');
        console.log(`👤 Owner: ${itemOwnerAddress}`);
        // console.log(
        //   `📝 Metadata sẽ có tại: ${config.collectionData.nftJsonBase}0.json`,
        // );
        await new Promise((resolve) => setTimeout(resolve, 30000));

        return {
          success: true,
          itemIndex: mintResult.itemIndex,
        };
      } else {
        console.log('❌ Mint NFT thất bại!');
        return {
          success: false,
          error: 'Mint NFT failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: `Error during minting process: ${error.message}`,
      };
    }
  }

  async getNextIndexNFT(nftMetadata: string) {
    const config = this.config;
    config.collectionData.nftJsonBase = nftMetadata;

    const nextIndexResult = await getNextIndexNFT(config);
    return nextIndexResult;
  }
  async transferNFT(toAddress: string, nftIndex: number, nftMetadata: string) {
    const config = this.config;
    config.collectionData.nftJsonBase = nftMetadata;
    const transferResult = await transferNFTSimple(config, toAddress, nftIndex);
    return transferResult;
  }
}
