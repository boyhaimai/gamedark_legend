import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Schema } from 'mongoose';
import { CurrencyType } from 'src/database/models/order.model';

export class CreateOrderDto {
  // @ApiProperty({

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  wallet: string;

  @ApiProperty({
    enum: CurrencyType,
    required: false,
    default: CurrencyType.TON,
  })
  @IsEnum(CurrencyType)
  @IsOptional()
  currency: CurrencyType;

  // @ApiProperty()
  // @IsNumber()
  // amount: number;

  // @ApiProperty()
  // @IsNumber()
  // quantity: number;
}
