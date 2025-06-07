import { FolderKanban, Users, CheckCircle2, FileText } from "lucide-react";

export const STATISTICS_DATA = [
  {
    id: "projects",
    number: 150,
    label: "Active Projects",
    description: "Successfully managed workspaces",
    icon: FolderKanban,
    bgColor: "bg-rose-50 dark:bg-rose-950/20",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    id: "members",
    number: 2500,
    label: "Team Members",
    description: "Collaborating across projects",
    icon: Users,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    id: "tasks",
    number: 12000,
    label: "Tasks Completed",
    description: "Delivered features and fixes",
    icon: CheckCircle2,
    bgColor: "bg-green-50 dark:bg-green-950/20",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    id: "documents",
    number: 850,
    label: "PRD Documents",
    description: "Requirements documented",
    icon: FileText,
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
];
