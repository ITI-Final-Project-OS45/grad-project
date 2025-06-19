import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { Model, isValidObjectId } from 'mongoose';
import { ApiError, ApiResponse, WorkspaceDto } from '@repo/types';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}
  async createWorkspace(
    workspaceData: WorkspaceDto,
    createdBy: string,
  ): Promise<ApiResponse<Workspace, ApiError>> {
    try {
      const newWorkspace = await this.workspaceModel.create({
        ...workspaceData,
        members: [
          {
            userId: createdBy,
            role: 'manager', // Assuming the creator is the manager
            joinedAt: new Date(),
          },
        ],
        createdBy,
      });

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'Workspace created successfully',
        data: newWorkspace,
      };
    } catch (err) {
      console.log(`There's error while creating new workspace: ${String(err)}`);
      throw new BadRequestException('failed to create this workspace');
    }
  }
  async getOneWorkspace(
    workspaceId: string,
  ): Promise<ApiResponse<Workspace, ApiError>> {
    if (!isValidObjectId(workspaceId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const workspace = await this.workspaceModel.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('workspace not found');
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Workspace found successfully',
      data: workspace,
    };
  }

  async getAllWorkspacesForUser(
    userId: string,
  ): Promise<ApiResponse<Workspace[], ApiError>> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    //TODO: check on the memebers
    const allWorkspaces = await this.workspaceModel.find({
      'members.userId': userId,
    });
    if (!allWorkspaces) {
      throw new NotFoundException("the user doesn't has workspaces");
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Workspaces found successfully',
      data: allWorkspaces,
    };
  }

  async updateWorkspace(
    workspaceId: string,
    data: Partial<WorkspaceDto>,
  ): Promise<ApiResponse<Workspace, ApiError>> {
    if (!isValidObjectId(workspaceId)) {
      throw new BadRequestException('Invalid workspace ID');
    }
    const isWorkspaceExist = await this.workspaceModel
      .findById(workspaceId)
      .exec();

    if (!isWorkspaceExist) {
      throw new NotFoundException('workspace not found');
    }

    if (isWorkspaceExist.createdBy !== data.createdBy) {
      throw new UnauthorizedException(
        'you are unauthorized to UPDATE this workspace',
      );
    }

    const updatedWorkspace = await this.workspaceModel
      .findByIdAndUpdate(workspaceId, { $set: data }, { new: true })
      .exec();

    if (!updatedWorkspace) {
      throw new NotFoundException('User not found');
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Workspace updated successfully',
      data: updatedWorkspace,
    };
  }

  async deleteWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    if (!isValidObjectId(workspaceId)) {
      throw new BadRequestException('Invalid workspace ID');
    }
    const isWorkspaceExist = await this.workspaceModel
      .findById(workspaceId)
      .exec();

    if (!isWorkspaceExist) {
      throw new NotFoundException('workspace not found');
    }

    if (isWorkspaceExist.createdBy !== userId) {
      throw new UnauthorizedException(
        'you are unauthorized to DELETE this workspace',
      );
    }

    const deletedWorkspace = await this.workspaceModel
      .findByIdAndDelete(workspaceId)
      .exec();

    if (!deletedWorkspace) {
      throw new NotFoundException('User not found');
    }
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Workspace deleted successfully',
      data: null,
    };
  }
}
