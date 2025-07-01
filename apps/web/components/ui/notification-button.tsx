"use client";

import { useState } from "react";
import { Bell, Mail, Check, X, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUserInvites, useInvites } from "@/hooks/use-invites";
import { cn } from "@/lib/utils";
import type { Invite } from "@/services/invite.service";

interface NotificationButtonProps {
  className?: string;
}

export function NotificationButton({ className }: NotificationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: invites = [], isLoading, refetch } = useUserInvites();
  const { respondToInvite } = useInvites();

  // Filter pending invites
  const pendingInvites = invites.filter((invite) => invite.status === "pending");
  const hasNotifications = pendingInvites.length > 0;

  const handleAcceptInvite = async (invite: Invite) => {
    await respondToInvite.mutateAsync({
      inviteId: invite._id,
      data: { action: "accept" },
    });
    refetch();
    setIsOpen(false);
  };

  const handleDeclineInvite = async (invite: Invite) => {
    await respondToInvite.mutateAsync({
      inviteId: invite._id,
      data: { action: "decline" },
    });
    refetch();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative h-9 w-9 rounded-full hover:bg-accent/80 transition-colors", className)}
        >
          <Bell className="h-4 w-4" />
          {hasNotifications && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {pendingInvites.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96" sideOffset={8}>
        <DropdownMenuLabel className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Notifications
          {hasNotifications && (
            <Badge variant="secondary" className="text-xs">
              {pendingInvites.length} pending
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(2)].map(() => (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : pendingInvites.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No pending invitations</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {pendingInvites.map((invite) => (
              <div key={invite._id} className="p-3 hover:bg-accent/50 transition-colors">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-primary/10">
                      <Users className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-sm font-medium">Workspace Invitation</span>
                      <Badge variant="outline" className="text-xs">
                        {invite.role}
                      </Badge>
                    </div>

                    <div className="mb-2">
                      <p className="text-sm text-foreground font-medium mb-1">{invite.workspaceId.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {invite.invitedBy.displayName} invited you to join this workspace
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <Clock className="h-3 w-3" />
                      {new Date(invite.sentAt).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="h-7 px-3 text-xs"
                        onClick={() => handleAcceptInvite(invite)}
                        disabled={respondToInvite.isPending}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-3 text-xs"
                        onClick={() => handleDeclineInvite(invite)}
                        disabled={respondToInvite.isPending}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
