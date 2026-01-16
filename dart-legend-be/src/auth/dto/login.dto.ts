import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  initData: string;
}

export class LoginDevDto {
  @ApiProperty({
    default: '678f1f5910d359d19a6241f0',
    example: '678f1f5910d359d19a6241f0',
  })
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}

export class AuthUserLoginDto {
  @ApiProperty({ example: 732873233 })
  @IsNotEmpty({ message: 'USER_ID_REQUIRED' })
  userId: number;

  @ApiProperty()
  @IsNotEmpty({ message: 'PW_REQUIRED' })
  password: string;
}
