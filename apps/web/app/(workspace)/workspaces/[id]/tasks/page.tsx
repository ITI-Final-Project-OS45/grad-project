"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  KanbanColumn,
  Task,
  TaskStatus,
  TaskPriority,
} from "../../../../../../../packages/types/src/dtos/tasks";
import { User, UserService } from "@/services/user.service";
import { TaskService } from "@/services/task.service";
import KanbanBoard from "@/components/kanban/kanban-board";

const columns: KanbanColumn[] = [
  { status: "todo", title: "To Do" },
  { status: "in-progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

export default function TasksPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      TaskService.getTasks(workspaceId),
      UserService.getAllUsers(),
    ]).then(([tasks, users]) => {
      setTasks(tasks);
      setUsers(users);
      setLoading(false);
    });
  }, [workspaceId]);

  const handleAddTask = async (task: {
    title: string;
    description?: string;
    assignedTo: string[];
    status: TaskStatus;
    dueDate?: string;
    priority?: TaskPriority;
  }) => {
    let dueDate = task.dueDate;
    if (dueDate) {
      dueDate = new Date(dueDate).toISOString();
    }
    const newTask = await TaskService.createTask({
      ...task,
      dueDate,
      workspaceId, // Ensure workspaceId is passed here
    });
    setTasks((prev) => [newTask, ...prev]); // Add the new task at the beginning
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === newStatus) return;
    const updatedTask = await TaskService.updateTask(taskId, {
      status: newStatus,
    });
    setTasks((prev) => {
      const filteredTasks = prev.filter((t) => t._id !== taskId);
      return [{ ...task, status: newStatus }, ...filteredTasks]; // Move the task to the beginning
    });
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
  };

  const handleTaskRemoved = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task._id !== taskId));
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <div className="text-lg font-semibold text-foreground">
          Loading Kanban...
        </div>
      </div>
    );

  return (
    <main className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-background">
      <div className="flex flex-col items-center bg-card shadow rounded-lg p-6 overflow-x-auto">
        <div className="flex flex-col items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Task Management Board
          </h1>
          <p className="text-muted-foreground text-center">
            Manage tasks for your workspace efficiently.
          </p>
        </div>
        <KanbanBoard
          columns={columns}
          tasks={tasks}
          users={users}
          onAddTask={handleAddTask}
          onMoveTask={handleMoveTask}
          workspaceId={workspaceId}
          onTaskUpdated={handleTaskUpdated}
          onTaskRemoved={handleTaskRemoved}
        />
      </div>
    </main>
  );
}
