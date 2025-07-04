import { Crown, Code, Palette, Bug } from "lucide-react";
import { UserRole } from "@repo/types";

export const roleConfig = {
  manager: {
    label: "Manager",
    icon: Crown,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-50 dark:bg-amber-950/20",
    borderColor: "border-amber-200 dark:border-amber-800",
    description: "Full access to workspace settings and member management",
  },
  developer: {
    label: "Developer",
    icon: Code,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    description: "Can create and manage releases, tasks, and bugs",
  },
  designer: {
    label: "Designer",
    icon: Palette,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    borderColor: "border-purple-200 dark:border-purple-800",
    description: "Can manage design assets and collaborate on requirements",
  },
  qa: {
    label: "QA",
    icon: Bug,
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    description: "Can test releases and manage bug reports",
  },
} as const;

export type RoleConfigKey = keyof typeof roleConfig;

export const getRoleConfig = (role: UserRole) => {
  return roleConfig[role.toLowerCase() as RoleConfigKey];
};
