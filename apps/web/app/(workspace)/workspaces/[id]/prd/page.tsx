"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Download, History, Eye, FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRDEditor } from "@/components/prd/prd-editor";
import { PRDPreview } from "@/components/prd/prd-preview";
import { PRDVersionHistory } from "@/components/prd/prd-version-history";
import { toast } from "sonner";
import { containerVariants, itemVariants } from "@/constants/variants/workspace.variants";
import { usePrd, usePrdsByWorkspace } from "@/hooks/use-prds";
import { useWorkspaceById } from "@/hooks/use-workspace";
import { useUser } from "@/hooks/use-user";
import { useWorkspacePermissions } from "@/lib/permissions";
import { Skeleton } from "@/components/ui/skeleton";
import { PrdExportService } from "@/lib/prd-export";

export default function PRDPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  // Hooks
  const { data: workspace } = useWorkspaceById(workspaceId);
  const { currentUser } = useUser();
  const { data: prds = [], isLoading: prdsLoading, error: prdsError } = usePrdsByWorkspace(workspaceId);
  const { createPrd, updatePrd, deletePrd, isCreating, isUpdating, isDeleting, isLoading: prdActionLoading } = usePrd();

  // Current PRD (since PRDs are per workspace, we take the first one)
  const currentPrd = prds.length > 0 ? prds[0] : null;

  // Get current user's workspace role and permissions
  const currentUserId = currentUser?.data?._id;
  const currentUserMember = workspace?.members?.find((m) => m.userId === currentUserId);
  const currentUserRole = currentUserMember?.role;
  const permissions = useWorkspacePermissions(currentUserId, currentUserRole, workspace?.createdBy);

  // State for editor
  const [currentEditTitle, setCurrentEditTitle] = useState("");
  const [currentEditContent, setCurrentEditContent] = useState("");
  const [activeTab, setActiveTab] = useState(permissions.isManager ? "create" : "preview");
  const [isExporting, setIsExporting] = useState(false);

  // Set default tab based on permissions
  useEffect(() => {
    if (permissions.isManager) {
      setActiveTab("create");
    } else if (currentPrd) {
      setActiveTab("preview");
    } else {
      setActiveTab("preview"); // Will show the no access message
    }
  }, [permissions.isManager, currentPrd]);

  // Initialize edit state when PRD loads
  useEffect(() => {
    if (currentPrd) {
      setCurrentEditTitle(currentPrd.title);
      setCurrentEditContent(currentPrd.content);
    } else {
      // Initialize with empty state for new PRD
      setCurrentEditTitle("");
      setCurrentEditContent("");
    }
  }, [currentPrd]);

  // Handle editor changes - this preserves the content across tab switches
  const handleEditorChange = (title: string, content: string) => {
    setCurrentEditTitle(title);
    setCurrentEditContent(content);
  };

  const handleDeletePrd = async () => {
    if (!permissions.isManager) {
      toast.error("Only managers can delete PRDs");
      return;
    }

    if (!currentPrd) return;

    try {
      await deletePrd.mutateAsync({
        prdId: currentPrd._id,
        workspaceId: workspaceId,
      });
    } catch (error) {
      console.error("Failed to delete PRD:", error);
    }
  };

  const handleExportPDF = async () => {
    if (!currentPrd) {
      toast.error("No PRD to export");
      return;
    }

    setIsExporting(true);

    try {
      await PrdExportService.exportToPDF({
        title: currentPrd.title,
        content: currentPrd.content,
        createdBy: currentPrd.createdBy.displayName,
        lastModified: currentPrd.updatedAt,
        version: currentPrd.versions.length + 1,
        workspaceName: workspace?.name,
      });

      toast.success("PRD exported to PDF successfully!");
    } catch (error) {
      console.error("Failed to export PDF:", error);
      toast.error("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Loading state
  if (prdsLoading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-6 space-y-6"
      >
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <Skeleton className="h-8 w-64" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Skeleton className="h-96 w-full" />
        </motion.div>
      </motion.div>
    );
  }

  // Error state
  if (prdsError) {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container mx-auto p-6 space-y-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading PRD</CardTitle>
            <CardDescription>There was an error loading the PRD for this workspace. Please try again.</CardDescription>
          </CardHeader>
        </Card>
      </motion.div>
    );
  }

  const isSaving = prdActionLoading;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <CardTitle className="text-2xl">
                    {currentPrd ? currentPrd.title : "Product Requirements Document"}
                  </CardTitle>
                  {currentPrd && <Badge variant="secondary">v{currentPrd.versions.length + 1}</Badge>}
                </div>
                <CardDescription>
                  {currentPrd ? (
                    <>
                      Last modified {new Date(currentPrd.updatedAt).toLocaleDateString()} by{" "}
                      {currentPrd.createdBy.displayName}
                    </>
                  ) : (
                    "No PRD exists for this workspace yet"
                  )}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {currentPrd && (
                  <Button variant="outline" size="sm" onClick={handleExportPDF} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export PDF"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className={`grid w-full ${permissions.isManager ? "grid-cols-3" : "grid-cols-2"}`}>
            {permissions.isManager && (
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create/Edit
              </TabsTrigger>
            )}
            <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!currentPrd}>
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2" disabled={!currentPrd}>
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {permissions.isManager && (
            <TabsContent value="create" className="space-y-4">
              <PRDEditor workspaceId={workspaceId} canEdit={permissions.isManager} />
            </TabsContent>
          )}

          {currentPrd && (
            <>
              <TabsContent value="preview" className="space-y-4">
                <PRDPreview title={currentEditTitle} content={currentEditContent} />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <PRDVersionHistory
                  versions={currentPrd.versions.map((v) => ({
                    version: v.versionNo,
                    createdAt: currentPrd.createdAt,
                    createdBy: currentPrd.createdBy.displayName,
                    title: v.title,
                    content: v.content, // Add content for preview
                  }))}
                  currentVersion={currentPrd.versions.length + 1}
                  onDeletePrd={permissions.isManager ? handleDeletePrd : undefined}
                  isDeleting={isDeleting}
                />
              </TabsContent>
            </>
          )}

          {/* Show message for non-managers */}
          {!permissions.isManager && (
            <div className="text-center py-12">
              <Card>
                <CardHeader>
                  <CardTitle>View Only Access</CardTitle>
                  <CardDescription>
                    You can view PRDs in this workspace, but only managers can create or edit them.
                    {currentPrd
                      ? " Use the Preview and History tabs to explore the current PRD."
                      : " No PRD exists for this workspace yet."}
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          )}
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
