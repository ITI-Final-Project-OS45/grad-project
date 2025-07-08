import { useMemo } from "react";
import { Task } from "@repo/types";

export function useTaskSearch(tasks: Task[], search: string) {
  return useMemo(() => {
    if (!search) return tasks;
    const lower = search.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lower) ||
        (task.description && task.description.toLowerCase().includes(lower))
    );
  }, [tasks, search]);
}
