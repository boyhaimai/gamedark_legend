import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaginationQuery } from 'src/common/dto/pagination.dto';
import { PaginationParams } from 'src/common/dto/pagination.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { Request } from 'express';
import { Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { SearchUserDto } from './dto/search-user.dto';
import { JwtPayload } from 'src/auth/jwt/type/jwt-payload.type';
import { AdminUpdateDto } from './dto/admin-update.dto';
import { User, UserRole } from 'src/database/models/user.model';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  async getProfile(@Req() req: { user: JwtPayload }) {
    const { user } = req;
    const data = await this.userService.getUserProfile(user._id);
    const rank = await this.userService.getRankUser(user._id);

    return { ...data, ...rank };
  }

  @Post()
  async createUser(@Body() body: CreateUserDto) {
    return this.userService.createUser(body);
  }

  @Get()
  async getUserDetail(@Req() req: Request) {
    // @ts-ignore
    const { user } = req;

    const data = await this.userService.findById(user._id);
    const rank = await this.userService.getRankUser(user._id);

    return { ...data.user.toJSON(), ...rank };
  }

  @Get('all')
  async getAllUsers(@Pagination() pagination: PaginationParams) {
    return this.userService.getAllUsers(new PaginationQuery(pagination));
  }

  @Get('search')
  @UsePipes(new ValidationPipe({ transform: true }))
  async searchUsers(
    @Query() dto: SearchUserDto,
    @Pagination() pagination: PaginationParams,
  ) {
    const key = dto.key || '';

    return this.userService.searchUsers(key, new PaginationQuery(pagination));
  }

  @Get('referral')
  async getReferral(@Req() req: { user: JwtPayload }) {
    return this.userService.getReferral(req.user._id);
  }

  @Roles([UserRole.ADMIN])
  @Post('set-bot')
  async setBot(@Body() body: AdminUpdateDto) {
    return this.userService.adminSetBot(body._id, body.is_bot);
  }

  @Roles([UserRole.ADMIN])
  @Get('all-bot')
  async getAllBot() {
    return this.userService.getAllBot();
  }
}
