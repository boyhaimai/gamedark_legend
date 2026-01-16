import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class ClaimRewardReferralDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  is_premium: boolean;
}
