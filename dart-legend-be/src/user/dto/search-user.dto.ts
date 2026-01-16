import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class SearchUserDto {
  @ApiPropertyOptional({ description: 'Search query for username or code' })
  @IsOptional()
  @IsString()
  key?: string;
}
