import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class RespondInvitationDto {
  @ApiPropertyOptional({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  invitationId: string;

  @ApiPropertyOptional({ type: String, required: true })
  @IsString()
  @IsIn(['ACCEPT', 'REJECT'])
  action: 'ACCEPT' | 'REJECT';
}


