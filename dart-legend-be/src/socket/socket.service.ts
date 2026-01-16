import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import {
  ConnectedClientResponseDto,
  ConnectedClientsResponseDto,
  DisconnectResponseDto,
} from './dto/socket-management.dto';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  getAllConnectedClients(): ConnectedClientsResponseDto {
    const clients = this.socketGateway.getAllConnectedClientsDetailed();
    return {
      clients,
      totalCount: clients.length,
    };
  }

  getConnectedClientsCount(): number {
    return this.socketGateway.getConnectedClientsCount();
  }

  disconnectAllClients(): DisconnectResponseDto {
    const disconnectedCount = this.socketGateway.disconnectAllClients();
    return {
      success: true,
      message: `Successfully disconnected all clients`,
      disconnectedCount,
    };
  }

  disconnectClientBySocketId(socketId: string): DisconnectResponseDto {
    const success = this.socketGateway.disconnectClientBySocketId(socketId);
    return {
      success,
      message: success
        ? `Successfully disconnected client with socket ID: ${socketId}`
        : `Client with socket ID ${socketId} not found`,
      disconnectedCount: success ? 1 : 0,
    };
  }

  disconnectClientsByUserId(userId: string): DisconnectResponseDto {
    const disconnectedCount =
      this.socketGateway.disconnectClientsByUserId(userId);
    return {
      success: disconnectedCount > 0,
      message:
        disconnectedCount > 0
          ? `Successfully disconnected ${disconnectedCount} client(s) for user ${userId}`
          : `No clients found for user ID: ${userId}`,
      disconnectedCount,
    };
  }

  getClientsByUserId(userId: string): ConnectedClientResponseDto[] {
    return this.socketGateway.getClientsByUserId(userId);
  }
}
