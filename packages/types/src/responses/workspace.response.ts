export interface WorkspaceResponse {
  _id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  releases?: string[];
}
