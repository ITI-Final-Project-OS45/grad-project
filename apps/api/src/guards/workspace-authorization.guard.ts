import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Workspace, WorkspaceDocument } from '../schemas/workspace.schema';
import { UserRole } from '@repo/types';
import { WorkspaceRequest } from 'src/interfaces/request-workspace.interface';
import { WorkspacePermission } from '@repo/types';
import { WorkspaceGuardOptions } from 'src/interfaces/workspace-guard-options.interface';

@Injectable()
export class WorkspaceAuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectModel(Workspace.name)
    private readonly workspaceModel: Model<WorkspaceDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<WorkspacePermission>(
      'workspacePermission',
      context.getHandler(),
    );
    const guardOptions =
      this.reflector.get<WorkspaceGuardOptions>(
        'workspaceGuardOptions',
        context.getHandler(),
      ) || {};

    const request = context.switchToHttp().getRequest<WorkspaceRequest>();
    const userId = request.userId;

    // Support flexible workspace id param key
    const params = request.params || {};
    const workspaceId: string | undefined =
      (params[guardOptions.workspaceIdParamKey || 'id'] as
        | string
        | undefined) ||
      (params['workspaceId'] as string | undefined) ||
      (params['id'] as string | undefined);

    if (!workspaceId || !Types.ObjectId.isValid(workspaceId)) {
      throw new ForbiddenException('Invalid workspace id');
    }
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const workspace = await this.workspaceModel.findById(workspaceId).lean();
    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    type WorkspaceMember = {
      userId: Types.ObjectId | string;
      role: UserRole;
      [key: string]: any;
    };

    const members: WorkspaceMember[] = Array.isArray(workspace.members)
      ? workspace.members
      : [];
    const member = members.find((m) =>
      m &&
      m.userId &&
      typeof m.userId === 'object' &&
      typeof m.userId.toString === 'function'
        ? m.userId.toString() === userId
        : m.userId === userId,
    );
    if (!member) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // Attach member role to request for downstream use
    request.workspaceMemberRole = member.role;
    request.workspace = workspace;

    // Flexible user id for self checks
    const targetUserId: string | undefined =
      (guardOptions.userIdParamKey &&
      typeof params[guardOptions.userIdParamKey] === 'string'
        ? (params[guardOptions.userIdParamKey] as string)
        : undefined) ||
      (guardOptions.userIdBodyKey &&
      typeof request.body?.[guardOptions.userIdBodyKey] === 'string'
        ? (request.body[guardOptions.userIdBodyKey] as string)
        : undefined);

    // Permission checks
    switch (requiredPermission) {
      case WorkspacePermission.MEMBER:
        return true;
      case WorkspacePermission.MANAGER:
        if (member.role !== UserRole.Manager) {
          throw new ForbiddenException('You are not a manager');
        }
        return true;
      case WorkspacePermission.SELF_OR_MANAGER:
        if (member.role === UserRole.Manager || userId === targetUserId) {
          return true;
        }
        throw new ForbiddenException('You are not authorized');
      default:
        return true;
    }
  }
}
