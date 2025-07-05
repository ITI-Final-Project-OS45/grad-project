import { useCallback } from "react";
import { Task, TaskStatus } from "@repo/types";
import { TaskService } from "@/services/task.service";

export interface UseDragAndDropReturn {
  moveTask: (
    dragIndex: number,
    hoverIndex: number,
    columnStatus: TaskStatus
  ) => void;
}

export const useDragAndDrop = ({
  tasks,
  onTaskUpdated,
}: {
  tasks: Task[];
  onTaskUpdated?: (updatedTask: Task) => void;
}): UseDragAndDropReturn => {
  const moveTask = useCallback(
    (dragIndex: number, hoverIndex: number, columnStatus: TaskStatus) => {
      // Find all tasks in this column, sorted by position
      const columnTasks = tasks
        .filter((t) => t.status === columnStatus)
        .sort((a, b) => a.position - b.position);

      const dragTask = columnTasks[dragIndex];
      if (!dragTask) return;

      // Remove dragTask from its old position
      columnTasks.splice(dragIndex, 1);
      // Insert dragTask at the new position
      columnTasks.splice(hoverIndex, 0, dragTask);

      // Reassign positions and persist to backend
      columnTasks.forEach((task, idx) => {
        if (task.position !== idx) {
          task.position = idx;
          TaskService.updateTask(task._id, {
            position: idx,
            status: columnStatus,
          });
          if (onTaskUpdated) {
            onTaskUpdated({ ...task });
          }
        }
      });
    },
    [tasks, onTaskUpdated]
  );

  return { moveTask };
};
