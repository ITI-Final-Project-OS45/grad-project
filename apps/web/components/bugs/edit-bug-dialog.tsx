"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Edit3, AlertTriangle, CheckCircle } from "lucide-react";
import { useBug } from "@/hooks/use-bugs";
import { useWorkspaceMembersByWorkspace } from "@/hooks/use-workspace-members";
import { updateBugSchema, type UpdateBugFormData } from "@/lib/schemas/bug-schemas";
import { BugSeverity, BugStatus, BugResponse } from "@repo/types";

interface EditBugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bug: BugResponse;
  workspaceId: string;
}

const severityOptions = [
  { value: BugSeverity.LOW, label: "Low", color: "text-blue-600" },
  { value: BugSeverity.MEDIUM, label: "Medium", color: "text-yellow-600" },
  { value: BugSeverity.HIGH, label: "High", color: "text-orange-600" },
  { value: BugSeverity.CRITICAL, label: "Critical", color: "text-red-600" },
];

const statusOptions = [
  { value: BugStatus.OPEN, label: "Open", color: "text-red-600" },
  { value: BugStatus.IN_PROGRESS, label: "In Progress", color: "text-blue-600" },
  { value: BugStatus.RESOLVED, label: "Resolved", color: "text-green-600" },
  { value: BugStatus.CLOSED, label: "Closed", color: "text-gray-600" },
  { value: BugStatus.REJECTED, label: "Rejected", color: "text-purple-600" },
];

