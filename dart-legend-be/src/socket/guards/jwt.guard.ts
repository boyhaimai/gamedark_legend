import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    try {
      const accessToken = client.handshake.headers.authorization;

      const secret = this.configService.getOrThrow<string>('JWT_SECRET_KEY');
      const user = await this.jwtService.verify(accessToken, { secret });
      client['user'] = user;
      return true;
    } catch (err) {
      client.to(client.id).emit('error');
      throw new WsException(err);
    }
  }
}
