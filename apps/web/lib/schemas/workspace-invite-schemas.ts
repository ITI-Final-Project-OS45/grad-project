import { z } from "zod";

export const inviteMemberSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  role: z.enum(["Manager", "Developer", "Designer", "QA"]),
});

export type InviteMemberFormData = z.infer<typeof inviteMemberSchema>;
