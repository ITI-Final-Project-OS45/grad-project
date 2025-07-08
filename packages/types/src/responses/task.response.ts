import { TaskStatus, TaskPriority } from "../dtos/tasks";

export interface TaskResponse {
  _id: string;
  title: string;
  description?: string;
  assignedTo: string[];
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  position: number;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}
