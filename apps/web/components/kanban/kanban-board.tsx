import React, { useState, useRef } from "react";
import {
  KanbanColumn,
  Task,
  TaskStatus,
} from "../../../../packages/types/src/dtos/tasks";
import { User } from "@/services/user.service";
import KanbanTaskCard from "./kanban-task-card";
import AddTaskModal from "./task-modal";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TaskService } from "@/services/task.service";
import { TaskPriority } from "../../../../packages/types/src/dtos/tasks/kanban";
import { Plus } from "lucide-react";

type KanbanBoardProps = {
  columns: KanbanColumn[];
  tasks: Task[];
  users: User[];
  onAddTask: (...args: any[]) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  workspaceId: string;
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskRemoved?: (taskId: string) => void; // Add this prop
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  tasks,
  users,
  onAddTask,
  onMoveTask,
  workspaceId,
  onTaskUpdated,
  onTaskRemoved, // Destructure the new prop
}) => {
  const [modalColumn, setModalColumn] = useState<TaskStatus | null>(null); // State for modal column
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false); // State for Add Task Modal

  const divRef = useRef<HTMLDivElement | null>(null); // Define divRef

  // Update handleAddTask to call onAddTask directly
  const handleAddTask = onAddTask;

  // Update handleMoveTask to call onMoveTask directly
  const handleMoveTask = onMoveTask;

  // Update handleTaskUpdated to call onTaskUpdated directly
  const handleTaskUpdated = (updatedTask: Task) => {
    if (onTaskUpdated) onTaskUpdated(updatedTask);
  };

  const handleTaskRemoved = (taskId: string) => {
    if (onTaskRemoved) onTaskRemoved(taskId);
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const [, dragRef] = useDrag({
      type: "TASK",
      item: { id: task._id },
    });

    const combinedDragRef = (node: HTMLDivElement | null) => {
      dragRef(node);
      divRef.current = node;
    };

    return (
      <div
        ref={combinedDragRef}
        className="cursor-grab bg-white shadow rounded-lg p-4 mb-3 hover:shadow-lg transition-shadow duration-200"
      >
        <KanbanTaskCard
          task={task}
          users={users}
          onTaskUpdated={handleTaskUpdated}
          onTaskRemoved={handleTaskRemoved}
        />
      </div>
    );
  };

  const Column: React.FC<{ column: KanbanColumn }> = ({ column }) => {
    const [, dropRef] = useDrop({
      accept: "TASK",
      drop: (item: { id: string }) => {
        handleMoveTask(item.id, column.status);
      },
    });

    const combinedRef = (node: HTMLDivElement | null) => {
      dropRef(node);
      divRef.current = node;
    };

    return (
      <div
        ref={combinedRef}
        className="p-6 mb-4 transition-transform duration-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">{column.title}</h2>
          <button
            className="text-foreground bg-primary px-4 py-2 rounded hover:bg-primary/80 flex items-center gap-1"
            onClick={() => setAddTaskModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          {tasks
            .filter((task) => task.status === column.status)
            .map((task) => (
              <KanbanTaskCard
                key={task._id}
                task={task}
                users={users}
                onTaskUpdated={handleTaskUpdated}
                onTaskRemoved={handleTaskRemoved}
              />
            ))}
        </div>
        <AddTaskModal
          defaultStatus={column.status}
          open={isAddTaskModalOpen}
          onClose={() => setAddTaskModalOpen(false)}
          onAdd={handleAddTask}
          users={users}
        />
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="overflow-x-auto w-full min-w-0">
        <div className="flex flex-nowrap min-w-max gap-4 justify-center bg-background p-6">
          {columns.map((col) => (
            <Column key={col.status} column={col} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;
