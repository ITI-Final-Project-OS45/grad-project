import { useCallback, useRef } from "react";
import { Task, TaskStatus, TaskPriority } from "@repo/types";
import { TaskService } from "@/services/task.service";

export function useTaskCrudHandlers({
  workspaceId,
  setTasks,
  tasks,
}: {
  workspaceId: string;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  tasks: Task[];
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
      let dueDate = task.dueDate;
      if (dueDate) dueDate = new Date(dueDate).toISOString();
      const newTask = await TaskService.createTask({
        ...task,
        dueDate,
        workspaceId,
        position: task.position,
      });
      if (newTask.data) {
        setTasks((prev) => [newTask.data, ...prev]);
      }
    },
    [workspaceId, setTasks]
  );

  const handleMoveTask = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      const task = tasks.find((t) => t._id === taskId);
      if (!task || task.status === newStatus) return;
      await TaskService.updateTask(taskId, { status: newStatus });
      setTasks((prev) => {
        const filteredTasks = prev.filter((t) => t._id !== taskId);
        return [{ ...task, status: newStatus }, ...filteredTasks];
      });
    },
    [tasks, setTasks]
  );

  const handleTaskUpdated = useCallback(
    async (updatedTask: Task) => {
      await TaskService.updateTask(updatedTask._id, updatedTask);
      setTasks((prev) =>
        prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
    },
    [setTasks]
  );

  const handleTaskRemoved = useCallback(
    async (taskId: string) => {
      if (recentlyDeleted.current.has(taskId)) return;
      recentlyDeleted.current.add(taskId);
      // Only remove from UI state, don't call API again since the component already did that
      setTasks((prev) => prev.filter((task) => task._id !== taskId));
      setTimeout(() => recentlyDeleted.current.delete(taskId), 2000);
    },
    [setTasks]
  );

  return {
    handleAddTask,
    handleMoveTask,
    handleTaskUpdated,
    handleTaskRemoved,
  };
}
