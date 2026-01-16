import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PaginationResult<T> {
  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  data: T;

  constructor(partial: Partial<PaginationResult<T>>) {
    Object.assign(this, partial);
  }
}

export class PaginationParams {
  @ApiPropertyOptional()
  @IsOptional()
  page: number;

  @ApiPropertyOptional()
  @IsOptional()
  limit: number;

  @ApiPropertyOptional()
  @IsOptional()
  sort: Record<string, string>;

  @ApiPropertyOptional({
    type: Object,
    additionalProperties: { type: 'string' },
  })
  @IsOptional()
  search: Record<string, string>;
}

export class PaginationQuery {
  sort: Record<string, string>;
  search: Record<string, string>;
  take: number;
  skip: number;
  limit: number;
  page: number;

  constructor(partial: Partial<PaginationParams>) {
    this.sort = partial.sort || {};
    this.take = partial.limit || 10;
    this.skip = (partial.page - 1) * this.take || 0;
    this.limit = partial.limit || 10;
    this.search = partial.search || {};
    this.page = partial.page || 1;
  }
}
