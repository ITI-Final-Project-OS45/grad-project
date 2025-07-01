"use client";

import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Loader2, Plus, Sparkles, Rocket } from "lucide-react";
import { useWorkspace } from "@/hooks/use-workspace";
import { createWorkspaceSchema, type CreateWorkspaceFormData } from "@/lib/schemas/workspace-schemas";

interface CreateWorkspaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const { createWorkspace } = useWorkspace();

  const form = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = async (data: CreateWorkspaceFormData) => {
    try {
      await createWorkspace.mutateAsync({
        name: data.name,
        description: data.description ?? "",
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit" className="relative">
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
                      <Rocket className="h-5 w-5 text-primary" />
                    </motion.div>
                    <span>Create New Workspace</span>
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
                    Create a new workspace to organize your projects and collaborate with your team.
                  </DialogDescription>
                </DialogHeader>
              </motion.div>

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
                        disabled={createWorkspace.isPending}
                        className="w-full border-border/50 hover:bg-accent/50 hover:border-border"
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                      <Button
                        type="submit"
                        disabled={createWorkspace.isPending}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200"
                      >
                        {createWorkspace.isPending && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Loader2 className="w-4 h-4" />
                          </motion.div>
                        )}
                        <Plus className="w-4 h-4" />
                        Create Workspace
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
