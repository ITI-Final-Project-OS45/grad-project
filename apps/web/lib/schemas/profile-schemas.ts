import { z } from "zod";

// Profile Update Schema
export const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email address"),
});

// Export types
export type ProfileFormData = z.infer<typeof profileSchema>;
