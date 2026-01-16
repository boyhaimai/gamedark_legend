import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { SocialType } from 'src/database/models/mission.model';
import { MissionType } from 'src/database/models/verify-mission.model';

export class MissionDto {
  @ApiProperty({
    enum: SocialType,
    required: true,
    default: SocialType.TELEGRAM,
  })
  @IsEnum(SocialType)
  @IsNotEmpty()
  type: SocialType;
}

export class CreateTaskDto {
  @ApiProperty({ type: String })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ type: Number })
  @IsNotEmpty()
  point: number;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  uri: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  tag: string;

  @ApiPropertyOptional({ type: String, required: false })
  @IsOptional()
  avatar: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  social: string;

  @IsOptional()
  @ApiPropertyOptional({ type: Date, required: false, default: new Date() })
  @IsDateString()
  start_time: Date;

  @IsOptional()
  @ApiPropertyOptional({ type: Date, required: false, default: new Date() })
  @IsDateString()
  end_time: Date;
}
