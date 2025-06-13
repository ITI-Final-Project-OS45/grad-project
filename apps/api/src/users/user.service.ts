import { UserResponse } from './../../../../packages/types/src/responses/user.response';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
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

  async findAllUsers(): Promise<ApiResponse<UserResponse[], ApiError>> {
    const users = await this.userModel
      .find()
      .select('-password')
      .populate<{ workspaces: WorkspaceDocument[] }>('workspaces')
      .exec();

    const data: UserResponse[] = users.map((u) => {
      return {
        id: String(u._id),
        username: u.username,
        displayName: u.displayName,
        email: u.email,
        workspaces: u.workspaces.map((w) => ({
          id: String(w._id),
          name: w.name,
          description: w.description,
          createdBy: w.createdBy.toString(),
          createdAt: w.createdAt.toISOString(),
          updatedAt: w.updatedAt.toISOString(),
        })),
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      };
    });

    return {
      success: true,
      status: HttpStatus.OK,
      data,
      message: 'Users retrieved successfully',
    };
  }

  async findOneUser(
    userId: string,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel
      .findById(userId)
      .select('-password')
      .populate<{ workspaces: WorkspaceDocument[] }>('workspaces')
      .exec();
    console.log(`User found: ${user ? user._id : 'not found'}`);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const data: UserResponse = {
      id: String(user._id),
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      workspaces: user.workspaces.map((w) => ({
        id: String(w._id),
        name: w.name,
        description: w.description,
        createdBy: w.createdBy.toString(),
        createdAt: w.createdAt.toISOString(),
        updatedAt: w.updatedAt.toISOString(),
      })),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return {
      success: true,
      status: HttpStatus.OK,
      data,
      message: 'User retrieved successfully',
    };
  }

  async updateUser(
    userId: string,
    data: Partial<UserDto>,
  ): Promise<ApiResponse<UserResponse, ApiError>> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const u = await this.userModel
      .findByIdAndUpdate(userId, { $set: data }, { new: true })
      .exec();
    if (!u) {
      throw new NotFoundException('User not found');
    }
    const updated: UserResponse = {
      id: String(u._id),
      username: u.username,
      displayName: u.displayName,
      email: u.email,
      workspaces: [],
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    };
    return {
      success: true,
      status: HttpStatus.OK,
      data: updated,
      message: 'User updated successfully',
    };
  }

  async deleteUser(userId: string): Promise<ApiResponse<null, ApiError>> {
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