export function EditBugDialog({ open, onOpenChange, bug, workspaceId }: EditBugDialogProps) {
  const { updateBug } = useBug();

  const { data: workspaceMembers = [], isLoading: membersLoading } = useWorkspaceMembersByWorkspace(workspaceId);

  const form = useForm<UpdateBugFormData>({
    resolver: zodResolver(updateBugSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: BugSeverity.MEDIUM,
      status: BugStatus.OPEN,
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
      assignedTo: "",
    },
  });

  useEffect(() => {
    if (bug && open) {
      form.reset({
        title: bug.title,
        description: bug.description,
        severity: bug.severity,
        status: bug.status,
        stepsToReproduce: bug.stepsToReproduce || "",
        expectedBehavior: bug.expectedBehavior || "",
        actualBehavior: bug.actualBehavior || "",
        assignedTo: bug.assignedTo?._id || "",
      });
    }
  }, [bug, open, form]);

  const handleSubmit = async (data: UpdateBugFormData) => {
    await updateBug.mutateAsync({
      bugId: bug._id,
      data,
      releaseId: bug.releaseId,
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <DialogHeader className="space-y-3 pb-6">
                <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                  <motion.div
                    className="p-2 rounded-full bg-blue-100 border border-blue-200"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    <Edit3 className="h-5 w-5 text-blue-600" />
                  </motion.div>
                  <span>Edit Bug</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base">
                  Update the bug details. Make sure to provide accurate information to help track progress.
                </DialogDescription>
              </DialogHeader>

              <motion.form
                onSubmit={form.handleSubmit(handleSubmit)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-6 py-2"
              >
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <Label htmlFor="title" className="text-sm font-medium text-foreground">
                    Bug Title
                  </Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the bug"
                    {...form.register("title")}
                    className={`h-11 bg-background/50 border-2 transition-all duration-200 ${
                      form.formState.errors.title
                        ? "border-destructive/50 focus:border-destructive"
                        : "border-border/50 focus:border-primary/50 hover:border-border"
                    }`}
                  />
                  <AnimatePresence>
                    {form.formState.errors.title && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20"
                      >
                        {form.formState.errors.title.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 }}
                  className="space-y-3"
                >
                  <Label htmlFor="description" className="text-sm font-medium text-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the bug"
                    rows={3}
                    {...form.register("description")}
                    className={`bg-background/50 border-2 transition-all duration-200 resize-none ${
                      form.formState.errors.description
                        ? "border-destructive/50 focus:border-destructive"
                        : "border-border/50 focus:border-primary/50 hover:border-border"
                    }`}
                  />
                  <AnimatePresence>
                    {form.formState.errors.description && (
                      <motion.p
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20"
                      >
                        {form.formState.errors.description.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Severity, Status, and Assigned To Row */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Severity */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="space-y-3"
                    >
                      <Label className="text-sm font-medium text-foreground">Severity</Label>
                      <Controller
                        name="severity"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-11 bg-background/50 border-2 border-border/50 focus:border-primary/50">
                              <SelectValue placeholder="Select severity" />
                            </SelectTrigger>
                            <SelectContent>
                              {severityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className={`h-4 w-4 ${option.color}`} />
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </motion.div>

                    {/* Status */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.32 }}
                      className="space-y-3"
                    >
                      <Label className="text-sm font-medium text-foreground">Status</Label>
                      <Controller
                        name="status"
                        control={form.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-11 bg-background/50 border-2 border-border/50 focus:border-primary/50">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className={`h-4 w-4 ${option.color}`} />
                                    <span>{option.label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </motion.div>
                  </div>

                  {/* Assigned To - Full width on its own line */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm font-medium text-foreground">Assign To</Label>
                    <Controller
                      name="assignedTo"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 bg-background/50 border-2 border-border/50 focus:border-primary/50">
                            <SelectValue placeholder={membersLoading ? "Loading members..." : "Select team member"} />
                          </SelectTrigger>
                          <SelectContent>
                            {membersLoading ? (
                              <SelectItem value="loading" disabled>
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Loading members...</span>
                                </div>
                              </SelectItem>
                            ) : workspaceMembers.length > 0 ? (
                              workspaceMembers.map((member) => (
                                <SelectItem key={member.userId._id} value={member.userId._id}>
                                  <div className="flex items-center gap-2">
                                    <span>{member.userId.displayName || member.userId.username}</span>
                                    <span className="text-muted-foreground text-sm">@{member.userId.username}</span>
                                  </div>
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-members" disabled>
                                No workspace members found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </motion.div>
                </div>

                {/* Steps to Reproduce */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <Label htmlFor="stepsToReproduce" className="text-sm font-medium text-foreground">
                    Steps to Reproduce
                  </Label>
                  <Textarea
                    id="stepsToReproduce"
                    placeholder="1. Go to... &#10;2. Click on... &#10;3. Notice that..."
                    rows={4}
                    {...form.register("stepsToReproduce")}
                    className="bg-background/50 border-2 border-border/50 focus:border-primary/50 hover:border-border resize-none"
                  />
                </motion.div>

                {/* Expected and Actual Behavior Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Expected Behavior */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="expectedBehavior" className="text-sm font-medium text-foreground">
                      Expected Behavior
                    </Label>
                    <Textarea
                      id="expectedBehavior"
                      placeholder="What should happen?"
                      rows={3}
                      {...form.register("expectedBehavior")}
                      className="bg-background/50 border-2 border-border/50 focus:border-primary/50 hover:border-border resize-none"
                    />
                  </motion.div>

                  {/* Actual Behavior */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="actualBehavior" className="text-sm font-medium text-foreground">
                      Actual Behavior
                    </Label>
                    <Textarea
                      id="actualBehavior"
                      placeholder="What actually happens?"
                      rows={3}
                      {...form.register("actualBehavior")}
                      className="bg-background/50 border-2 border-border/50 focus:border-primary/50 hover:border-border resize-none"
                    />
                  </motion.div>
                </div>

                <DialogFooter className="pt-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex gap-3 w-full sm:w-auto"
                  >
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={updateBug.isPending}
                        className="w-full border-border/50 hover:bg-accent/50 hover:border-border"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                      <Button
                        type="submit"
                        disabled={updateBug.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
                      >
                        {updateBug.isPending && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Loader2 className="w-4 h-4" />
                          </motion.div>
                        )}
                        <Edit3 className="w-4 h-4" />
                        Update Bug
                      </Button>
                    </motion.div>
                  </motion.div>
                </DialogFooter>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
