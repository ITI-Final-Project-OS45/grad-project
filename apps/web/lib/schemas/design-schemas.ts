import { z } from "zod";

// Create Workspace Schema
export const ZDesignsSchema = z.object({
    type: z.enum(["figma", "mockup"], { required_error: "Workspace type is required" }),
    description: z.string().max(500, "Description must be less than 500 characters").optional(),
    assetUrl: z.string().url("Must be a valid URL").max(500, "URL must be less than 500 characters").optional(),
    file: z.instanceof(FileList).optional(),
})

// Edit Workspace Schema
// export const editWorkspaceSchema = z.object({
//   name: z.string().min(1, "Workspace name is required").max(100, "Name must be less than 100 characters"),
//   description: z.string().max(500, "Description must be less than 500 characters").optional(),
// });

// Export types
export type ZDesignsFormData = z.infer<typeof ZDesignsSchema>;
// export type EditWorkspaceFormData = z.infer<typeof editWorkspaceSchema>;
