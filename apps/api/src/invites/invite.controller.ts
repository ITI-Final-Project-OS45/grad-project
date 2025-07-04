import {
  Controller,
  Post,
  Patch,
  Param,
  Body,
  Get,
  Req,
  UseGuards,
  SetMetadata,
  Delete,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import { UserRole, WorkspacePermission } from '@repo/types';
import type { RequestWithUser } from 'src/interfaces/request-user.interface';

@Controller('invites')
@UseGuards(AuthGuard)
export class InviteController {
  constructor(private readonly invitesService: InviteService) {}

  // Manager creates invite for a user (by usernameOrEmail) to a workspace
  @Post(':workspaceId')
  @UseGuards(WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MANAGER)
  async createInvite(
    @Param('workspaceId') workspaceId: string,
    @Body('usernameOrEmail') usernameOrEmail: string,
    @Body('role') role: UserRole,
    @Req() req: RequestWithUser,
  ) {
    return this.invitesService.createInvite(
      workspaceId,
      usernameOrEmail,
      req.userId,
      role,
    );
  }

  // User responds to invite (accept/decline)
  @Patch('respond/:inviteId')
  async respondToInvite(
    @Param('inviteId') inviteId: string,
    @Body('action') action: 'accept' | 'decline',
    @Req() req: RequestWithUser,
  ) {
    return this.invitesService.respondToInvite(inviteId, req.userId, action);
  }

  // Get all invites for the current user
  @Get('user')
  async getInvitesForUser(@Req() req: RequestWithUser) {
    return this.invitesService.getInvitesForUser(req.userId);
  }

  // Get all invites for a workspace (manager only)
  @Get('workspace/:workspaceId')
  async getInvitesForWorkspace(@Param('workspaceId') workspaceId: string) {
    return this.invitesService.getInvitesForWorkspace(workspaceId);
  }

  // Delete an invite (manager only)
  @Delete(':inviteId')
  async deleteInvite(
    @Param('inviteId') inviteId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.invitesService.deleteInvite(inviteId, req.userId);
  }
}
