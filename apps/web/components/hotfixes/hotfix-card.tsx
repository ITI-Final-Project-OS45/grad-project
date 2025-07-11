'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wrench,
  Calendar,
  User,
  Edit,
  Trash2,
  MoreHorizontal,
  GitCommit,
  Clock,
  Play,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { useHotfix } from '@/hooks/use-hotfixes';
import { useWorkspacePermissions } from '@/lib/permissions';
import { useUser } from '@/hooks/use-user';
import { useWorkspaceMembersByWorkspace } from '@/hooks/use-workspace-members';
import { EditHotfixDialog } from './edit-hotfix-dialog';
import type { HotfixResponse, HotfixStatus } from '@repo/types';

const getHotfixStatusColor = (status: HotfixStatus) => {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'IN_PROGRESS':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'DEPLOYED':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getHotfixStatusIcon = (status: HotfixStatus) => {
  switch (status) {
    case 'PENDING':
      return <Clock className="h-4 w-4" />;
    case 'IN_PROGRESS':
      return <AlertCircle className="h-4 w-4" />;
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />;
    case 'DEPLOYED':
      return <Play className="h-4 w-4" />;
    default:
      return <Wrench className="h-4 w-4" />;
  }
};

interface HotfixCardProps {
  hotfix: HotfixResponse;
  releaseId: string;
  workspaceId: string;
}

export function HotfixCard({
  hotfix,
  releaseId,
  workspaceId,
}: HotfixCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { updateHotfix, deleteHotfix } = useHotfix();
  const { currentUser: user } = useUser();
  const { data: members } = useWorkspaceMembersByWorkspace(workspaceId);

  // Get current user's workspace role
  const currentUserMember = members?.find(
    (member) => member.userId._id === user?.data?._id
  );
  const currentUserRole = currentUserMember?.role;

  // Check permissions using current user's actual role
  const permissions = useWorkspacePermissions(user?.data?._id, currentUserRole);

  const handleStatusChange = async (newStatus: HotfixStatus) => {
    await updateHotfix.mutateAsync({
      hotfixId: hotfix._id,
      data: { status: newStatus },
      releaseId: releaseId, // Add releaseId for proper cache invalidation
    });
  };

  const handleDelete = async () => {
    await deleteHotfix.mutateAsync({
      hotfixId: hotfix._id,
      releaseId: releaseId, // Add releaseId for proper cache invalidation
    });
  };

  const hasDetails = hotfix.attachedCommits?.length > 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    {hotfix.title}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`${getHotfixStatusColor(hotfix.status)} flex items-center gap-1 capitalize`}
                  >
                    {getHotfixStatusIcon(hotfix.status)}
                    {hotfix.status.replace('_', ' ')}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {hotfix.description}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {hasDetails && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    {isExpanded ? 'Less' : 'More'}
                  </Button>
                )}

                {(permissions.canUpdateHotfix ||
                  permissions.canDeleteHotfix) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {permissions.canUpdateHotfix && (
                        <>
                          <DropdownMenuItem
                            onClick={() => setEditDialogOpen(true)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Hotfix
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange('IN_PROGRESS' as HotfixStatus)
                            }
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Mark In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange('COMPLETED' as HotfixStatus)
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Completed
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange('DEPLOYED' as HotfixStatus)
                            }
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Mark Deployed
                          </DropdownMenuItem>
                        </>
                      )}
                      {permissions.canDeleteHotfix && (
                        <DropdownMenuItem
                          onClick={handleDelete}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Hotfix
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
                <span>
                  Fixed by{' '}
                  {typeof hotfix.fixedBy === 'string'
                    ? hotfix.fixedBy
                    : hotfix.fixedBy?.displayName ||
                      hotfix.fixedBy?.username ||
                      'Unknown'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(hotfix.createdAt).toLocaleDateString()}</span>
              </div>
              {hotfix.fixedDate && (
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>
                    Fixed {new Date(hotfix.fixedDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Info */}
            {hotfix.attachedCommits && hotfix.attachedCommits.length > 0 && (
              <div className="flex items-center gap-2">
                <GitCommit className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {hotfix.attachedCommits.length} commit
                  {hotfix.attachedCommits.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Expanded Details */}
            {hasDetails && isExpanded && (
              <div className="space-y-4">
                <Separator />

                {hotfix.attachedCommits &&
                  hotfix.attachedCommits.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <GitCommit className="h-4 w-4" />
                        Attached Commits
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {hotfix.attachedCommits.map((commit) => (
                          <Badge
                            key={commit}
                            variant="outline"
                            className="font-mono text-xs"
                          >
                            {commit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <EditHotfixDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        hotfix={hotfix}
        releaseId={releaseId}
      />
    </>
  );
}
