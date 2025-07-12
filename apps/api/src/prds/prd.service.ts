import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Prd, PrdDocument } from '../schemas/prd.schema';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import {
  CreatePrdDto,
  UpdatePrdDto,
  UserRole,
  ApiError,
  ApiResponse,
  TaskResponse,
  CreateTaskDto,
} from '@repo/types';
import {
  WorkspaceNotFoundException,
  UnauthorizedActionException,
} from '../exceptions/domain.exceptions';
import { AiService } from 'src/design-asset/ai.service';
import { Task, TaskDocument } from 'src/schemas/task.schema';
import { TasksService } from 'src/tasks/tasks.service';

@Injectable()
export class PrdService {
  constructor(
    @InjectModel(Prd.name)
    private readonly prdModel: Model<PrdDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
    private readonly aiService: AiService,
    // @InjectModel(Task.name)
    // private readonly taskModel: Model<TaskDocument>,
    private readonly tasksService: TasksService,
  ) {}

  /**
   * Sanitizes markdown content by removing markdown formatting
   * @param markdownContent - The markdown content to sanitize
   * @returns Plain text content without markdown formatting
   */
  private sanitizeMarkdown(markdownContent: string): string {
    return (
      markdownContent
        // Remove headers (# ## ### etc.)
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold formatting (**text** or __text__)
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/__(.*?)__/g, '$1')
        // Remove italic formatting (*text* or _text_)
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        // Remove code blocks (```code```)
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code (`code`)
        .replace(/`([^`]+)`/g, '$1')
        // Remove links [text](url)
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove images ![alt](url)
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        // Remove strikethrough (~~text~~)
        .replace(/~~(.*?)~~/g, '$1')
        // Remove blockquotes (> text)
        .replace(/^>\s+/gm, '')
        // Remove horizontal rules (---, ***, ___)
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove list markers (-, *, +, 1., 2., etc.)
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Clean up extra whitespace and newlines
        .replace(/\n\s*\n/g, '\n')
        .trim()
    );
  }

  async create(
    createPrdDto: CreatePrdDto,
    userId: string,
    generateTasks: boolean,
  ): Promise<ApiResponse<Prd, ApiError>> {
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
      throw new UnauthorizedActionException(
        'create PRDs. Only managers are allowed',
      );
    }

    // Check if a PRD already exists for this workspace
    const existingPrd = await this.prdModel
      .findOne({ workspaceId: createPrdDto.workspaceId })
      .exec();

    if (existingPrd) {
      // Add the current state to versions
      const prevVersionNo = (existingPrd.versions?.length || 0) + 1;
      const updatedPrd = await this.prdModel
        .findByIdAndUpdate(
          existingPrd._id,
          {
            $push: {
              versions: {
                versionNo: prevVersionNo,
                title: existingPrd.title,
                content: existingPrd.content,
                createdBy: existingPrd.createdBy,
              },
            },
            title: createPrdDto.title,
            content: createPrdDto.content,
            createdBy: new Types.ObjectId(userId),
          },
          { new: true, runValidators: true },
        )
        .populate('createdBy', 'username displayName email')
        .lean<Prd>()
        .exec();

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'PRD updated with new version successfully',
        data: updatedPrd!,
      };
    } else {
      // Create new PRD if none exists
      const newPrd = new this.prdModel({
        ...createPrdDto,
        createdBy: userId,
        versions: [],
      });
      const savedPrd = await newPrd.save();

      const populatedPrd = await this.prdModel
        .findById(savedPrd._id)
        .populate('createdBy', 'username displayName email')
        .lean<Prd>()
        .exec();

      //! generate tasks by gemini
      if (populatedPrd && generateTasks) {
        const sanitizedContent = this.sanitizeMarkdown(populatedPrd.content);
        const tasks = await this.aiService.generateTasks(
          sanitizedContent,
          workspace.members,
          String(workspace._id),
        );

        const tasksArray: CreateTaskDto[] = JSON.parse(
          tasks,
        ) as CreateTaskDto[];
        await this.tasksService.createBulkTasks(tasksArray, userId);
      }

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'PRD created successfully',
        data: populatedPrd!,
      };
    }
  }

  async findByWorkspace(
    workspaceId: string,
  ): Promise<ApiResponse<Prd[], ApiError>> {
    const prds = await this.prdModel
      .find({ workspaceId })
      .populate('createdBy', 'username displayName email')
      .lean<Prd[]>()
      .exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message:
        prds.length > 0
          ? 'PRDs retrieved successfully'
          : 'No PRDs found for this workspace',
      data: prds,
    };
  }

  async updateByWorkspace(
    workspaceId: string,
    updatePrdDto: UpdatePrdDto,
    userId: string,
  ): Promise<ApiResponse<Prd, ApiError>> {
    const prd = await this.prdModel.findOne({ workspaceId }).exec();
    if (!prd) {
      throw new WorkspaceNotFoundException();
    }

    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new UnauthorizedActionException(
        'update PRDs. Only managers are allowed',
      );
    }

    // Build update object with only provided fields
    const updateData: Partial<Prd> = {};
    if (updatePrdDto.title) updateData.title = updatePrdDto.title;
    if (updatePrdDto.content) updateData.content = updatePrdDto.content;

    const updatedPrd = await this.prdModel
      .findByIdAndUpdate(prd._id, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('createdBy', 'username displayName email')
      .lean<Prd>()
      .exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'PRD updated successfully',
      data: updatedPrd!,
    };
  }

  async deleteByWorkspace(
    workspaceId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    const prd = await this.prdModel
      .findOne({ workspaceId })
      .sort({ createdAt: -1 })
      .exec();
    if (!prd) {
      throw new WorkspaceNotFoundException();
    }

    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new UnauthorizedActionException(
        'delete PRDs. Only managers are allowed',
      );
    }

    await this.prdModel.findByIdAndDelete(prd._id).exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'PRD deleted successfully',
      data: null,
    };
  }

  async updateById(
    prdId: string,
    updatePrdDto: UpdatePrdDto,
    userId: string,
  ): Promise<ApiResponse<Prd, ApiError>> {
    const prd = await this.prdModel.findById(prdId).exec();
    if (!prd) {
      throw new WorkspaceNotFoundException();
    }

    const workspace = await this.workspaceModel
      .findById(prd.workspaceId)
      .exec();
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new UnauthorizedActionException(
        'update PRDs. Only managers are allowed',
      );
    }

    // Build update object with only provided fields
    const updateData: Partial<Prd> = {};
    if (updatePrdDto.title) updateData.title = updatePrdDto.title;
    if (updatePrdDto.content) updateData.content = updatePrdDto.content;

    const updatedPrd = await this.prdModel
      .findByIdAndUpdate(prdId, updateData, {
        new: true,
        runValidators: true,
      })
      .populate('createdBy', 'username displayName email')
      .lean<Prd>()
      .exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'PRD updated successfully',
      data: updatedPrd!,
    };
  }

  async deleteById(
    prdId: string,
    userId: string,
  ): Promise<ApiResponse<null, ApiError>> {
    const prd = await this.prdModel.findById(prdId).exec();
    if (!prd) {
      throw new WorkspaceNotFoundException();
    }

    const workspace = await this.workspaceModel
      .findById(prd.workspaceId)
      .exec();
    if (!workspace) {
      throw new WorkspaceNotFoundException();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );
    if (!member || member.role !== UserRole.Manager) {
      throw new UnauthorizedActionException(
        'delete PRDs. Only managers are allowed',
      );
    }

    await this.prdModel.findByIdAndDelete(prdId).exec();

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'PRD deleted successfully',
      data: null,
    };
  }
}
