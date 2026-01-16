import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FakeVerifyMissionDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  @IsString()
  key: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  @IsNumber()
  point: number;
}
