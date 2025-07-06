/**
 * Tasks Controller
 * ================
 *
 * Handles all HTTP requests related to tasks:
 * - Create task
 * - Update task
 * - Get tasks by workspace
 * - Delete task
 *
 * Returns standardized ApiResponse objects for all endpoints.
 *
 */
import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiResponse, ApiError, Task, CreateTaskDto } from '@repo/types';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Get all tasks for a workspace
   * GET /tasks/workspace/:workspaceId
   */
  @Get('workspace/:workspaceId')
  async getTasksByWorkspace(@Param('workspaceId') workspaceId: string): Promise<ApiResponse<Task[], ApiError>> {
    return this.tasksService.findAllByWorkspace(workspaceId);
  }

  /**
   * Create a new task
   * POST /tasks
   */
  @Post()
  async createTask(@Body() dto: CreateTaskDto): Promise<ApiResponse<Task, ApiError>> {
    return this.tasksService.create(dto);
  }

  /**
   * Update an existing task
   * PUT /tasks/:id
   */
  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaskDto>,
  ): Promise<ApiResponse<Task, ApiError>> {
    return this.tasksService.updateTask(id, dto);
  }

  /**
   * Delete a task by ID
   * DELETE /tasks/:id
   */
  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<ApiResponse<null, ApiError>> {
    return this.tasksService.delete(id);
  }
}
