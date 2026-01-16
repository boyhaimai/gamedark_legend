import { ApiQuery } from '@nestjs/swagger';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { PaginationParams } from '../dto/pagination.dto';
import { Request } from 'express';

export const Pagination = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req: Request = ctx.switchToHttp().getRequest();
    const query = req.query as unknown as PaginationParams;
    const { search, sort, page = 1, limit = 10 } = query;
    return { search, sort, page, limit };
  },
  [
    (data: any, key: string) => {
      ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Page number',
      })(data, key, Object.getOwnPropertyDescriptor(data, key));
      ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Limit number',
      })(data, key, Object.getOwnPropertyDescriptor(data, key));
      ApiQuery({
        name: 'sort',
        required: false,
        type: Object,
        description: 'Sort object',
      })(data, key, Object.getOwnPropertyDescriptor(data, key));
      ApiQuery({
        name: 'search',
        required: false,
        type: Object,
        description: 'Search object',
      })(data, key, Object.getOwnPropertyDescriptor(data, key));
    },
  ],
);
