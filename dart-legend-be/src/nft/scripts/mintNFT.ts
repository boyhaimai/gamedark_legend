import { prepareCollection } from './prepareCollection.js';
import { TonWeb, sendMode, TX_AMOUNT } from './_utils.js';

export async function mintNFT(config, itemOwnerAddress) {
  const { nftCollection, collectionConfig } = await prepareCollection(config);

  const secretKey = collectionConfig.secretKey;

  itemOwnerAddress = new TonWeb.utils.Address(itemOwnerAddress);

  const currentCollectionState = await nftCollection.getCollectionData();

  const itemIndex = currentCollectionState.nextItemIndex;

  if (itemIndex >= collectionConfig.limit) return;

  const amount = TonWeb.utils.toNano(TX_AMOUNT);
  const seqno = (await collectionConfig._wallet.methods.seqno().call()) || 0;

  // const itemContentUri = `${itemIndex}.json`
  const itemContentUri = '';

  const mintData = { amount, itemIndex, itemOwnerAddress, itemContentUri };
  const payload = nftCollection.createMintBody(mintData);

  const toAddress = nftCollection.address;

  const deployNftTX = {
    secretKey,
    toAddress,
    amount,
    seqno,
    payload,
    sendMode,
  };

  try {
    await collectionConfig._wallet.methods.transfer(deployNftTX).send();
    return {
      success: true,
      itemIndex,
    };
  } catch (e) {
    console.log(e);
    return {
      success: false,
      error: `Mint NFT failed: ${e.message}`,
    };
  }
}

export async function getNextIndexNFT(config: any) {
  const { nftCollection, collectionConfig } = await prepareCollection(config);
  const currentCollectionState = await nftCollection.getCollectionData();
  const nextItemIndex = currentCollectionState.nextItemIndex;

  return {
    nftIndex: nextItemIndex,
  };
}

export async function transferNFTSimple(
  config: any,
  toAddress: string,
  nftIndex: number,
) {
  try {
    const recipientAddr = new TonWeb.utils.Address(toAddress.trim());

    const { nftCollection, collectionConfig } = await prepareCollection(config);

    const nftItemAddress =
      await nftCollection.getNftItemAddressByIndex(nftIndex);

    const seqno = (await collectionConfig._wallet.methods.seqno().call()) || 0;

    const transferBody = new TonWeb.boc.Cell();
    transferBody.bits.writeUint(0x5fcc3d14, 32); // transfer op
    transferBody.bits.writeUint(0, 64); // query_id
    transferBody.bits.writeAddress(recipientAddr); // new_owner
    transferBody.bits.writeAddress(collectionConfig._walletAddress); // response_destination
    transferBody.bits.writeBit(false); // null custom_payload
    transferBody.bits.writeCoins(TonWeb.utils.toNano('0.01')); // forward_amount
    transferBody.bits.writeBit(false); // forward_payload empty

    const transferResult = await collectionConfig._wallet.methods
      .transfer({
        secretKey: collectionConfig.secretKey,
        toAddress: nftItemAddress,
        amount: TonWeb.utils.toNano('0.02'),
        seqno: seqno,
        payload: transferBody,
        sendMode: sendMode,
      })
      .send();

    return {
      success: true,
      result: transferResult,
      nftIndex: nftIndex,
      nftAddress: nftItemAddress.toString(true, true, true),
      fromAddress: collectionConfig._walletAddress.toString(true, true, true),
      toAddress: recipientAddr.toString(true, true, true),
    };
  } catch (error) {
    console.error('❌ Simple NFT Transfer failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}
