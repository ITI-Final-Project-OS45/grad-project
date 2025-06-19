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
import { User, UserDocument } from 'src/schemas/user.schema';
import { WorkspaceMember } from 'src/schemas/workspace-member.schema';
import { Workspace, WorkspaceDocument } from 'src/schemas/workspace.schema';
import { ApiError } from '@repo/types';
import { JwtService } from '@nestjs/jwt';

enum OperationType {
  ADD = 'add',
  UPDATE = 'update',
  DELETE = 'delete',
  GET = 'get',
}

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
    token: string,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    try {
      // check it's a valid ID or not
      this.isValidId(workspaceId);

      // check it's a valid role or not
      this.isValidUserRole(role);

      const managerId = this.getMemberId(token);

      const user = await this.getUser(membernameOrEmail);

      const workspace = await this.getWorkspace(workspaceId);

      this.isMangerAndIsMember(workspace, user, managerId, OperationType.ADD);

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
    } catch (error) {
      console.error('Error in create method:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async updateMember(
    workspaceId: string,
    membernameOrEmail: string,
    newRole: UserRole,
    token: string,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    try {
      // check it's a valid ID or not
      this.isValidId(workspaceId);

      // check it's a valid role or not
      this.isValidUserRole(newRole);

      const managerId = this.getMemberId(token);

      const user = await this.getUser(membernameOrEmail);

      const workspace = await this.getWorkspace(workspaceId);

      this.isMangerAndIsMember(
        workspace,
        user,
        managerId,
        OperationType.UPDATE,
      );

      const userId =
        user._id instanceof Types.ObjectId
          ? user._id
          : new Types.ObjectId(user._id as string);

      // Use arrayFilters instead of positional operator for more reliability
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
    } catch (error) {
      console.error('Error in create method:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async deleteMember(
    workspaceId: string,
    membernameOrEmail: string,
    token: string,
  ): Promise<ApiResponse<null, ApiError>> {
    try {
      // check it's a valid ID or not
      this.isValidId(workspaceId);
      const managerId = this.getMemberId(token);

      const user = await this.getUser(membernameOrEmail);

      const workspace = await this.getWorkspace(workspaceId);

      this.isMangerAndIsMember(
        workspace,
        user,
        managerId,
        OperationType.DELETE,
      );

      const userId =
        user._id instanceof Types.ObjectId
          ? user._id
          : new Types.ObjectId(user._id as string);

      // Use arrayFilters instead of positional operator for more reliability
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

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'User deleted from the workspace successfully',
        data: null,
      };
    } catch (error) {
      console.error('Error in create method:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getAllWorkspaceMembers(
    workspaceId: string,
    token: string,
  ): Promise<ApiResponse<WorkspaceMember[], ApiError>> {
    try {
      // check it's a valid ID or not
      this.isValidId(workspaceId);
      const memberId = this.getMemberId(token);

      const workspace = await this.getWorkspace(workspaceId);

      const member = this.isMember(workspace, memberId);

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Members found  successfully',
        data: workspace.members as WorkspaceMember[],
      };
    } catch (error) {
      console.error('Error in create method:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async getOneWorkspaceMember(
    workspaceId: string,
    membernameOrEmail: string,
    token: string,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    try {
      // check it's a valid ID or not
      this.isValidId(workspaceId);
      const memberId = this.getMemberId(token);
      const user = await this.getUser(membernameOrEmail);
      const workspace = await this.getWorkspace(workspaceId);

      const requestSenderIsMember = this.isMember(workspace, memberId);
      const sentUserIsMember = this.isMember(
        workspace,
        (user._id as Types.ObjectId).toString(),
      );

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Member found successfully',
        data: sentUserIsMember,
      };
    } catch (error) {
      console.error('Error in create method:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  // private get

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

  private isMangerAndIsMember(
    workspace: WorkspaceDocument,
    user: UserDocument,
    managerId: string,
    operationType: OperationType,
  ): void {
    let isManager: boolean = false;
    let isMember: boolean = false;

    for (const member of workspace.members) {
      if (isManager && isMember) {
        break;
      }
      if (
        !isManager &&
        member.userId.toString() === managerId &&
        member.role === UserRole.Manager
      ) {
        isManager = true;
      }
      if (
        !isMember &&
        member.userId.toString() === (user._id as Types.ObjectId).toString()
      ) {
        isMember = true;
      }
    }

    if (!isManager) {
      throw new UnauthorizedException('You are not authorized to add members');
    }

    if (isMember && operationType === OperationType.ADD) {
      throw new InternalServerErrorException('User already exists');
    } else if (
      !isMember &&
      (operationType === OperationType.UPDATE ||
        operationType === OperationType.DELETE)
    ) {
      throw new NotFoundException("User isn't a member");
    }
  }

  private isMember(workspace: Workspace, memberId: string): WorkspaceMember {
    let isMember: WorkspaceMember | undefined;
    for (const member of workspace.members) {
      if (member.userId.toString() === memberId) {
        isMember = member;
        break;
      }
    }
    if (isMember) {
      return isMember;
    }
    throw new UnauthorizedException('You are not a member');
  }
}
