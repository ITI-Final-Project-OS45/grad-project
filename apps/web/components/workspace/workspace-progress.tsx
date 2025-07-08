"use client";

import { BarChart3, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { WorkspaceStats } from "@/types/workspace.type";

interface WorkspaceProgressProps {
  stats: WorkspaceStats;
  isLoading?: boolean;
}

export function WorkspaceProgress({ stats, isLoading }: WorkspaceProgressProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded"></div>
            <div className="h-4 w-48 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 w-full bg-muted rounded"></div>
              <div className="h-2 w-full bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 w-32 bg-muted rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 w-full bg-muted rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const taskProgress = stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0;
  const releaseProgress = stats.totalReleases > 0 ? ((stats.completedReleases || 0) / stats.totalReleases) * 100 : 0;

  // Calculate workflow distribution
  const workflowData = [
    { label: "To Do", value: stats.todoTasks || 0, color: "bg-gray-200 dark:bg-gray-700" },
    { label: "In Progress", value: stats.inProgressTasks || 0, color: "bg-blue-200 dark:bg-blue-700" },
    { label: "Completed", value: stats.completedTasks, color: "bg-green-200 dark:bg-green-700" },
  ];

  const totalWorkflow = workflowData.reduce((sum, item) => sum + item.value, 0);

  // Priority distribution
  const priorityData = [
    { label: "High", value: stats.highPriorityTasks || 0, color: "bg-red-500", urgent: true },
    { label: "Medium", value: stats.mediumPriorityTasks || 0, color: "bg-yellow-500", urgent: false },
    { label: "Low", value: stats.lowPriorityTasks || 0, color: "bg-green-500", urgent: false },
  ];

  const getProgressStatus = (percentage: number) => {
    if (percentage >= 80) return { text: "Excellent", color: "text-green-600 dark:text-green-400" };
    if (percentage >= 60) return { text: "Good", color: "text-blue-600 dark:text-blue-400" };
    if (percentage >= 40) return { text: "Fair", color: "text-yellow-600 dark:text-yellow-400" };
    return { text: "Needs Attention", color: "text-red-600 dark:text-red-400" };
  };

  const taskStatus = getProgressStatus(taskProgress);
  const hasUrgentItems =
    (stats.overdueTasks || 0) > 0 || (stats.dueSoonTasks || 0) > 0 || (stats.highPriorityTasks || 0) > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Project Progress
          </CardTitle>
          <CardDescription>Track completion across your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Task Completion */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Task Completion</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={taskStatus.color}>
                  {taskStatus.text}
                </Badge>
                <span className="font-medium text-sm">
                  {stats.completedTasks}/{stats.totalTasks}
                </span>
              </div>
            </div>
            <Progress value={taskProgress} className="h-3" />
            <div className="text-right">
              <span className="text-lg font-bold text-foreground">{Math.round(taskProgress)}%</span>
            </div>
          </div>

          {/* Release Progress */}
          {stats.totalReleases > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground">Release Completion</span>
                <span className="font-medium text-sm">
                  {stats.completedReleases || 0}/{stats.totalReleases}
                </span>
              </div>
              <Progress value={releaseProgress} className="h-2" />
              <div className="text-right">
                <span className="text-sm font-medium text-foreground">{Math.round(releaseProgress)}%</span>
              </div>
            </div>
          )}

          {/* Workflow Distribution */}
          {totalWorkflow > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Workflow Distribution</h4>
              <div className="flex rounded-lg overflow-hidden h-3 bg-muted">
                {workflowData.map((item, index) => {
                  const percentage = (item.value / totalWorkflow) * 100;
                  return percentage > 0 ? (
                    <div
                      key={index}
                      className={item.color}
                      style={{ width: `${percentage}%` }}
                      title={`${item.label}: ${item.value} tasks`}
                    />
                  ) : null;
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                {workflowData.map((item, index) => (
                  <span key={index} className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                    {item.label} ({item.value})
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights & Alerts Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Workspace Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Priority Breakdown */}
          {stats.totalTasks > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Task Priorities</h4>
              <div className="space-y-2">
                {priorityData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                      <span className="text-sm text-muted-foreground">{item.label} Priority</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{item.value}</span>
                      {item.urgent && item.value > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                          !
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Urgent Alerts */}
          {hasUrgentItems && (
            <div className="space-y-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800/50">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Urgent Attention Required
              </h4>
              <div className="space-y-2">
                {(stats.overdueTasks || 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700 dark:text-red-300">Overdue tasks</span>
                    <Badge variant="destructive">{stats.overdueTasks}</Badge>
                  </div>
                )}
                {(stats.dueSoonTasks || 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700 dark:text-red-300">Due within 7 days</span>
                    <Badge variant="outline" className="border-yellow-600 text-yellow-600">
                      {stats.dueSoonTasks}
                    </Badge>
                  </div>
                )}
                {(stats.highPriorityTasks || 0) > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-red-700 dark:text-red-300">High priority tasks</span>
                    <Badge variant="destructive">{stats.highPriorityTasks}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Positive Insights */}
          {!hasUrgentItems && stats.totalTasks > 0 && (
            <div className="space-y-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800/50">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Great Work!
              </h4>
              <div className="space-y-1 text-sm text-green-700 dark:text-green-300">
                {taskProgress >= 80 && <p>• Excellent task completion rate</p>}
                {(stats.overdueTasks || 0) === 0 && <p>• No overdue tasks</p>}
                {(stats.highPriorityTasks || 0) === 0 && <p>• All high priority tasks handled</p>}
                <p>• Workspace activity score: {stats.workspaceActivity || 0}</p>
              </div>
            </div>
          )}

          {/* Team Composition */}
          {stats.memberRoles && Object.keys(stats.memberRoles).length > 1 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Team Composition</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(stats.memberRoles).map(([role, count]) => (
                  <div key={role} className="flex justify-between p-2 bg-muted/50 rounded">
                    <span className="capitalize">{role}s</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
