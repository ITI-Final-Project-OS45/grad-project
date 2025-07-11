import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Task, TaskStatus, UserRole } from "@repo/types";
import KanbanTaskCard from "./kanban-task-card";
import { useWorkspacePermissions } from "@/lib/permissions";

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
  currentUserId?: string;
  currentUserRole?: UserRole;
  permissions?: ReturnType<typeof useWorkspacePermissions>;
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
  currentUserId,
  currentUserRole,
  permissions,
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
      className="group cursor-grab bg-gradient-to-br from-card/95 to-card/98 dark:from-card/90 dark:to-card/95 shadow-md dark:shadow-lg dark:shadow-black/20 hover:shadow-xl hover:shadow-primary/15 dark:hover:shadow-primary/10 rounded-2xl border border-border/60 dark:border-border/80 hover:border-primary/50 dark:hover:border-primary/70 transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 backdrop-blur-sm p-4 mb-3"
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
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        permissions={permissions}
      />
    </div>
  );
};
