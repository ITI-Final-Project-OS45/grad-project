import React from "react";
import { Task, TaskStatus } from "@repo/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextPreview } from "./rich-text-preview";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useTaskGroups } from "@/hooks/use-task-groups";

// Define KanbanUser type locally for type safety
export type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

interface TaskListViewProps {
  tasks: Task[];
  users: KanbanUser[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onPreview: (task: Task) => void;
  renderSectionAction?: (status: TaskStatus) => React.ReactNode;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  users,
  onEdit,
  onDelete,
  onPreview,
  renderSectionAction,
}) => {
  const groupedSorted = useTaskGroups(tasks);
  const allStatuses: TaskStatus[] = ["todo", "in-progress", "done"];

  return (
    <div className="space-y-8">
      {allStatuses.map((status) => {
        const sortedTasks = groupedSorted[status] || [];
        return (
          <div key={status}>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="uppercase tracking-wide">
                {status.replace(/-/g, " ")}
              </Badge>
              <span className="text-xs text-muted-foreground">
                ({sortedTasks.length})
              </span>
              {renderSectionAction && renderSectionAction(status)}
            </div>
            <div className="w-full">
              <div className="flex flex-col divide-y rounded-xl border bg-card overflow-hidden shadow-sm">
                <div className="hidden sm:grid grid-cols-6 bg-muted text-xs text-muted-foreground font-semibold">
                  <div className="p-2 text-left col-span-2">
                    Title & Description
                  </div>
                  <div className="p-2 text-left">Assigned</div>
                  <div className="p-2 text-left">Due</div>
                  <div className="p-2 text-left">Priority</div>
                  <div className="p-2 text-left">Actions</div>
                </div>
                {sortedTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-xs sm:text-sm">
                    <span>No tasks so far</span>
                  </div>
                ) : (
                  sortedTasks.map((task) => {
                    const assignedUsers = users.filter((u) =>
                      task.assignedTo.includes(u._id)
                    );
                    const preview = task.description
                      ? task.description.replace(/<[^>]+>/g, "").slice(0, 80) +
                        (task.description.length > 80 ? "..." : "")
                      : "No description";
                    return (
                      <div
                        key={task._id}
                        className="group grid grid-cols-2 sm:grid-cols-6 items-start gap-2 px-2 py-3 hover:bg-muted/50 transition-colors cursor-pointer text-xs sm:text-sm"
                        onClick={() => onPreview(task)}
                      >
                        <div className="col-span-2 flex flex-col min-w-0">
                          <span className="font-medium truncate text-foreground mb-1">
                            {task.title}
                          </span>
                          <span className="text-muted-foreground truncate break-words max-w-full">
                            {preview}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 items-center">
                          {assignedUsers.length > 0 ? (
                            assignedUsers.map((u) => (
                              <Badge
                                key={u._id}
                                variant="outline"
                                className="truncate max-w-[80px] px-1"
                                title={u.username}
                              >
                                {u.username.length > 10
                                  ? u.username.slice(0, 9) + "…"
                                  : u.username}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-destructive text-xs">
                              Unassigned
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString()
                            : "-"}
                        </div>
                        <div>
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)}
                          </Badge>
                        </div>
                        <div
                          className="flex gap-2 flex-wrap z-10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onEdit(task)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(task);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
