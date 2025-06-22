"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface WorkspaceItem {
  _id: string;
  name: string;
  description?: string;
  members?: Array<{
    userId: string;
    role: string;
  }>;
}

interface UserWorkspacesListProps {
  workspaces: WorkspaceItem[];
  currentUserId?: string;
  isLoading?: boolean;
  maxDisplay?: number;
}

export function UserWorkspacesList({
  workspaces,
  currentUserId,
  isLoading = false,
  maxDisplay = 5,
}: UserWorkspacesListProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Workspaces
          </CardTitle>
          <CardDescription>Workspaces you're a member of</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 border rounded-lg">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-48 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayWorkspaces = workspaces?.slice(0, maxDisplay) || [];
  const remainingCount = workspaces?.length ? workspaces.length - maxDisplay : 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Workspaces
        </CardTitle>
        <CardDescription>Workspaces you're a member of</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {workspaces && workspaces.length > 0 ? (
          <>
            <div className="space-y-3 flex-1">
              {displayWorkspaces.map((workspace) => {
                // Find the current user's role in this workspace
                const userMember = workspace.members?.find((member) => member.userId === currentUserId);
                const userRole = userMember?.role || "member";
                const displayRole = userRole.charAt(0).toUpperCase() + userRole.slice(1);

                return (
                  <motion.div
                    key={workspace._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/workspaces/${workspace._id}`}>
                      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground hover:text-primary truncate">{workspace.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {workspace.description || "No description"}
                          </p>
                        </div>
                        <Badge variant="secondary" className="ml-2 flex-shrink-0">
                          {displayRole}
                        </Badge>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}

              {remainingCount > 0 && (
                <div className="text-sm text-muted-foreground text-center py-2">
                  +{remainingCount} more workspace{remainingCount > 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="pt-4 border-t mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/workspaces">View All Workspaces</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground py-8">
            <Briefcase className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-center mb-4">No workspaces found</p>
            <Button asChild variant="outline">
              <Link href="/workspaces">Browse Workspaces</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
