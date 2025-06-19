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
  Req,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceDto } from '@repo/types';
import { AuthGuard } from '../guards/auth.guards';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';
// import { WorkspaceAuthGuard } from 'src/guards/workspaceAuth.guard';

@UseGuards(AuthGuard)
@Controller('workspaces')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('')
  createWorkspace(
    @Body() workspaceData: WorkspaceDto,
    @Req() req: RequestWithUser,
  ) {
    return this.workspaceService.createWorkspace(workspaceData, req.userId);
  }

  // @UseGuards(WorkspaceAuthGuard)
  @Get(':id')
  getOneWorkspace(@Param('id') workspaceId: string) {
    return this.workspaceService.getOneWorkspace(workspaceId);
  }

  @Get()
  getAllWorkspacesForUser(@Req() req: RequestWithUser) {
    const userId = req.userId;
    return this.workspaceService.getAllWorkspacesForUser(userId);
  }

  @Patch(':id')
  updateWorkspace(
    @Param('id') workspaceId: string,
    @Body() data: Partial<WorkspaceDto>,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.userId;
    data.createdBy = userId;
    return this.workspaceService.updateWorkspace(workspaceId, data);
  }

  @Delete(':id')
  deleteWorkspace(
    @Param('id') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.workspaceService.deleteWorkspace(workspaceId, req.userId);
  }
}
