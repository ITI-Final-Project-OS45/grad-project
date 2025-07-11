import {
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiResponse, UserRole, JwtPayload } from '@repo/types';
import { isValidObjectId, Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { WorkspaceMember } from '../schemas/workspace-member.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { ApiError } from '@repo/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async addMember(
    workspaceId: string,
    membernameOrEmail: string,
    role: UserRole,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    this.isValidId(workspaceId);
    this.isValidUserRole(role);

    // Check if user exists
    const user = await this.getUser(membernameOrEmail);

    // Check if user is already a member
    const workspace = await this.getWorkspace(workspaceId);
    const isMember = workspace.members.some(
      (m) => m.userId.toString() === (user._id as Types.ObjectId).toString(),
    );
    if (isMember) {
      throw new BadRequestException(
        'User is already a member of this workspace',
      );
    }

    // Add member to workspace
    const addNewMember = await this.workspaceModel
      .findByIdAndUpdate(
        workspaceId,
        {
          $push: {
            members: {
              userId: user._id,
              role,
              joinedAt: new Date(),
            },
          },
        },
        { new: true },
      )
      .exec();

    if (!addNewMember) {
      throw new InternalServerErrorException('Failed to add new member');
    }

    // Add workspaceId to user's workspaces array if not already present
    await this.userModel
      .updateOne(
        { _id: user._id, workspaces: { $ne: workspaceId } },
        { $push: { workspaces: workspaceId } },
      )
      .exec();

    return {
      success: true,
      status: HttpStatus.ACCEPTED,
      message: 'Member added successfully',
      data: {
        userId: user._id,
        role,
        joinedAt: new Date(),
      } as WorkspaceMember,
    };
  }

  async updateMember(
    workspaceId: string,
    membernameOrEmail: string,
    newRole: UserRole,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    this.isValidId(workspaceId);
    this.isValidUserRole(newRole);

    // No need to check manager/member here; handled by guard
    const user = await this.getUser(membernameOrEmail);

    const userId =
      user._id instanceof Types.ObjectId
        ? user._id
        : new Types.ObjectId(user._id as string);

    const updatedUser = await this.workspaceModel
      .findOneAndUpdate(
        { _id: workspaceId },
        {
          $set: {
            'members.$[elem].role': newRole,
          },
        },
        {
          arrayFilters: [{ 'elem.userId': userId }],
          new: true,
        },
      )
      .exec();

    if (!updatedUser) {
      throw new InternalServerErrorException('Failed to update the member');
    }

    return {
      success: true,
      status: HttpStatus.ACCEPTED,
      message: 'Member role updated successfully',
      data: {
        userId: user._id,
        role: newRole,
        joinedAt: new Date(),
      } as WorkspaceMember,
    };
  }

  async deleteMember(
    workspaceId: string,
    membernameOrEmail: string,
  ): Promise<ApiResponse<null, ApiError>> {
    this.isValidId(workspaceId);

    // No need to check manager/member here; handled by guard
    const user = await this.getUser(membernameOrEmail);

    const userId =
      user._id instanceof Types.ObjectId
        ? user._id
        : new Types.ObjectId(user._id as string);

    // Remove member from workspace
    const deletedUser = await this.workspaceModel
      .updateOne(
        { _id: workspaceId },
        {
          $pull: {
            members: { userId: userId },
          },
        },
      )
      .exec();

    if (!deletedUser) {
      throw new InternalServerErrorException('Failed to Delete the member');
    }

    // Remove workspaceId from user's workspaces array
    await this.userModel
      .updateOne({ _id: user._id }, { $pull: { workspaces: workspaceId } })
      .exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'User deleted from the workspace successfully',
      data: null,
    };
  }

  async getAllWorkspaceMembers(
    workspaceId: string,
  ): Promise<ApiResponse<WorkspaceMember[], ApiError>> {
    this.isValidId(workspaceId);

    // No need to check member here; handled by guard
    const workspace = await this.workspaceModel
      .findById(workspaceId)
      .populate({
        path: 'members.userId',
        select: 'username displayName email',
      })
      .exec();

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Members found successfully',
      data: workspace.members as WorkspaceMember[],
    };
  }

  async getOneMemberByWorkspace(
    workspaceId: string,
    memberId: string,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    this.isValidId(workspaceId);

    const workspace = await this.getWorkspace(workspaceId);

    const member = workspace.members.find(
      (m) => m.userId.toString() === memberId,
    );

    if (!member) {
      throw new NotFoundException('Member not found in workspace');
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Member found successfully',
      data: member,
    };
  }

  private isValidUserRole(role: string): void {
    if (!Object.values(UserRole).includes(role as UserRole)) {
      throw new BadRequestException('Invalid role');
    }
  }

  private getMemberId(token: string): string {
    const memberId = token.split(' ')[1] || '';
    const payload = this.jwtService.verify<JwtPayload>(memberId);

    if (!payload.userId) {
      throw new UnauthorizedException('Invalid token');
    }

    return payload.userId;
  }

  private isValidId(id: string): void {
    if (!isValidObjectId(id)) {
      throw new NotFoundException('Invalid workspace ID');
    }
  }

  private async getUser(membernameOrEmail: string): Promise<UserDocument> {
    const user = await this.userModel
      .findOne({
        $or: [{ username: membernameOrEmail }, { email: membernameOrEmail }],
      })
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async getWorkspace(workspaceId: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }
    return workspace;
  }
}
