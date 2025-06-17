import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ViewMode = "grid" | "list";

interface WorkspacesLoadingSkeletonProps {
  viewMode?: ViewMode;
  count?: number;
}

export function WorkspacesLoadingSkeleton({ viewMode = "grid", count = 6 }: WorkspacesLoadingSkeletonProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header Skeleton */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5 border-b border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-30" />

        <div className="container mx-auto px-6 py-12 relative">
          <div className="max-w-4xl">
            {/* Badge and Icon */}
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>

            <div className="mb-4">
              <Skeleton className="h-12 w-96 mb-2" />
              <Skeleton className="h-12 w-80" />
            </div>

            <div className="mb-8 space-y-2">
              <Skeleton className="h-6 w-full max-w-2xl" />
              <Skeleton className="h-6 w-3/4 max-w-xl" />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card
              key={`stat-skeleton-${index}`}
              className="bg-gradient-to-br from-muted/30 to-muted/10 border border-border/50 animate-pulse"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 pb-12">
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <Skeleton className="h-11 w-full rounded-md" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-20" />
              <Skeleton className="h-9 w-16" />
              <div className="flex border border-border/50 rounded-lg overflow-hidden bg-background/50">
                <Skeleton className="h-9 w-10 rounded-none" />
                <Skeleton className="h-9 w-10 rounded-none" />
              </div>
            </div>
          </div>
        </div>

        <WorkspacesSkeleton viewMode={viewMode} count={count} />
      </div>
    </div>
  );
}

export function WorkspacesSkeleton({ viewMode, count = 6 }: { viewMode: ViewMode; count?: number }) {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, index) => (
          <Card
            key={`grid-skeleton-${index}`}
            className="group relative overflow-hidden border-0 bg-background shadow-sm ring-1 ring-border/50 animate-pulse"
          >
            {/* Gradient background skeleton */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/10 opacity-30" />

            <CardContent className="relative p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-3/4 mb-1" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>

              {/* Description */}
              <div className="mb-6 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-3.5 w-3.5 rounded" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-12 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={`list-skeleton-${index}`}
          className="group relative overflow-hidden border-0 bg-background ring-1 ring-border/50 animate-pulse"
        >
          {/* Left accent border skeleton */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20" />

          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <Skeleton className="w-12 h-12 rounded-xl" />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Skeleton className="h-6 w-48" />
                      <Skeleton className="h-5 w-12 rounded-full" />
                    </div>

                    <Skeleton className="h-4 w-3/4 mb-2" />

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <Skeleton className="h-4 w-16 mr-2" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
