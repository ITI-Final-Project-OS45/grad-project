import { UserResponse } from './../../../../packages/types/src/responses/user.response';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { UserDocument, User } from '../schemas/user.schema';
import { WorkspaceDocument } from '../schemas/workspace.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { ApiError, ApiResponse, UserDto } from '@repo/types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOneUser(
    userId: string,
    requesterId: string,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    if (requesterId !== userId) {
      throw new ForbiddenException('You are not authorized to view this user');
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate<{ workspaces: WorkspaceDocument[] }>('workspaces')
      .lean<UserResponse>()
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      status: HttpStatus.OK,
      data: user,
      message: 'User retrieved successfully',
    };
  }

  async updateUser(
    userId: string,
    data: Partial<UserDto>,
    requesterId: string,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    if (requesterId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this user',
      );
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, { $set: data }, { new: true })
      .select('-password')
      .lean<UserResponse>()
      .exec();
    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      status: HttpStatus.OK,
      data: updatedUser,
      message: 'User updated successfully',
    };
  }

  async deleteUser(
    userId: string,
    requesterId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    if (requesterId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this user',
      );
    }
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const deletedUser = await this.userModel.findByIdAndDelete(userId).exec();
    if (!deletedUser) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      status: HttpStatus.OK,
      data: null,
      message: 'User deleted successfully',
    };
  }
}
