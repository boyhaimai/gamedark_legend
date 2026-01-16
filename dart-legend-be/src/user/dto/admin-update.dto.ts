import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class AdminUpdateDto {
  @ApiProperty({ type: String, default: '60a0fe4f5311236168a109ca' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  _id: string;

  @ApiProperty({ type: Boolean, default: true })
  @IsBoolean()
  @IsNotEmpty()
  is_bot: boolean;
}
