import React, { useState } from "react";
import {
  Task,
  TaskPriority,
  TaskStatus,
} from "../../../../packages/types/src/dtos/tasks";
import { User } from "@/services/user.service";

type EditTaskModalProps = {
  task: Task;
  users: User[];
  open: boolean;
  onClose: () => void;
  onUpdate: (updatedTask: Partial<Task>) => void;
};

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  task,
  users,
  open,
  onClose,
  onUpdate,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [priority, setPriority] = useState<TaskPriority>(
    task.priority || "medium"
  );
  const [assignedTo, setAssignedTo] = useState<string[]>(task.assignedTo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedTask = {
      ...task,
      title,
      description,
      dueDate,
      priority,
      assignedTo,
    };
    onUpdate(updatedTask); // Update the parent state immediately

    // Trigger a soft update by ensuring the parent component re-renders
    setTitle(updatedTask.title);
    setDescription(updatedTask.description || "");
    setDueDate(updatedTask.dueDate || "");
    setPriority(updatedTask.priority || "medium");
    setAssignedTo(updatedTask.assignedTo);

    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <form
        className="bg-card p-6 rounded shadow-md min-w-[300px]"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold text-foreground mb-4">Edit Task</h2>
        <input
          type="text"
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <textarea
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="date"
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <select
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          multiple
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          value={assignedTo}
          onChange={(e) =>
            setAssignedTo(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
        >
          {users.map((user) => (
            <option key={user._id} value={user._id} className="text-foreground">
              {user.username}
            </option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="bg-muted text-muted-foreground px-4 py-2 rounded hover:bg-muted/80"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/80"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTaskModal;
