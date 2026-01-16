import { Observable } from 'rxjs';
import {
  ExecutionContext,
  Injectable,
  SetMetadata,
  applyDecorators,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt.guard';

export const IS_PUBLIC_KEY = 'isPublic';

const PublicAuthMiddleware = SetMetadata(IS_PUBLIC_KEY, true);

export const Public = () => applyDecorators(PublicAuthMiddleware);
@Injectable()
export class AuthGuard extends JwtAuthGuard {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<any> {
    const isPublic = this.reflector.get<boolean>(
      IS_PUBLIC_KEY,
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
