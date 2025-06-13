"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { inviteMembersConstants } from "@/constants/workspace";
import {
  inviteMemberSchema,
  InviteMemberFormData,
} from "@/lib/schemas/workspace-invite-schemas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Mail, Copy } from "lucide-react";
import { toast } from "sonner";
interface InviteMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string | null;
}
export function InviteMembersDialog({
  open,
  onOpenChange,
  workspaceId,
}: InviteMembersDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [invites, setInvites] = useState<
    Array<{ email: string; role: string; id: string }>
  >([]);
  const [inviteLink, setInviteLink] = useState("");

  const form = useForm<InviteMemberFormData>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      emailOrUsername: "",
      role: "Developer",
    },
  });

  useEffect(() => {
    // Only access window on client side
    if (typeof window !== "undefined" && workspaceId) {
      setInviteLink(`${window.location.origin}/invite/${workspaceId}`);
    }
  }, [workspaceId]);

  const handleAddInvite: Parameters<typeof form.handleSubmit>[0] = (data) => {
    const newInvite = {
      id: Date.now().toString(),
      email: data.emailOrUsername,
      role: data.role,
    };
    setInvites((prev) => [...prev, newInvite]);
    form.reset({ emailOrUsername: "", role: "Developer" });
  };

  const handleRemoveInvite = (id: string) => {
    setInvites((prev) => prev.filter((invite) => invite.id !== id));
  };

  const handleSendInvites = async () => {};

  const handleCopyInviteLink = async () => {
    if (inviteLink && typeof window !== "undefined") {
      try {
        await navigator.clipboard.writeText(inviteLink);
        toast.success(inviteMembersConstants.dialog.copyLinkSuccess);
      } catch {
        toast.error(inviteMembersConstants.dialog.copyLinkError);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>{inviteMembersConstants.dialog.title}</DialogTitle>
            <DialogDescription>
              {inviteMembersConstants.dialog.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Invite Link */}
            <div className="space-y-2">
              <Label>{inviteMembersConstants.dialog.inviteLinkLabel}</Label>
              <div className="flex gap-2">
                <Input value={inviteLink} readOnly className="flex-1" />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {inviteMembersConstants.dialog.inviteLinkNote}
              </p>
            </div>

            {/* Add Individual Invites */}
            <div className="space-y-4">
              <Label>{inviteMembersConstants.dialog.addInvitesLabel}</Label>
              <form
                onSubmit={form.handleSubmit(handleAddInvite)}
                className="flex gap-2"
              >
                <Input
                  placeholder={
                    inviteMembersConstants.dialog.emailOrUsernamePlaceholder
                  }
                  {...form.register("emailOrUsername")}
                  className="flex-1"
                />
                <Select
                  value={form.watch("role")}
                  onValueChange={(value) =>
                    form.setValue(
                      "role",
                      value as "Manager" | "Developer" | "Designer" | "QA",
                    )
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Manager">
                      {inviteMembersConstants.dialog.roleManager}
                    </SelectItem>
                    <SelectItem value="Developer">
                      {inviteMembersConstants.dialog.roleDeveloper}
                    </SelectItem>
                    <SelectItem value="Designer">
                      {inviteMembersConstants.dialog.roleDesigner}
                    </SelectItem>
                    <SelectItem value="QA">
                      {inviteMembersConstants.dialog.roleQA}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="submit" size="sm">
                  <Mail className="w-4 h-4" />
                </Button>
              </form>
              {form.formState.errors.emailOrUsername && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.emailOrUsername.message}
                </p>
              )}
            </div>

            {/* Pending Invites */}
            {invites.length > 0 && (
              <div className="space-y-2">
                <Label>
                  {inviteMembersConstants.dialog.pendingInvitesLabel(
                    invites.length,
                  )}
                </Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {invites.map((invite) => (
                    <motion.div
                      key={invite.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="flex items-center justify-between p-2 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{invite.email}</span>
                        <Badge variant="secondary" className="text-xs">
                          {invite.role}
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveInvite(invite.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {inviteMembersConstants.dialog.cancelButton}
            </Button>
            <Button
              onClick={handleSendInvites}
              disabled={isLoading || invites.length === 0}
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {inviteMembersConstants.dialog.sendButton(invites.length)}
            </Button>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
