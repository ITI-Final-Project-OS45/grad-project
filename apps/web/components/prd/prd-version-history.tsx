"use client";

import { motion } from "framer-motion";
import { Calendar, User, Trash2, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { PRDPreview } from "./prd-preview";

interface Version {
  version: number;
  createdAt: string;
  createdBy: string;
  title: string;
  content?: string; // Add content for preview
}

interface PRDVersionHistoryProps {
  versions: Version[];
  currentVersion: number;
  onDeletePrd?: () => void;
  isDeleting?: boolean;
}

export function PRDVersionHistory({
  versions,
  currentVersion,
  onDeletePrd,
  isDeleting = false,
}: PRDVersionHistoryProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<Version | null>(null);
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  const handleDelete = () => {
    if (onDeletePrd) {
      onDeletePrd();
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Version History</CardTitle>
            {onDeletePrd && (
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Delete PRD
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete PRD</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this PRD? This action cannot be undone and will remove all
                      versions of the document permanently.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete PRD
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedVersions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No version history available yet.</p>
                <p className="text-sm">Create a new version to see history here.</p>
              </div>
            ) : (
              sortedVersions.map((version, index) => (
                <motion.div
                  key={version.version}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Version {version.version}</h4>
                      {version.version === currentVersion && <Badge variant="default">Current</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{version.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(version.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{version.createdBy}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Preview button for all versions */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => setPreviewVersion(version)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            Preview Version {version.version}
                            {version.version === currentVersion && (
                              <Badge variant="default" className="ml-2">
                                Current
                              </Badge>
                            )}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <PRDPreview
                            title={version.title}
                            content={version.content || "No content available for this version."}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
