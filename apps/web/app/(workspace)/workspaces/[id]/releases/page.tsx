"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import {
  Plus,
  Rocket,
  Calendar,
  Bug,
  Wrench,
  GitBranch,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReleases } from "@/hooks/use-releases";
import { useBugsByRelease } from "@/hooks/use-bugs";
import { useHotfixesByRelease } from "@/hooks/use-hotfixes";
import { useWorkspacePermissions } from "@/lib/permissions";
import { useUser } from "@/hooks/use-user";
import { useWorkspaceMembersByWorkspace } from "@/hooks/use-workspace-members";
import { CreateReleaseDialog } from "@/components/releases/create-release-dialog";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/constants/variants/workspace.variants";
import { QAStatus, ReleaseResponse } from "@repo/types";

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

interface ReleaseCardProps {
  release: ReleaseResponse;
  workspaceId: string;
}

function ReleaseCard({ release, workspaceId }: ReleaseCardProps) {
  const { data: bugs } = useBugsByRelease(release._id);
  const { data: hotfixes } = useHotfixesByRelease(release._id);

  const isDeployed = !!release.deployedDate;
  const isOverdue = new Date(release.plannedDate) < new Date() && !isDeployed;

  return (
    <motion.div variants={itemVariants} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="h-full hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-xl">
                  <Link
                    href={`/workspaces/${workspaceId}/releases/${release._id}`}
                    className="hover:text-primary transition-colors"
                  >
                    {release.versionTag}
                  </Link>
                </CardTitle>
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
              </div>
              <CardDescription className="line-clamp-2">{release.description}</CardDescription>
            </div>
            <Badge
              variant="outline"
              className={`${getQAStatusColor(release.qaStatus)} flex items-center gap-1 capitalize`}
            >
              {getQAStatusIcon(release.qaStatus)}
              {release.qaStatus}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Bug className="h-4 w-4 text-red-500" />
              <span className="font-medium">{bugs?.length ?? 0}</span>
              <span className="text-muted-foreground capitalize">bugs</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Wrench className="h-4 w-4 text-orange-500" />
              <span className="font-medium">{hotfixes?.length ?? 0}</span>
              <span className="text-muted-foreground capitalize">hotfixes</span>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Planned:</span>
              <span className={isOverdue ? "text-red-600" : ""}>
                {new Date(release.plannedDate).toLocaleDateString()}
              </span>
            </div>
            {isDeployed && (
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Deployed:</span>
                <span className="text-green-600">{new Date(release.deployedDate!).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function ReleasesPage() {
  const params = useParams();
  const workspaceId = params.id as string;
  const router = useRouter();

  // State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Data fetching
  const { data: releases, isLoading } = useReleases(workspaceId);
  const { currentUser: user } = useUser();
  const { data: members = [] } = useWorkspaceMembersByWorkspace(workspaceId);

  // Get current user's role in this workspace
  const currentUserId = user?.data?._id;
  const currentUserMember = members.find((m) => m.userId._id === currentUserId && currentUserId !== undefined);
  const currentUserRole = currentUserMember?.role;

  // Permissions
  const permissions = useWorkspacePermissions(currentUserId, currentUserRole);
  const canCreateRelease = permissions.canCreateRelease;

  // Filter releases
  const filteredReleases =
    releases?.filter((release) => {
      const matchesSearch =
        release.versionTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        release.description.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "deployed") return !!release.deployedDate;
      if (statusFilter === "pending") return !release.deployedDate;
      if (statusFilter === "qa-passed") return release.qaStatus === QAStatus.PASSED;
      if (statusFilter === "qa-failed") return release.qaStatus === QAStatus.FAILED;
      if (statusFilter === "qa-pending") return release.qaStatus === QAStatus.PENDING;

      return true;
    }) ?? [];

  const stats = {
    total: releases?.length ?? 0,
    deployed: releases?.filter((r) => !!r.deployedDate).length ?? 0,
    pending: releases?.filter((r) => !r.deployedDate).length ?? 0,
    qaPassed: releases?.filter((r) => r.qaStatus === QAStatus.PASSED).length ?? 0,
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-4 bg-muted rounded w-96" />
            </div>
            <div className="h-10 bg-muted rounded w-32" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={`stats-skeleton-${i}`} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-16 mb-2" />
                  <div className="h-4 bg-muted rounded w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={`card-skeleton-${i}`} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-24 mb-4" />
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              Release Management
            </h1>
            <p className="text-muted-foreground">
              Plan, track, and deploy product releases with comprehensive QA workflows
            </p>
          </div>
          {canCreateRelease && (
            <Button onClick={() => setCreateDialogOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              New Release
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Releases</p>
                </div>
                <Rocket className="h-8 w-8 text-primary ml-auto" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-green-600">{stats.deployed}</p>
                  <p className="text-sm text-muted-foreground">Deployed</p>
                </div>
                <Play className="h-8 w-8 text-green-600 ml-auto" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600 ml-auto" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">{stats.qaPassed}</p>
                  <p className="text-sm text-muted-foreground">QA Passed</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600 ml-auto" />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search releases..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Releases</SelectItem>
              <SelectItem value="deployed">Deployed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="qa-passed">QA Passed</SelectItem>
              <SelectItem value="qa-failed">QA Failed</SelectItem>
              <SelectItem value="qa-pending">QA Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Releases Grid */}
      <motion.div variants={itemVariants}>
        {filteredReleases.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Rocket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {releases?.length === 0 ? "No releases yet" : "No releases match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {releases?.length === 0
                  ? "Create your first release to start tracking product deployments"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {canCreateRelease && releases?.length === 0 && (
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Release
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReleases.map((release) => (
              <ReleaseCard key={release._id} release={release} workspaceId={workspaceId} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Create Release Dialog */}
      <CreateReleaseDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} workspaceId={workspaceId} />
    </motion.div>
  );
}
