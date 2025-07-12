/**
 * Tasks Service
 * =============
 *
 * Handles all business logic and database operations for tasks with authorization:
 * - Create task (Manager only)
 * - Update task (Assigned users + Manager)
 * - Get tasks by workspace (Filtered by assignment for non-managers)
 * - Delete task (Manager only)
 *
 * Returns standardized ApiResponse objects for all methods.
 *
 */
import { Injectable, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Task as MongooseTask,
  Task,
  TaskDocument,
} from 'src/schemas/task.schema';
import { Workspace, WorkspaceDocument } from 'src/schemas/workspace.schema';
import { Model, isValidObjectId } from 'mongoose';
import {
  ApiResponse,
  ApiError,
  UserRole,
  CreateTaskDto,
  UpdateTaskDto,
} from '@repo/types';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(MongooseTask.name)
    private readonly taskModel: Model<TaskDocument>,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  /**
   * Get all tasks for a workspace
   * Filtered by user assignment for non-managers
   * (Workspace membership already validated by guard)
   */
  async findAllByWorkspace(
    workspaceId: string,
    userId?: string,
    userRole?: UserRole,
  ): Promise<ApiResponse<Task[], ApiError>> {
    if (!isValidObjectId(workspaceId)) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid workspace ID',
        error: {
          message:
            'The provided workspace ID is not valid. Please check the workspace ID and try again.',
          error: 'INVALID_WORKSPACE_ID',
          statusCode: HttpStatus.BAD_REQUEST,
        },
      };
    }

    const taskFilter: Record<string, any> = { workspaceId };

    // For non-managers, filter tasks to show only assigned tasks
    if (userRole !== UserRole.Manager && userId) {
      taskFilter.assignedTo = { $in: [userId] };
    }

    const tasks = await this.taskModel.find(taskFilter).exec();
    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Tasks found successfully',
      data: tasks as Task[],
    };
  }

  /**
   * Create a new task
   * Manager only
   */
  async create(
    createTaskDto: CreateTaskDto,
    userId?: string,
  ): Promise<ApiResponse<Task, ApiError>> {
    // Validate workspace membership and manager permissions
    if (userId) {
      const hasPermission = await this.validateTaskPermission(
        createTaskDto.workspaceId,
        userId,
        'create',
      );
      if (!hasPermission) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: 'Permission denied',
          error: {
            message:
              'Only managers can create tasks in this workspace. You need manager permissions to create tasks. Please contact a workspace manager for assistance.',
            error: 'INSUFFICIENT_PERMISSIONS',
            statusCode: HttpStatus.FORBIDDEN,
          },
        };
      }
    }

    // Validate assigned users are members of the workspace
    const assignedUsersValidation = await this.validateAssignedUsers(
      createTaskDto.workspaceId,
      createTaskDto.assignedTo,
    );
    if (!assignedUsersValidation.isValid) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid assigned users',
        error: {
          message:
            'Some assigned users are not members of the workspace. Please ensure all assigned users are valid workspace members: ' +
            assignedUsersValidation.invalidUsers?.join(', '),
          error: 'INVALID_ASSIGNED_USERS',
          statusCode: HttpStatus.BAD_REQUEST,
        },
      };
    }

    const created = await this.taskModel.create(createTaskDto);

    // Add task to workspace's tasks array
    await this.workspaceModel.findByIdAndUpdate(
      createTaskDto.workspaceId,
      { $push: { tasks: created._id } },
      { new: true },
    );

    return {
      success: true,
      status: HttpStatus.CREATED,
      message: 'Task created successfully',
      data: created as Task,
    };
  }

  /**
   * Update an existing task
   * Assigned users + Manager only
   */
  async updateTask(
    id: string,
    updateTaskDto: UpdateTaskDto,
    userId?: string,
  ): Promise<ApiResponse<Task, ApiError>> {
    if (!isValidObjectId(id)) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid task ID',
        error: {
          message:
            'The provided task ID is not valid. Please check the task ID and try again.',
          error: 'INVALID_TASK_ID',
          statusCode: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Get the current task to check permissions
    const currentTask = await this.taskModel.findById(id);
    if (!currentTask) {
      return {
        success: false,
        status: HttpStatus.NOT_FOUND,
        message: 'Task not found',
        error: {
          message:
            'The requested task could not be found. The task may have been deleted or you may not have access to it.',
          error: 'TASK_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
      };
    }

    // Validate workspace membership and permissions
    if (userId) {
      const hasPermission = await this.validateTaskPermission(
        currentTask.workspaceId,
        userId,
        'update',
        currentTask,
      );
      if (!hasPermission) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: 'Permission denied',
          error: {
            message:
              'You can only edit tasks that are assigned to you. This task is not assigned to you. Only assigned users and managers can edit tasks.',
            error: 'INSUFFICIENT_PERMISSIONS',
            statusCode: HttpStatus.FORBIDDEN,
          },
        };
      }
    }

    // Validate assigned users are members of the workspace
    if (updateTaskDto.assignedTo) {
      const assignedUsersValidation = await this.validateAssignedUsers(
        currentTask.workspaceId,
        updateTaskDto.assignedTo,
      );
      if (!assignedUsersValidation.isValid) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid assigned users',
          error: {
            message:
              'Some assigned users are not members of the workspace. Please ensure all assigned users are valid workspace members: ' +
              assignedUsersValidation.invalidUsers?.join(', '),
            error: 'INVALID_ASSIGNED_USERS',
            statusCode: HttpStatus.BAD_REQUEST,
          },
        };
      }
    }

    const updated = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, {
      new: true,
    });
    if (!updated) {
      return {
        success: false,
        status: HttpStatus.NOT_FOUND,
        message: 'Task not found',
        error: {
          message:
            'The task could not be updated because it was not found. The task may have been deleted while you were editing it.',
          error: 'TASK_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
      };
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
   * Manager only
   */
  async delete(
    taskId: string,
    userId?: string,
  ): Promise<ApiResponse<null, ApiError>> {
    if (!isValidObjectId(taskId)) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid task ID',
        error: {
          message:
            'The provided task ID is not valid. Please check the task ID and try again.',
          error: 'INVALID_TASK_ID',
          statusCode: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Get the task to validate workspace and permissions
    const task = await this.taskModel.findById(taskId);
    if (!task) {
      return {
        success: false,
        status: HttpStatus.NOT_FOUND,
        message: 'Task not found',
        error: {
          message:
            'The requested task could not be found. The task may have already been deleted or you may not have access to it.',
          error: 'TASK_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
      };
    }

    // Validate workspace membership and manager permissions
    if (userId) {
      const hasPermission = await this.validateTaskPermission(
        task.workspaceId,
        userId,
        'delete',
      );
      if (!hasPermission) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: 'Permission denied',
          error: {
            message:
              'Only managers can delete tasks. You need manager permissions to delete tasks. Please contact a workspace manager for assistance.',
            error: 'INSUFFICIENT_PERMISSIONS',
            statusCode: HttpStatus.FORBIDDEN,
          },
        };
      }
    }

    const result = await this.taskModel.deleteOne({ _id: taskId }).exec();
    if (result.deletedCount === 0) {
      return {
        success: false,
        status: HttpStatus.NOT_FOUND,
        message: 'Task not found',
        error: {
          message:
            'The task could not be deleted because it was not found. The task may have already been deleted.',
          error: 'TASK_NOT_FOUND',
          statusCode: HttpStatus.NOT_FOUND,
        },
      };
    }

    // Remove task from workspace's tasks array
    await this.workspaceModel.findByIdAndUpdate(
      task.workspaceId,
      { $pull: { tasks: taskId } },
      { new: true },
    );

    return {
      success: true,
      status: HttpStatus.OK,
      message: 'Task deleted successfully',
      data: null,
    };
  }

  /**
   * Validate task permissions based on workspace membership and role
   */
  private async validateTaskPermission(
    workspaceId: string,
    userId: string,
    operation: 'create' | 'update' | 'delete',
    task?: TaskDocument,
  ): Promise<boolean> {
    if (!isValidObjectId(workspaceId)) {
      return false;
    }

    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      return false;
    }

    const userMember = workspace.members.find(
      (member) => member.userId.toString() === userId,
    );

    if (!userMember) {
      return false; // User is not a member of the workspace
    }

    switch (operation) {
      case 'create':
      case 'delete':
        // Only managers can create or delete tasks
        return userMember.role === UserRole.Manager;

      case 'update':
        // Managers can update any task, users can only update assigned tasks
        if (userMember.role === UserRole.Manager) {
          return true;
        }
        return task ? task.assignedTo.includes(userId) : false;

      default:
        return false;
    }
  }

  /**
   * Validate that all assigned users are members of the workspace
   */
  private async validateAssignedUsers(
    workspaceId: string,
    assignedTo?: string[],
  ): Promise<{ isValid: boolean; invalidUsers?: string[] }> {
    if (!assignedTo || assignedTo.length === 0) {
      return { isValid: true };
    }

    const workspace = await this.workspaceModel.findById(workspaceId).exec();
    if (!workspace) {
      return { isValid: false };
    }

    const workspaceMemberIds = workspace.members.map((member) =>
      member.userId.toString(),
    );

    const invalidUsers = assignedTo.filter(
      (userId) => !workspaceMemberIds.includes(userId),
    );

    return {
      isValid: invalidUsers.length === 0,
      invalidUsers: invalidUsers.length > 0 ? invalidUsers : undefined,
    };
  }

    /**
   * Create multiple tasks from an array of task objects
   * Manager only
   */
  async createBulkTasks(
    tasksArray: CreateTaskDto[],
    userId?: string,
  ): Promise<ApiResponse<Task[], ApiError>> {
    if (!Array.isArray(tasksArray) || tasksArray.length === 0) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid tasks array',
        error: {
          message:
            'Tasks array must be a non-empty array of task objects. Please provide valid task data.',
          error: 'INVALID_TASKS_ARRAY',
          statusCode: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Validate that all tasks belong to the same workspace
    const workspaceIds = [...new Set(tasksArray.map((task) => task.workspaceId))];
    if (workspaceIds.length !== 1) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'All tasks must belong to the same workspace',
        error: {
          message:
            'Bulk task creation requires all tasks to be in the same workspace. Please ensure all tasks have the same workspaceId.',
          error: 'MULTIPLE_WORKSPACES_NOT_ALLOWED',
          statusCode: HttpStatus.BAD_REQUEST,
        },
      };
    }

    const workspaceId = workspaceIds[0];
    if (!workspaceId) {
      return {
        success: false,
        status: HttpStatus.BAD_REQUEST,
        message: 'Invalid workspace ID',
        error: {
          message:
            'All tasks must have a valid workspaceId. Please ensure all tasks include a valid workspace ID.',
          error: 'MISSING_WORKSPACE_ID',
          statusCode: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Validate workspace membership and manager permissions
    if (userId) {
      const hasPermission = await this.validateTaskPermission(
        workspaceId,
        userId,
        'create',
      );
      if (!hasPermission) {
        return {
          success: false,
          status: HttpStatus.FORBIDDEN,
          message: 'Permission denied',
          error: {
            message:
              'Only managers can create tasks in this workspace. You need manager permissions to create tasks. Please contact a workspace manager for assistance.',
            error: 'INSUFFICIENT_PERMISSIONS',
            statusCode: HttpStatus.FORBIDDEN,
          },
        };
      }
    }

    // Validate all assigned users are members of the workspace
    const allAssignedUsers = tasksArray.flatMap(
      (task) => task.assignedTo || [],
    );
    const uniqueAssignedUsers = [...new Set(allAssignedUsers)];

    if (uniqueAssignedUsers.length > 0) {
      const assignedUsersValidation = await this.validateAssignedUsers(
        workspaceId,
        uniqueAssignedUsers,
      );
      if (!assignedUsersValidation.isValid) {
        return {
          success: false,
          status: HttpStatus.BAD_REQUEST,
          message: 'Invalid assigned users',
          error: {
            message:
              'Some assigned users are not members of the workspace. Please ensure all assigned users are valid workspace members: ' +
              assignedUsersValidation.invalidUsers?.join(', '),
            error: 'INVALID_ASSIGNED_USERS',
            statusCode: HttpStatus.BAD_REQUEST,
          },
        };
      }
    }

    try {
      // Create all tasks in bulk
      const createdTasks = await this.taskModel.insertMany(tasksArray);

      // Add all task IDs to workspace's tasks array
      const taskIds = createdTasks.map((task) => task._id);
      await this.workspaceModel.findByIdAndUpdate(
        workspaceId,
        { $push: { tasks: { $each: taskIds } } },
        { new: true },
      );

      return {
        success: true,
        status: HttpStatus.CREATED,
        message: `${createdTasks.length} tasks created successfully`,
        data: createdTasks as Task[],
      };
    } catch (error) {
      return {
        success: false,
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Failed to create tasks',
        error: {
          message:
            'An error occurred while creating the tasks. Please check your task data and try again.',
          error: 'BULK_TASK_CREATION_FAILED',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      };
    }
  }
}
