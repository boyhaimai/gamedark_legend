import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import { UserRole } from 'src/database/models/user.model';

export class CreateUserDto {
  @ApiPropertyOptional({ type: Number, required: true, default: 716278126872 })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  userId: number;

  @ApiPropertyOptional({ type: String, required: true, default: 'username' })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  username: string;

  @ApiPropertyOptional({ type: String, required: false, default: 'first_name' })
  @IsOptional()
  @IsString()
  first_name: string;

  @ApiPropertyOptional({ type: String, required: false, default: 'last_name' })
  @IsOptional()
  @IsString()
  last_name: string;

  @ApiPropertyOptional({ type: Number, required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(1000)
  friend: number;

  @ApiPropertyOptional({ type: Number, required: false, default: 100 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  balance: number;

  @ApiPropertyOptional({ type: Number, required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(10)
  depth: number;

  @ApiPropertyOptional({ type: Boolean, required: true, default: false })
  @IsBoolean()
  @IsNotEmpty()
  is_premium: boolean;

  @ApiPropertyOptional({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  active: boolean;

  @ApiPropertyOptional({ type: Boolean, required: false, default: false })
  @IsBoolean()
  @IsOptional()
  is_bot: boolean;

  @ApiPropertyOptional({ type: Boolean, required: false, default: false })
  role: UserRole;
}
