// import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
// import { RoomService } from './room.service';
// import { CreateRoomDto } from './dto/create-room.dto';
// import { SendInvitationDto } from './dto/send-invitation.dto';
// import { RespondInvitationDto } from './dto/respond-invitation.dto';
// import { ContinueGameDto } from './dto/continue-game.dto';
// import { SendMessageDto } from './dto/send-message.dto';
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

// @ApiBearerAuth()
// @ApiTags('Room')
// @Controller('room')
// export class RoomController {
//   constructor(private readonly roomService: RoomService) {}

//   @Post()
//   async createRoom(@Request() req, @Body() createRoomDto: CreateRoomDto) {
//     return this.roomService.createRoom(req.user._id, createRoomDto);
//   }

//   @Post(':roomId/invite')
//   async sendInvitation(
//     @Request() req,
//     @Param('roomId') roomId: string,
//     @Body() sendInvitationDto: SendInvitationDto,
//   ) {
//     return this.roomService.sendInvitation(
//       req.user._id,
//       roomId,
//       sendInvitationDto,
//     );
//   }

//   @Post('invitation/respond')
//   async respondToInvitation(
//     @Request() req,
//     @Body() respondInvitationDto: RespondInvitationDto,
//   ) {
//     return this.roomService.respondToInvitation(
//       req.user._id,
//       respondInvitationDto,
//     );
//   }

//   // @Post('continue')
//   // async continueGame(@Request() req, @Body() continueGameDto: ContinueGameDto) {
//   //   return this.roomService.continueGame(req.user._id, continueGameDto);
//   // }

//   @Get('my-rooms')
//   async getMyRooms(@Request() req) {
//     return this.roomService.getMyRooms(req.user._id);
//   }

//   @Get(':roomId')
//   async getRoomDetails(@Request() req, @Param('roomId') roomId: string) {
//     return this.roomService.getRoomDetails(roomId, req.user._id);
//   }

//   @Get(':roomId/games')
//   async getRoomGames(@Request() req, @Param('roomId') roomId: string) {
//     return this.roomService.getRoomGames(roomId, req.user._id);
//   }

//   @Get('invitations/my')
//   async getMyInvitations(@Request() req) {
//     return this.roomService.getMyInvitations(req.user._id);
//   }

//   @Get(':roomId/messages')
//   async getMessages(@Request() req, @Param('roomId') roomId: string) {
//     const { limit, before } = req.query || {};
//     return this.roomService.getMessages(
//       req.user._id,
//       roomId,
//       limit ? parseInt(limit) : 30,
//       before,
//     );
//   }

//   @Post(':roomId/chat')
//   async sendMessage(
//     @Request() req,
//     @Param('roomId') roomId: string,
//     @Body() dto: SendMessageDto,
//   ) {
//     return this.roomService.sendMessage(req.user._id, roomId, dto.content);
//   }

//   @Post(':roomId/leave')
//   async leaveRoom(@Request() req, @Param('roomId') roomId: string) {
//     return this.roomService.leaveRoom(req.user._id, roomId);
//   }

//   @Get('clients/kjaka')
//   getConnectedClients() {
//     return {
//       clients: this.roomService.getConnectedClients(),
//     };
//   }
// }
