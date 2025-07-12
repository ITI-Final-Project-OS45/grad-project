"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, GitBranch, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePrd, usePrdsByWorkspace } from "@/hooks/use-prds";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface PRDEditorProps {
  workspaceId: string;
  canEdit?: boolean;
}

export function PRDEditor({ workspaceId, canEdit = true }: PRDEditorProps) {
  // Get current PRD from workspace
  const { data: prds = [] } = usePrdsByWorkspace(workspaceId);
  const currentPrd = prds.length > 0 ? prds[0] : null;

  // PRD operations
  const { createPrd, updatePrd, isLoading } = usePrd();

  // Form state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showGenerateTasksDialog, setShowGenerateTasksDialog] = useState(false);
  const [pendingCreateData, setPendingCreateData] = useState<{ title: string; content: string } | null>(null);

  // Initialize form with current PRD data
  useEffect(() => {
    if (currentPrd) {
      setTitle(currentPrd.title);
      setContent(currentPrd.content);
    } else {
      // Reset for new PRD
      setTitle("");
      setContent("");
    }
  }, [currentPrd]);

  // Check if form has valid data
  const hasValidData = title.trim() !== "" && content.trim() !== "";

  // Check if data has changed from original
  const hasChanges = currentPrd ? title !== currentPrd.title || content !== currentPrd.content : hasValidData; // For new PRD, any valid data means "has changes"

  // Button states
  const canSaveChanges = currentPrd && hasChanges && hasValidData;
  const canCreateNew = hasValidData; // Can always create new if data is valid
  const canUpdate = canSaveChanges;

  const handleSaveChanges = async () => {
    if (!canEdit || !currentPrd) {
      toast.error("Cannot save changes");
      return;
    }

    try {
      await updatePrd.mutateAsync({
        prdId: currentPrd._id,
        data: { title, content },
      });
    } catch (error) {
      console.error("Failed to update PRD:", error);
    }
  };

  const handleCreateNew = async () => {
    if (!canEdit) {
      toast.error("You don't have permission to create PRDs");
      return;
    }

    // Store the data and show dialog for task generation choice
    setPendingCreateData({ title, content });
    setShowGenerateTasksDialog(true);
  };

  const handleConfirmCreate = async (generateTasks: boolean) => {
    if (!pendingCreateData) return;

    try {
      await createPrd.mutateAsync({
        workspaceId,
        data: { ...pendingCreateData, generateTasks },
      });
      setShowGenerateTasksDialog(false);
      setPendingCreateData(null);
    } catch (error) {
      console.error("Failed to create PRD:", error);
    }
  };

  // Show no access message if user can't edit
  if (!canEdit) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader>
            <CardTitle>No Edit Permission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You don&apos;t have permission to edit PRDs in this workspace. Only managers can create or edit PRDs.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const getStatusMessage = () => {
    if (!currentPrd) {
      return "Create your first PRD for this workspace. Both title and content are required.";
    }
    if (hasChanges) {
      return "You have unsaved changes";
    }
    return "Make changes to save or create a new version";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Action Buttons - Above the editor */}
      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">{currentPrd ? "Edit PRD" : "Create New PRD"}</h3>
          <p className="text-sm text-muted-foreground">{getStatusMessage()}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save Changes Button - only show if we have an existing PRD */}
          {currentPrd && (
            <Button variant="outline" size="sm" onClick={handleSaveChanges} disabled={!canUpdate || isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          )}

          {/* Create New Button - always show but with different labels */}
          <Button size="sm" onClick={handleCreateNew} disabled={!canCreateNew || isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitBranch className="w-4 h-4 mr-2" />}
            {currentPrd ? "Save as New Version" : "Create PRD"}
          </Button>
        </div>
      </div>

      {/* Editor Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter PRD title"
              disabled={!canEdit}
              className="text-lg font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <div className="border rounded-md overflow-hidden" data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(value) => setContent(value ?? "")}
                height={600}
                visibleDragbar={false}
                data-color-mode="light"
                textareaProps={{
                  placeholder: "Write your PRD content in Markdown format...",
                  autoCapitalize: "off",
                  disabled: !canEdit,
                  style: {
                    fontSize: "14px",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                    backgroundColor: "#ffffff",
                    color: "#000000",
                  },
                }}
                preview="edit"
                hideToolbar={false}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Tasks Dialog */}
      <Dialog open={showGenerateTasksDialog} onOpenChange={setShowGenerateTasksDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Auto-generate Tasks?
            </DialogTitle>
            <DialogDescription>
              Would you like to automatically generate tasks from your PRD content using AI? This will create a set of
              tasks based on the requirements in your document.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => handleConfirmCreate(false)} disabled={isLoading}>
              No, create PRD only
            </Button>
            <Button onClick={() => handleConfirmCreate(true)} disabled={isLoading}>
              <Sparkles className="w-4 h-4 mr-2" />
              Yes, generate tasks
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
