/**
 * Tasks Service
 * =============
 *
 * Handles all business logic and database operations for tasks:
 * - Create task
 * - Update task
 * - Get tasks by workspace
 * - Delete task
 *
 * Returns standardized ApiResponse objects for all methods.
 *
 */
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task as MongooseTask, TaskDocument } from 'src/schemas/task.schema';
import { Model, isValidObjectId } from 'mongoose';
import { ApiResponse, ApiError, Task, CreateTaskDto } from '@repo/types';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(MongooseTask.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  /**
   * Get all tasks for a workspace
   */
  async findAllByWorkspace(
    workspaceId: string,
  ): Promise<ApiResponse<Task[], ApiError>> {
    if (!isValidObjectId(workspaceId)) {
      throw new BadRequestException('Invalid workspace ID');
    }
    const tasks = await this.taskModel.find({ workspaceId }).exec();
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Tasks found successfully',
      data: tasks as Task[],
    };
  }

  /**
   * Create a new task
   */
  async create(
    createTaskDto: CreateTaskDto,
  ): Promise<ApiResponse<Task, ApiError>> {
    try {
      const created = await this.taskModel.create(createTaskDto);
      return {
        success: true,
        status: HttpStatus.CREATED,
        message: 'Task created successfully',
        data: created as Task,
      };
    } catch (err) {
      throw new BadRequestException('Failed to create task');
    }
  }

  /**
   * Update an existing task
   */
  async updateTask(
    id: string,
    updateTaskDto: Partial<CreateTaskDto>,
  ): Promise<ApiResponse<Task, ApiError>> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid task ID');
    }
    const updated = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, {
      new: true,
    });
    if (!updated) {
      throw new NotFoundException('Task not found');
    }
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Task updated successfully',
      data: updated as Task,
    };
  }

  /**
   * Delete a task by ID
   */
  async delete(taskId: string): Promise<ApiResponse<null, ApiError>> {
    if (!isValidObjectId(taskId)) {
      throw new BadRequestException('Invalid task ID');
    }
    const result = await this.taskModel.deleteOne({ _id: taskId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Task not found');
    }
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Task deleted successfully',
      data: null,
    };
  }
}
