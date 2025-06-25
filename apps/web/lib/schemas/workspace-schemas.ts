import { z } from "zod";

// Create Workspace Schema
export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

// Edit Workspace Schema
export const editWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

// Export types
export type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;
export type EditWorkspaceFormData = z.infer<typeof editWorkspaceSchema>;
