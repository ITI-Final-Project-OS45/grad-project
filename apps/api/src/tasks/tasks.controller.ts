import { Controller, Get, Post, Put, Body, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from '@/../../packages/types/src/dtos/tasks/index';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('workspace/:workspaceId')
  async getTasksByWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.tasksService.findAllByWorkspace(workspaceId);
  }

  @Post()
  async createTask(@Body() dto: CreateTaskDto) {
    console.log('Received payload:', dto);
    return this.tasksService.create(dto);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() dto: Partial<CreateTaskDto>,
  ) {
    return this.tasksService.updateTask(id, dto);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.delete(id); // Ensure this method exists in the service
  }
}
