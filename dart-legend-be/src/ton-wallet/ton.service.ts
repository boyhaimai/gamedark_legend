import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Address,
  beginCell,
  fromNano,
  internal,
  JettonMaster,
  JettonWallet,
  toNano,
  TonClient,
  WalletContractV4,
} from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import {
  JETTON_MASTER_ADDRESS,
  TON_BOT_API_KEY,
  TON_MASTER_WALLET_MNEMONIC,
  TONClientRPC,
} from './constants';

@Injectable()
export class TonService {
  constructor() {}

  private readonly tonClient: TonClient = new TonClient({
    apiKey: TON_BOT_API_KEY,
    // endpoint: TONClientRPC.MAINNET,
    endpoint: TONClientRPC.MAINNET,
  });

  private async getKeyPair() {
    const mnemonic = TON_MASTER_WALLET_MNEMONIC;
    const key = mnemonic.split(' ');
    return await mnemonicToPrivateKey(key);
  }

  private async getContract() {
    const keyPair = await this.getKeyPair();
    const wallet = WalletContractV4.create({
      workchain: 0,
      publicKey: keyPair.publicKey,
    });
    return this.tonClient.open(wallet);
  }

  async getWalletAddress() {
    const contract = await this.getContract();
    return contract.address.toString();
  }

  async verifyWalletAddress(address: string) {
    try {
      Address.parse(address);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getBalance() {
    try {
      const contract = await this.getContract();
      const balance = await contract.getBalance();
      return fromNano(balance);
    } catch (error) {
      // Re-throw with clearer message for caller
      throw new BadRequestException(
        `TON getBalance failed: ${error?.message || error}`,
      );
    }
  }

  async transfer(targetAddress: string, value: number, message: string) {
    const balance = await this.getBalance();

    if (Number(balance || 0) < Number(value || 0))
      throw new BadRequestException('Not enough balance');

    const contract = await this.getContract();
    const keyPair = await this.getKeyPair();
    const seqno: number = await contract.getSeqno();

    try {
      const transfer = contract.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
          internal({
            value: value.toFixed(2),
            to: targetAddress,
            body: message,
            bounce: false,
          }),
        ],
      });

      await contract.send(transfer);

      return transfer;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async getJettonWalletAddress(userWalletAddress: string): Promise<string> {
    try {
      // Parse user wallet address
      const userAddress = Address.parse(userWalletAddress);

      // Get Jetton Master contract
      const jettonMaster = this.tonClient.open(
        JettonMaster.create(Address.parse(JETTON_MASTER_ADDRESS)),
      );

      // Get Jetton Wallet address for this user
      const jettonWalletAddress =
        await jettonMaster.getWalletAddress(userAddress);

      return jettonWalletAddress.toString();
    } catch (error) {
      throw new BadRequestException(
        `Failed to get Jetton Wallet address: ${error?.message || error}`,
      );
    }
  }

  async transferJetton(targetAddress: string, value: number, message: string) {
    try {
      const keyPair = await this.getKeyPair();

      // 2. Tạo ví người gửi
      const senderWallet = WalletContractV4.create({
        publicKey: keyPair.publicKey,
        workchain: 0,
      });
      const sender = this.tonClient.open(senderWallet);
      const senderAddress = sender.address;

      // 3. Tạo JettonMaster và lấy JettonWallet của người gửi
      const jettonMaster = this.tonClient.open(
        JettonMaster.create(Address.parse(JETTON_MASTER_ADDRESS)),
      );
      const senderJettonWalletAddress =
        await jettonMaster.getWalletAddress(senderAddress);
      const senderJettonWallet = this.tonClient.open(
        JettonWallet.create(senderJettonWalletAddress),
      );

      const recipient = Address.parse(targetAddress);
      const jettonAmount = toNano(value);
      const forwardAmount = toNano('0.0005');
      const responseAddress = senderAddress;
      const transferBody = beginCell()
        .storeUint(0xf8a7ea5, 32) // op code transfer
        .storeUint(0, 64) // query_id
        .storeCoins(jettonAmount) // jetton amount
        .storeAddress(recipient) // recipient
        .storeAddress(responseAddress) // response address
        .storeBit(false) // no custom payload
        .storeCoins(forwardAmount) // forward TON amount
        .storeBit(false) // no forward payload
        .endCell();

      const seqno = await sender.getSeqno();

      const transfer = await sender.createTransfer({
        seqno,
        secretKey: keyPair.secretKey,
        messages: [
          internal({
            to: senderJettonWallet.address,
            value: toNano('0.05'), // cần dư để chi phí
            body: transferBody,
          }),
        ],
        sendMode: 0,
      });
      await sender.send(transfer);
      console.log('✅ Gửi Jetton thành công!');

      return transfer;
    } catch (error) {
      console.error('❌ Lỗi gửi Jetton:', error);
      throw new BadRequestException(error);
    }
  }
}
