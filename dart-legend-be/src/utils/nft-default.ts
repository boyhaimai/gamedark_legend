import { NFTType } from 'src/database/models/NFT.model';

export const nftDefault = [
  {
    name: 'The Original Dart',
    price: 3,
    reward: 3.6,
    reward_SGC: 52,
    total: 25000,
    current_index: 0,
    description:
      'Forged in the void between stars, this dart pulses with the mysterious energy of deep space. Its shimmering purple aura shifts like a nebula, making every throw feel like bending the laws of the universe itself.',
    type: NFTType.COMMON,
    image: 'https://sucosun-s3.s3.ap-southeast-1.amazonaws.com/whiteNFT.json',
  },
  {
    name: 'Phoenix Throw',
    price: 12,
    reward: 24,
    reward_SGC: 236,
    total: 11000,
    current_index: 0,
    description:
      'A radiant creation of swirling rainbow light, this dart embodies speed, freedom, and flair. It twists through the air like a ribbon of color, dazzling opponents and leaving behind a trail of brilliance.',
    type: NFTType.RARE,
    image: 'https://sucosun-s3.s3.ap-southeast-1.amazonaws.com/yellowNFT.json',
  },
  {
    name: "Legendary Bull's Eye",
    price: 25,
    reward: 62.5,
    reward_SGC: 1040,
    total: 5000,
    current_index: 0,
    description:
      'Crafted from an ancient glacier shard, this dart is cold, precise, and deadly. Its transparent body refracts light into icy beams, and its sharp tip never misses — like a silent arrow of winter.',
    type: NFTType.LEGENDARY,
    image: 'https://sucosun-s3.s3.ap-southeast-1.amazonaws.com/redNFT.json',
  },
];
