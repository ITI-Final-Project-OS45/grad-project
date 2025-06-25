"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

interface UserStatsProps {
  workspaceCount: number;
  daysActive: number;
  lastUpdated: string;
}

export function UserStats({ workspaceCount, daysActive, lastUpdated }: UserStatsProps) {
  const stats = [
    {
      label: "Workspaces",
      value: workspaceCount,
      description: "Active memberships",
    },
    {
      label: "Days Active",
      value: daysActive,
      description: "Since joining",
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Account Statistics</CardTitle>
        <CardDescription>Overview of your account activity</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <div className="grid gap-6 grid-cols-2 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-lg bg-muted/50"
            >
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-sm font-medium text-foreground mb-1">{stat.label}</div>
              <div className="text-xs text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </div>

        <div className="border-t pt-4">
          <div className="text-center">
            <div className="text-sm font-medium text-foreground mb-1">Last Updated</div>
            <div className="text-sm text-muted-foreground">{lastUpdated}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
