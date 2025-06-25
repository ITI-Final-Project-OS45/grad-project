"use client";

import { CheckSquare, TrendingUp, Palette, Users } from "lucide-react";
import type { WorkspaceStats } from "@/types/workspace.type";

interface WorkspaceStatsProps {
  stats: WorkspaceStats;
  isLoading?: boolean;
}

const statItems = [
  {
    icon: CheckSquare,
    label: "Tasks",
    key: "totalTasks" as keyof WorkspaceStats,
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-950/50",
  },
  {
    icon: TrendingUp,
    label: "Completed",
    key: "completedTasks" as keyof WorkspaceStats,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-950/50",
  },
  {
    icon: Palette,
    label: "Designs",
    key: "totalDesigns" as keyof WorkspaceStats,
    iconColor: "text-purple-600 dark:text-purple-400",
    iconBg: "bg-purple-100 dark:bg-purple-950/50",
  },
  {
    icon: Users,
    label: "Members",
    key: "totalMembers" as keyof WorkspaceStats,
    iconColor: "text-orange-600 dark:text-orange-400",
    iconBg: "bg-orange-100 dark:bg-orange-950/50",
  },
];

export function WorkspaceStats({ stats, isLoading }: WorkspaceStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <div key={item.label} className="bg-card border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.iconBg}`}>
              <item.icon className={`w-4 h-4 ${item.iconColor}`} />
            </div>
            <div>
              <div className="text-2xl font-semibold text-foreground">{isLoading ? "..." : stats[item.key]}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
