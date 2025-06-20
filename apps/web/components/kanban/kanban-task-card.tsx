import React, { useState, useRef } from "react";
import { Task } from "../../../../packages/types/src/dtos/tasks";
import { User } from "@/services/user.service";
import { useDrag } from "react-dnd";
import EditTaskModal from "./edit-task-modal";
import { TaskService } from "@/services/task.service";
import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react"; // Import icons from lucide-react

type KanbanTaskCardProps = {
  task: Task;
  users: User[];
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskRemoved?: (taskId: string) => void; // Add a prop type for the remove callback
};

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
  task,
  users,
  onTaskUpdated,
  onTaskRemoved,
}) => {
  const assignedUsers = users.filter((user) =>
    task.assignedTo.includes(user._id)
  ); // Get all assigned users

  const [{ isDragging }, dragRef] = useDrag({
    type: "TASK",
    item: { id: task._id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const handleUpdate = async (updatedTask: Partial<Task>) => {
    // Call backend API to update the task
    const updated = await TaskService.updateTask(task._id, updatedTask);

    // Update the UI by calling a parent-provided function
    if (onTaskUpdated) {
      onTaskUpdated(updated); // Pass the updated task to the parent
    }
  };

  const handleRemove = async () => {
    await TaskService.deleteTask(task._id); // Call backend API to delete the task
    if (onTaskRemoved) {
      onTaskRemoved(task._id); // Notify the parent to remove the task from the UI
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <div
        ref={combinedRef} // Use combinedRef to resolve TypeScript error
        className="group relative overflow-hidden border-0 bg-card shadow-sm hover:shadow-lg transition-all duration-300 cursor-grab ring-1 ring-border hover:ring-primary rounded-lg p-6 mb-4 w-[320px] h-[220px] flex flex-col justify-between shrink-0"
      >
        <div className="relative flex flex-col gap-4 flex-1 min-h-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 truncate max-w-[170px]">
              {task.title}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                task.priority === "high"
                  ? "bg-red-500 text-white"
                  : task.priority === "medium"
                    ? "bg-yellow-400 text-black"
                    : "bg-green-400 text-black"
              }`}
            >
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </span>
          </div>
          {task.dueDate && (
            <p className="text-xs text-muted-foreground truncate">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}
          {task.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 break-words max-h-[40px] overflow-hidden">
              {task.description}
            </p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="font-medium">Assigned:</span>
              {assignedUsers.length > 0 ? (
                assignedUsers.map((user) => (
                  <span
                    key={user._id}
                    className="text-foreground bg-muted px-2 py-1 rounded-full text-xs truncate max-w-[80px] overflow-hidden"
                    title={user.username}
                  >
                    {user.username}
                  </span>
                ))
              ) : (
                <span className="text-destructive">Unassigned</span>
              )}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            className="text-xs text-white bg-primary px-2 py-1 rounded hover:bg-primary/80 transition-colors flex items-center gap-1"
            onClick={() => setEditModalOpen(true)}
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
          <button
            className="text-xs text-white bg-destructive px-2 py-1 rounded hover:bg-destructive/80 transition-colors flex items-center gap-1"
            onClick={handleRemove}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
        <EditTaskModal
          task={task}
          users={users}
          open={isEditModalOpen}
          onClose={() => setEditModalOpen(false)}
          onUpdate={handleUpdate}
        />
      </div>
    </motion.div>
  );
};

export default KanbanTaskCard;
