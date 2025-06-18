"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { WorkspaceCard } from "./workspace-card";
import { WorkspaceListItem } from "./workspace-list-item";
import type { Workspace } from "@/services/workspace.service";

type ViewMode = "grid" | "list";

interface WorkspacesListProps {
  workspaces: Workspace[];
  viewMode: ViewMode;
  onWorkspaceClick: (id: string) => void;
  onEditWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
  isDeleting: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function WorkspacesList({
  workspaces,
  viewMode,
  onWorkspaceClick,
  onEditWorkspace,
  onDeleteWorkspace,
  isDeleting,
}: WorkspacesListProps) {
  if (viewMode === "grid") {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {workspaces.map((workspace, index) => (
            <motion.div key={workspace._id} variants={itemVariants} layout custom={index}>
              <WorkspaceCard
                workspace={workspace}
                onWorkspaceClick={onWorkspaceClick}
                onEditWorkspace={onEditWorkspace}
                onDeleteWorkspace={onDeleteWorkspace}
                isDeleting={isDeleting}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
      <AnimatePresence mode="popLayout">
        {workspaces.map((workspace, index) => (
          <motion.div key={workspace._id} variants={itemVariants} layout custom={index}>
            <WorkspaceListItem
              workspace={workspace}
              onWorkspaceClick={onWorkspaceClick}
              onEditWorkspace={onEditWorkspace}
              onDeleteWorkspace={onDeleteWorkspace}
              isDeleting={isDeleting}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
