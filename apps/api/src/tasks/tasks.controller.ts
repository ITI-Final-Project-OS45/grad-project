import { CreateTaskDto } from './../../../../packages/types/src/dtos/tasks/task.dto';
/**
 * Tasks Controller
 * ================
 *
 * Handles all HTTP requests related to tasks with workspace-based authorization:
 * - Create task (Manager only)
 * - Update task (Assigned users + Manager)
 * - Get tasks by workspace (Filtered by assignment for non-managers)
 * - Delete task (Manager only)
 *
 * Returns standardized ApiResponse objects for all endpoints.
 *
 */
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  UseGuards,
  SetMetadata,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiResponse, ApiError, WorkspacePermission } from '@repo/types';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import type { WorkspaceRequest } from 'src/interfaces/request-workspace.interface';
import { Task } from 'src/schemas/task.schema';

@UseGuards(AuthGuard)
@Controller('tasks')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Get all tasks for a workspace
   * GET /tasks/workspace/:workspaceId
   * Filtered by user assignment for non-managers
   */
  @Get('workspace/:workspaceId')
  @UseGuards(WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER)
  @SetMetadata('workspaceGuardOptions', { workspaceIdParamKey: 'workspaceId' })
  async getTasksByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Req() req: WorkspaceRequest,
  ): Promise<ApiResponse<Task[], ApiError>> {
    return this.tasksService.findAllByWorkspace(
      workspaceId,
      req.userId,
      req.workspaceMemberRole,
    );
  }

  /**
   * Create a new task
   * POST /tasks
   * Manager only
   */
  @Post()
  async createTask(
    @Body() dto: CreateTaskDto,
    @Req() req: WorkspaceRequest,
  ): Promise<ApiResponse<Task, ApiError>> {
    return this.tasksService.create(dto, req.userId);
  }

  /**
   * Update an existing task
   * PUT /tasks/:id
   * Assigned users + Manager only
   */
  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaskDto>,
    @Req() req: WorkspaceRequest,
  ): Promise<ApiResponse<Task, ApiError>> {
    return this.tasksService.updateTask(id, dto, req.userId);
  }

  /**
   * Delete a task by ID
   * DELETE /tasks/:id
   * Manager only
   */
  @Delete(':id')
  async deleteTask(
    @Param('id') id: string,
    @Req() req: WorkspaceRequest,
  ): Promise<ApiResponse<null, ApiError>> {
    return this.tasksService.delete(id, req.userId);
  }
}
