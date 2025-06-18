import { WorkspaceResponse } from "./workspace.response";

export interface UserResponse {
  _id: string;
  username: string;
  displayName: string;
  email: string;
  workspaces: WorkspaceResponse[];
  createdAt: string;
  updatedAt: string;
}
