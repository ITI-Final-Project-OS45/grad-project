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
import {
  ApiError,
  ApiResponse,
  WorkspaceDto,
  WorkspaceResponse,
} from '@repo/types';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}
  async createWorkspace(
    workspaceData: WorkspaceDto,
    createdBy: string,
  ): Promise<ApiResponse<WorkspaceResponse, ApiError>> {
    try {
      const newWorkspace = await this.workspaceModel.create({
        ...workspaceData,
        createdBy,
      });
      const transformedWorkspace: WorkspaceResponse = {
        id: String(newWorkspace._id),
        name: newWorkspace.name,
        description: newWorkspace.description,
        createdBy: newWorkspace.createdBy.toString(),
        releases: newWorkspace.releases?.map((release) => String(release)),
        createdAt: newWorkspace.createdAt.toISOString(),
        updatedAt: newWorkspace.updatedAt.toISOString(),
      };
      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'Workspace created successfully',
        data: transformedWorkspace,
      };
    } catch (err) {
      console.log(`There's error while creating new workspace: ${String(err)}`);
      throw new BadRequestException('failed to create this workspace');
    }
  }
  async getOneWorkspace(
    workspaceId: string,
  ): Promise<ApiResponse<WorkspaceResponse, ApiError>> {
    if (!isValidObjectId(workspaceId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const workspace = await this.workspaceModel.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('workspace not found');
    }
    const transformedWorkspace: WorkspaceResponse = {
      id: String(workspace._id),
      name: workspace.name,
      description: workspace.description,
      createdBy: workspace.createdBy.toString(),
      releases: workspace.releases?.map((release) => String(release)),
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    };
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Workspace found successfully',
      data: transformedWorkspace,
    };
  }

  async getAllWorkspacesForUser(
    userId: string,
  ): Promise<ApiResponse<WorkspaceResponse[], ApiError>> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const allWorkspaces = await this.workspaceModel.find({ createdBy: userId });
    if (!allWorkspaces) {
      throw new NotFoundException("the user doesn't has workspaces");
    }
    const transformedWorkspaces: WorkspaceResponse[] = allWorkspaces.map(
      (workspace) => ({
        id: String(workspace._id),
        name: workspace.name,
        description: workspace.description,
        createdBy: workspace.createdBy.toString(),
        releases: workspace.releases?.map((release) => String(release)),
        createdAt: workspace.createdAt.toISOString(),
        updatedAt: workspace.updatedAt.toISOString(),
      }),
    );
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Workspaces found successfully',
      data: transformedWorkspaces,
    };
  }

  async updateWorkspace(
    worksapceId: string,
    data: Partial<WorkspaceDto>,
  ): Promise<ApiResponse<WorkspaceResponse, ApiError>> {
    if (!isValidObjectId(worksapceId)) {
      throw new BadRequestException('Invalid workspace ID');
    }
    const isWorkspaceExist = await this.workspaceModel
      .findById(worksapceId)
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
      .findByIdAndUpdate(worksapceId, { $set: data }, { new: true })
      .exec();

    if (!updatedWorkspace) {
      throw new NotFoundException('User not found');
    }
    const transformedWorkspace: WorkspaceResponse = {
      id: String(updatedWorkspace._id),
      name: updatedWorkspace.name,
      description: updatedWorkspace.description,
      createdBy: updatedWorkspace.createdBy.toString(),
      releases: updatedWorkspace.releases?.map((release) => String(release)),
      createdAt: updatedWorkspace.createdAt.toISOString(),
      updatedAt: updatedWorkspace.updatedAt.toISOString(),
    };
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Workspace updated successfully',
      data: transformedWorkspace,
    };
  }

  async deleteWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<ApiResponse<string, ApiError>> {
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
      data: `Workspace with ID ${workspaceId} has been deleted`,
    };
  }
}
