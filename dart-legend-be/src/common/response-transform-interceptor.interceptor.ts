import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  data: T & { message?: string };
}
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  private logger = new Logger('HTTP');

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        const message = data?.['message'];
        if (message) delete data?.['message'];

        return {
          message: message ?? 'success',
          data: data,
          code: context.switchToHttp().getResponse().statusCode,
        };
      }),
    );
  }
}
