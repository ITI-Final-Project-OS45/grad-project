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
              <CardTitle className="text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {design.description}
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
                    <MoreHorizontal className="h-4 w-4 inline-block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.preventDefault();
                      onEditDesign(design._id);
                      setOpen(false);
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
                      setOpen(false);
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
              src={
                design.type === "figma"
                  ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyIEyfClNU0SVPqlWPYBvqUG3JjBr-Orm3dw&s"
                  : design.assetUrl || "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
              }
              alt={design._id}
              className="w-full h-full object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
