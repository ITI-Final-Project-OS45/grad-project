"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bug,
  Calendar,
  User,
  Edit,
  Trash2,
  MoreHorizontal,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useBug } from "@/hooks/use-bugs";
import { useWorkspacePermissions } from "@/lib/permissions";
import { useUser } from "@/hooks/use-user";
import { useWorkspaceMembersByWorkspace } from "@/hooks/use-workspace-members";
import { BugResponse, BugSeverity, BugStatus } from "@repo/types";
import { EditBugDialog } from "./edit-bug-dialog";
import { DeleteBugDialog } from "./delete-bug-dialog";

const getBugSeverityColor = (severity: BugSeverity) => {
  switch (severity) {
    case BugSeverity.CRITICAL:
      return "bg-red-100 text-red-800 border-red-200";
    case BugSeverity.HIGH:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case BugSeverity.MEDIUM:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case BugSeverity.LOW:
      return "bg-blue-100 text-blue-800 border-blue-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getBugSeverityIcon = (severity: BugSeverity) => {
  switch (severity) {
    case BugSeverity.CRITICAL:
      return <AlertTriangle className="h-4 w-4" />;
    case BugSeverity.HIGH:
      return <XCircle className="h-4 w-4" />;
    case BugSeverity.MEDIUM:
      return <Clock className="h-4 w-4" />;
    case BugSeverity.LOW:
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Bug className="h-4 w-4" />;
  }
};

const getBugStatusColor = (status: BugStatus) => {
  switch (status) {
    case BugStatus.OPEN:
      return "bg-red-100 text-red-800 border-red-200";
    case BugStatus.IN_PROGRESS:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case BugStatus.RESOLVED:
      return "bg-green-100 text-green-800 border-green-200";
    case BugStatus.CLOSED:
      return "bg-gray-100 text-gray-800 border-gray-200";
    case BugStatus.REJECTED:
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

interface BugCardProps {
  bug: BugResponse;
  releaseId: string;
  workspaceId: string; // Add workspaceId instead of workspaceMembers
}

export function BugCard({ bug, releaseId, workspaceId }: BugCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { updateBug, deleteBug } = useBug();
  const { currentUser: user } = useUser();
  const { data: members } = useWorkspaceMembersByWorkspace(workspaceId);

  // Get current user's workspace role
  const currentUserMember = members?.find((member) => member.userId._id === user?.data?._id);
  const currentUserRole = currentUserMember?.role;

  // Check if current user is assigned to this bug
  const isAssignedUser = bug.assignedTo && user?.data?._id === bug.assignedTo._id;

  // Check permissions: QA, Manager, and Assigned User can update bugs
  const updatePermissions = useWorkspacePermissions(user?.data?._id, currentUserRole);
  const canUpdateBug = currentUserRole === "qa" || currentUserRole === "manager" || isAssignedUser;
  const canDeleteBug = updatePermissions.canDeleteBug; // Only QA and Manager can delete

  const handleStatusChange = async (newStatus: BugStatus) => {
    await updateBug.mutateAsync({
      bugId: bug._id,
      data: { status: newStatus },
      releaseId,
    });
  };

  const handleDeleteConfirm = async (bugId: string) => {
    await deleteBug.mutateAsync({
      bugId,
      releaseId,
    });
  };

  const hasDetails = bug.stepsToReproduce ?? bug.expectedBehavior ?? bug.actualBehavior;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{bug.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`${getBugSeverityColor(bug.severity)} flex items-center gap-1 capitalize`}
                  >
                    {getBugSeverityIcon(bug.severity)}
                    {bug.severity}
                  </Badge>
                  <Badge variant="outline" className={`${getBugStatusColor(bug.status)} capitalize`}>
                    {bug.status.replace("_", " ")}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">{bug.description}</CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {hasDetails && (
                  <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? "Less" : "More"}
                  </Button>
                )}

                {/* Only show dropdown if user has any permissions */}
                {(canUpdateBug || canDeleteBug) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {canUpdateBug && (
                        <>
                          <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Bug
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(BugStatus.IN_PROGRESS)}>
                            <Clock className="h-4 w-4 mr-2" />
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(BugStatus.RESOLVED)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(BugStatus.CLOSED)}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Close Bug
                          </DropdownMenuItem>
                        </>
                      )}
                      {canDeleteBug && (
                        <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Bug
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Reported by {bug.reportedBy.displayName || bug.reportedBy.username}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
              </div>
              {bug.assignedTo && (
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>Assigned to {bug.assignedTo.displayName || bug.assignedTo.username}</span>
                </div>
              )}
            </div>

            {/* Expanded Details */}
            {hasDetails && isExpanded && (
              <div className="space-y-4">
                <Separator />

                {bug.stepsToReproduce && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Steps to Reproduce</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{bug.stepsToReproduce}</p>
                  </div>
                )}

                {bug.expectedBehavior && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Expected Behavior</h4>
                    <p className="text-sm text-muted-foreground">{bug.expectedBehavior}</p>
                  </div>
                )}

                {bug.actualBehavior && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Actual Behavior</h4>
                    <p className="text-sm text-muted-foreground">{bug.actualBehavior}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Only render dialogs if user has appropriate permissions */}
      {canUpdateBug && (
        <EditBugDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} bug={bug} workspaceId={workspaceId} />
      )}

      {canDeleteBug && (
        <DeleteBugDialog
          bug={bug}
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteBug.isPending}
        />
      )}
    </>
  );
}
