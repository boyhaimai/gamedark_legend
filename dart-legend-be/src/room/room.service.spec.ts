import { Test, TestingModule } from '@nestjs/testing';
import { RoomService } from './room.service';
import { getModelToken } from '@nestjs/mongoose';
import { SocketGateway } from 'src/socket/socket.gateway';

describe('RoomService', () => {
  let service: RoomService;

  const mockRoomModel = {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockInvitationModel = {
    create: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    updateMany: jest.fn(),
  };

  const mockUserModel = {
    findById: jest.fn(),
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockGameModel = {
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockTransactionModel = {
    create: jest.fn(),
  };

  const mockSocketGateway = {
    emitEventToRoom: jest.fn(),
    emitEventToUser: jest.fn(),
  };

  const mockConnection = {
    startSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: getModelToken('rooms'),
          useValue: mockRoomModel,
        },
        {
          provide: getModelToken('RoomInvitation'),
          useValue: mockInvitationModel,
        },
        {
          provide: getModelToken('users'),
          useValue: mockUserModel,
        },
        {
          provide: getModelToken('games'),
          useValue: mockGameModel,
        },
        {
          provide: getModelToken('transactions'),
          useValue: mockTransactionModel,
        },
        {
          provide: SocketGateway,
          useValue: mockSocketGateway,
        },
        {
          provide: 'DATABASE_CONNECTION',
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    it('should create a room successfully', async () => {
      const userId = 'user123';
      const createRoomDto = { isPrivate: false, maxPlayers: 2 };
      const mockUser = { _id: userId, username: 'testuser' };
      const mockRoom = { _id: 'room123', creator: userId, players: [userId] };

      mockUserModel.findById.mockResolvedValue(mockUser);
      mockRoomModel.create.mockResolvedValue(mockRoom);

      const result = await service.createRoom(userId, createRoomDto);

      expect(result).toEqual(mockRoom);
      expect(mockRoomModel.create).toHaveBeenCalledWith({
        creator: userId,
        players: [userId],
        isPrivate: false,
      });
    });
  });
});


