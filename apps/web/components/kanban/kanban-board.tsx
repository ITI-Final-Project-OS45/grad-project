import React, { useState } from "react";
import { KanbanColumn, Task, TaskStatus, UserRole } from "@repo/types";
import AddTaskModal from "./task-modal";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TaskListView,
  KanbanUser as TaskListKanbanUser,
} from "./task-list-view";
import EditTaskModal from "./edit-task-modal";
import { TaskDetailModal } from "./task-detail-modal";
import { KanbanColumnComponent } from "./kanban-column";
import { useKanbanTaskGroups } from "@/hooks/use-kanban-task-groups";
import { useModalState } from "@/hooks/use-modal-state";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import { useWorkspacePermissions } from "@/lib/permissions";

// Change User import to a local type for Kanban users (from workspace members)
type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

type KanbanBoardProps = {
  columns: KanbanColumn[];
  tasks: Task[];
  users: KanbanUser[];
  onAddTask: (...args: any[]) => void;
  onMoveTask: (taskId: string, newStatus: TaskStatus) => void;
  workspaceId: string;
  onTaskUpdated?: (updatedTask: Task) => void;
  onTaskRemoved?: (taskId: string) => void;
  currentUserId?: string;
  currentUserRole?: UserRole;
  permissions?: ReturnType<typeof useWorkspacePermissions>;
};

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  columns,
  tasks,
  users,
  onAddTask,
  onMoveTask,
  workspaceId,
  onTaskUpdated,
  onTaskRemoved,
  currentUserId,
  currentUserRole,
  permissions,
}) => {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  // Use custom hooks for better separation of concerns
  const groupedKanbanTasks = useKanbanTaskGroups(tasks);
  const { moveTask } = useDragAndDrop({ tasks, onTaskUpdated });
  const {
    activeModal,
    editTask,
    previewTask,
    addModalStatus,
    modalColumn,
    openEditModal,
    openPreviewModal,
    openAddModal,
    setModalColumn,
    closeEditModal,
    closePreviewModal,
    closeAddModal,
    closeAllModals,
  } = useModalState();

  // Clear modals when switching view modes
  const handleViewModeChange = (mode: "kanban" | "list") => {
    closeAllModals();
    setViewMode(mode);
  };

  // Task event handlers
  const handleTaskUpdated = (updatedTask: Task) => {
    if (onTaskUpdated) onTaskUpdated(updatedTask);
  };

  const handleTaskRemoved = (taskId: string) => {
    if (onTaskRemoved) onTaskRemoved(taskId);
  };

  const handleAddTask = (task: any) => {
    if (onAddTask) {
      const position = addModalStatus
        ? groupedKanbanTasks[addModalStatus].length
        : 0;
      onAddTask({
        ...task,
        status: addModalStatus,
        workspaceId,
        position,
      });
    }
    closeAddModal();
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex items-center justify-end mb-4 gap-2">
        <Button
          variant={viewMode === "kanban" ? "default" : "outline"}
          onClick={() => handleViewModeChange("kanban")}
        >
          Kanban View
        </Button>
        <Button
          variant={viewMode === "list" ? "default" : "outline"}
          onClick={() => handleViewModeChange("list")}
        >
          List View
        </Button>
      </div>

      {viewMode === "kanban" ? (
        <div className="overflow-x-auto w-full min-w-0">
          <div className="flex flex-col sm:flex-row flex-nowrap min-w-0 gap-4 justify-center bg-background dark:bg-background-dark p-2 sm:p-6">
            {columns.map((col) => (
              <KanbanColumnComponent
                key={col.status}
                column={col}
                tasks={groupedKanbanTasks[col.status]}
                users={users}
                modalColumn={modalColumn}
                setModalColumn={setModalColumn}
                onAddTask={onAddTask}
                onMoveTask={onMoveTask}
                onTaskUpdated={handleTaskUpdated}
                onTaskRemoved={handleTaskRemoved}
                onPreview={(task) => openPreviewModal(task)}
                moveTask={moveTask}
                className="bg-card dark:bg-card-dark border border-border dark:border-border-dark rounded-md shadow-md"
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                permissions={permissions}
              />
            ))}
          </div>
        </div>
      ) : (
        <TaskListView
          tasks={tasks}
          users={users as TaskListKanbanUser[]}
          onEdit={openEditModal}
          onPreview={openPreviewModal}
          onDelete={(task) => {
            if (onTaskRemoved) onTaskRemoved(task._id);
          }}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          permissions={permissions}
          renderSectionAction={(status) =>
            permissions?.canCreateTask ? (
              <Button
                size="sm"
                variant="outline"
                className="ml-2"
                onClick={() => openAddModal(status)}
                aria-label={`Add to ${status}`}
              >
                <Plus className="w-4 h-4" />
              </Button>
            ) : null
          }
        />
      )}

      {/* Modals - Move outside view mode condition so they work in both views */}
      {editTask && (
        <EditTaskModal
          task={editTask}
          users={users}
          open={!!editTask}
          onClose={closeEditModal}
          onUpdate={(updatedTask) => {
            if (onTaskUpdated) {
              onTaskUpdated({ ...editTask, ...updatedTask });
            }
            closeEditModal();
          }}
        />
      )}

      <TaskDetailModal
        task={previewTask}
        users={users}
        open={!!previewTask}
        onClose={closePreviewModal}
      />

      {addModalStatus && (
        <AddTaskModal
          defaultStatus={addModalStatus}
          open={!!addModalStatus}
          onClose={closeAddModal}
          onAdd={handleAddTask}
          users={users}
          position={
            addModalStatus ? groupedKanbanTasks[addModalStatus].length : 0
          }
        />
      )}
    </DndProvider>
  );
};

export default KanbanBoard;
