import React, { useState } from "react";
import { TaskStatus, TaskPriority } from "@repo/types";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

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
    position?: number; // <-- allow position as a prop
  }) => void;
  users: KanbanUser[];
  defaultStatus: TaskStatus;
  position?: number; // <-- allow position as a prop
};

const AddTaskModal: React.FC<AddTaskModalProps> = ({
  open,
  onClose,
  onAdd,
  users,
  defaultStatus,
  position, // <-- accept position
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState<string[]>([]); // Change to an array
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [error, setError] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");

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
      ...(typeof position === "number" ? { position } : {}), // <-- always include position if provided
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-4 sm:p-6 rounded-2xl overflow-y-auto max-h-[90vh]">
        <DialogTitle className="mb-2 text-xl font-bold">Add Task</DialogTitle>
        {error && <div className="text-destructive mb-2">{error}</div>}
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="rounded-lg"
          />
          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg min-h-[60px] break-words whitespace-pre-line resize-y max-h-40 overflow-y-auto"
            style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
          />
          <label className="text-sm font-medium">Assign to</label>
          <Input
            placeholder="Search members..."
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            className="rounded-lg mb-2"
          />
          <div
            className={`flex flex-col gap-2 ${
              users.filter((user) =>
                (user.displayName || user.username)
                  .toLowerCase()
                  .includes(memberSearch.toLowerCase())
              ).length > 10
                ? "max-h-40 overflow-y-auto"
                : ""
            } rounded-lg border border-input bg-input p-2 mb-2`}
          >
            {users
              .filter((user) =>
                (user.displayName || user.username)
                  .toLowerCase()
                  .includes(memberSearch.toLowerCase())
              )
              .map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={assignedTo.includes(user._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignedTo([...assignedTo, user._id]);
                      } else {
                        setAssignedTo(
                          assignedTo.filter((id) => id !== user._id)
                        );
                      }
                    }}
                    className="accent-primary rounded"
                  />
                  <span className="text-foreground text-sm">
                    {user.displayName || user.username}
                  </span>
                </label>
              ))}
            {users.filter((user) =>
              (user.displayName || user.username)
                .toLowerCase()
                .includes(memberSearch.toLowerCase())
            ).length === 0 && (
              <span className="text-muted-foreground text-xs px-2">
                No members found.
              </span>
            )}
          </div>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
            className="rounded-lg"
          />
          <label className="text-sm font-medium">Priority</label>
          <select
            className="border border-input bg-input text-foreground p-2 mb-2 w-full rounded-lg"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <div className="flex justify-end gap-2 mt-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary" className="rounded-lg">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="default"
              disabled={!title || !dueDate}
              className="rounded-lg"
            >
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskModal;
