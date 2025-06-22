"use client";

import type React from "react";
import { Edit, MoreHorizontal, Trash2, Users, ArrowRight, Building2, Clock } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.2,
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

export function WorkspaceCard({
  workspace,
  onWorkspaceClick,
  onEditWorkspace,
  onDeleteWorkspace,
  isDeleting,
}: WorkspaceCardProps) {
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
    <motion.div variants={cardVariants} initial="hidden" animate="visible" exit="exit" layout>
      <Card className="group relative bg-card hover:bg-accent/5 border border-border hover:border-primary/20 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5">
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div
              className="flex-1 cursor-pointer"
              onClick={handleWorkspaceClick}
              onKeyDown={handleKeyDown}
              tabIndex={0}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-all duration-200">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-1">
                    {workspace.name}
                  </h3>
                </div>
              </div>
            </div>

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
        </CardHeader>

        {/* Content */}
        <CardContent className="pt-0 pb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem] mb-4">
            {workspace.description || "No description provided"}
          </p>

          {/* Metadata - Only show once, no duplicate badges */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span className="font-medium">
                {memberCount} member{memberCount !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>{relativeTime}</span>
            </div>
          </div>
        </CardContent>

        {/* Footer with Action Button */}
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 font-medium border-border hover:border-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
            asChild
          >
            <Link href={`/workspaces/${workspaceId}`} className="flex items-center justify-center gap-2">
              Open Workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
