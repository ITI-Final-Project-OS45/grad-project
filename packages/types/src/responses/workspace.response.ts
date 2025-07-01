import { WorkspaceMemberDto } from "../dtos/workspace-members";
import { ReleaseResponse } from "./release.response";

export interface WorkspaceResponse {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: WorkspaceMemberDto[];
  createdAt: string;
  updatedAt: string;
  releases?: ReleaseResponse[];
}
