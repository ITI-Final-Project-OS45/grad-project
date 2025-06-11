import {
  Injectable,
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace, WorkspaceDocument } from './workspace.schema';
import { Model, isValidObjectId } from 'mongoose';
import { WorkspaceDto } from './dto/workspace-dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}
  async createWorkspace(workspaceData: WorkspaceDto): Promise<Workspace> {
    try {
      const newWorkspace = await this.workspaceModel.create(workspaceData);
      console.log('newwworkspace-->', newWorkspace);
      return newWorkspace;
    } catch (err) {
      console.log(`There's error while creating new workspace: ${err}`);
      throw new BadRequestException('faild to create this workspace');
    }
  }
  async getOneWorkspace(workspaceId: string): Promise<Workspace> {
    if (!isValidObjectId(workspaceId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const workspace = await this.workspaceModel.findById(workspaceId);

    if (!workspace) {
      throw new NotFoundException('workspace not found');
    }
    return workspace;
  }

  async getAllWorkspacesForUser(userId: string): Promise<Workspace[]> {
    if (!isValidObjectId(userId)) {
      throw new BadRequestException('Invalid user ID');
    }
    const allWorkspaces = await this.workspaceModel.find({ createdBy: userId });
    if (!allWorkspaces) {
      throw new NotFoundException("the user doesn't has workspaces");
    }
    return allWorkspaces;
  }

  async updateWorkspace(
    worksapceId: string,
    data: Partial<WorkspaceDto>,
  ): Promise<Partial<Workspace>> {
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
    return updatedWorkspace;
  }

  async deleteWorkspace(
    workspaceId: string,
    data: Partial<WorkspaceDto>,
  ): Promise<string> {
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
        'you are unauthorized to DELETE this workspace',
      );
    }

    const deletedWorkspace = await this.workspaceModel
      .findByIdAndDelete(workspaceId)
      .exec();

    if (!deletedWorkspace) {
      throw new NotFoundException('User not found');
    }
    return `The ${deletedWorkspace.name} deleted successfully`;
  }
}
