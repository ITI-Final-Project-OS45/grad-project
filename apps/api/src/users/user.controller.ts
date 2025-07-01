import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guards';
import { ApiError, ApiResponse, UserDto, UserResponse } from '@repo/types';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';

@UseGuards(AuthGuard)
@Controller('users')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  async findOneUser(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    return this.userService.findOneUser(userId, req.userId);
  }

  @Patch(':id')
  async updateUser(
    @Param('id') userId: string,
    @Body() data: Partial<UserDto>,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    return this.userService.updateUser(userId, data, req.userId);
  }

  @Delete(':id')
  async deleteUser(
    @Param('id') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<null, ApiError>> {
    return this.userService.deleteUser(userId, req.userId);
  }
}
