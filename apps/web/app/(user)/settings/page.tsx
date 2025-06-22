"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";
import { User, Settings } from "lucide-react";
import { tokenManager } from "@/lib/token";
import { profileSchema, type ProfileFormData } from "@/lib/schemas/profile-schemas";
import { motion } from "framer-motion";
import { UserProfileForm, UserAccountInfo, UserDeleteAccount } from "@/components/user";

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

export default function SettingsPage() {
  const { currentUser, updateProfile, deleteAccount, isLoading, isUpdatingProfile, isDeletingAccount } = useUser();
  const user = currentUser?.data;
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setUserId(tokenManager.getUserId()!);
  }, []);

  const onProfileSubmit = async (data: ProfileFormData) => {
    if (!userId) return;

    await updateProfile.mutateAsync({
      userId,
      data: {
        displayName: data.displayName,
        username: data.username,
        email: data.email,
      },
    });
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    await deleteAccount.mutateAsync(userId);
  };

  if (!isClient || isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" style={{ width: "12rem" }} />
          <div className="h-96 bg-gray-200 rounded animate-pulse" />
        </div>
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
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Account
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <UserProfileForm user={user} onSubmit={onProfileSubmit} isLoading={isUpdatingProfile} />
            </TabsContent>

            {/* Account Tab */}
            <TabsContent value="account">
              <div className="space-y-6">
                <UserAccountInfo user={user} />
                <UserDeleteAccount onDeleteAccount={handleDeleteAccount} isDeleting={isDeletingAccount} />
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.main>
  );
}
