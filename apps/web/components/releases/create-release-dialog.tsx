"use client";

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
import { Loader2, Rocket } from "lucide-react";
import { useRelease } from "@/hooks/use-releases";

const createReleaseSchema = z.object({
  versionTag: z
    .string()
    .min(1, "Version tag is required")
    .regex(/^v?\d+\.\d+\.\d+$/, "Version tag must follow semantic versioning (e.g., v1.0.0)"),
  description: z.string().min(1, "Description is required"),
  plannedDate: z.string().min(1, "Planned date is required"),
});

type CreateReleaseFormData = z.infer<typeof createReleaseSchema>;

interface CreateReleaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
}

const dialogVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: -20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: "easeIn",
    },
  },
};

const fieldVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

export function CreateReleaseDialog({ open, onOpenChange, workspaceId }: CreateReleaseDialogProps) {
  const { createRelease } = useRelease();

  const form = useForm<CreateReleaseFormData>({
    resolver: zodResolver(createReleaseSchema),
    defaultValues: {
      versionTag: "",
      description: "",
      plannedDate: "",
    },
  });

  const handleSubmit = async (data: CreateReleaseFormData) => {
    await createRelease.mutateAsync({
      ...data,
      workspaceId,
    });
    form.reset();
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit">
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                  <motion.div
                    className="p-2 rounded-full bg-primary/10 border border-primary/20"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.1,
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    <Rocket className="h-5 w-5 text-primary" />
                  </motion.div>
                  Create New Release
                </DialogTitle>
                <DialogDescription>
                  Plan a new product release with version tracking and deployment coordination.
                </DialogDescription>
              </DialogHeader>

              <motion.form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6 py-4"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2,
                    },
                  },
                }}
              >
                <motion.div variants={fieldVariants} className="space-y-2">
                  <Label htmlFor="versionTag">Version Tag</Label>
                  <Input
                    id="versionTag"
                    placeholder="e.g., v1.0.0"
                    {...form.register("versionTag")}
                    className={form.formState.errors.versionTag ? "border-destructive" : ""}
                  />
                  <AnimatePresence>
                    {form.formState.errors.versionTag && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors.versionTag.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={fieldVariants} className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what's included in this release..."
                    rows={3}
                    {...form.register("description")}
                    className={form.formState.errors.description ? "border-destructive" : ""}
                  />
                  <AnimatePresence>
                    {form.formState.errors.description && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors.description.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={fieldVariants} className="space-y-2">
                  <Label htmlFor="plannedDate">Planned Release Date</Label>
                  <div className="relative">
                    <Input
                      id="plannedDate"
                      type="date"
                      {...form.register("plannedDate")}
                      className={form.formState.errors.plannedDate ? "border-destructive" : ""}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                  <AnimatePresence>
                    {form.formState.errors.plannedDate && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors.plannedDate.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={handleClose} disabled={createRelease.isPending}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRelease.isPending} className="bg-primary hover:bg-primary/90">
                    {createRelease.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Release
                  </Button>
                </DialogFooter>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
