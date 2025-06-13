import {
  Controller,
  Post,
  Get,
  Body,
  Patch,
  Delete,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceDto } from '@repo/types';
import { AuthGuard } from '../guards/auth.guards';

@UseGuards(AuthGuard)
@Controller('workspaces')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('')
  createWorkspace(@Body() workspaceData: WorkspaceDto) {
    console.log('newwworkspace-->', workspaceData);
    return this.workspaceService.createWorkspace(workspaceData);
  }
  @Get(':id')
  getOneWorkspace(@Param('id') workspaceId: string) {
    return this.workspaceService.getOneWorkspace(workspaceId);
  }

  @Get()
  getAllWorkspacesForUser(@Body('userId') userId: string) {
    return this.workspaceService.getAllWorkspacesForUser(userId);
  }

  @Patch(':id')
  updateWorkspace(
    @Param('id') worksapceId: string,
    @Body() data: Partial<WorkspaceDto>,
  ) {
    return this.workspaceService.updateWorkspace(worksapceId, data);
  }

  @Delete(':id')
  deleteWorkspace(
    @Param('id') workspaceId: string,
    @Body() data: Partial<WorkspaceDto>,
  ) {
    return this.workspaceService.deleteWorkspace(workspaceId, data);
  }
}
