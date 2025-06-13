"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = async (data: CreateWorkspaceFormData) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to create workspace
      console.log("Creating workspace:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating workspace:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>Create New Workspace</DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your projects and collaborate with your team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name *</Label>
              <Input
                id="name"
                placeholder="Enter workspace name"
                {...form.register("name")}
                className={form.formState.errors.name ? "border-destructive" : ""}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your workspace (optional)"
                rows={3}
                {...form.register("description")}
                className={form.formState.errors.description ? "border-destructive" : ""}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Workspace
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
