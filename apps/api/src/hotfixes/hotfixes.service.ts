import {
  Injectable,
  NotFoundException,
  HttpStatus,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hotfix, HotfixDocument } from '../schemas/hotfix.schema';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { User, UserDocument } from '../schemas/user.schema';
import {
  ApiError,
  ApiResponse,
  CreateHotfixDto,
  UpdateHotfixDto,
} from '@repo/types';

@Injectable()
export class HotfixesService {
  constructor(
    @InjectModel(Hotfix.name)
    private readonly hotfixModel: Model<HotfixDocument>,
    @InjectModel(Release.name)
    private readonly releaseModel: Model<ReleaseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(
    createHotfixDto: CreateHotfixDto,
    userId: string,
    releaseId: string, // Now require releaseId as parameter
  ): Promise<ApiResponse<Hotfix, ApiError>> {
    try {
      // Validate that the release exists
      const releaseExists = await this.releaseModel.findById(releaseId).exec();
      if (!releaseExists) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Release not found',
          error: 'Release does not exist',
        });
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
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Hotfix not found after creation',
          error: 'Hotfix does not exist',
        });
      }

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'Hotfix created successfully',
        data: populatedHotfix,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error creating hotfix',
        error: e.message,
      });
    }
  }

  async findByRelease(
    releaseId: string,
  ): Promise<ApiResponse<Hotfix[], ApiError>> {
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
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving hotfixes',
        error: e.message,
      });
    }
  }

  async findById(hotfixId: string): Promise<ApiResponse<Hotfix, ApiError>> {
    try {
      const hotfix = await this.hotfixModel
        .findById(hotfixId)
        .populate('fixedBy', 'username displayName email')
        .populate('releaseId', 'versionTag description')
        .lean<Hotfix>()
        .exec();

      if (!hotfix) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Hotfix not found',
          error: 'Hotfix does not exist',
        });
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Hotfix retrieved successfully',
        data: hotfix,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving hotfix',
        error: e.message,
      });
    }
  }

  async update(
    hotfixId: string,
    updateHotfixDto: UpdateHotfixDto,
    userId: string,
  ): Promise<ApiResponse<Hotfix, ApiError>> {
    try {
      const hotfix = await this.hotfixModel
        .findById(hotfixId)
        .lean<Hotfix>()
        .exec();
      if (!hotfix) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Hotfix not found',
          error: 'Hotfix does not exist',
        });
      }
      if (userId !== hotfix.fixedBy.toString()) {
        throw new UnauthorizedException({
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized to update this hotfix',
          error: 'You can only update hotfixes you created',
        });
      }
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
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Hotfix not found after update',
          error: 'Hotfix does not exist',
        });
      }

      return {
        success: true,
        status: HttpStatus.OK,
        message: 'Hotfix updated successfully',
        data: updatedHotfix,
      };
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error updating hotfix',
        error: e.message,
      });
    }
  }

  async delete(
    hotfixId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    try {
      const hotfix = await this.hotfixModel
        .findById(hotfixId)
        .lean<Hotfix>()
        .exec();
      if (!hotfix) {
        throw new NotFoundException({
          success: false,
          status: HttpStatus.NOT_FOUND,
          message: 'Hotfix not found',
          error: 'Hotfix does not exist',
        });
      }
      if (userId !== hotfix.fixedBy.toString()) {
        throw new UnauthorizedException({
          success: false,
          status: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized to delete this hotfix',
          error: 'You can only delete hotfixes you created',
        });
      }

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
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error deleting hotfix',
        error: e.message,
      });
    }
  }

  async findAll(): Promise<ApiResponse<Hotfix[], ApiError>> {
    try {
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
    } catch (error) {
      const e = error as Error;
      throw new BadRequestException({
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Error retrieving hotfixes',
        error: e.message,
      });
    }
  }
}
