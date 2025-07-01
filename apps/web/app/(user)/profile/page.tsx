"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useWorkspaces } from "@/hooks/use-workspace";
import { Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserProfileHeader, UserWorkspacesList, UserStats } from "@/components/user";

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function ProfilePage() {
  const { currentUser, isLoading: isUserLoading, error } = useUser();
  const { data: workspaces, isLoading: isWorkspacesLoading } = useWorkspaces();
  const [isClient, setIsClient] = useState(false);
  const user = currentUser?.data;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const daysActive =
    isClient && user?.createdAt
      ? Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  const lastUpdated = isClient && user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Loading...";

  const userWorkspaces =
    workspaces?.filter((workspace) => workspace.members?.some((member) => member.userId === user?._id)) || [];

  if (isUserLoading || !isClient) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-48 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center text-red-500">Error loading profile: {error.message}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="text-center text-muted-foreground">No user data available</div>
      </div>
    );
  }

  return (
    <motion.main
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto p-6 max-w-4xl min-h-dvh"
    >
      <div className="space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">View and manage your profile information</p>
          </div>
          <Button asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
        </motion.div>

        {/* Profile Information */}
        <motion.div variants={itemVariants}>
          <UserProfileHeader user={user} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Workspaces */}
          <motion.div variants={itemVariants}>
            <UserWorkspacesList
              workspaces={userWorkspaces}
              currentUserId={user._id}
              isLoading={isWorkspacesLoading}
              maxDisplay={5}
            />
          </motion.div>

          {/* Account Statistics */}
          <motion.div variants={itemVariants}>
            <UserStats workspaceCount={userWorkspaces.length} daysActive={daysActive} lastUpdated={lastUpdated} />
          </motion.div>
        </div>
      </div>
    </motion.main>
  );
}
