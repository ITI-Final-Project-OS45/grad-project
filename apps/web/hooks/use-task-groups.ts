import { Task, TaskStatus } from "@repo/types";

/**
 * Groups and sorts tasks by status and priority.
 * Ensures all statuses are present, even if empty.
 * @param tasks List of tasks
 * @returns Record of status to sorted tasks
 */
export function useTaskGroups(tasks: Task[]) {
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
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const groupedSorted = Object.fromEntries(
    allStatuses.map((status) => [
      status,
      [...statusGroups[status]].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      ),
    ])
  ) as Record<TaskStatus, Task[]>;
  return groupedSorted;
}
