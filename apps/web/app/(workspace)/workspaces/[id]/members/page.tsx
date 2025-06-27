"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Users, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useWorkspaceById } from "@/hooks/use-workspace";
import { useWorkspaceMembers, useWorkspaceMembersByWorkspace } from "@/hooks/use-workspace-members";
import { useInvites, useWorkspaceInvites } from "@/hooks/use-invites";
import { useUser } from "@/hooks/use-user";
import { useWorkspacePermissions } from "@/lib/permissions";
import { UserRole } from "@repo/types";
import { MemberRow, InviteDialog, PendingInvites } from "@/components/members";

export default function MembersPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  const { data: workspace } = useWorkspaceById(workspaceId);
  const { currentUser } = useUser();
  const {
    data: members = [],
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useWorkspaceMembersByWorkspace(workspaceId);
  const { data: invites = [], isLoading: invitesLoading, refetch: refetchInvites } = useWorkspaceInvites(workspaceId);
  const { updateMember, deleteMember } = useWorkspaceMembers();
  const { deleteInvite } = useInvites();

  // Get current user's workspace role and permissions
  const currentUserId = currentUser?.data?._id;
  const currentUserMember = members.find((m) => m.userId._id === currentUserId);
  const currentUserRole = currentUserMember?.role;

  // Use the new permission system
  const permissions = useWorkspacePermissions(currentUserId, currentUserRole, workspace?.createdBy);

  const handleUpdateRole = async (memberId: string, newRole: UserRole) => {
    try {
      await updateMember.mutateAsync({
        workspaceId,
        data: {
          membernameOrEmail: memberId,
          role: newRole,
        },
      });
      refetchMembers();
    } catch (error) {
      console.error("Failed to update member role:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await deleteMember.mutateAsync({
        workspaceId,
        data: {
          membernameOrEmail: memberId,
        },
      });
      refetchMembers();
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    try {
      await deleteInvite.mutateAsync({
        inviteId,
        workspaceId,
      });
      refetchInvites();
    } catch (error) {
      console.error("Failed to delete invite:", error);
    }
  };

  const handleInviteSent = () => {
    refetchInvites();
  };

  if (membersLoading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={`member-skeleton-${i}`} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error if user doesn't have permission to view members
  if (!permissions.canViewMembers) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to view workspace members.</p>
        </div>
      </div>
    );
  }

  // Filter pending invites - only show if user can view workspace invites
  const pendingInvites = permissions.canViewWorkspaceInvites
    ? invites.filter((invite) => invite.status === "pending")
    : [];

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workspace Members</h1>
            <p className="text-muted-foreground">
              Manage team members and their roles in {workspace?.name}
              {permissions.isManager && " (Manager)"}
            </p>
          </div>
          {permissions.canCreateInvite && (
            <Button onClick={() => setIsInviteDialogOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Pending Invites - Only show to managers */}
        {permissions.canViewWorkspaceInvites && !invitesLoading && pendingInvites.length > 0 && (
          <PendingInvites
            invites={pendingInvites}
            onDeleteInvite={handleDeleteInvite}
            isDeleting={deleteInvite.isPending}
            canDelete={permissions.canDeleteInvite}
          />
        )}

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({members.length})
            </CardTitle>
            <CardDescription>
              Current workspace members and their roles
              {permissions.isManager && " - You can manage all members"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <MemberRow
                    key={member.userId._id}
                    member={member}
                    currentUserId={currentUserId}
                    permissions={permissions}
                    onUpdateRole={handleUpdateRole}
                    onRemoveMember={handleRemoveMember}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invite Dialog - Only show to managers */}
        {permissions.canCreateInvite && (
          <InviteDialog
            open={isInviteDialogOpen}
            onOpenChange={setIsInviteDialogOpen}
            workspaceId={workspaceId}
            onInviteSent={handleInviteSent}
          />
        )}
      </div>
    </div>
  );
}
