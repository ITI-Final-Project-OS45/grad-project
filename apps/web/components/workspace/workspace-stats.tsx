"use client";

import { CheckSquare, TrendingUp, Palette, Users, AlertTriangle, Clock, Target, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceStats } from "@/types/workspace.type";

interface WorkspaceStatsProps {
  stats: WorkspaceStats;
  isLoading?: boolean;
}

export function WorkspaceStats({ stats, isLoading }: WorkspaceStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-card border rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted"></div>
              <div>
                <div className="h-6 w-12 bg-muted rounded mb-1"></div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const primaryStats = [
    {
      icon: CheckSquare,
      label: "Total Tasks",
      value: stats.totalTasks,
      subtitle: `${stats.completedTasks} completed`,
      iconColor: "text-blue-600 dark:text-blue-400",
      iconBg: "bg-blue-100 dark:bg-blue-950/50",
      trend: stats.taskCompletionRate ? `${stats.taskCompletionRate}% done` : undefined,
    },
    {
      icon: Activity,
      label: "In Progress",
      value: stats.inProgressTasks || 0,
      subtitle: `${stats.todoTasks || 0} remaining`,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
    },
    {
      icon: Palette,
      label: "Design Assets",
      value: stats.totalDesigns,
      subtitle:
        Object.keys(stats.designTypes || {}).length > 0
          ? `${Object.keys(stats.designTypes || {}).length} types`
          : "Ready to upload",
      iconColor: "text-purple-600 dark:text-purple-400",
      iconBg: "bg-purple-100 dark:bg-purple-950/50",
    },
    {
      icon: Users,
      label: "Team Members",
      value: stats.totalMembers,
      subtitle: stats.memberRoles ? `${stats.memberRoles.manager || 0} managers` : "Active team",
      iconColor: "text-orange-600 dark:text-orange-400",
      iconBg: "bg-orange-100 dark:bg-orange-950/50",
    },
  ];

  const alertStats = [
    {
      icon: AlertTriangle,
      label: "High Priority",
      value: stats.highPriorityTasks || 0,
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-950/50",
      urgent: (stats.highPriorityTasks || 0) > 0,
    },
    {
      icon: Clock,
      label: "Due Soon",
      value: stats.dueSoonTasks || 0,
      iconColor: "text-yellow-600 dark:text-yellow-400",
      iconBg: "bg-yellow-100 dark:bg-yellow-950/50",
      urgent: (stats.dueSoonTasks || 0) > 0,
    },
    {
      icon: Target,
      label: "Overdue",
      value: stats.overdueTasks || 0,
      iconColor: "text-red-600 dark:text-red-400",
      iconBg: "bg-red-100 dark:bg-red-950/50",
      urgent: (stats.overdueTasks || 0) > 0,
    },
    {
      icon: TrendingUp,
      label: "Releases",
      value: stats.totalReleases,
      subtitle: `${stats.activeReleases} active`,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-100 dark:bg-indigo-950/50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {primaryStats.map((item) => (
            <div key={item.label} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                    <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{item.value}</div>
                    <div className="text-sm text-muted-foreground">{item.label}</div>
                    {item.subtitle && <div className="text-xs text-muted-foreground mt-1">{item.subtitle}</div>}
                  </div>
                </div>
                {item.trend && (
                  <Badge variant="secondary" className="text-xs">
                    {item.trend}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Stats */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Attention Needed</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {alertStats.map((item) => (
            <div
              key={item.label}
              className={`bg-card border rounded-lg p-4 hover:shadow-md transition-all ${
                item.urgent ? "ring-2 ring-red-200 dark:ring-red-800/50" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <div>
                  <div
                    className={`text-xl font-semibold ${item.urgent ? "text-red-600 dark:text-red-400" : "text-foreground"}`}
                  >
                    {item.value}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                  {item.subtitle && <div className="text-xs text-muted-foreground mt-1">{item.subtitle}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
