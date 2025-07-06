export type TaskStatus = "todo" | "in-progress" | "done";
export type KanbanColumn = {
  status: TaskStatus;
  title: string;
};

export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  _id: string;
  title: string;
  description?: string;
  assignedTo: string[];
  status: TaskStatus;
  priority: TaskPriority; // Add priority property
  dueDate?: string;
  position: number; // Add position for ordering
};
