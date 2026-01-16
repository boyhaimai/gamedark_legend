import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class SendMessageDto {
  @ApiPropertyOptional({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  @Length(1, 1000)
  content: string;
}
