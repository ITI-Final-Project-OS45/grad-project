"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DesignResponse } from "@repo/types";
import React from "react";
import Link from "next/link";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function DesignsList({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">{children}</div>;
}

export function DesignItem({
  design,
  workspacesId,
  onEditDesign,
  onDeleteDesign,
  isDeleting,
  canUpdateDesign,
  canDeleteDesign,
}: {
  design: DesignResponse;
  workspacesId: string;
  onEditDesign: (designId: string) => void;
  onDeleteDesign: (designId: string) => void;
  isDeleting?: boolean;
  canUpdateDesign: boolean;
  canDeleteDesign: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Link href={`/workspaces/${workspacesId}/designs/${design._id}`} className="block">
      <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50 group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                Design: {design._id}
              </CardTitle>
              <CardDescription className="text-sm">
                {design.type === "figma" ? "Figma Design" : "Mockup Design"}
              </CardDescription>
            </div>
            {canUpdateDesign && canDeleteDesign && (
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-muted shrink-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      onEditDesign(design._id);
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Design
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      onDeleteDesign(design._id);
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting ? "Deleting..." : "Delete Design"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              src={design.assetUrl || "/placeholder-design.png"}
              alt={design._id}
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
