import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AcceptTransactionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  order_id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  wallet: string;
}
