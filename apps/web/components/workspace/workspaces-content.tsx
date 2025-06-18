import { WorkspacesSkeleton } from "./workspaces-skeleton";
import { WorkspacesEmptyState } from "./workspaces-empty-state";
import { WorkspacesList } from "./workspaces-list";
import { useWorkspace } from "@/hooks/use-workspace";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import type { Workspace } from "@/services/workspace.service";

type ViewMode = "grid" | "list";

export function WorkspacesContent({
  workspaces,
  error,
  isLoading,
  viewMode,
  searchQuery,
  onWorkspaceClick,
  onEditWorkspace,
  onDeleteWorkspace,
  onCreateWorkspace,
  onClearSearch,
}: {
  workspaces?: Workspace[];
  error: Error | null;
  isLoading: boolean;
  viewMode: ViewMode;
  searchQuery: string;
  onWorkspaceClick: (id: string) => void;
  onEditWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
  onClearSearch: () => void;
}) {
  const { isDeleting } = useWorkspace();

  if (isLoading) {
    return <WorkspacesSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-destructive mb-2">Oops! Something went wrong</h2>
        <p className="text-muted-foreground">We couldn't load your workspaces. Please try refreshing the page.</p>
      </motion.div>
    );
  }

  const filteredWorkspaces =
    workspaces?.filter(
      (workspace) =>
        workspace?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        workspace?.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (filteredWorkspaces.length === 0) {
    return (
      <WorkspacesEmptyState
        hasWorkspaces={(workspaces?.length ?? 0) > 0}
        searchQuery={searchQuery}
        onCreateWorkspace={onCreateWorkspace}
        onClearSearch={searchQuery ? onClearSearch : undefined}
      />
    );
  }

  return (
    <WorkspacesList
      workspaces={filteredWorkspaces}
      viewMode={viewMode}
      onWorkspaceClick={onWorkspaceClick}
      onEditWorkspace={onEditWorkspace}
      onDeleteWorkspace={onDeleteWorkspace}
      isDeleting={isDeleting}
    />
  );
}
