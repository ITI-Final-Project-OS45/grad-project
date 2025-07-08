import { useCallback, useRef } from "react";
import { Task, TaskStatus, TaskPriority } from "@repo/types";
import { TaskService } from "@/services/task.service";
import { getErrorMessageWithSuggestion } from "@/lib/error-handling";

export function useTaskCrudHandlers({
  workspaceId,
  setTasks,
  tasks,
  onError,
}: {
  workspaceId: string;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
  onError?: (message: string) => void;
}) {
  const recentlyDeleted = useRef<Set<string>>(new Set());

  const handleAddTask = useCallback(
    async (task: {
      title: string;
      description?: string;
      assignedTo: string[];
      status: TaskStatus;
      dueDate?: string;
      priority?: TaskPriority;
      position: number;
    }) => {
      try {
        let dueDate = task.dueDate;
        if (dueDate) dueDate = new Date(dueDate).toISOString();

        const response = await TaskService.createTask({
          ...task,
          dueDate,
          workspaceId,
          position: task.position,
        });

        if (response.success && response.data) {
          setTasks((prev) => [response.data, ...prev]);
        } else if (!response.success && response.error) {
          const errorMessage = getErrorMessageWithSuggestion(response.error);
          onError?.(errorMessage);
        }
      } catch (error) {
        onError?.("Failed to create task. Please try again.");
        console.error("Failed to create task:", error);
      }
    },
    [workspaceId, setTasks, onError]
  );

  const handleMoveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      try {
        const task = tasks.find((t) => t._id === taskId);
        if (!task || task.status === newStatus) return;

        const response = await TaskService.updateTask(taskId, {
          status: newStatus,
        });

        if (response.success) {
          setTasks((prev) => {
            const filteredTasks = prev.filter((t) => t._id !== taskId);
            return [{ ...task, status: newStatus }, ...filteredTasks];
          });
        } else if (!response.success && response.error) {
          const errorMessage = getErrorMessageWithSuggestion(response.error);
          onError?.(errorMessage);
        }
      } catch (error) {
        onError?.("Failed to move task. Please try again.");
        console.error("Failed to move task:", error);
      }
    },
    [tasks, setTasks, onError]
  );

  const handleTaskUpdated = useCallback(
    async (updatedTask: Task) => {
      try {
        const response = await TaskService.updateTask(
          updatedTask._id,
          updatedTask
        );

        if (response.success) {
          setTasks((prev) =>
            prev.map((task) =>
              task._id === updatedTask._id ? updatedTask : task
            )
          );
        } else if (!response.success && response.error) {
          const errorMessage = getErrorMessageWithSuggestion(response.error);
          onError?.(errorMessage);
        }
      } catch (error) {
        onError?.("Failed to update task. Please try again.");
        console.error("Failed to update task:", error);
      }
    },
    [setTasks, onError]
  );

  const handleTaskRemoved = useCallback(
    async (taskId: string) => {
      if (recentlyDeleted.current.has(taskId)) return;
      recentlyDeleted.current.add(taskId);

      try {
        const response = await TaskService.deleteTask(taskId);

        if (response.success) {
          setTasks((prev) => prev.filter((task) => task._id !== taskId));
        } else if (!response.success && response.error) {
          const errorMessage = getErrorMessageWithSuggestion(response.error);
          onError?.(errorMessage);
          // Don't remove from UI if deletion failed
          recentlyDeleted.current.delete(taskId);
          return;
        }
      } catch (error) {
        onError?.("Failed to delete task. Please try again.");
        console.error("Failed to delete task:", error);
        // Don't remove from UI if deletion failed
        recentlyDeleted.current.delete(taskId);
        return;
      }

      setTimeout(() => recentlyDeleted.current.delete(taskId), 2000);
    },
    [setTasks, onError]
  );

  return {
    handleAddTask,
    handleMoveTask,
    handleTaskUpdated,
    handleTaskRemoved,
  };
}
