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
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiError,
  ApiResponse,
  UserRole,
  WorkspacePermission,
} from '@repo/types';
import { WorkspaceMember } from 'src/schemas/workspace-member.schema';
import { WorkspaceMemberService } from './workspace-member.service';
import { AuthGuard } from '../guards/auth.guards';
import { WorkspaceAuthorizationGuard } from '../guards/workspace-authorization.guard';

@UseGuards(AuthGuard)
@Controller('workspace-member')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class WorkspaceMemberController {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Post(':id') // workspaceId
  @UseGuards(WorkspaceAuthorizationGuard)
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

  @Patch(':id') // workspaceId
  @UseGuards(WorkspaceAuthorizationGuard)
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

  @Delete(':id') // workspaceId
  @UseGuards(WorkspaceAuthorizationGuard)
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

  @Get(':workspaceId/member/:memberId')
  @UseGuards(WorkspaceAuthorizationGuard)
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

  @Get(':id')
  @UseGuards(WorkspaceAuthorizationGuard)
  @SetMetadata('workspacePermission', WorkspacePermission.MEMBER)
  async getAllWorkspaceMembers(@Param('id') workspaceId: string) {
    return this.workspaceMemberService.getAllWorkspaceMembers(workspaceId);
  }
}
