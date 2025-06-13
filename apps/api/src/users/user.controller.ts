import {
  Controller,
  Get,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../guards/auth.guards';
import { ApiError, ApiResponse, UserDto, UserResponse } from '@repo/types';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAllUsers(): Promise<ApiResponse<UserResponse[], ApiError>> {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  findOneUser(
    @Param('id') userId: string,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    return this.userService.findOneUser(userId);
  }
  @Patch(':id')
  updateUser(
    @Param('id') userId: string,
    @Body() data: Partial<UserDto>,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    return this.userService.updateUser(userId, data);
  }

  @Delete(':id')
  deleteUser(
    @Param('id') userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    return this.userService.deleteUser(userId);
  }
}
