"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { Download, History, Edit3, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PRDEditor } from "@/components/prd/prd-editor";
import { PRDPreview } from "@/components/prd/prd-preview";
import { PRDVersionHistory } from "@/components/prd/prd-version-history";
import { toast } from "sonner";
import { containerVariants, itemVariants } from "@/constants/variants/workspace.variants";

export default function PRDPage() {
  const params = useParams();
  const workspaceId = params.id as string;

  const [prd, setPrd] = useState({
    id: "prd-123",
    title: "Sample PRD Title",
    content: "This is the content of the PRD.",
    currentVersion: 1,
    lastModified: new Date().toISOString(),
    modifiedBy: "Mohamed Hesham",
    versions: [
      {
        version: 1,
        createdAt: new Date().toISOString(),
        createdBy: "Mohamed Hesham",
        title: "Initial Version",
      },
    ],
  });
  const [currentEditTitle, setCurrentEditTitle] = useState(prd.title);
  const [currentEditContent, setCurrentEditContent] = useState(prd.content);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");

  // Initialize edit state when PRD loads
  useEffect(() => {
    setCurrentEditTitle(prd.title);
    setCurrentEditContent(prd.content);
  }, [prd.title, prd.content]);

  // Handle editor changes - this preserves the content across tab switches
  const handleEditorChange = (title: string, content: string) => {
    setCurrentEditTitle(title);
    setCurrentEditContent(content);
  };

  const handleSave = async (content: string, title: string) => {};
  const handleSaveAsNewVersion = async (content: string, title: string) => {};

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    toast.success("Your PRD is being exported to PDF");
  };

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
                  <CardTitle className="text-2xl">{prd.title}</CardTitle>
                  <Badge variant="secondary">v{prd.currentVersion}</Badge>
                </div>
                <CardDescription>
                  Last modified {new Date(prd.lastModified).toLocaleDateString()} by {prd.modifiedBy}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleExportPDF}>
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Content */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Edit3 className="w-4 h-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <PRDEditor
              title={currentEditTitle}
              content={currentEditContent}
              onSave={handleSave}
              onSaveAsNewVersion={handleSaveAsNewVersion}
              onChange={handleEditorChange}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <PRDPreview title={currentEditTitle} content={currentEditContent} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <PRDVersionHistory
              versions={prd.versions}
              currentVersion={prd.currentVersion}
              onRestoreVersion={(version) => {
                // TODO: Implement version restoration
                console.log("Restoring version:", version);
              }}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
