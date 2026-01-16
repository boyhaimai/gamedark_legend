import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger('HTTP');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const body = request?.body;
    const params = request?.params;
    const query = request?.query;
    const { method, url } = request;
    const userAgent = request.get('user-agent') || '';
    const data = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: null,
    };

    switch (exception.constructor) {
      case BadRequestException:
      case ConflictException:
      case NotFoundException:
      default:
        const { message } = exception.getResponse() as {
          message: string[];
          error: string;
        };
        data.message = message;
        break;
    }

    this.logger.error(
      `${method} ${url} - ${userAgent} ${JSON.stringify(body)} ${JSON.stringify(params)} ${JSON.stringify(query)} ${JSON.stringify(data)}`,
    );

    response.status(status).json(data);
  }
}
