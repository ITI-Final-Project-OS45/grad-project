"use client";

import { Mail, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Invite } from "@/services/invite.service";
import { getRoleConfig } from "./role-config";

interface PendingInvitesProps {
  invites: Invite[];
  onDeleteInvite: (inviteId: string) => void;
  isDeleting: boolean;
  canDelete: boolean; // New prop to control delete permission
}

export function PendingInvites({ invites, onDeleteInvite, isDeleting, canDelete }: PendingInvitesProps) {
  if (invites.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Pending Invitations ({invites.length})
        </CardTitle>
        <CardDescription>
          Invitations that have been sent but not yet accepted
          {!canDelete && " (View only)"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {invites.map((invite) => {
            const roleInfo = getRoleConfig(invite.role);
            const RoleIcon = roleInfo?.icon || Shield;

            return (
              <div key={invite._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium">{invite.userId.displayName || invite.userId.username}</div>
                    <div className="text-sm text-muted-foreground">
                      @{invite.userId.username} • Invited {new Date(invite.sentAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={`${roleInfo?.bgColor} ${roleInfo?.borderColor} gap-1.5`}>
                    <RoleIcon className={`h-3 w-3 ${roleInfo?.color}`} />
                    <span className={roleInfo?.color}>{roleInfo?.label}</span>
                  </Badge>
                  {canDelete ? (
                    <Button variant="ghost" size="sm" onClick={() => onDeleteInvite(invite._id)} disabled={isDeleting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <span className="text-sm text-muted-foreground px-2">View Only</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
