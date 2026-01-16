import { IsString, IsOptional, IsArray } from 'class-validator';

export class DisconnectClientDto {
  @IsString()
  socketId: string;
}

export class DisconnectUserDto {
  @IsString()
  userId: string;
}

export class ConnectedClientResponseDto {
  id: string;
  userId?: string;
  rooms: string[];
  connectedAt?: Date;
}

export class ConnectedClientsResponseDto {
  clients: ConnectedClientResponseDto[];
  totalCount: number;
}

export class DisconnectResponseDto {
  success: boolean;
  message: string;
  disconnectedCount?: number;
}
