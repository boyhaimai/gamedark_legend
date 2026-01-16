import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsMongoId, IsNotEmpty } from 'class-validator';

export class ContinueGameDto {
  @ApiProperty()
  @IsMongoId()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ enum: ['CONTINUE', 'CANCEL'] })
  @IsIn(['CONTINUE', 'CANCEL'])
  @IsNotEmpty()
  action: 'CONTINUE' | 'CANCEL';
}


