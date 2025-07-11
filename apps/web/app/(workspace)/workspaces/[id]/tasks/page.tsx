"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { KanbanColumn, Task, TaskStatus, TaskPriority } from "@repo/types";
import { TaskService } from "@/services/task.service";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X } from "lucide-react";
import KanbanBoard from "@/components/kanban/kanban-board";
import {
  WorkspaceMemberService,
  WorkspaceMember,
} from "@/services/workspace-member.service";
import { useTaskSearch } from "@/hooks/use-task-search";
import { useTaskCrudHandlers } from "@/hooks/use-task-crud-handlers";
import { mapWorkspaceMembersToUsers } from "@/hooks/map-workspace-members-to-users";
import { useWorkspacePermissions } from "@/lib/permissions";
import { useUser } from "@/hooks/use-user";
import { useWorkspaceById } from "@/hooks/use-workspace";

const columns: KanbanColumn[] = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

export default function TasksPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Will map from workspace members
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Get workspace and current user context
  const { data: workspace } = useWorkspaceById(workspaceId);
  const { currentUser } = useUser();
  const currentUserId = currentUser?.data?._id;
  const currentUserMember = workspaceMembers.find(
    (m) => m.userId._id === currentUserId
  );
  const currentUserRole = currentUserMember?.role;

  // Get permissions
  const permissions = useWorkspacePermissions(
    currentUserId,
    currentUserRole,
    workspace?.createdBy
  );

  useEffect(() => {
    setLoading(true);
    Promise.all([
      TaskService.getTasks(workspaceId),
      WorkspaceMemberService.getAllMembers(workspaceId),
    ]).then(([tasksResponse, membersResponse]) => {
      setTasks(tasksResponse.data ?? []);
      const members = membersResponse.data ?? [];
      setWorkspaceMembers(members);
      setUsers(mapWorkspaceMembersToUsers(members));
      setLoading(false);
    });
  }, [workspaceId]);

  const {
    handleAddTask,
    handleMoveTask,
    handleTaskUpdated,
    handleTaskRemoved,
  } = useTaskCrudHandlers({
    workspaceId,
    setTasks,
    tasks,
    onError: setError,
  });

  const filteredTasks = useTaskSearch(tasks, search);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-lg font-semibold text-foreground">
          Loading Kanban...
        </div>
      </div>
    );

  return (
    <main className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-background px-2 sm:px-0">
      <motion.div
        className="flex flex-col items-center w-full max-w-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {error && (
          <Alert className="w-full mb-4 border-destructive/30 bg-destructive/5 dark:bg-destructive/10 backdrop-blur-sm">
            <AlertDescription className="flex items-center justify-between">
              <span className="text-destructive dark:text-destructive-foreground">
                {error}
              </span>
              <button
                onClick={() => setError(null)}
                className="ml-2 hover:opacity-70 text-destructive dark:text-destructive-foreground"
              >
                <X size={16} />
              </button>
            </AlertDescription>
          </Alert>
        )}

        <Card className="w-full mb-6 rounded-2xl shadow-lg border-border/20 bg-card/98 backdrop-blur-sm p-4 sm:p-8 dark:border-border/10 dark:bg-card/95">
          <CardHeader className="flex flex-col items-center">
            <CardTitle className="text-3xl font-bold text-foreground mb-2 text-center">
              Task Management Board
            </CardTitle>
            <p className="text-muted-foreground text-center mb-4">
              Manage tasks for your workspace efficiently.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-xs rounded-lg border-border/20 bg-background/60 dark:border-border/10 dark:bg-background/40"
              />
            </div>
          </CardHeader>
        </Card>
        <KanbanBoard
          columns={columns}
          tasks={filteredTasks}
          users={users}
          onAddTask={handleAddTask}
          onMoveTask={handleMoveTask}
          workspaceId={workspaceId}
          onTaskUpdated={handleTaskUpdated}
          onTaskRemoved={handleTaskRemoved}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          permissions={permissions}
        />
      </motion.div>
    </main>
  );
}
