import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CancelGameDto, UpdateGameDto } from './dto/update-game.dto';
import { JwtPayload } from 'src/auth/jwt/type/jwt-payload.type';

@ApiBearerAuth()
@ApiTags('Game')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @ApiOperation({
    description: 'User start combat',
    summary: 'User start combat',
  })
  @Post('match')
  create(@Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.gameService.create({ _id });
  }

  @ApiOperation({
    description: 'User cancel game',
    summary: 'User cancel game',
  })
  @Post('cancel')
  userPk(@Body() body: CancelGameDto, @Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.gameService.userCancelGame({
      game_id: body.game_id,
      _id,
    });
  }

  @Get()
  getGameUser(@Req() req: { user: JwtPayload }) {
    const _id = req?.user?._id;
    return this.gameService.getGameUser({ _id });
  }
}
