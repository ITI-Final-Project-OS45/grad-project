import { WorkspaceMemberDto } from "../dtos/workspace-members";
import { ReleaseResponse } from "./release.response";
import { TaskResponse } from "./task.response";
import { DesignResponse } from "./design.response";

export interface WorkspaceResponse {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  members: WorkspaceMemberDto[];
  createdAt: string;
  updatedAt: string;
  releases?: ReleaseResponse[];
  tasks?: TaskResponse[];
  designs?: DesignResponse[];
}
