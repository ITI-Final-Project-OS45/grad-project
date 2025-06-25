"use client";

import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface WorkspaceErrorProps {
  error?: Error | null;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export function WorkspaceError({ error, onRetry, onGoHome }: WorkspaceErrorProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-foreground font-semibold">Workspace Not Found</h2>
            <p className="text-muted-foreground text-sm">
              {error?.message || "The workspace you're looking for doesn't exist or you don't have access to it."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button onClick={onGoHome} className="flex-1">
              <Home className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
