"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { KanbanColumn, Task, TaskStatus, TaskPriority } from "@repo/types";
import { TaskService } from "@/services/task.service";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import KanbanBoard from "@/components/kanban/kanban-board";
import {
  WorkspaceMemberService,
  WorkspaceMember,
} from "@/services/workspace-member.service";
import { useTaskSearch } from "@/hooks/use-task-search";
import { useTaskCrudHandlers } from "@/hooks/use-task-crud-handlers";
import { mapWorkspaceMembersToUsers } from "@/hooks/map-workspace-members-to-users";

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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      TaskService.getTasks(workspaceId),
      WorkspaceMemberService.getAllMembers(workspaceId),
    ]).then(([tasksResponse, membersResponse]) => {
      setTasks(tasksResponse.data ?? []);
      setUsers(mapWorkspaceMembersToUsers(membersResponse.data ?? []));
      setLoading(false);
    });
  }, [workspaceId]);

  const {
    handleAddTask,
    handleMoveTask,
    handleTaskUpdated,
    handleTaskRemoved,
  } = useTaskCrudHandlers({ workspaceId, setTasks, tasks });

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
        <Card className="w-full mb-6 rounded-2xl shadow-md p-4 sm:p-8 bg-card">
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
                className="max-w-xs rounded-lg"
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
        />
      </motion.div>
    </main>
  );
}
