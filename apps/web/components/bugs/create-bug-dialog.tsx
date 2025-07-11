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
import { Loader2, Bug, AlertTriangle } from "lucide-react";
import { useBug } from "@/hooks/use-bugs";
import { useWorkspaceMembersByWorkspace } from "@/hooks/use-workspace-members";
import { createBugSchema, type CreateBugFormData } from "@/lib/schemas/bug-schemas";
import { BugSeverity } from "@repo/types";

interface CreateBugDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  releaseId: string;
  workspaceId: string;
}

const severityOptions = [
  { value: BugSeverity.LOW, label: "Low", color: "text-blue-600" },
  { value: BugSeverity.MEDIUM, label: "Medium", color: "text-yellow-600" },
  { value: BugSeverity.HIGH, label: "High", color: "text-orange-600" },
  { value: BugSeverity.CRITICAL, label: "Critical", color: "text-red-600" },
];

export function CreateBugDialog({ open, onOpenChange, releaseId, workspaceId }: CreateBugDialogProps) {
  const { createBug } = useBug();

  const { data: workspaceMembers = [], isLoading: membersLoading } = useWorkspaceMembersByWorkspace(workspaceId);

  const form = useForm<CreateBugFormData>({
    resolver: zodResolver(createBugSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: BugSeverity.MEDIUM,
      releaseId: releaseId,
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
      assignedTo: "",
    },
  });

  useEffect(() => {
    if (releaseId) {
      form.setValue("releaseId", releaseId);
    }
  }, [releaseId, form]);

  // Auto-assign to first member if not already assigned
  useEffect(() => {
    if (workspaceMembers.length > 0 && !form.getValues("assignedTo")) {
      form.setValue("assignedTo", workspaceMembers[0]!.userId._id);
    }
  }, [workspaceMembers, form]);

  const handleSubmit = async (data: CreateBugFormData) => {
    await createBug.mutateAsync(data);
    onOpenChange(false);
    form.reset();
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
                    className="p-2 rounded-full bg-red-100 border border-red-200"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    <Bug className="h-5 w-5 text-red-600" />
                  </motion.div>
                  <span>Report New Bug</span>
                </DialogTitle>
                <DialogDescription className="text-muted-foreground text-base">
                  Report a bug you&apos;ve discovered. Please provide as much detail as possible to help us reproduce
                  and fix the issue.
                </DialogDescription>
              </DialogHeader>

              <motion.form
                onSubmit={form.handleSubmit(handleSubmit)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="space-y-8 py-2"
              >
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="border-b border-border/50 pb-2">
                    <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                    <p className="text-sm text-muted-foreground">Essential details about the bug</p>
                  </div>

                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-3"
                  >
                    <Label htmlFor="title" className="text-sm font-medium text-foreground flex items-center gap-2">
                      Bug Title
                      <span className="text-destructive">*</span>
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
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-foreground flex items-center gap-2"
                    >
                      Description
                      <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Detailed description of the bug and its impact"
                      rows={4}
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
                </div>

                {/* Classification Section */}
                <div className="space-y-6">
                  <div className="border-b border-border/50 pb-2">
                    <h3 className="text-lg font-semibold text-foreground">Classification</h3>
                    <p className="text-sm text-muted-foreground">Severity level and assignment</p>
                  </div>

                  {/* Severity - Full width */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Severity Level
                      <span className="text-destructive">*</span>
                    </Label>
                    <Controller
                      name="severity"
                      control={form.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="h-11 bg-background/50 border-2 border-border/50 focus:border-primary/50">
                            <SelectValue placeholder="Select severity level" />
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
                    <AnimatePresence>
                      {form.formState.errors.severity && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20"
                        >
                          {form.formState.errors.severity.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Assigned To - Full width on its own line */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 }}
                    className="space-y-3"
                  >
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                      Assign To Team Member
                      <span className="text-destructive">*</span>
                    </Label>
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
                    <AnimatePresence>
                      {form.formState.errors.assignedTo && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20"
                        >
                          {form.formState.errors.assignedTo.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>

                {/* Detailed Information Section */}
                <div className="space-y-6">
                  <div className="border-b border-border/50 pb-2">
                    <h3 className="text-lg font-semibold text-foreground">Additional Details</h3>
                    <p className="text-sm text-muted-foreground">Help us understand and reproduce the issue</p>
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
                      <span className="text-muted-foreground ml-1">(Optional)</span>
                    </Label>
                    <Textarea
                      id="stepsToReproduce"
                      placeholder="1. Go to the login page&#10;2. Click on the submit button&#10;3. Notice that the form doesn't validate properly"
                      rows={4}
                      {...form.register("stepsToReproduce")}
                      className="bg-background/50 border-2 border-border/50 focus:border-primary/50 hover:border-border resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      List the exact steps someone needs to follow to reproduce this bug
                    </p>
                  </motion.div>

                  {/* Expected vs Actual Behavior */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expected Behavior */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 }}
                      className="space-y-3"
                    >
                      <Label htmlFor="expectedBehavior" className="text-sm font-medium text-foreground">
                        Expected Behavior
                        <span className="text-muted-foreground ml-1">(Optional)</span>
                      </Label>
                      <Textarea
                        id="expectedBehavior"
                        placeholder="Describe what should happen..."
                        rows={4}
                        {...form.register("expectedBehavior")}
                        className="bg-background/50 border-2 border-border/50 focus:border-primary/50 hover:border-border resize-none"
                      />
                      <p className="text-xs text-muted-foreground">What was supposed to happen?</p>
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
                        <span className="text-muted-foreground ml-1">(Optional)</span>
                      </Label>
                      <Textarea
                        id="actualBehavior"
                        placeholder="Describe what actually happens..."
                        rows={4}
                        {...form.register("actualBehavior")}
                        className="bg-background/50 border-2 border-border/50 focus:border-primary/50 hover:border-border resize-none"
                      />
                      <p className="text-xs text-muted-foreground">What actually happened instead?</p>
                    </motion.div>
                  </div>
                </div>

                <DialogFooter className="pt-8 border-t border-border/50">
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
                        disabled={createBug.isPending}
                        className="w-full h-11 border-border/50 hover:bg-accent/50 hover:border-border"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                      <Button
                        type="submit"
                        disabled={createBug.isPending || workspaceMembers.length === 0}
                        className="w-full h-11 bg-red-600 hover:bg-red-700 text-white transition-all duration-200 min-w-[140px]"
                      >
                        {createBug.isPending ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            >
                              <Loader2 className="w-4 h-4" />
                            </motion.div>
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            <span>Report Bug</span>
                          </div>
                        )}
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
