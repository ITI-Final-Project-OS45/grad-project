"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dynamic from "next/dynamic";
import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface PRDEditorProps {
  title: string;
  content: string;
  onSave: (content: string, title: string) => Promise<void>;
  onSaveAsNewVersion: (content: string, title: string) => Promise<void>;
  onChange?: (title: string, content: string) => void;
  isSaving: boolean;
}

export function PRDEditor({ title, content, onSave, onSaveAsNewVersion, onChange, isSaving }: PRDEditorProps) {
  const [editTitle, setEditTitle] = useState(title);
  const [editContent, setEditContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Only initialize once or when explicitly reset
  useEffect(() => {
    if (!isInitialized) {
      setEditTitle(title);
      setEditContent(content);
      setIsInitialized(true);
    }
  }, [title, content, isInitialized]);

  // Reset state when saved (when title and content match what we have)
  useEffect(() => {
    if (editTitle === title && editContent === content) {
      setHasChanges(false);
    }
  }, [title, content, editTitle, editContent]);

  useEffect(() => {
    const titleChanged = editTitle !== title;
    const contentChanged = editContent !== content;
    setHasChanges(titleChanged || contentChanged);

    // Call onChange when content changes
    if (onChange) {
      onChange(editTitle, editContent);
    }
  }, [editTitle, editContent, title, content, onChange]);

  const handleTitleChange = (newTitle: string) => {
    setEditTitle(newTitle);
  };

  const handleContentChange = (newContent: string | undefined) => {
    setEditContent(newContent ?? "");
  };

  const handleSave = () => {
    onSave(editContent, editTitle);
  };

  const handleSaveAsNewVersion = () => {
    onSaveAsNewVersion(editContent, editTitle);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit PRD</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSave} disabled={!hasChanges || isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Changes
              </Button>
              <Button size="sm" onClick={handleSaveAsNewVersion} disabled={!hasChanges || isSaving}>
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <GitBranch className="w-4 h-4 mr-2" />}
                Save as New Version
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              value={editTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter PRD title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content (Markdown)</Label>
            <div className="border rounded-md overflow-hidden">
              <MDEditor
                value={editContent}
                onChange={handleContentChange}
                height={600}
                visibleDragbar={false}
                textareaProps={{
                  placeholder: "Write your PRD content in Markdown format...",
                  autoCapitalize: "off",
                  style: {
                    fontSize: "14px",
                    fontFamily:
                      'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                  },
                }}
              />
            </div>
          </div>
          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-muted-foreground bg-muted p-2 rounded-md"
            >
              You have unsaved changes
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
