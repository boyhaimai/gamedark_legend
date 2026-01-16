import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BuyNftDto {
  @ApiProperty({
    description: 'The ID of the NFT to buy',
    example: '64d6a32564d6a32564d6a325',
  })
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  nftId: string;

  @ApiProperty({
    description: 'Wallet address for blockchain NFT minting (optional)',
    example: '0:abc123def456...',
    required: false,
  })
  @IsOptional()
  @IsString()
  walletAddress?: string;
}
