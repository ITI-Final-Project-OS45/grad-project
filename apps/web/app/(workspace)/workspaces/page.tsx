"use client";

import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Plus, Search, Grid3X3, List, Sparkles, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { useRouter } from "next/navigation";
import { WorkspacesContent } from "@/components/workspace/workspaces-content";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { EditWorkspaceDialog } from "@/components/workspace/edit-workspace-dialog";
import { DeleteWorkspaceDialog } from "@/components/workspace/delete-workspace-dialog";
import { useWorkspaces } from "@/hooks/use-workspace";
import { tokenManager } from "@/lib/token";

type ViewMode = "grid" | "list";

const pageVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const toolbarVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const statsVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const statItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export default function WorkspacesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<string | null>(null);
  const [deletingWorkspace, setDeletingWorkspace] = useState<string | null>(null);

  const router = useRouter();
  const { data: workspaces, error, isLoading } = useWorkspaces();

  // Calculate unique team members across all workspaces (including current user)
  const uniqueTeamMembersCount = useMemo(() => {
    if (!workspaces || workspaces.length === 0) return 0;

    const uniqueUserIds = new Set<string>();

    workspaces.forEach((workspace) => {
      if (workspace.members && workspace.members.length > 0) {
        workspace.members.forEach((member) => {
          uniqueUserIds.add(member.userId);
        });
      }
    });

    return uniqueUserIds.size;
  }, [workspaces]);

  const handleWorkspaceClick = (workspaceId: string) => {
    router.push(`/workspaces/${workspaceId}`);
  };

  const handleEditWorkspace = (workspaceId: string) => {
    setEditingWorkspace(workspaceId);
  };

  const handleDeleteWorkspace = (workspaceId: string) => {
    setDeletingWorkspace(workspaceId);
  };

  const handleCreateWorkspace = () => {
    setShowCreateDialog(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  return (
    <motion.div variants={pageVariants} initial="hidden" animate="visible" className="min-h-screen bg-background">
      <motion.div
        variants={headerVariants}
        className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border/50"
      >
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <motion.div
          className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <div className="container mx-auto px-6 py-12 relative">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <motion.div
                className="p-2 rounded-xl bg-primary/10 border border-primary/20"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Users className="h-6 w-6 text-primary" />
              </motion.div>
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Team Collaboration
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight"
            >
              Your Creative{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Workspaces
              </span>
              <motion.span
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3 }}
                className="inline-block ml-2"
              >
                ✨
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl"
            >
              Organize your projects, collaborate with your team, and bring your ideas to life. Each workspace is your
              digital headquarters for innovation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={handleCreateWorkspace}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                >
                  <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }} className="mr-2">
                    <Plus className="h-5 w-5" />
                  </motion.div>
                  Create New Workspace
                  <motion.div
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="ml-2"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.div>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Stats Section */}
      <motion.div variants={statsVariants} className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            variants={statItemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-6 rounded-xl border border-blue-200/50 dark:border-blue-800/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Workspaces</span>
            </div>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{workspaces?.length ?? 0}</p>
            <p className="text-sm text-blue-600/70 dark:text-blue-400/70">Across all teams and projects</p>
          </motion.div>

          <motion.div
            variants={statItemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-6 rounded-xl border border-purple-200/50 dark:border-purple-800/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Team Members</span>
            </div>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{uniqueTeamMembersCount}</p>
            <p className="text-sm text-purple-600/70 dark:text-purple-400/70">Unique collaborators</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12">
        {/* Enhanced Toolbar */}
        <motion.div variants={toolbarVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-background/50 border-border/50 hover:border-border focus:border-primary/50 transition-colors"
                />
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearSearch}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent"
                    >
                      ×
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex border border-border/50 rounded-lg overflow-hidden bg-background/50">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none border-0 h-9"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-none border-0 h-9"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <WorkspacesContent
          workspaces={workspaces}
          error={error}
          isLoading={isLoading}
          viewMode={viewMode}
          searchQuery={searchQuery}
          onWorkspaceClick={handleWorkspaceClick}
          onEditWorkspace={handleEditWorkspace}
          onDeleteWorkspace={handleDeleteWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
          onClearSearch={handleClearSearch}
        />
      </div>

      {/* Dialogs */}
      <CreateWorkspaceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />

      {editingWorkspace && (
        <EditWorkspaceDialog
          workspaceId={editingWorkspace}
          open={!!editingWorkspace}
          onClose={() => setEditingWorkspace(null)}
        />
      )}

      {deletingWorkspace && (
        <DeleteWorkspaceDialog
          workspaceId={deletingWorkspace}
          open={!!deletingWorkspace}
          onClose={() => setDeletingWorkspace(null)}
        />
      )}
    </motion.div>
  );
}
