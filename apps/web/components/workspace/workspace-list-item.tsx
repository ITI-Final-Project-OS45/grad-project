"use client";

import type React from "react";
import { Edit, MoreHorizontal, Trash2, Users, Calendar, ArrowRight, Folder } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    x: 20,
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
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
};

const childVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

export function WorkspaceListItem({
  workspace,
  onWorkspaceClick,
  onEditWorkspace,
  onDeleteWorkspace,
  isDeleting,
}: WorkspaceListItemProps) {
  const workspaceId = workspace._id;

  const handleWorkspaceClick = () => onWorkspaceClick(workspaceId);
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onWorkspaceClick(workspaceId);
    }
  };

  return (
    <motion.div variants={itemVariants} initial="hidden" animate="visible" exit="exit" layout>
      <Card className="group relative overflow-hidden border-0 bg-card hover:shadow-lg transition-all duration-300 cursor-pointer ring-1 ring-border/50 hover:ring-primary/20">
        {/* Left accent border */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors duration-300"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        />

        <CardContent className="relative p-6">
          <motion.div variants={contentVariants} initial="hidden" animate="visible">
            <div className="flex items-center justify-between">
              <div
                className="flex-1 cursor-pointer"
                onClick={handleWorkspaceClick}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <motion.div variants={childVariants}>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-200">
                      <Folder className="h-6 w-6 text-primary/70" />
                    </div>
                  </motion.div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <motion.div variants={childVariants} className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors duration-200 truncate">
                        {workspace.name}
                      </h3>
                    </motion.div>

                    <motion.p variants={childVariants} className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {workspace.description || "No description provided"}
                    </motion.p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </motion.div>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <motion.div variants={childVariants} className="flex items-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>5 members</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              <span>Updated {formatDistanceToNow(new Date(workspace.updatedAt), { addSuffix: true })}</span>
            </div>
          </motion.div>
          <Button
            size="lg"
            className="flex items-center gap-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            asChild
          >
            <Link href={`/workspaces/${workspaceId}`}>
              <span className="font-medium">Open</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
