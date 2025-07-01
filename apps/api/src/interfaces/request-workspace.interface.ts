import { Request } from 'express';
import { UserRole } from '@repo/types';

export interface WorkspaceRequest extends Request {
  userId?: string;
  workspaceMemberRole?: UserRole;
  workspace?: any;
  params: Record<string, any>;
  body: Record<string, any>;
}
