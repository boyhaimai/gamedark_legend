import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SendInvitationDto {
  @ApiPropertyOptional({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  toUserId: string;
}


