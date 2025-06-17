"use client";

import type React from "react";
import { Edit, MoreHorizontal, Trash2, Users, Calendar, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import type { Workspace } from "@/services/workspace.service";
import Link from "next/link";

interface WorkspaceCardProps {
  workspace: Workspace;
  onWorkspaceClick: (id: string) => void;
  onEditWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
  isDeleting: boolean;
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export function WorkspaceCard({
  workspace,
  onWorkspaceClick,
  onEditWorkspace,
  onDeleteWorkspace,
  isDeleting,
}: WorkspaceCardProps) {
  const workspaceId = workspace._id;

  const handleWorkspaceClick = () => onWorkspaceClick(workspaceId);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onWorkspaceClick(workspaceId);
    }
  };

  return (
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
      <Card className="group relative overflow-hidden border-0 bg-card shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer ring-1 ring-border/50 hover:ring-primary/20">
        <CardContent className="relative p-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible">
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-start justify-between mb-4">
              <div
                className="flex-1 cursor-pointer"
                onClick={handleWorkspaceClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                    <div className="w-5 h-5 rounded bg-primary/60" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                      {workspace.name}
                    </h3>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-background/80">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background border-border shadow-lg">
                  <DropdownMenuItem
                    onClick={() => onEditWorkspace(workspaceId)}
                    className="hover:bg-accent hover:text-accent-foreground"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteWorkspace(workspaceId)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>

            {/* Description */}
            <motion.div variants={itemVariants} className="mb-6">
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {workspace.description || "No description provided"}
              </p>
            </motion.div>

            {/* TODO: MEMBERS */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <span>5 members</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true })}</span>
              </div>
              <Button
                size="sm"
                className="flex items-center gap-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                asChild
              >
                <Link href={`/workspaces/${workspaceId}`}>
                  <span className="font-medium">Open</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
