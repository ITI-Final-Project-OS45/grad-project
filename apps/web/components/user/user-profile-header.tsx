"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Calendar, UserIcon } from "lucide-react";
import { UserAvatar } from "./user-avatar";
import type { User } from "@/services/user.service";

interface UserProfileHeaderProps {
  user: User;
  showEditButton?: boolean;
  onEditClick?: () => void;
}

export function UserProfileHeader({ user, showEditButton = false, onEditClick }: UserProfileHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserIcon className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>Your account details and personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <UserAvatar displayName={user.displayName} size="xl" />
            <div>
              <h1 className="text-3xl font-bold">{user.displayName}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
          </div>
          {showEditButton && <Button onClick={onEditClick}>Edit Profile</Button>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">Member Since</p>
              <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
