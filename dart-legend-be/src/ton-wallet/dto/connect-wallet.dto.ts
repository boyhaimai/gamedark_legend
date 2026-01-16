import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConnectWalletDto {
  @ApiPropertyOptional({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  wallet: string;
}
