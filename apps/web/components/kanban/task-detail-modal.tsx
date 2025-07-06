import React from "react";
import { Task } from "@repo/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RichTextPreview } from "./rich-text-preview";

type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

type TaskDetailModalProps = {
  task: Task | null;
  users: KanbanUser[];
  open: boolean;
  onClose: () => void;
};

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  users,
  open,
  onClose,
}) => {
  if (!task) return null;

  const assignedUsers = users.filter((user) =>
    task.assignedTo.includes(user._id)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-hidden p-6 rounded-2xl flex flex-col">
        <DialogTitle className="mb-4 text-xl font-bold shrink-0">
          {task.title}
        </DialogTitle>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          <div className="text-muted-foreground">
            <span className="font-medium">Assigned:</span>{" "}
            {assignedUsers.length > 0 ? (
              assignedUsers
                .map((user) => user.displayName || user.username)
                .join(", ")
            ) : (
              <span className="text-destructive">Unassigned</span>
            )}
          </div>

          <div>
            <span className="font-medium">Description:</span>
            <div className="whitespace-pre-line mt-2 rich-text-preview max-h-60 overflow-y-auto p-3 bg-muted/30 rounded-lg border">
              <RichTextPreview
                content={
                  task.description ||
                  "<span class='italic text-muted-foreground'>No description</span>"
                }
              />
            </div>
          </div>

          {task.dueDate && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">Due:</span>{" "}
              {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Priority:</span>{" "}
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </div>
        </div>

        {/* Fixed close button */}
        <div className="shrink-0 mt-4">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              className="rounded-lg w-full"
            >
              Close
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
