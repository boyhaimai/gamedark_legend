import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateGameDto } from './create-game.dto';
import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class UpdateGameDto {
  @ApiProperty({ type: Number })
  @IsNumber()
  @IsNotEmpty()
  // @Max(60)
  @Min(0)
  count_click: number;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @IsOptional()
  @Max(60)
  @Min(1)
  count_bot_click: number;
}

export class CancelGameDto {
  @ApiProperty({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  game_id: string;
}
