import React, { useState } from "react";
import { User } from "@/services/user.service";
import {
  KanbanColumn,
  Task,
  TaskStatus,
} from "../../../../packages/types/src/dtos/tasks";
import KanbanTaskCard from "./kanban-task-card";
import AddTaskModal from "./task-modal";
import { useDrag, useDrop } from "react-dnd";

type KanbanColumnProps = {
  column: KanbanColumn;
  tasks: Task[];
  users: User[];
  onAddTask: (task: {
    title: string;
    description?: string;
    assignedTo: string;
    status: TaskStatus;
  }) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
};

const KanbanColumnComponent: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  users,
  onAddTask,
  onMoveTask,
}) => {
  const [modalOpen, setModalOpen] = useState(false);

  const [, dropRef] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => {
      onMoveTask(item.id, column.status);
    },
  });

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    const [, dragRef] = useDrag({
      type: "TASK",
      item: { id: task._id },
    });

    return (
      <div ref={dragRef}>
        <KanbanTaskCard task={task} users={users} />
      </div>
    );
  };

  return (
    <div
      ref={dropRef}
      className="flex flex-col bg-gray-100 rounded-lg shadow-md p-4 w-full sm:w-[350px]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{column.title}</h3>
        <button
          className="bg-blue-500 text-white rounded px-3 py-1 text-sm hover:bg-blue-600 transition-colors"
          onClick={() => setModalOpen(true)}
        >
          + Add
        </button>
      </div>
      <div className="bg-muted/30 rounded-lg min-h-[200px] p-3">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} />
        ))}
      </div>
      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAdd={onAddTask}
        users={users}
        defaultStatus={column.status}
      />
    </div>
  );
};

export default KanbanColumnComponent;
