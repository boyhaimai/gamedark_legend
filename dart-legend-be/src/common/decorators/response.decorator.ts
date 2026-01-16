import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CreatedResponse,
  DataResponse,
  FailedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  PaginatedResponse,
  UnauthorizedResponse,
} from '../dto/response.dto';

export function PostResponseExample<DataDto extends Type<unknown>>(
  data: DataDto,
) {
  return applyDecorators(
    ApiExtraModels(
      data,
      CreatedResponse,
      FailedResponse,
      UnauthorizedResponse,
      ForbiddenResponse,
      NotFoundResponse,
    ),
    ApiCreatedResponse({
      description: 'Created',
      schema: {
        allOf: [
          { $ref: getSchemaPath(CreatedResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(data) },
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad request',
      schema: {
        allOf: [{ $ref: getSchemaPath(FailedResponse) }],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        allOf: [{ $ref: getSchemaPath(UnauthorizedResponse) }],
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      schema: {
        allOf: [{ $ref: getSchemaPath(ForbiddenResponse) }],
      },
    }),
    ApiNotFoundResponse({
      description: 'Not found',
      schema: {
        allOf: [{ $ref: getSchemaPath(NotFoundResponse) }],
      },
    }),
  );
}

export function GetResponseExample<DataDto extends Type<unknown>>(
  data: DataDto,
) {
  return applyDecorators(
    ApiExtraModels(
      DataResponse,
      FailedResponse,
      UnauthorizedResponse,
      ForbiddenResponse,
      NotFoundResponse,
    ),
    ApiOkResponse({
      description: 'Success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(DataResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(data) },
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad request',
      schema: {
        allOf: [{ $ref: getSchemaPath(FailedResponse) }],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        allOf: [{ $ref: getSchemaPath(UnauthorizedResponse) }],
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      schema: {
        allOf: [{ $ref: getSchemaPath(ForbiddenResponse) }],
      },
    }),
    ApiNotFoundResponse({
      description: 'Not found',
      schema: {
        allOf: [{ $ref: getSchemaPath(NotFoundResponse) }],
      },
    }),
  );
}

export function DeleteResponseExample<DataDto extends Type<unknown>>(
  data: DataDto,
) {
  return applyDecorators(
    ApiExtraModels(
      DataResponse,
      FailedResponse,
      UnauthorizedResponse,
      ForbiddenResponse,
      NotFoundResponse,
    ),
    ApiOkResponse({
      description: 'Success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(DataResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(data) },
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad request',
      schema: {
        allOf: [{ $ref: getSchemaPath(FailedResponse) }],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        allOf: [{ $ref: getSchemaPath(UnauthorizedResponse) }],
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      schema: {
        allOf: [{ $ref: getSchemaPath(ForbiddenResponse) }],
      },
    }),
    ApiNotFoundResponse({
      description: 'Not found',
      schema: {
        allOf: [{ $ref: getSchemaPath(NotFoundResponse) }],
      },
    }),
  );
}
export function PaginatedResponseExample<DataDto extends Type<unknown>>(
  data: DataDto,
) {
  return applyDecorators(
    ApiExtraModels(
      PaginatedResponse,
      FailedResponse,
      UnauthorizedResponse,
      ForbiddenResponse,
      NotFoundResponse,
    ),
    ApiOkResponse({
      description: 'Success',
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginatedResponse) },
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(data) },
              },
            },
          },
        ],
      },
    }),
    ApiBadRequestResponse({
      description: 'Bad request',
      schema: {
        allOf: [{ $ref: getSchemaPath(FailedResponse) }],
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      schema: {
        allOf: [{ $ref: getSchemaPath(UnauthorizedResponse) }],
      },
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      schema: {
        allOf: [{ $ref: getSchemaPath(ForbiddenResponse) }],
      },
    }),
    ApiNotFoundResponse({
      description: 'Not found',
      schema: {
        allOf: [{ $ref: getSchemaPath(NotFoundResponse) }],
      },
    }),
  );
}
