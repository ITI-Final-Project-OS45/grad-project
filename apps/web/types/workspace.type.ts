export interface WorkspaceStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks?: number;
  todoTasks?: number;
  totalDesigns: number;
  totalMembers: number;
  totalReleases: number;
  activeReleases: number;
  completedReleases?: number;
  highPriorityTasks?: number;
  mediumPriorityTasks?: number;
  lowPriorityTasks?: number;
  overdueTasks?: number;
  dueSoonTasks?: number;
  designTypes?: Record<string, number>;
  memberRoles?: Record<string, number>;
  taskCompletionRate?: number;
  releaseCompletionRate?: number;
  workspaceActivity?: number;
}

export interface FeatureCard {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
}

export interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  action: () => void;
}
export interface ExtendedFeatureCard extends FeatureCard {
  gradient: string;
  pattern: string;
}
