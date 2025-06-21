import React, { useState } from "react";
import { User } from "@/services/user.service";
import {
  TaskStatus,
  TaskPriority,
} from "../../../../packages/types/src/dtos/tasks";

type AddTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (task: {
    title: string;
    description?: string;
    assignedTo: string[]; // Change to string array
    status: TaskStatus;
    dueDate?: string;
    priority?: TaskPriority;
  }) => void;
  users: User[];
  defaultStatus: TaskStatus;
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onClose,
  onAdd,
  users,
  defaultStatus,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]); // Change to an array
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (assignedTo.length === 0) {
      setError("At least one user must be assigned.");
      return;
    }

    setError(null);
    onAdd({
      title,
      description,
      assignedTo, // Pass array of user IDs
      status,
      dueDate,
      priority,
    });
    setTitle("");
    setDescription("");
    setAssignedTo([]);
    setStatus(defaultStatus);
    setDueDate("");
    setPriority("medium");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
      <form
        className="bg-card p-6 rounded shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold text-foreground mb-4">Add Task</h2>
        {error && <div className="text-destructive mb-2">{error}</div>}
        <input
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
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
        <input
          type="date"
          className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          required
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
            className={`px-4 py-2 rounded ${
              title && dueDate
                ? "bg-primary text-primary-foreground hover:bg-primary/80"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
            disabled={!title || !dueDate} // Disable if title or dueDate is missing
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskModal;
