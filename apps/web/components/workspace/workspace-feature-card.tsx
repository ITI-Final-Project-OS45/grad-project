"use client";

import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FeatureCard } from "@/types/workspace.type";

interface WorkspaceFeatureCardProps {
  feature: FeatureCard;
  onClick: () => void;
}

export function WorkspaceFeatureCard({ feature, onClick }: WorkspaceFeatureCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/20 group"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
              <feature.icon className={`w-5 h-5 ${feature.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
        <CardDescription className="mt-2">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {feature.features.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
              <span>{item}</span>
            </div>
          ))}
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          Open {feature.title}
        </Button>
      </CardContent>
    </Card>
  );
}
