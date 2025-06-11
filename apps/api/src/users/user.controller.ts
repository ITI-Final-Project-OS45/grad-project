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
import { UserDto } from './dto/user.dto';

@UseGuards(AuthGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Get(':id')
  findOneUser(@Param('id') userId: string) {
    return this.userService.findOneUser(userId);
  }
  @Patch(':id')
  updateUser(@Param('id') userId: string, @Body() data: Partial<UserDto>) {
    return this.userService.updateUser(userId, data);
  }

  @Delete(':id')
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
