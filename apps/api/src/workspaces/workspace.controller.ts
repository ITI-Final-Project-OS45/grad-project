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
  SetMetadata,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceDto } from '@repo/types';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import { WorkspacePermission } from '@repo/types';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';

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
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER)
  getOneWorkspace(@Param('id') workspaceId: string) {
    return this.workspaceService.getOneWorkspace(workspaceId);
  }

  @Get()
  getAllWorkspacesForUser(@Req() req: RequestWithUser) {
    const userId = req.userId;
    return this.workspaceService.getAllWorkspacesForUser(userId);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MANAGER)
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
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MANAGER)
  deleteWorkspace(
    @Param('id') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.workspaceService.deleteWorkspace(workspaceId, req.userId);
  }
}
