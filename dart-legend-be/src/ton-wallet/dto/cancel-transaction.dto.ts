import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CancelTransactionDto {
  @ApiProperty()
  @IsString()
  orderId: string;

  @ApiProperty()
  @IsString()
  wallet: string;
}
