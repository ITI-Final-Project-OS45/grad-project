import {
  Injectable,
  NotFoundException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bug, BugDocument } from '../schemas/bug.schema';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { ApiError, ApiResponse, CreateBugDto, UpdateBugDto } from '@repo/types';

@Injectable()
export class BugsService {
  constructor(
    @InjectModel(Bug.name) private readonly bugModel: Model<BugDocument>,
    @InjectModel(Release.name)
    private readonly releaseModel: Model<ReleaseDocument>,

    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(
    createBugDto: CreateBugDto,
    userId: string,
  ): Promise<ApiResponse<Bug, ApiError>> {
    try {
      // Validate that the release exists
      const releaseExists = await this.releaseModel
        .findById(createBugDto.releaseId)
        .exec();
      if (!releaseExists) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
      }

      // Validate assignedTo user exists (if provided)
      if (createBugDto.assignedTo) {
        const assignedUserExists = await this.userModel
          .findById(createBugDto.assignedTo)
          .exec();
        if (!assignedUserExists) {
          throw new NotFoundException({
            success: false,
            status: HttpStatus.NOT_FOUND,
            message: 'Assigned user not found',
            error: 'Assigned user does not exist',
          });
        }
      }

      // Create the bug
      const newBug = new this.bugModel({
        ...createBugDto,
        reportedBy: userId,
      });
      const savedBug = await newBug.save();

      // Add bug ID to the release's bugs array
      await this.releaseModel.findByIdAndUpdate(
        createBugDto.releaseId,
        { $push: { bugs: savedBug._id } },
        { new: true },
      );

      const populatedBug = await this.bugModel
        .findById(savedBug._id)
        .populate('reportedBy', 'username displayName email')
        .populate('assignedTo', 'username displayName email')
        .populate('releaseId', 'versionTag description')
        .lean<Bug>()
        .exec();
      if (!populatedBug) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Bug not found after creation',
          error: 'Bug does not exist',
        });
      }

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'Bug created successfully',
        data: populatedBug,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error creating bug',
        error: e.message,
      });
    }
  }

  async findByRelease(
    releaseId: string,
  ): Promise<ApiResponse<Bug[], ApiError>> {
    try {
      const releaseExists = await this.releaseModel.findById(releaseId).exec();
      if (!releaseExists) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
      }

      const bugs = await this.bugModel
        .find({ releaseId })
        .populate('reportedBy', 'username displayName email')
        .populate('assignedTo', 'username displayName email')
        .lean<Bug[]>()
        .exec();

      return {
        success: true,
        status: HttpStatus.OK,
        message:
          bugs.length > 0
            ? 'Bugs retrieved successfully'
            : 'No bugs found for this release',
        data: bugs,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving bugs',
        error: e.message,
      });
    }
  }

  async findById(bugId: string): Promise<ApiResponse<Bug, ApiError>> {
    try {
      const bug = await this.bugModel
        .findById(bugId)
        .populate('reportedBy', 'username displayName email')
        .populate('assignedTo', 'username displayName email')
        .populate('releaseId', 'versionTag description')
        .lean<Bug>()
        .exec();

      if (!bug) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Bug not found',
          error: 'Bug does not exist',
        });
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Bug retrieved successfully',
        data: bug,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving bug',
        error: e.message,
      });
    }
  }

  async update(
    bugId: string,
    updateBugDto: UpdateBugDto,
    userId: string,
  ): Promise<ApiResponse<Bug, ApiError>> {
    try {
      const bug = await this.bugModel.findById(bugId).lean<Bug>().exec();
      if (!bug) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Bug not found',
          error: 'Bug does not exist',
        });
      }
      if (
        userId !== String(bug.assignedTo) ||
        userId !== String(bug.reportedBy)
      ) {
        throw new UnauthorizedException({
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to update this bug',
          error: 'Permission denied',
        });
      }
      // Validate assignedTo user exists (if provided)
      if (updateBugDto.assignedTo) {
        const assignedUserExists = await this.userModel
          .findById(updateBugDto.assignedTo)
          .exec();
        if (!assignedUserExists) {
          throw new NotFoundException({
            success: false,
            status: HttpStatus.NOT_FOUND,
            message: 'Assigned user not found',
            error: 'Assigned user does not exist',
          });
        }
      }

      const updatedBug = await this.bugModel
        .findByIdAndUpdate(bugId, updateBugDto, {
          new: true,
          runValidators: true,
        })
        .populate('reportedBy', 'username displayName email')
        .populate('assignedTo', 'username displayName email')
        .populate('releaseId', 'versionTag description')
        .lean<Bug>()
        .exec();
      if (!updatedBug) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Bug not found after update',
          error: 'Bug does not exist',
        });
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Bug updated successfully',
        data: updatedBug,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error updating bug',
        error: e.message,
      });
    }
  }

  async delete(
    bugId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    try {
      const bug = await this.bugModel
        .findById(bugId)
        .lean<Bug>()
        .lean<Bug>()
        .exec();
      if (!bug) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Bug not found',
          error: 'Bug does not exist',
        });
      }
      if (userId !== String(bug.reportedBy))
        throw new UnauthorizedException({
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: 'You do not have permission to delete this bug',
          error: 'Permission denied',
        });

      await this.releaseModel.findByIdAndUpdate(
        bug.releaseId,
        { $pull: { bugs: bugId } },
        { new: true },
      );

      // Delete the bug
      await this.bugModel.findByIdAndDelete(bugId).exec();

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Bug deleted successfully',
        data: null,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error deleting bug',
        error: e.message,
      });
    }
  }

  async findAll(): Promise<ApiResponse<Bug[], ApiError>> {
    try {
      const bugs = await this.bugModel
        .find()
        .populate('reportedBy', 'username displayName email')
        .populate('assignedTo', 'username displayName email')
        .populate('releaseId', 'versionTag description')
        .lean<Bug[]>()
        .exec();

      return {
        success: true,
        status: HttpStatus.OK,
        message:
          bugs.length > 0 ? 'Bugs retrieved successfully' : 'No bugs found',
        data: bugs,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving bugs',
        error: e.message,
      });
    }
  }
}
