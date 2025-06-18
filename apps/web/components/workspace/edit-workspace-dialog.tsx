"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2, Edit3, Sparkles } from "lucide-react";
import { useWorkspace, useWorkspaceById } from "@/hooks/use-workspace";

const editWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

type EditWorkspaceFormData = z.infer<typeof editWorkspaceSchema>;

interface EditWorkspaceDialogProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

const dialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: -20,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    filter: "blur(2px)",
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const formVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -20, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const loadingVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function EditWorkspaceDialog({ workspaceId, open, onClose }: EditWorkspaceDialogProps) {
  const { updateWorkspace } = useWorkspace();
  const { data: workspace, isLoading: isLoadingWorkspace } = useWorkspaceById(workspaceId);

  const form = useForm<EditWorkspaceFormData>({
    resolver: zodResolver(editWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (workspace) {
      form.reset({
        name: workspace.name,
        description: workspace.description ?? "",
      });
    }
  }, [workspace, form]);

  const handleSubmit = async (data: EditWorkspaceFormData) => {
    try {
      await updateWorkspace.mutateAsync({
        workspaceId,
        data: {
          name: data.name,
          description: data.description ?? "",
        },
      });
      onClose();
    } catch (error) {
      console.error("Error updating workspace:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit" className="relative">
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 rounded-lg -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />

              <motion.div variants={headerVariants}>
                <DialogHeader className="space-y-3 pb-6">
                  <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-foreground">
                    <motion.div
                      className="p-2 rounded-full bg-primary/10 border border-primary/20"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <Edit3 className="h-5 w-5 text-primary" />
                    </motion.div>
                    <span>Edit Workspace</span>
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 3,
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-primary/60" />
                    </motion.div>
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground text-base">
                    Update your workspace information and settings to keep everything organized.
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

              {isLoadingWorkspace ? (
                <motion.div
                  variants={loadingVariants}
                  className="py-12 flex flex-col items-center justify-center space-y-4"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <Loader2 className="h-8 w-8 text-primary" />
                  </motion.div>
                  <p className="text-sm text-muted-foreground">Loading workspace details...</p>
                </motion.div>
              ) : (
                <motion.form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-6 py-2"
                >
                  <motion.div variants={fieldVariants} className="space-y-3">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground flex items-center gap-2">
                      Workspace Name
                      <span className="text-destructive">*</span>
                    </Label>
                    <motion.div whileFocus={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                      <Input
                        id="name"
                        placeholder="Enter workspace name"
                        {...form.register("name")}
                        className={`h-11 bg-background/50 border-2 transition-all duration-200 ${
                          form.formState.errors.name
                            ? "border-destructive/50 focus:border-destructive"
                            : "border-border/50 focus:border-primary/50 hover:border-border"
                        }`}
                      />
                    </motion.div>
                    <AnimatePresence>
                      {form.formState.errors.name && (
                        <motion.p
                          initial={{ opacity: 0, height: 0, y: -10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -10 }}
                          className="text-sm text-destructive bg-destructive/5 px-3 py-2 rounded-md border border-destructive/20"
                        >
                          {form.formState.errors.name.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div variants={fieldVariants} className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-medium text-foreground">
                      Description
                    </Label>
                    <motion.div whileFocus={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                      <Textarea
                        id="description"
                        placeholder="Describe your workspace (optional)"
                        rows={4}
                        {...form.register("description")}
                        className={`bg-background/50 border-2 transition-all duration-200 resize-none ${
                          form.formState.errors.description
                            ? "border-destructive/50 focus:border-destructive"
                            : "border-border/50 focus:border-primary/50 hover:border-border"
                        }`}
                      />
                    </motion.div>
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

                  <DialogFooter className="pt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex gap-3 w-full sm:w-auto"
                    >
                      <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleClose}
                          disabled={updateWorkspace.isPending}
                          className="w-full border-border/50 hover:bg-accent/50 hover:border-border"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                      <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                        <Button
                          type="submit"
                          disabled={updateWorkspace.isPending}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                        >
                          {updateWorkspace.isPending && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            >
                              <Loader2 className="w-4 h-4" />
                            </motion.div>
                          )}
                          Update Workspace
                        </Button>
                      </motion.div>
                    </motion.div>
                  </DialogFooter>
                </motion.form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
