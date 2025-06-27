"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInvites } from "@/hooks/use-invites";
import { toast } from "sonner";
import { UserRole } from "@repo/types";
import { roleConfig, getRoleConfig } from "./role-config";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onInviteSent: () => void;
}

export function InviteDialog({ open, onOpenChange, workspaceId, onInviteSent }: InviteDialogProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.Developer);
  const { createInvite, isCreating } = useInvites();

  const handleSendInvite = async () => {
    if (!emailOrUsername.trim()) {
      toast.error("Please enter an email or username");
      return;
    }

    try {
      await createInvite.mutateAsync({
        workspaceId,
        data: {
          usernameOrEmail: emailOrUsername.trim(),
          role: selectedRole,
        },
      });

      setEmailOrUsername("");
      setSelectedRole(UserRole.Developer);
      onOpenChange(false);
      onInviteSent();
    } catch (error) {
      console.error("Failed to send invite:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite someone to collaborate on this workspace by entering their email or username.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="emailOrUsername">Email or Username</Label>
            <Input
              id="emailOrUsername"
              placeholder="Enter email or username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendInvite} disabled={isCreating || !emailOrUsername.trim()}>
            {isCreating ? "Sending..." : "Send Invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
