"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, AlertCircle } from "lucide-react";

interface UserDeleteAccountProps {
  onDeleteAccount: () => Promise<void>;
  isDeleting?: boolean;
}

export function UserDeleteAccount({ onDeleteAccount, isDeleting = false }: UserDeleteAccountProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const handleDelete = async () => {
    if (deleteConfirmation !== "DELETE") return;

    try {
      await onDeleteAccount();
      setShowDeleteDialog(false);
      setDeleteConfirmation("");
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleCancel = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmation("");
  };

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="text-red-600">Danger Zone</CardTitle>
        <CardDescription>These actions are irreversible. Please proceed with caution.</CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Account</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove all of your data from
                our servers.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Alert className="border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  All your workspaces, tasks, and personal data will be permanently lost.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="deleteConfirmation">
                  Type <strong>DELETE</strong> to confirm
                </Label>
                <Input
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteConfirmation !== "DELETE" || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
