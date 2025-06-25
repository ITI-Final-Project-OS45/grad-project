import axios from "axios";
import {
  Task,
  TaskStatus,
  TaskPriority,
} from "../../../packages/types/src/dtos/tasks";
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export type CreateTaskData = Partial<Task> & {
  workspaceId: string; // Add workspaceId explicitly
};

export type UpdateTaskData = Partial<CreateTaskData>;

export class TaskService {
  static async createTask(taskData: CreateTaskData): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create task: ${response.statusText}`);
    }

    return response.json(); // Return the created task from the backend
  }

  static async updateTask(id: string, update: UpdateTaskData): Promise<Task> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(update),
    });

    if (!response.ok) {
      throw new Error(`Failed to update task: ${response.statusText}`);
    }

    return response.json();
  }

  static async getTasks(workspaceId: string): Promise<Task[]> {
    const response = await fetch(`${API_URL}/tasks/workspace/${workspaceId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    return response.json();
  }

  static async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${API_URL}/tasks/${taskId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.statusText}`);
    }
  }
}
