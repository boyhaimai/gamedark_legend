import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsString,
  Length,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @Length(1, 100)
  @IsOptional()
  name: string;
}


