import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { ApiError, ApiResponse, CreateReleaseDto, QAStatus } from '@repo/types';
import { Workspace, WorkspaceDocument } from 'src/schemas/workspace.schema';

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
    try {
      // TODO: Validate that userId is manager of the workspace
      const workspaceExists = await this.workspaceModel
        .findById(createReleaseDto.workspaceId)
        .exec();
      if (!workspaceExists) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Workspace not found',
          error: 'Workspace does not exist',
        });
      }
      const newRelease = new this.releaseModel({
        ...createReleaseDto,
        createdBy: userId,
      });
      const savedRelease = await newRelease.save();
      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'Release created successfully',
        data: savedRelease,
      };
    } catch (error) {
      const e = error as Error;
      throw new NotFoundException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error creating release',
        error: e.message,
      });
    }
  }
  async findByWorkspace(
    workspaceId: string,
  ): Promise<ApiResponse<Release[], ApiError>> {
    try {
      const releases = await this.releaseModel
        .find({ workspaceId })
        // TODO: Uncomment when Task/Development schema is available
        // .populate('associatedTasks')
        .populate('bugs')
        .populate('hotfixes')
        .exec();

      if (!releases || releases.length === 0) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'No releases found for this workspace',
          error: 'Releases not found',
        });
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Releases retrieved successfully',
        data: releases,
      };
    } catch (error) {
      const e = error as Error;
      throw new NotFoundException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving releases',
        error: e.message,
      });
    }
  }
  async findById(releaseId: string): Promise<ApiResponse<Release, ApiError>> {
    try {
      const release = await this.releaseModel
        .findById(releaseId)
        // TODO: Uncomment when Task/Development schema is available
        // .populate('associatedTasks')
        .populate('bugs')
        .populate('hotfixes')
        .exec();
      if (!release) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
      }
      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Release retrieved successfully',
        data: release,
      };
    } catch (error) {
      const e = error as Error;
      throw new NotFoundException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving release',
        error: e.message,
      });
    }
  }
  async update(
    releaseId: string,
    updateReleaseDto: Partial<CreateReleaseDto>,
    userId: string,
  ): Promise<ApiResponse<Release, ApiError>> {
    try {
      const releaseExistAndIsManager = await this.releaseModel
        .findOne({ _id: releaseId, createdBy: userId })
        .exec();
      if (!releaseExistAndIsManager) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found or you are not authorized to update it',
          error: 'Release does not exist or unauthorized',
        });
      }

      const updatedRelease = await this.releaseModel
        .findByIdAndUpdate(releaseId, updateReleaseDto, {
          new: true,
          runValidators: true,
        })
        // TODO: Uncomment when Task/Development schema is available
        // .populate('associatedTasks')
        .populate('bugs')
        .populate('hotfixes')
        .exec();
      if (!updatedRelease) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
      }
      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Release updated successfully',
        data: updatedRelease,
      };
    } catch (error) {
      const e = error as Error;
      throw new NotFoundException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error updating release',
        error: e.message,
      });
    }
  }
  async deploy(
    releaseId: string,
    userId: string,
  ): Promise<ApiResponse<Release, ApiError>> {
    try {
      const releaseExistAndIsManager = await this.releaseModel
        .findOne({ _id: releaseId, createdBy: userId })
        .exec();
      if (!releaseExistAndIsManager) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found or you are not authorized to deploy it',
          error: 'Release does not exist or unauthorized',
        });
      }

      const updatedRelease = await this.releaseModel.findByIdAndUpdate(
        releaseId,
        { deployedBy: userId, deployedDate: new Date() },
        { new: true, runValidators: true },
      );
      if (!updatedRelease) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
      }
      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Release deployed successfully',
        data: updatedRelease,
      };
    } catch (error) {
      const e = error as Error;
      throw new NotFoundException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error deploying release',
        error: e.message,
      });
    }
  }
  async updateQAStatus(
    releaseId: string,
    qaStatus: QAStatus,
    userId: string,
  ): Promise<ApiResponse<Release, ApiError>> {
    // TODO: Validate that the user is authorized to update QA status
    try {
      const updatedRelease = await this.releaseModel.findByIdAndUpdate(
        releaseId,
        { qaStatus },
        { new: true, runValidators: true },
      );
      if (!updatedRelease) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
      }
      return {
        success: true,
        status: HttpStatus.OK,
        message: 'QA status updated successfully',
        data: updatedRelease,
      };
    } catch (error) {
      const e = error as Error;
      throw new NotFoundException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error updating QA status',
        error: e.message,
      });
    }
  }
  async delete(
    releaseId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    try {
      const releaseExistAndIsManager = await this.releaseModel
        .findOne({ _id: releaseId, createdBy: userId })
        .exec();
      if (!releaseExistAndIsManager) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found or you are not authorized to delete it',
          error: 'Release does not exist or unauthorized',
        });
      }
      const deletedRelease =
        await this.releaseModel.findByIdAndDelete(releaseId);
      if (!deletedRelease) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
      }
      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Release deleted successfully',
        data: null,
      };
    } catch (error) {
      const e = error as Error;
      throw new NotFoundException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error deleting release',
        error: e.message,
      });
    }
  }
}
