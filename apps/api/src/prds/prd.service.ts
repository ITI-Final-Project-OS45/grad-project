import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prd, PrdDocument } from '../schemas/prd.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { CreatePrdDto, UserRole } from '@repo/types';
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
    // Check if a PRD already exists for this workspace
    const prd = await this.prdModel.findOne({
      workspaceId: createPrdDto.workspaceId,
    });
    if (prd) {
      // Add the current state to versions
      const prevVersionNo = (prd.versions?.length || 0) + 1;
      prd.versions.push({
        versionNo: prevVersionNo,
        title: prd.title,
        content: prd.content,
        createdBy: prd.createdBy,
      });
      prd.title = createPrdDto.title;
      prd.content = createPrdDto.content;
      prd.createdBy = new Types.ObjectId(userId);
      return await prd.save();
    } else {
      // Create new PRD if none exists
      const newPrd = new this.prdModel({
        ...createPrdDto,
        createdBy: userId,
        versions: [],
      });
      return await newPrd.save();
    }
  }

  async findByWorkspace(workspaceId: string) {
    return await this.prdModel.find({ workspaceId }).exec();
  }

  async updateByWorkspace(
    workspaceId: string,
    updatePrdDto: { title: string; content: string },
    userId: string,
  ) {
    const prd = await this.prdModel.findOne({ workspaceId }).exec();
    if (!prd) throw new Error('PRD not found');
    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) throw new Error('Workspace not found');
    const member = workspace.members.find(
      (m: any) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new Error('Only managers can update PRDs');
    }
    prd.title = updatePrdDto.title;
    prd.content = updatePrdDto.content;
    return await prd.save();
  }
  async deleteByWorkspace(workspaceId: string, userId: string) {
    const prd = await this.prdModel
      .findOne({ workspaceId })
      .sort({ createdAt: -1 })
      .exec();
    if (!prd) throw new Error('PRD not found');
    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) throw new Error('Workspace not found');
    const member = workspace.members.find(
      (m: any) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new Error('Only managers can delete PRDs');
    }
    await this.prdModel.deleteOne({ _id: prd._id });
    return { success: true };
  }
}
