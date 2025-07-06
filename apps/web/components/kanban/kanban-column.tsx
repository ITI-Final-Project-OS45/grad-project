import React, { useRef } from "react";
import { useDrop } from "react-dnd";
import { KanbanColumn, Task, TaskStatus } from "@repo/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import AddTaskModal from "./task-modal";
import { KanbanTaskCardWithDrag } from "./kanban-task-card-with-drag";

type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

type KanbanColumnComponentProps = {
  column: KanbanColumn;
  tasks: Task[];
  users: KanbanUser[];
  modalColumn: TaskStatus | null;
  setModalColumn: (status: TaskStatus | null) => void;
  onAddTask: (...args: any[]) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskRemoved?: (taskId: string) => void;
  onPreview?: (task: Task) => void;
  moveTask: (
    dragIndex: number,
    hoverIndex: number,
    columnStatus: TaskStatus
  ) => void;
};

export const KanbanColumnComponent: React.FC<KanbanColumnComponentProps> = ({
  column,
  tasks,
  users,
  modalColumn,
  setModalColumn,
  onAddTask,
  onMoveTask,
  onTaskUpdated,
  onTaskRemoved,
  onPreview,
  moveTask,
}) => {
  const divRef = useRef<HTMLDivElement | null>(null);

  const [, dropRef] = useDrop({
    accept: "TASK",
    drop: (item: { id: string }) => {
      onMoveTask(item.id, column.status);
    },
  });

  const combinedRef = (node: HTMLDivElement | null) => {
    dropRef(node);
    divRef.current = node;
  };

  const columnTasks = tasks
    .filter((t) => t.status === column.status)
    .sort((a, b) => a.position - b.position);

  return (
    <Card
      ref={combinedRef}
      className="p-4 sm:p-6 mb-4 w-full sm:w-[350px] flex flex-col gap-4 bg-background border border-border shadow-md rounded-2xl min-h-[400px]"
    >
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <span className="text-lg font-bold text-foreground truncate">
          {column.title}
        </span>
        <Dialog
          open={modalColumn === column.status}
          onOpenChange={(open) => setModalColumn(open ? column.status : null)}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="default"
              className="gap-1 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <AddTaskModal
            defaultStatus={column.status}
            open={modalColumn === column.status}
            onClose={() => setModalColumn(null)}
            onAdd={onAddTask}
            users={users}
            position={columnTasks.length}
          />
        </Dialog>
      </div>
      <div className="flex flex-col gap-4 flex-1 min-h-[100px]">
        {columnTasks.map((task, idx) => (
          <KanbanTaskCardWithDrag
            key={task._id}
            task={task}
            index={idx}
            columnStatus={column.status}
            users={users}
            onTaskUpdated={onTaskUpdated}
            onTaskRemoved={onTaskRemoved}
            onPreview={() => onPreview && onPreview(task)}
            moveTask={moveTask}
          />
        ))}
      </div>
    </Card>
  );
};
