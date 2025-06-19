import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiError, ApiResponse, UserRole } from '@repo/types';
import { WorkspaceMember } from 'src/schemas/workspace-member.schema';
import { WorkspaceMemberService } from './workspace-member.service';

@Controller('workspace-member')
export class WorkspaceMemberController {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  @Post(':id') // workspaceId
  async addMember(
    @Param('id') workspaceId: string,
    @Body('membernameOrEmail') membernameOrEmail: string,
    @Body('role') role: UserRole,
    @Headers('authorization') token: string,
  ): Promise<ApiResponse<WorkspaceMember, ApiError>> {
    return this.workspaceMemberService.addMember(
      workspaceId,
      membernameOrEmail,
      role,
      token,
    );
  }

  //TODO: update member role

  @Patch(':id') // workspaceId
  async updateMember(
    @Param('id') workspaceId: string,
    @Body('membernameOrEmail') membernameOrEmail: string,
    @Body('role') newRole: UserRole,
    @Headers('authorization') token: string,
  ) {
    return this.workspaceMemberService.updateMember(
      workspaceId,
      membernameOrEmail,
      newRole,
      token,
    );
  }

  //TODO: delete member from workspace
  @Delete(':id') // workspaceId
  async deleteMember(
    @Param('id') workspaceId: string,
    @Body('membernameOrEmail') membernameOrEmail: string,
    @Headers('authorization') token: string,
  ) {
    return this.workspaceMemberService.deleteMember(
      workspaceId,
      membernameOrEmail,
      token,
    );
  }

  //TODO: get member by id from workspace
  @Get(':id')
  async getOneWorkspaceMember(
    @Param('id') workspaceId: string,
    @Body('membernameOrEmail') membernameOrEmail: string,
    @Headers('authorization') token: string,
  ) {
    return this.workspaceMemberService.getOneWorkspaceMember(
      workspaceId,
      membernameOrEmail,
      token,
    );
  }

  //TODO: get all members of a workspace
  @Get(':id')
  async getAllWorkspaceMembers(
    @Param('id') workspaceId: string,
    @Headers('authorization') token: string,
  ) {
    return this.workspaceMemberService.getAllWorkspaceMembers(
      workspaceId,
      token,
    );
  }
}
