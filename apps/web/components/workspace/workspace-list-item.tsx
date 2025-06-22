"use client";

import type React from "react";
import { Edit, MoreHorizontal, Trash2, Users, Building2, Clock } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Workspace } from "@/services/workspace.service";
import Link from "next/link";

interface WorkspaceListItemProps {
  workspace: Workspace;
  onWorkspaceClick: (id: string) => void;
  onEditWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
  isDeleting: boolean;
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
};

// Helper function to format relative time
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return "now";
  if (diffInMinutes < 60) return `${diffInMinutes}m`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo`;
};

export function WorkspaceListItem({
  workspace,
  onWorkspaceClick,
  onEditWorkspace,
  onDeleteWorkspace,
  isDeleting,
}: WorkspaceListItemProps) {
  const workspaceId = workspace._id;
  const memberCount = workspace.members?.length || 0;
  const relativeTime = formatRelativeTime(new Date(workspace.updatedAt));

  const handleWorkspaceClick = () => onWorkspaceClick(workspaceId);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onWorkspaceClick(workspaceId);
    }
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible" exit="exit" layout>
      <Card className="group relative bg-card hover:bg-accent/5 border border-border hover:border-primary/20 transition-all duration-200">
        <CardContent className="p-0">
          <div className="flex items-center">
            {/* Main clickable area */}
            <div
              className="flex-1 flex items-center gap-4 p-4 cursor-pointer"
              onClick={handleWorkspaceClick}
              onKeyDown={handleKeyDown}
              role="button"
              tabIndex={0}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-200">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <h3 className="font-semibold text-base text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                  {workspace.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-1 leading-relaxed">
                  {workspace.description || "No description provided"}
                </p>

                {/* Metadata row */}
                <div className="flex items-center gap-4 pt-0.5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{memberCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{relativeTime}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions area - separate from clickable area */}
            <div className="flex-shrink-0 flex items-center gap-1 px-4 py-4 border-l border-border/50">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs font-medium text-primary hover:bg-primary/10 hover:text-primary"
                asChild
              >
                <Link href={`/workspaces/${workspaceId}`}>Open</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem onClick={() => onEditWorkspace(workspaceId)} className="text-sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDeleteWorkspace(workspaceId)}
                    className="text-sm text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
