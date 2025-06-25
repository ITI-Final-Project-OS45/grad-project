import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiError, ApiResponse, UserRole } from '@repo/types';
import { WorkspaceMember } from 'src/schemas/workspace-member.schema';
import { WorkspaceMemberService } from './workspace-member.service';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';
import { WorkspacePermission } from '@repo/types';

@Controller('workspace-member')
export class WorkspaceMemberController {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Post(':id') // workspaceId
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MANAGER)
  async addMember(
    @Param('id') workspaceId: string,
    @Body('membernameOrEmail') membernameOrEmail: string,
    @Body('role') role: UserRole,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    return this.workspaceMemberService.addMember(
      workspaceId,
      membernameOrEmail,
      role,
    );
  }

  //TODO: update member role

  @Patch(':id') // workspaceId
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MANAGER)
  @SetMetadata('workspaceGuardOptions', {
    workspaceIdParamKey: 'id',
    userIdBodyKey: 'membernameOrEmail',
  })
  async updateMember(
    @Param('id') workspaceId: string,
    @Body('membernameOrEmail') membernameOrEmail: string,
    @Body('role') newRole: UserRole,
  ) {
    // Optionally, pass req.userId for self-update logic
    return this.workspaceMemberService.updateMember(
      workspaceId,
      membernameOrEmail,
      newRole,
    );
  }

  //TODO: delete member from workspace
  @Delete(':id') // workspaceId
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MANAGER)
  async deleteMember(
    @Param('id') workspaceId: string,
    @Body('membernameOrEmail') membernameOrEmail: string,
  ) {
    return this.workspaceMemberService.deleteMember(
      workspaceId,
      membernameOrEmail,
    );
  }

  //TODO: get member by id from workspace
  @Get(':workspaceId/member/:memberId')
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER)
  async getOneMemberByWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.workspaceMemberService.getOneMemberByWorkspace(
      workspaceId,
      memberId,
    );
  }

  //TODO: get all members of a workspace
  @Get(':id')
  @UseGuards(AuthGuard, WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER)
  async getAllWorkspaceMembers(@Param('id') workspaceId: string) {
    return this.workspaceMemberService.getAllWorkspaceMembers(workspaceId);
  }
}
