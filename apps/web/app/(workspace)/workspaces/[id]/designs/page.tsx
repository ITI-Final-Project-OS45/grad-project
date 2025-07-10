"use client";

import { CreateDesignDialog } from "@/components/design/create-design-dialog";
import { UpdateDesignDialog } from "@/components/design/update-design-dialog";
import { useDesign, useDesigns } from "@/hooks/use-designs";
import type { DesignResponse } from "@repo/types";
import { useParams } from "next/navigation";
import React from "react";
import { Palette, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useWorkspacePermissions } from "@/lib/permissions";
import { useUser } from "@/hooks/use-user";
import { useWorkspaceMembersByWorkspace } from "@/hooks/use-workspace-members";
import { DesignsList, DesignItem } from "@/components/design/designs-list";

export default function DesignsPage() {
  const { id: workspaceId }: { id: string } = useParams();
  const { data: designs, error, isLoading } = useDesigns(workspaceId);
  const { createDesign, updateDesign, deleteDesign } = useDesign(workspaceId);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editingDesign, setEditingDesign] = React.useState<DesignResponse | null>(null);

  // Get current user and workspace members
  const { currentUser } = useUser();
  const { data: members = [] } = useWorkspaceMembersByWorkspace(workspaceId);
  const currentUserId = currentUser?.data?._id;
  const currentUserMember = members.find((m) => m.userId._id === currentUserId);
  const currentUserRole = currentUserMember?.role;
  // Use correct permissions
  const { canCreateDesign, canUpdateDesign, canDeleteDesign } = useWorkspacePermissions(currentUserId, currentUserRole);

  function onDeleteDesign(designId: string) {
    console.log("Delete design  of ID:", designId);
    deleteDesign.mutateAsync(designId);
  }

  function onEditDesign(designId: string) {
    const design = designs?.find((d) => d._id === designId);

    if (design == null) {
      toast.error("No Design to update");
      return;
    }
    setEditingDesign(design);
    console.log(design);
    setEditDialogOpen(true);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-0 right-0 w-48 h-48 md:w-96 md:h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-800/50">
                <Palette className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge
                variant="secondary"
                className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950/30 dark:to-pink-950/30 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50 text-xs sm:text-sm"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                Project Visuals
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
              Your Brilliant{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Design Assets
              </span>
              <span className="inline-block ml-2">🖌️</span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-2xl">
              Collect, manage, and reuse your creative visuals in one place. From logos to mockups, keep everything
              ready to spark your next big idea.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              {canCreateDesign && <CreateDesignDialog workspacesId={workspaceId} createDesign={createDesign} />}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading designs...</div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-destructive">Error loading designs: {error.message}</div>
          </div>
        )}

        {!isLoading && !error && designs && designs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Palette className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No designs yet</h3>
            {canCreateDesign && (
              <>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Get started by creating your first design asset. Upload images, mockups, or connect your Figma
                  designs.
                </p>
                <CreateDesignDialog workspacesId={workspaceId} createDesign={createDesign} />
              </>
            )}
          </div>
        )}

        {designs && designs.length > 0 && (
          <DesignsList>
            {designs.map((design) => (
              <DesignItem
                key={design._id}
                design={design}
                workspacesId={workspaceId}
                onEditDesign={onEditDesign}
                onDeleteDesign={onDeleteDesign}
                canUpdateDesign={canUpdateDesign}
                canDeleteDesign={canDeleteDesign}
              />
            ))}
          </DesignsList>
        )}
      </div>

      {/* Edit Design Dialog */}
      {editingDesign && canUpdateDesign && (
        <UpdateDesignDialog
          workspacesId={workspaceId}
          editingDesign={editingDesign}
          open={editDialogOpen}
          setOpen={setEditDialogOpen}
        />
      )}
    </div>
  );
}
