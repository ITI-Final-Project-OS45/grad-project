import { WorkspaceMemberDto } from "../dtos/workspace-members";

export interface WorkspaceResponse {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: WorkspaceMemberDto[];
  createdAt: string;
  updatedAt: string;
  releases?: string[];
}
