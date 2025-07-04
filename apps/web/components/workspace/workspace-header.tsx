"use client";

import { Users, Calendar, Factory } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspacePermissions } from "@/lib/permissions";
import { useUser } from "@/hooks/use-user";
import type { Workspace } from "@/services/workspace.service";

interface WorkspaceHeaderProps {
  workspace: Workspace;
  onMembersClick?: () => void;
}

export function WorkspaceHeader({ workspace, onMembersClick }: WorkspaceHeaderProps) {
  const { currentUser } = useUser();

  // Get current user's role in this workspace
  const currentUserId = currentUser?.data?._id;
  const currentUserMember = workspace.members?.find((m) => m.userId === currentUserId);
  const currentUserRole = currentUserMember?.role;

  // Get permissions for this workspace
  const permissions = useWorkspacePermissions(currentUserId, currentUserRole, workspace.createdBy);

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-start justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Factory className="w-5 h-5 text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-foreground">{workspace.name}</h1>
              {workspace.description && <p className="text-muted-foreground max-w-2xl">{workspace.description}</p>}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created {new Date(workspace.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Only show Members button if user can view members */}
            {permissions.canViewMembers && (
              <Button variant="outline" size="sm" onClick={onMembersClick}>
                <Users className="w-4 h-4 mr-2" />
                Members
                {permissions.isManager && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Manage
                  </Badge>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
