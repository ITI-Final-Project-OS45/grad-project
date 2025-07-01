"use client";

import { useState } from "react";
import { Edit, Trash2, MoreHorizontal, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserRole } from "@repo/types";
import type { WorkspaceMember } from "@/services/workspace-member.service";
import { roleConfig, getRoleConfig } from "./role-config";
import { RemoveMemberDialog } from "./remove-member-dialog";

interface MemberRowProps {
  member: WorkspaceMember;
  currentUserId?: string;
  permissions: {
    canUpdateMemberRole: boolean;
    canRemoveMember: boolean;
    isManager: boolean;
    getPermissionContext: (targetUserId?: string) => any;
  };
  onUpdateRole: (memberId: string, newRole: UserRole) => void;
  onRemoveMember: (memberId: string) => Promise<void>;
}

export function MemberRow({ member, currentUserId, permissions, onUpdateRole, onRemoveMember }: MemberRowProps) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(member.role);
  const [isRemoving, setIsRemoving] = useState(false);
  const roleInfo = getRoleConfig(member.role);
  const RoleIcon = roleInfo?.icon || Shield;

  const isCurrentUser = member.userId._id === currentUserId;

  // Only managers can modify other members (not themselves)
  const canModifyThisMember = permissions.canUpdateMemberRole && !isCurrentUser;
  const canRemoveThisMember = permissions.canRemoveMember && !isCurrentUser;

  const handleUpdateRole = () => {
    if (selectedRole !== member.role) {
      onUpdateRole(member.userId.username || member.userId.email, selectedRole);
    }
    setIsUpdateDialogOpen(false);
  };

  const handleRemoveMember = async (memberId: string) => {
    setIsRemoving(true);
    try {
      await onRemoveMember(memberId);
    } finally {
      setIsRemoving(false);
    }
  };

  const getActionStatus = () => {
    if (isCurrentUser) return "You";
    if (!permissions.isManager) return "View Only";
    return "Manage";
  };

  return (
    <>
      <TableRow className="hover:bg-muted/50">
        <TableCell>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {member.userId.displayName?.slice(0, 2).toUpperCase() ||
                  member.userId.username?.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {member.userId.displayName || member.userId.username}
                {isCurrentUser && (
                  <Badge variant="secondary" className="text-xs">
                    You
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                @{member.userId.username} • Joined {new Date(member.joinedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className={`${roleInfo?.bgColor} ${roleInfo?.borderColor} gap-1.5`}>
            <RoleIcon className={`h-3 w-3 ${roleInfo?.color}`} />
            <span className={roleInfo?.color}>{roleInfo?.label}</span>
          </Badge>
        </TableCell>
        <TableCell>
          <div className="text-sm text-muted-foreground">{roleInfo?.description}</div>
        </TableCell>
        <TableCell>
          {canModifyThisMember || canRemoveThisMember ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {canModifyThisMember && (
                  <DropdownMenuItem onClick={() => setIsUpdateDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Role
                  </DropdownMenuItem>
                )}
                {canModifyThisMember && canRemoveThisMember && <DropdownMenuSeparator />}
                {canRemoveThisMember && (
                  <DropdownMenuItem className="text-destructive" onClick={() => setIsRemoveDialogOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove Member
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <span className="text-sm text-muted-foreground">{getActionStatus()}</span>
          )}
        </TableCell>
      </TableRow>

      {/* Update Role Dialog - Only show to managers */}
      {canModifyThisMember && (
        <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Member Role</DialogTitle>
              <DialogDescription>
                Change the role for {member.userId.displayName || member.userId.username}. This will affect their
                permissions and access level.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="role">Select New Role</Label>
                <Select value={selectedRole} onValueChange={(value: UserRole) => setSelectedRole(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(roleConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <config.icon className={`h-4 w-4 ${config.color}`} />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedRole && (
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <div className="text-sm font-medium mb-1">{getRoleConfig(selectedRole)?.label} Role</div>
                  <div className="text-sm text-muted-foreground">{getRoleConfig(selectedRole)?.description}</div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUpdateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={selectedRole === member.role}>
                Update Role
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Remove Member Dialog */}
      <RemoveMemberDialog
        member={member}
        open={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        onConfirm={handleRemoveMember}
        isDeleting={isRemoving}
      />
    </>
  );
}
