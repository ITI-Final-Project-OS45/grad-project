import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bug, BugDocument } from '../schemas/bug.schema';
import { Release, ReleaseDocument } from '../schemas/release.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import {
  ApiError,
  ApiResponse,
  CreateBugDto,
  UpdateBugDto,
  UserRole,
} from '@repo/types';
import {
  ReleaseNotFoundException,
  BugNotFoundException,
  UserNotFoundException,
  UnauthorizedActionException,
} from '../exceptions/domain.exceptions';

@Injectable()
export class BugsService {
  constructor(
    @InjectModel(Bug.name) private readonly bugModel: Model<BugDocument>,
    @InjectModel(Release.name)
    private readonly releaseModel: Model<ReleaseDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async create(
    createBugDto: CreateBugDto,
    userId: string,
  ): Promise<ApiResponse<Bug, ApiError>> {
    // Validate that the release exists
    const releaseExists = await this.releaseModel
      .findById(createBugDto.releaseId)
      .exec();
    if (!releaseExists) {
      throw new ReleaseNotFoundException();
    }

    // Validate assignedTo user exists (if provided)
    if (createBugDto.assignedTo) {
      const assignedUserExists = await this.userModel
        .findById(createBugDto.assignedTo)
        .exec();
      if (!assignedUserExists) {
        throw new UserNotFoundException('Assigned user not found');
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
      throw new BugNotFoundException();
    }

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'Bug created successfully',
      data: populatedBug,
    };
  }

  async findByRelease(
    releaseId: string,
  ): Promise<ApiResponse<Bug[], ApiError>> {
    const releaseExists = await this.releaseModel.findById(releaseId).exec();
    if (!releaseExists) {
      throw new ReleaseNotFoundException();
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
  }

  async findById(bugId: string): Promise<ApiResponse<Bug, ApiError>> {
    const bug = await this.bugModel
      .findById(bugId)
      .populate('reportedBy', 'username displayName email')
      .populate('assignedTo', 'username displayName email')
      .populate('releaseId', 'versionTag description')
      .lean<Bug>()
      .exec();

    if (!bug) {
      throw new BugNotFoundException();
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Bug retrieved successfully',
      data: bug,
    };
  }

  async update(
    bugId: string,
    updateBugDto: UpdateBugDto,
    userId: string,
  ): Promise<ApiResponse<Bug, ApiError>> {
    // First get the bug to get releaseId
    const bug = await this.bugModel.findById(bugId).exec();
    if (!bug) {
      throw new BugNotFoundException();
    }

    // Get the release to access workspaceId
    const release = await this.releaseModel.findById(bug.releaseId).exec();
    if (!release) {
      throw new ReleaseNotFoundException();
    }

    // Check workspace permissions - only QA, Manager, and assigned users can update bugs
    await this.validateWorkspacePermissionForUpdate(
      release.workspaceId.toString(),
      userId,
      bugId,
    );

    // Validate assignedTo user exists (if provided)
    if (updateBugDto.assignedTo) {
      const assignedUserExists = await this.userModel
        .findById(updateBugDto.assignedTo)
        .exec();
      if (!assignedUserExists) {
        throw new UserNotFoundException('Assigned user not found');
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
      throw new BugNotFoundException();
    }

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Bug updated successfully',
      data: updatedBug,
    };
  }

  async delete(
    bugId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    // First get the bug to get releaseId
    const bug = await this.bugModel.findById(bugId).exec();
    if (!bug) {
      throw new BugNotFoundException();
    }

    // Get the release to access workspaceId
    const release = await this.releaseModel.findById(bug.releaseId).exec();
    if (!release) {
      throw new ReleaseNotFoundException();
    }

    // Check workspace permissions - only QA and Manager can delete bugs
    await this.validateWorkspacePermissionForDelete(
      release.workspaceId.toString(),
      userId,
    );

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
  }

  async findAll(): Promise<ApiResponse<Bug[], ApiError>> {
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
  }

  /**
   * Validates if the user has QA, Manager role or is assigned to the bug for update operations
   * @param workspaceId - The workspace ID to check permissions for
   * @param userId - The user ID to validate permissions for
   * @param bugId - The bug ID to check if user is assigned to it
   * @throws UnauthorizedActionException if user doesn't have required permissions
   */
  private async validateWorkspacePermissionForUpdate(
    workspaceId: string,
    userId: string,
    bugId?: string,
  ): Promise<void> {
    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      throw new ReleaseNotFoundException(); // Workspace not found
    }

    const userMember = workspace.members.find(
      (member) => member.userId.toString() === userId,
    );

    if (!userMember) {
      throw new UnauthorizedActionException('access this workspace');
    }

    // Check if user has QA or Manager role
    const hasRequiredRole =
      userMember.role === UserRole.QA || userMember.role === UserRole.Manager;

    // Check if user is assigned to the bug (if bugId is provided)
    let isAssignedUser = false;
    if (bugId) {
      const bug = await this.bugModel.findById(bugId).exec();
      isAssignedUser = !!(
        bug &&
        bug.assignedTo &&
        bug.assignedTo.toString() === userId
      );
    }

    // QA, Manager, and assigned user can update bugs
    if (!hasRequiredRole && !isAssignedUser) {
      throw new UnauthorizedActionException(
        'perform this action. Only QA, Manager, and assigned users are allowed',
      );
    }
  }

  /**
   * Validates if the user has QA or Manager role in the workspace for delete operations
   * @param workspaceId - The workspace ID to check permissions for
   * @param userId - The user ID to validate permissions for
   * @throws UnauthorizedActionException if user doesn't have required permissions
   */
  private async validateWorkspacePermissionForDelete(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      throw new ReleaseNotFoundException(); // Workspace not found
    }

    const userMember = workspace.members.find(
      (member) => member.userId.toString() === userId,
    );

    if (!userMember) {
      throw new UnauthorizedActionException('access this workspace');
    }

    // Only QA and Manager roles can delete bugs
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
