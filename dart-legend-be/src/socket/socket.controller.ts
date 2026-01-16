import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { SocketService } from './socket.service';
import {
  DisconnectClientDto,
  DisconnectUserDto,
  ConnectedClientsResponseDto,
  DisconnectResponseDto,
  ConnectedClientResponseDto,
} from './dto/socket-management.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('socket')
export class SocketController {
  constructor(private readonly socketService: SocketService) {}

  @Get('clients')
  getAllConnectedClients(): ConnectedClientsResponseDto {
    return this.socketService.getAllConnectedClients();
  }

  @Get('clients/count')
  getConnectedClientsCount(): { count: number } {
    const count = this.socketService.getConnectedClientsCount();
    return { count };
  }

  @Get('clients/user/:userId')
  getClientsByUserId(
    @Param('userId') userId: string,
  ): ConnectedClientResponseDto[] {
    return this.socketService.getClientsByUserId(userId);
  }

  @Delete('clients/all')
  @HttpCode(HttpStatus.OK)
  disconnectAllClients(): DisconnectResponseDto {
    return this.socketService.disconnectAllClients();
  }

  @Delete('clients/socket')
  @HttpCode(HttpStatus.OK)
  disconnectClientBySocketId(
    @Body() disconnectClientDto: DisconnectClientDto,
  ): DisconnectResponseDto {
    return this.socketService.disconnectClientBySocketId(
      disconnectClientDto.socketId,
    );
  }

  @Delete('clients/user')
  @HttpCode(HttpStatus.OK)
  disconnectClientsByUserId(
    @Body() disconnectUserDto: DisconnectUserDto,
  ): DisconnectResponseDto {
    return this.socketService.disconnectClientsByUserId(
      disconnectUserDto.userId,
    );
  }

  // Alternative endpoints with path parameters
  @Delete('clients/socket/:socketId')
  @HttpCode(HttpStatus.OK)
  disconnectClientBySocketIdParam(
    @Param('socketId') socketId: string,
  ): DisconnectResponseDto {
    return this.socketService.disconnectClientBySocketId(socketId);
  }

  @Delete('clients/user/:userId')
  @HttpCode(HttpStatus.OK)
  disconnectClientsByUserIdParam(
    @Param('userId') userId: string,
  ): DisconnectResponseDto {
    return this.socketService.disconnectClientsByUserId(userId);
  }
}
