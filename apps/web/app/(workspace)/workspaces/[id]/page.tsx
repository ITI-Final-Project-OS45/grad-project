"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { CheckSquare, FileText, Palette, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceById } from "@/hooks/use-workspace";
import { WorkspaceHeader } from "@/components/workspace/workspace-header";
import { WorkspaceStats } from "@/components/workspace/workspace-stats";
import { WorkspaceProgress } from "@/components/workspace/workspace-progress";
import { WorkspaceFeatureCard } from "@/components/workspace/workspace-feature-card";
import { WorkspaceQuickActions } from "@/components/workspace/workspace-quick-actions";
import { WorkspaceLoading } from "@/components/workspace/workspace-loading";
import { WorkspaceError } from "@/components/workspace/workspace-error";
import type { WorkspaceStats as WorkspaceStatsType, FeatureCard } from "@/types/workspace.type";

const featureCards: FeatureCard[] = [
  {
    title: "Project Requirements",
    description: "Create and manage project requirements with collaborative documentation",
    icon: FileText,
    href: "/prd",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/30 dark:to-indigo-950/30",
    borderColor: "border-blue-200/50 dark:border-blue-800/50",
    features: ["Markdown Editor", "Version Control", "PDF Export", "Team Collaboration"],
  },
  {
    title: "Task Management",
    description: "Organize tasks and track progress with intuitive workflow management",
    icon: CheckSquare,
    href: "/tasks",
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-gradient-to-br from-emerald-50 to-green-100 dark:from-emerald-950/30 dark:to-green-950/30",
    borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
    features: ["Kanban Board", "Task Assignment", "Due Dates", "Priority Management"],
  },
  {
    title: "Design Assets",
    description: "Store and collaborate on design files with version control",
    icon: Palette,
    href: "/designs",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30",
    borderColor: "border-purple-200/50 dark:border-purple-800/50",
    features: ["File Upload", "Version History", "Team Sharing", "Asset Organization"],
  },
  {
    title: "Release Management",
    description: "Plan and coordinate product releases with deployment tracking",
    icon: Rocket,
    href: "/releases",
    color: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-gradient-to-br from-orange-50 to-red-100 dark:from-orange-950/30 dark:to-red-950/30",
    borderColor: "border-orange-200/50 dark:border-orange-800/50",
    features: ["Release Planning", "Deployment Tracking", "Version Control", "Release Notes"],
  },
];

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;

  const { data: workspace, isLoading: workspaceLoading, error: workspaceError } = useWorkspaceById(workspaceId);

  const stats: WorkspaceStatsType = useMemo(() => {
    if (!workspace)
      return {
        totalTasks: 0,
        completedTasks: 0,
        totalDesigns: 0,
        totalMembers: 0,
        totalReleases: 0,
        activeReleases: 0,
      };

    const releases = workspace.releases || [];
    const tasks = workspace.tasks || [];
    const designs = workspace.designs || [];
    const members = workspace.members || [];

    console.log("🔢 Designs length:", designs.length);
    console.log("🔢 Tasks length:", tasks.length);

    // Enhanced task analytics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.status === "done").length;
    const inProgressTasks = tasks.filter((task) => task.status === "in-progress").length;
    const todoTasks = tasks.filter((task) => task.status === "todo").length;

    // Priority breakdown
    const highPriorityTasks = tasks.filter((task) => task.priority === "high").length;
    const mediumPriorityTasks = tasks.filter((task) => task.priority === "medium").length;
    const lowPriorityTasks = tasks.filter((task) => task.priority === "low").length;

    // Task due date analytics
    const now = new Date();
    const overdueTasks = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < now && task.status !== "done"
    ).length;
    const dueSoonTasks = tasks.filter((task) => {
      if (!task.dueDate || task.status === "done") return false;
      const dueDate = new Date(task.dueDate);
      const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      return daysDiff <= 7 && daysDiff >= 0;
    }).length;

    // Release analytics
    const activeReleases = releases.filter((release) => !release.deployedDate).length;
    const completedReleases = releases.filter((release) => release.deployedDate).length;

    // Design analytics
    const totalDesigns = designs.length;
    const designTypes = designs.reduce(
      (acc, design) => {
        acc[design.type] = (acc[design.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Member role analytics
    const memberRoles = members.reduce(
      (acc, member) => {
        acc[member.role] = (acc[member.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      totalDesigns,
      totalMembers: members.length,
      totalReleases: releases.length,
      activeReleases,
      completedReleases,
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
      overdueTasks,
      dueSoonTasks,
      designTypes,
      memberRoles,
      // Calculated metrics
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      releaseCompletionRate: releases.length > 0 ? Math.round((completedReleases / releases.length) * 100) : 0,
      workspaceActivity: totalTasks + totalDesigns + releases.length, // Overall activity score
    };
  }, [workspace]);

  const handleFeatureClick = (href: string) => {
    router.push(`/workspaces/${workspaceId}${href}`);
  };

  const handleMembersClick = () => {
    router.push(`/workspaces/${workspaceId}/members`);
  };

  if (workspaceLoading) {
    return <WorkspaceLoading />;
  }

  if (workspaceError || !workspace) {
    return (
      <WorkspaceError
        error={workspaceError}
        onRetry={() => window.location.reload()}
        onGoHome={() => router.push("/workspaces")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <WorkspaceHeader workspace={workspace} onMembersClick={handleMembersClick} />

      <main className="container mx-auto px-6 py-8 max-w-6xl space-y-8">
        <WorkspaceStats stats={stats} isLoading={workspaceLoading} />

        <WorkspaceProgress stats={stats} isLoading={workspaceLoading} />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-1">
                Workspace Tools
              </h2>
              <p className="text-muted-foreground text-lg">Manage your project with these integrated tools</p>
            </div>
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border-primary/20 px-4 py-2"
            >
              ✨ {featureCards.length} Tools Available
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <WorkspaceFeatureCard feature={feature} onClick={() => handleFeatureClick(feature.href)} />
              </motion.div>
            ))}
          </div>
        </div>

        <WorkspaceQuickActions
          onCreateTask={() => handleFeatureClick("/tasks")}
          onEditPRD={() => handleFeatureClick("/prd")}
          onUploadDesign={() => handleFeatureClick("/designs")}
        />
      </main>
    </div>
  );
}
