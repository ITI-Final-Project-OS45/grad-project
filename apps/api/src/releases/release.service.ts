import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import {
  ApiError,
  ApiResponse,
  CreateReleaseDto,
  QAStatus,
  UserRole,
} from '@repo/types';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import {
  WorkspaceNotFoundException,
  ReleaseNotFoundException,
  UserNotMemberException,
  InsufficientPermissionsException,
} from '../exceptions/domain.exceptions';

@Injectable()
export class ReleaseService {
  constructor(
    @InjectModel(Release.name)
    private readonly releaseModel: Model<ReleaseDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}
  async create(
    createReleaseDto: CreateReleaseDto,
    userId: string,
  ): Promise<ApiResponse<Release, ApiError>> {
    // Validate that workspace exists and user is a manager
    const workspace = await this.workspaceModel
      .findById(createReleaseDto.workspaceId)
      .exec();

    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    // Find the user's role in the workspace
    const userMember = workspace.members.find(
      (member) => member.userId.toString() === userId,
    );

    if (!userMember) {
      throw new UserNotMemberException();
    }

    const newRelease = new this.releaseModel({
      ...createReleaseDto,
      createdBy: userId,
    });
    const savedRelease = await newRelease.save();

    // Add release to workspace's releases array
    await this.workspaceModel.findByIdAndUpdate(
      createReleaseDto.workspaceId,
      { $push: { releases: savedRelease._id } },
      { new: true },
    );

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'Release created successfully',
      data: savedRelease,
    };
  }

  async findByWorkspace(
    workspaceId: string,
  ): Promise<ApiResponse<Release[], ApiError>> {
    const workspaceExists = await this.workspaceModel
      .findById(workspaceId)
      .exec();

    if (!workspaceExists) {
      throw new WorkspaceNotFoundException();
    }

    const releases = await this.releaseModel
      .find({ workspaceId })
      .populate('bugs')
      .populate('hotfixes')
      .exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message:
        releases.length > 0
          ? 'Releases retrieved successfully'
          : 'No releases found for this workspace',
      data: releases,
    };
  }

  async findById(releaseId: string): Promise<ApiResponse<Release, ApiError>> {
    const release = await this.releaseModel
      .findById(releaseId)
      .populate('bugs')
      .populate('hotfixes')
      .exec();
    if (!release) {
      throw new ReleaseNotFoundException();
    }
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Release retrieved successfully',
      data: release,
    };
  }

  async update(
    releaseId: string,
    updateReleaseDto: Partial<CreateReleaseDto>,
    userId: string,
  ): Promise<ApiResponse<Release, ApiError>> {
    const releaseExistAndIsManager = await this.releaseModel
      .findOne({ _id: releaseId, createdBy: userId })
      .exec();
    if (!releaseExistAndIsManager) {
      throw new ReleaseNotFoundException();
    }

    const updatedRelease = await this.releaseModel
      .findByIdAndUpdate(releaseId, updateReleaseDto, {
        new: true,
        runValidators: true,
      })
      .populate('bugs')
      .populate('hotfixes')
      .exec();
    if (!updatedRelease) {
      throw new ReleaseNotFoundException();
    }
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Release updated successfully',
      data: updatedRelease,
    };
  }

  async deploy(
    releaseId: string,
    userId: string,
  ): Promise<ApiResponse<Release, ApiError>> {
    const releaseExistAndIsManager = await this.releaseModel
      .findOne({ _id: releaseId, createdBy: userId })
      .exec();
    if (!releaseExistAndIsManager) {
      throw new ReleaseNotFoundException();
    }

    const updatedRelease = await this.releaseModel.findByIdAndUpdate(
      releaseId,
      { deployedBy: userId, deployedDate: new Date() },
      { new: true, runValidators: true },
    );
    if (!updatedRelease) {
      throw new ReleaseNotFoundException();
    }
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Release deployed successfully',
      data: updatedRelease,
    };
  }

  async updateQAStatus(
    releaseId: string,
    qaStatus: QAStatus,
    userId: string,
  ): Promise<ApiResponse<Release, ApiError>> {
    const release = await this.releaseModel.findById(releaseId).exec();

    if (!release) {
      throw new ReleaseNotFoundException();
    }

    // Check if user is manager or QA in the workspace
    const workspace = await this.workspaceModel
      .findById(release.workspaceId)
      .exec();

    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    // Find the user's role in the workspace
    const userMember = workspace.members.find(
      (member) => member.userId.toString() === userId,
    );

    if (!userMember) {
      throw new UserNotMemberException();
    }

    // Check if user is manager or QA
    if (
      userMember.role !== UserRole.Manager &&
      userMember.role !== UserRole.QA
    ) {
      throw new InsufficientPermissionsException(
        'update QA status',
        UserRole.QA,
      );
    }

    const updatedRelease = await this.releaseModel.findByIdAndUpdate(
      releaseId,
      { qaStatus },
      { new: true, runValidators: true },
    );

    if (!updatedRelease) {
      throw new ReleaseNotFoundException();
    }
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'QA status updated successfully',
      data: updatedRelease,
    };
  }

  async delete(
    releaseId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    const releaseExistAndIsManager = await this.releaseModel
      .findOne({ _id: releaseId, createdBy: userId })
      .exec();
    if (!releaseExistAndIsManager) {
      throw new ReleaseNotFoundException();
    }
    const deletedRelease = await this.releaseModel.findByIdAndDelete(releaseId);
    if (!deletedRelease) {
      throw new ReleaseNotFoundException();
    }

    // Remove release from workspace's releases array
    await this.workspaceModel.findByIdAndUpdate(
      deletedRelease.workspaceId,
      { $pull: { releases: releaseId } },
      { new: true },
    );

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Release deleted successfully',
      data: null,
    };
  }
}
