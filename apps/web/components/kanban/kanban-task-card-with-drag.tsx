import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Task, TaskStatus } from "@repo/types";
import KanbanTaskCard from "./kanban-task-card";

type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

type KanbanTaskCardWithDragProps = {
  task: Task;
  index: number;
  columnStatus: TaskStatus;
  users: KanbanUser[];
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskRemoved?: (taskId: string) => void;
  onPreview?: () => void;
  moveTask: (
    dragIndex: number,
    hoverIndex: number,
    columnStatus: TaskStatus
  ) => void;
};

export const KanbanTaskCardWithDrag: React.FC<KanbanTaskCardWithDragProps> = ({
  task,
  index,
  columnStatus,
  users,
  onTaskUpdated,
  onTaskRemoved,
  onPreview,
  moveTask,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop({
    accept: "TASK",
    hover(item: { id: string; index: number; status: TaskStatus }, monitor) {
      if (!ref.current) return;
      if (item.index === index && item.status === columnStatus) return;

      moveTask(item.index, index, columnStatus);
      item.index = index;
      item.status = columnStatus;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { id: task._id, index, status: columnStatus },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="cursor-grab bg-white shadow rounded-xl p-4 mb-3 hover:shadow-lg transition-shadow duration-200 flex flex-col"
      style={{
        minHeight: "unset",
        height: "auto",
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <KanbanTaskCard
        task={task}
        users={users}
        onTaskUpdated={onTaskUpdated}
        onTaskRemoved={onTaskRemoved}
        onPreview={onPreview}
      />
    </div>
  );
};
