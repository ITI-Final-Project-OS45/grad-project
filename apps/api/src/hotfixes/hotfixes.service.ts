import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotfix, HotfixDocument } from '../schemas/hotfix.schema';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import {
  ApiError,
  ApiResponse,
  CreateHotfixDto,
  UpdateHotfixDto,
  UserRole,
} from '@repo/types';
import {
  ReleaseNotFoundException,
  HotfixNotFoundException,
  UnauthorizedActionException,
} from '../exceptions/domain.exceptions';

@Injectable()
export class HotfixesService {
  constructor(
    @InjectModel(Hotfix.name)
    private readonly hotfixModel: Model<HotfixDocument>,
    @InjectModel(Release.name)
    private readonly releaseModel: Model<ReleaseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async create(
    createHotfixDto: CreateHotfixDto,
    userId: string,
    releaseId: string,
  ): Promise<ApiResponse<Hotfix, ApiError>> {
    // Validate that the release exists
    const releaseExists = await this.releaseModel.findById(releaseId).exec();
    if (!releaseExists) {
      throw new ReleaseNotFoundException();
    }

    // Create the hotfix
    const newHotfix = new this.hotfixModel({
      ...createHotfixDto,
      releaseId: releaseId,
      fixedBy: userId,
      fixedDate: new Date(),
    });
    const savedHotfix = await newHotfix.save();

    // Add hotfix ID to the release's hotfixes array
    await this.releaseModel.findByIdAndUpdate(
      releaseId,
      { $push: { hotfixes: savedHotfix._id } },
      { new: true },
    );

    const populatedHotfix = await this.hotfixModel
      .findById(savedHotfix._id)
      .populate('fixedBy', 'username displayName email')
      .populate('releaseId', 'versionTag description')
      .lean<Hotfix>()
      .exec();

    if (!populatedHotfix) {
      throw new HotfixNotFoundException();
    }

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'Hotfix created successfully',
      data: populatedHotfix,
    };
  }

  async findByRelease(
    releaseId: string,
  ): Promise<ApiResponse<Hotfix[], ApiError>> {
    const releaseExists = await this.releaseModel.findById(releaseId).exec();
    if (!releaseExists) {
      throw new ReleaseNotFoundException();
    }

    const hotfixes = await this.hotfixModel
      .find({ releaseId })
      .populate('fixedBy', 'username displayName email')
      .populate('releaseId', 'versionTag description')
      .lean<Hotfix[]>()
      .exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message:
        hotfixes.length > 0
          ? 'Hotfixes retrieved successfully'
          : 'No hotfixes found for this release',
      data: hotfixes,
    };
  }

  async findById(hotfixId: string): Promise<ApiResponse<Hotfix, ApiError>> {
    const hotfix = await this.hotfixModel
      .findById(hotfixId)
      .populate('fixedBy', 'username displayName email')
      .populate('releaseId', 'versionTag description')
      .lean<Hotfix>()
      .exec();

    if (!hotfix) {
      throw new HotfixNotFoundException();
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Hotfix retrieved successfully',
      data: hotfix,
    };
  }

  async update(
    hotfixId: string,
    updateHotfixDto: UpdateHotfixDto,
    userId: string,
  ): Promise<ApiResponse<Hotfix, ApiError>> {
    // First get the hotfix to get releaseId
    const hotfix = await this.hotfixModel.findById(hotfixId).exec();
    if (!hotfix) {
      throw new HotfixNotFoundException();
    }

    // Get the release to access workspaceId
    const release = await this.releaseModel.findById(hotfix.releaseId).exec();
    if (!release) {
      throw new ReleaseNotFoundException();
    }

    // Check workspace permissions - only QA or Manager can update hotfixes
    await this.validateWorkspacePermission(
      release.workspaceId.toString(),
      userId,
    );

    const updatedHotfix = await this.hotfixModel
      .findByIdAndUpdate(hotfixId, updateHotfixDto, {
        new: true,
        runValidators: true,
      })
      .populate('fixedBy', 'username displayName email')
      .populate('releaseId', 'versionTag description')
      .lean<Hotfix>()
      .exec();
    if (!updatedHotfix) {
      throw new HotfixNotFoundException();
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Hotfix updated successfully',
      data: updatedHotfix,
    };
  }

  async delete(
    hotfixId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    // First get the hotfix to get releaseId
    const hotfix = await this.hotfixModel.findById(hotfixId).exec();
    if (!hotfix) {
      throw new HotfixNotFoundException();
    }

    // Get the release to access workspaceId
    const release = await this.releaseModel.findById(hotfix.releaseId).exec();
    if (!release) {
      throw new ReleaseNotFoundException();
    }

    // Check workspace permissions - only QA or Manager can delete hotfixes
    await this.validateWorkspacePermission(
      release.workspaceId.toString(),
      userId,
    );

    // Remove hotfix ID from release's hotfixes array
    await this.releaseModel.findByIdAndUpdate(
      hotfix.releaseId,
      { $pull: { hotfixes: hotfixId } },
      { new: true },
    );

    // Delete the hotfix
    await this.hotfixModel.findByIdAndDelete(hotfixId).exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Hotfix deleted successfully',
      data: null,
    };
  }

  async findAll(): Promise<ApiResponse<Hotfix[], ApiError>> {
    const hotfixes = await this.hotfixModel
      .find()
      .populate('fixedBy', 'username displayName email')
      .populate('releaseId', 'versionTag description')
      .lean<Hotfix[]>()
      .exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message:
        hotfixes.length > 0
          ? 'Hotfixes retrieved successfully'
          : 'No hotfixes found',
      data: hotfixes,
    };
  }
  // Validates if the user has QA or Manager role in the workspace
  private async validateWorkspacePermission(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      throw new ReleaseNotFoundException();
    }

    const userMember = workspace.members.find(
      (member) => member.userId.toString() === userId,
    );

    if (!userMember) {
      throw new UnauthorizedActionException('access this workspace');
    }

    // Only QA and Manager roles can update/delete hotfixes
    if (
      userMember.role !== UserRole.QA &&
      userMember.role !== UserRole.Manager
    ) {
      throw new UnauthorizedActionException(
        'perform this action. Only QA and Manager roles are allowed',
      );
    }
  }
}
