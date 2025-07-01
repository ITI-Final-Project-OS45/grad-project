/**
 * Task Service
 * ============
 *
 * Handles all task-related API operations including:
 * - Create task
 * - Update task
 * - Get tasks by workspace
 * - Delete task
 *
 * This service maps frontend data to the exact API format
 * expected by the NestJS backend and transforms responses back
 * to frontend-compatible formats.
 *
 * API Endpoints:
 * - POST /tasks                  - Create task
 * - PUT /tasks/:id               - Update task
 * - GET /tasks/workspace/:id     - Get tasks by workspace
 * - DELETE /tasks/:id            - Delete task
 *
 */
import { apiClient } from "@/lib/axios";
import {
  ApiResponse,
  ApiError,
  Task,
  TaskStatus,
  TaskPriority,
} from "@repo/types";

export type CreateTaskData = Partial<Task> & {
  workspaceId: string;
};

export type UpdateTaskData = Partial<CreateTaskData>;

export class TaskService {
  /**
   * API endpoint definitions for task operations
   */
  private static readonly ENDPOINTS = {
    TASKS: "/tasks",
    TASK_BY_ID: (id: string) => `/tasks/${id}`,
    TASKS_BY_WORKSPACE: (workspaceId: string) =>
      `/tasks/workspace/${workspaceId}`,
  } as const;

  /**
   * Create a new task
   * Maps to POST /tasks
   */
  static async createTask(
    taskData: CreateTaskData
  ): Promise<ApiResponse<Task, ApiError>> {
    return apiClient.post<Task>(TaskService.ENDPOINTS.TASKS, taskData);
  }

  /**
   * Update an existing task
   * Maps to PUT /tasks/:id
   */
  static async updateTask(
    id: string,
    update: UpdateTaskData
  ): Promise<ApiResponse<Task, ApiError>> {
    return apiClient.put<Task>(TaskService.ENDPOINTS.TASK_BY_ID(id), update);
  }

  /**
   * Get all tasks for a workspace
   * Maps to GET /tasks/workspace/:id
   */
  static async getTasks(
    workspaceId: string
  ): Promise<ApiResponse<Task[], ApiError>> {
    return apiClient.get<Task[]>(
      TaskService.ENDPOINTS.TASKS_BY_WORKSPACE(workspaceId)
    );
  }

  /**
   * Delete a task by ID
   * Maps to DELETE /tasks/:id
   */
  static async deleteTask(
    taskId: string
  ): Promise<ApiResponse<null, ApiError>> {
    return apiClient.delete<null>(TaskService.ENDPOINTS.TASK_BY_ID(taskId));
  }
}
