import { Users, Target, GitBranch, FileText } from "lucide-react";

export const ABOUT_CARD_DATA = [
  {
    icon: FileText,
    title: "PRD Management",
    description:
      "Create and version Project Requirements Documents with our markdown editor. Save versions with incremented numbers and export to PDF for stakeholder review.",
    tags: ["Markdown Editor", "Version Control"],
    gradient: "from-rose-600 via-rose-500 to-rose-400",
  },
  {
    icon: Target,
    title: "Design Phase",
    description:
      "Collaborate on design assets with Figma embedding, upload mockups and UI drafts. Version control for design iterations and seamless designer workflow.",
    tags: ["Figma Embed", "Asset Upload"],
    gradient: "from-gray-900 via-gray-800 to-black",
  },
  {
    icon: Users,
    title: "Development",
    description:
      "Assign tasks with priorities and due dates. Track status changes, get alerts for overdue items, and manage team workload with dashboard widgets.",
    tags: ["Task Assignment", "Due Date Alerts"],
    gradient: "from-rose-500 via-rose-600 to-rose-700",
  },
  {
    icon: GitBranch,
    title: "Release & Maintenance",
    description:
      "Plan releases with semantic versioning, track deployment status with QA approval. Manage hotfixes, bug reports, and post-deployment maintenance.",
    tags: ["Version Tags", "QA Workflow"],
    gradient: "from-black via-gray-800 to-gray-700",
  },
];
