import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';

export class CreatedResponse<T> {
  @ApiProperty({ example: HttpStatus.CREATED })
  statusCode?: 201 | 200;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;
}

export class DataResponse<T> {
  @ApiProperty({ example: HttpStatus.OK })
  statusCode?: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;
}

export class ErrorResponse {
  @ApiProperty()
  message: string;

  @ApiProperty()
  timestamp: Date;

  @ApiProperty()
  path: string;

  @ApiProperty()
  tenantId: string;
}
export class FailedResponse extends ErrorResponse {
  @ApiProperty({ example: HttpStatus.BAD_REQUEST })
  statusCode: number;
}

export class UnauthorizedResponse extends ErrorResponse {
  @ApiProperty({ example: HttpStatus.UNAUTHORIZED })
  statusCode: number;
}

export class ForbiddenResponse extends ErrorResponse {
  @ApiProperty({ example: HttpStatus.FORBIDDEN })
  statusCode: number;
}

export class NotFoundResponse extends ErrorResponse {
  @ApiProperty({ example: HttpStatus.NOT_FOUND })
  statusCode: number;
}

export class PaginatedResponse<T> {
  @ApiProperty({ example: HttpStatus.OK })
  statusCode: number;

  @ApiProperty()
  data: T[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;
}
