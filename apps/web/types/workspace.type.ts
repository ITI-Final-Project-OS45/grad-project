export interface WorkspaceStats {
  totalTasks: number;
  completedTasks: number;
  totalDesigns: number;
  totalMembers: number;
  totalReleases: number;
  activeReleases: number;
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
