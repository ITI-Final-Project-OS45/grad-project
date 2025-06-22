"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import type { User } from "@/services/user.service";

interface UserAccountInfoProps {
  user: User;
}

export function UserAccountInfo({ user }: UserAccountInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>View your account details and membership information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label className="text-sm font-medium">Account ID</Label>
            <p className="text-sm text-muted-foreground font-mono">{user._id}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Member Since</Label>
            <p className="text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div>
          <Label className="text-sm font-medium">Last Updated</Label>
          <p className="text-sm text-muted-foreground">{new Date(user.updatedAt).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  );
}
