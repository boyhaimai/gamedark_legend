import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { NftType } from '../services/mint-nft.service';

export class UploadMetadataDto {
  @ApiProperty({
    description: 'Type of NFT (will auto-increment number from current file)',
    enum: NftType,
    example: NftType.RED,
  })
  @IsEnum(NftType)
  type: NftType;
}
