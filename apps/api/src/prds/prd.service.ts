import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prd, PrdDocument } from '../schemas/prd.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ApiError,
  ApiResponse,
  CreatePrdDto,
  UserRole,
  VersionDto,
} from '@repo/types';
import { WorkspaceNotFoundException } from '../exceptions/domain.exceptions';

@Injectable()
export class PrdService {
  constructor(
    @InjectModel(Prd.name)
    private readonly prdModel: Model<PrdDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createPrdDto: CreatePrdDto, userId: string) {
    // Validate workspace exists
    const workspace = await this.workspaceModel
      .findById(createPrdDto.workspaceId)
      .exec();
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }
    // Validate user is a manager in the workspace
    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new Error('Only managers can create PRDs');
    }
    // Check if a previous PRD exists for this workspace
    const lastPrd = await this.prdModel
      .findOne({ workspaceId: createPrdDto.workspaceId })
      .sort({ createdAt: -1 })
      .exec();
    let versions: {
      versionNo: number;
      title: string;
      content: string;
      createdBy: Types.ObjectId;
    }[] = [];
    if (lastPrd) {
      // Add the previous PRD's data to versions, incrementing versionNo
      const prevVersionNo = (lastPrd.versions?.length || 0) + 1;
      versions = [
        ...lastPrd.versions,
        {
          versionNo: prevVersionNo,
          title: lastPrd.title,
          content: lastPrd.content,
          createdBy: lastPrd.createdBy,
        },
      ];
    }
    // Create new PRD with new title/content, and previous versions
    const prd = new this.prdModel({
      ...createPrdDto,
      createdBy: userId,
      versions,
    });
    return await prd.save();
  }

  async findByWorkspace(workspaceId: string) {
    return await this.prdModel.find({ workspaceId }).exec();
  }

  async findById(id: string) {
    return await this.prdModel.findById(id).exec();
  }

  async update(id: string, updatePrdDto: any, userId: string) {
    const prd = await this.prdModel.findById(id).exec();
    if (!prd) throw new Error('PRD not found');
    // Validate workspace exists
    const workspace = await this.workspaceModel
      .findById(prd.workspaceId)
      .exec();
    if (!workspace) throw new Error('Workspace not found');
    // Validate user is a manager in the workspace
    const member = workspace.members.find(
      (m: any) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new Error('Only managers can update PRDs');
    }
    return await this.prdModel
      .findByIdAndUpdate(id, { ...updatePrdDto }, { new: true })
      .exec();
  }

  async addVersion(id: string, versionDto: VersionDto, userId: string) {
    const prd = await this.prdModel.findById(id).exec();
    if (!prd) throw new Error('PRD not found');
    // Validate workspace exists
    const workspace = await this.workspaceModel
      .findById(prd.workspaceId)
      .exec();
    if (!workspace) throw new Error('Workspace not found');
    // Validate user is a manager in the workspace
    const member = workspace.members.find(
      (m: any) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new Error('Only managers can add PRD versions');
    }
    const versionNo = (prd.versions?.length || 0) + 1;
    const newVersion = {
      versionNo,
      title: versionDto.title,
      content: versionDto.content,
      createdBy: userId,
    };
    prd.versions.push(newVersion);
    return await prd.save();
  }
}
