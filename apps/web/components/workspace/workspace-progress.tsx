"use client";

import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WorkspaceStats } from "@/types/workspace.type";

interface WorkspaceProgressProps {
  stats: WorkspaceStats;
  isLoading?: boolean;
}

export function WorkspaceProgress({ stats, isLoading }: WorkspaceProgressProps) {
  const taskProgress = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Project Progress
        </CardTitle>
        <CardDescription>Track completion across your workspace</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Task Completion</span>
            <span className="font-medium">
              {isLoading ? "Loading..." : `${stats.completedTasks}/${stats.totalTasks}`}
            </span>
          </div>
          <Progress value={taskProgress} className="h-2" />
          <div className="text-right">
            <span className="text-sm font-medium">{Math.round(taskProgress)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
