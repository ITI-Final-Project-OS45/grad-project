"use client";

import { Plus, Edit3, Upload } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface WorkspaceQuickActionsProps {
  onCreateTask: () => void;
  onEditPRD: () => void;
  onUploadDesign: () => void;
}

export function WorkspaceQuickActions({ onCreateTask, onEditPRD, onUploadDesign }: WorkspaceQuickActionsProps) {
  const actions = [
    {
      title: "Create Task",
      description: "Add a new task",
      icon: Plus,
      onClick: onCreateTask,
    },
    {
      title: "Edit PRD",
      description: "Update requirements",
      icon: Edit3,
      onClick: onEditPRD,
    },
    {
      title: "Upload Design",
      description: "Add design files",
      icon: Upload,
      onClick: onUploadDesign,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks for this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {actions.map((action) => (
            <Button key={action.title} variant="outline" className="h-auto p-4 justify-start" onClick={action.onClick}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  <action.icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
