"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bug,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  Play,
  Plus,
  Rocket,
  Settings,
  Wrench,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useReleaseById, useRelease } from "@/hooks/use-releases";
import { useBugsByRelease } from "@/hooks/use-bugs";
import { useHotfixesByRelease } from "@/hooks/use-hotfixes";
import { useWorkspacePermissions } from "@/lib/permissions";
import { useUser } from "@/hooks/use-user";
import { useWorkspaceMembersByWorkspace } from "@/hooks/use-workspace-members";
import { EditReleaseDialog } from "@/components/releases/edit-release-dialog";
import { DeleteReleaseDialog } from "@/components/releases/delete-release-dialog";
import { CreateBugDialog } from "@/components/bugs/create-bug-dialog";
import { CreateHotfixDialog } from "@/components/hotfixes/create-hotfix-dialog";
import { BugCard } from "@/components/bugs/bug-card";
import { HotfixCard } from "@/components/hotfixes/hotfix-card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { containerVariants, itemVariants } from "@/constants/variants/workspace.variants";
import { QAStatus, BugSeverity, HotfixStatus } from "@repo/types";

const getQAStatusColor = (status: QAStatus) => {
  switch (status) {
    case QAStatus.PENDING:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case QAStatus.PASSED:
      return "bg-green-100 text-green-800 border-green-200";
    case QAStatus.FAILED:
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getQAStatusIcon = (status: QAStatus) => {
  switch (status) {
    case QAStatus.PENDING:
      return <Clock className="h-4 w-4" />;
    case QAStatus.PASSED:
      return <CheckCircle className="h-4 w-4" />;
    case QAStatus.FAILED:
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

export default function ReleaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const releaseId = params.releaseId as string;

  // State
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createBugDialogOpen, setCreateBugDialogOpen] = useState(false);
  const [createHotfixDialogOpen, setCreateHotfixDialogOpen] = useState(false);

  // Data fetching
  const { data: release, isLoading: releaseLoading } = useReleaseById(releaseId);
  const { data: bugs, isLoading: bugsLoading } = useBugsByRelease(releaseId);
  const { data: hotfixes, isLoading: hotfixesLoading } = useHotfixesByRelease(releaseId);
  const { currentUser: user } = useUser();
  const { data: members } = useWorkspaceMembersByWorkspace(workspaceId);

  // Release mutations - import from correct hook
  const { deployRelease, updateQAStatus } = useRelease();

  // Get current user's workspace role
  const currentUserMember = members?.find((member) => member.userId._id === user?.data?._id);
  const currentUserRole = currentUserMember?.role;

  // Permissions - use current user's actual role
  const permissions = useWorkspacePermissions(user?.data?._id, currentUserRole);

  // Handle deploy action
  const handleDeploy = async () => {
    if (!release || isDeployed) return;

    try {
      await deployRelease.mutateAsync({
        releaseId: release._id,
        workspaceId: workspaceId,
      });
    } catch (error) {
      console.error("Failed to deploy release:", error);
    }
  };

  // Handle QA status change
  const handleQAStatusChange = async (qaStatus: QAStatus) => {
    if (!release) return;

    try {
      await updateQAStatus.mutateAsync({
        releaseId: release._id,
        qaStatus,
        workspaceId: workspaceId,
      });
    } catch (error) {
      console.error("Failed to update QA status:", error);
    }
  };

  if (releaseLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-muted rounded" />
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-96" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-32 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-24 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!release) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Release not found</h3>
            <p className="text-muted-foreground mb-4">
              The release you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDeployed = !!release.deployedDate;
  const isOverdue = new Date(release.plannedDate) < new Date() && !isDeployed;

  const criticalBugs = bugs?.filter((bug) => bug.severity === BugSeverity.CRITICAL).length ?? 0;
  const activeBugs =
    bugs?.filter((bug) => ![BugSeverity.CRITICAL, BugSeverity.HIGH].includes(bug.severity)).length ?? 0;

  const pendingHotfixes = hotfixes?.filter((hotfix) => hotfix.status === HotfixStatus.PENDING).length ?? 0;
  const deployedHotfixes = hotfixes?.filter((hotfix) => hotfix.status === HotfixStatus.DEPLOYED).length ?? 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-6"
    >
      {/* Back to Workspace Button */}
      <div className="flex items-center gap-4 mb-6 pt-4">
        <Button variant="ghost" size="sm" onClick={() => router.push(`/workspaces/${workspaceId}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Workspace
        </Button>
      </div>
      {/* Header */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/workspaces/${workspaceId}/releases`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Releases
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  {release.versionTag}
                  {isDeployed && (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                      <Play className="h-3 w-3 mr-1" />
                      Deployed
                    </Badge>
                  )}
                  {isOverdue && (
                    <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">
                      Overdue
                    </Badge>
                  )}
                </h1>
                <p className="text-muted-foreground text-lg">{release.description}</p>
              </div>
            </div>

            {/* QA Status */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getQAStatusColor(release.qaStatus)} flex items-center gap-2`}>
                {getQAStatusIcon(release.qaStatus)}
                QA Status: {release.qaStatus}
              </Badge>

              {/* QA Status Change Dropdown */}
              {permissions.canUpdateQAStatus && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Change QA Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleQAStatusChange(QAStatus.PENDING)}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Mark as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleQAStatusChange(QAStatus.PASSED)}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Mark as Passed
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleQAStatusChange(QAStatus.FAILED)}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4 text-red-600" />
                      Mark as Failed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {permissions.canUpdateRelease && (
              <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Release
              </Button>
            )}
            {permissions.canDeleteRelease && (
              <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            {!isDeployed && release.qaStatus === QAStatus.PASSED && (
              <Button onClick={handleDeploy}>
                <Play className="h-4 w-4 mr-2" />
                Deploy
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Overview Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-600">{criticalBugs}</p>
                  <p className="text-sm text-muted-foreground">Critical Bugs</p>
                </div>
                <Bug className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{activeBugs}</p>
                  <p className="text-sm text-muted-foreground">Active Bugs</p>
                </div>
                <Bug className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-yellow-600">{pendingHotfixes}</p>
                  <p className="text-sm text-muted-foreground">Pending Hotfixes</p>
                </div>
                <Wrench className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{deployedHotfixes}</p>
                  <p className="text-sm text-muted-foreground">Deployed Hotfixes</p>
                </div>
                <Wrench className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Tabs */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="bugs" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="bugs" className="flex items-center gap-2">
                  <Bug className="h-4 w-4" />
                  Bugs ({bugs?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="hotfixes" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Hotfixes ({hotfixes?.length ?? 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bugs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Bug Reports</h3>
                  {permissions.canCreateBug && (
                    <Button onClick={() => setCreateBugDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Report Bug
                    </Button>
                  )}
                </div>

                {bugsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={`bug-skeleton-${i}`} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-4 bg-muted rounded w-full mb-2" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : bugs && bugs.length > 0 ? (
                  <div className="space-y-4">
                    {bugs.map((bug) => (
                      <BugCard key={bug._id} bug={bug} releaseId={releaseId} workspaceId={workspaceId} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Bug className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">No bugs reported</h4>
                      <p className="text-muted-foreground mb-4">No bugs have been reported for this release yet.</p>
                      {permissions.canCreateBug && (
                        <Button onClick={() => setCreateBugDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Report First Bug
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="hotfixes" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Hotfixes</h3>
                  {permissions.canCreateHotfix && (
                    <Button onClick={() => setCreateHotfixDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Hotfix
                    </Button>
                  )}
                </div>

                {hotfixesLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={`hotfix-skeleton-${i}`} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                          <div className="h-4 bg-muted rounded w-full mb-2" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : hotfixes && hotfixes.length > 0 ? (
                  <div className="space-y-4">
                    {hotfixes.map((hotfix) => (
                      <HotfixCard key={hotfix._id} hotfix={hotfix} releaseId={releaseId} workspaceId={workspaceId} />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">No hotfixes</h4>
                      <p className="text-muted-foreground mb-4">No hotfixes have been created for this release yet.</p>
                      {permissions.canCreateHotfix && (
                        <Button onClick={() => setCreateHotfixDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create First Hotfix
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Release Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(release.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${isOverdue ? "bg-red-500" : "bg-orange-500"}`} />
                    <div className="flex-1">
                      <p className="font-medium">Planned Release</p>
                      <p className={`text-sm ${isOverdue ? "text-red-600" : "text-muted-foreground"}`}>
                        {new Date(release.plannedDate).toLocaleDateString()}
                        {isOverdue && " (Overdue)"}
                      </p>
                    </div>
                  </div>

                  {isDeployed && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <div className="flex-1">
                          <p className="font-medium">Deployed</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(release.deployedDate!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Version</p>
                  <p className="font-mono">{release.versionTag}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Workspace</p>
                  <p>{release.workspaceId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <p>{release.createdBy}</p>
                </div>
                {release.deployedBy && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Deployed By</p>
                    <p>{release.deployedBy}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      {/* Dialogs */}
      <EditReleaseDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        release={release}
        workspaceId={workspaceId}
      />

      <CreateBugDialog
        open={createBugDialogOpen}
        onOpenChange={setCreateBugDialogOpen}
        releaseId={releaseId}
        workspaceId={workspaceId}
      />

      <CreateHotfixDialog
        open={createHotfixDialogOpen}
        onOpenChange={setCreateHotfixDialogOpen}
        releaseId={releaseId}
      />

      <DeleteReleaseDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        release={release}
        workspaceId={workspaceId}
      />
    </motion.div>
  );
}
