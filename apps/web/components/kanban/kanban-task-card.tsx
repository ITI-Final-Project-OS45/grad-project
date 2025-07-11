import React, { useState, useRef } from "react";
import { Task, UserRole } from "@repo/types";
import { useDrag } from "react-dnd";
import EditTaskModal from "./edit-task-modal";
import { TaskService } from "@/services/task.service";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RichTextPreview } from "./rich-text-preview";
import { useWorkspacePermissions } from "@/lib/permissions";

type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

type KanbanTaskCardProps = {
  task: Task;
  users: KanbanUser[];
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskRemoved?: (taskId: string) => void;
  onPreview?: () => void;
  currentUserId?: string;
  currentUserRole?: UserRole;
  permissions?: ReturnType<typeof useWorkspacePermissions>;
};

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  users,
  onTaskUpdated,
  onTaskRemoved,
  onPreview,
  currentUserId,
  currentUserRole,
  permissions,
}) => {
  const assignedUsers = users.filter((user) =>
    task.assignedTo.includes(user._id)
  );

  const [{ isDragging }, dragRef] = useDrag({
    type: "TASK",
    item: { id: task._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleUpdate = async (updatedTask: Partial<Task>) => {
    // Call backend API to update the task
    const updated = await TaskService.updateTask(task._id, updatedTask);
    // Update the UI by calling a parent-provided function
    if (onTaskUpdated && updated.data) {
      onTaskUpdated(updated.data); // Pass the updated task data to the parent
    }
  };

  const handleRemove = async () => {
    if (deleting) return; // Prevent double delete
    setDeleting(true);
    try {
      // Just call the parent's remove handler instead of directly calling the API
      // The parent will handle the API call and error handling
      if (onTaskRemoved) {
        onTaskRemoved(task._id);
      }
    } catch (error) {
      console.error("Failed to delete task:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Create a ref for the div
  const divRef = useRef<HTMLDivElement>(null);

  // Combine dragRef with divRef
  const combinedRef = (node: HTMLDivElement | null) => {
    dragRef(node);
    divRef.current = node;
  };

  return (
    <>
      {/* Card is always rendered, parent removes it after onTaskRemoved */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        layout
        className="h-full"
      >
        <Card
          ref={combinedRef}
          className="group relative overflow-hidden cursor-pointer rounded-xl p-4 w-full h-full flex flex-col justify-between shrink-0 bg-transparent border-0 shadow-none hover:bg-transparent"
          onClick={() => onPreview && onPreview()}
        >
          <div className="relative flex flex-col gap-4 flex-1 min-h-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 truncate max-w-[170px]">
                {task.title}
              </h3>
              <Badge
                variant={
                  task.priority === "high"
                    ? "destructive"
                    : task.priority === "medium"
                      ? "secondary"
                      : "outline"
                }
                className="px-3 py-1 rounded-full text-xs font-medium"
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </Badge>
            </div>
            {task.dueDate && (
              <p className="text-xs text-muted-foreground truncate">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
            {task.description && (
              <div className="text-sm text-muted-foreground line-clamp-3 break-words max-h-[60px] overflow-hidden rich-text-preview">
                <RichTextPreview content={task.description} />
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
              <span className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">Assigned:</span>
                {assignedUsers.length > 0 ? (
                  assignedUsers.map((user) => (
                    <Badge
                      key={user._id}
                      variant="outline"
                      className="truncate max-w-[80px]"
                      title={user.username}
                    >
                      {user.username}
                    </Badge>
                  ))
                ) : (
                  <span className="text-destructive">Unassigned</span>
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 mt-4">
            {/* Only show edit button if user can update task details */}
            {permissions?.canUpdateSpecificTaskDetails(task.assignedTo) && (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditModalOpen(true);
                }}
                className="whitespace-nowrap"
              >
                <Edit className="h-4 w-4" /> Edit
              </Button>
            )}
            {/* Only show delete button if user can delete tasks */}
            {permissions?.canDeleteTask && (
              <Button
                size="sm"
                variant="destructive"
                disabled={deleting}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent Card onClick from firing
                  handleRemove();
                }}
                className="whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            )}
          </div>
          <EditTaskModal
            task={task}
            users={users}
            open={isEditModalOpen}
            onClose={() => setEditModalOpen(false)}
            onUpdate={handleUpdate}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            permissions={permissions}
          />
        </Card>
      </motion.div>
    </>
  );
};

export default KanbanTaskCard;
