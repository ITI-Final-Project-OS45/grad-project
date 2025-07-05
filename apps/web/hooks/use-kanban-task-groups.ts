import { Task, TaskStatus } from "@repo/types";

/**
 * Groups and sorts tasks by status and position for Kanban board.
 * Ensures all statuses are present, even if empty.
 * @param tasks List of tasks
 * @returns Record of status to sorted tasks
 */
export function useKanbanTaskGroups(tasks: Task[]) {
  const allStatuses: TaskStatus[] = ["todo", "in-progress", "done"];
  const statusGroups: Record<TaskStatus, Task[]> = {
    todo: [],
    "in-progress": [],
    done: [],
  };
  tasks.forEach((task) => {
    if (statusGroups[task.status]) {
      statusGroups[task.status].push(task);
    }
  });
  const groupedSorted = Object.fromEntries(
    allStatuses.map((status) => [
      status,
      [...statusGroups[status]].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      ),
    ])
  ) as Record<TaskStatus, Task[]>;
  return groupedSorted;
}
