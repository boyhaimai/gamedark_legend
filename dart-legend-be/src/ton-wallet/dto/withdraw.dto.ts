import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class WithdrawDto {
  @ApiProperty({
    description: 'The address to withdraw to',
    example: '0QAtAU0TAWDR8v_H0yIKYw0MNQpOwF6xtD5-0hlT-oFWrROV',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({
    description: 'The amount to withdraw',
    example: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  amount: number;
}
