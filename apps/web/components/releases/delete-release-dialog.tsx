"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
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
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Trash2, Shield } from "lucide-react";
import { useRelease } from "@/hooks/use-releases";
import type { ReleaseResponse } from "@repo/types";
import { useRouter } from "next/navigation";

interface DeleteReleaseDialogProps {
  release: ReleaseResponse | null;
  open: boolean;
  onClose: () => void;
  workspaceId: string;
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

const warningVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.2,
    },
  },
};

const shakeVariants: Variants = {
  shake: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
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

export function DeleteReleaseDialog({ release, open, onClose, workspaceId }: DeleteReleaseDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const { deleteRelease } = useRelease();
  const router = useRouter();

  const expectedConfirmation = `delete ${release?.versionTag}`;
  const isConfirmationValid = confirmationText.toLowerCase() === expectedConfirmation.toLowerCase();

  const handleDelete = async () => {
    if (!release || !isConfirmationValid) return;

    await deleteRelease.mutateAsync({
      releaseId: release._id,
      workspaceId,
    });
    router.push(`/workspaces/${workspaceId}/releases`);
    onClose();
  };

  const handleClose = () => {
    if (!deleteRelease.isPending) {
      setConfirmationText("");
      onClose();
    }
  };

  if (!release) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-background/95 backdrop-blur-xl border-destructive/20 shadow-2xl">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div variants={dialogVariants} initial="hidden" animate="visible" exit="exit" className="relative">
              {/* Animated danger background */}
              <motion.div
                className="absolute inset-0 rounded-lg -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />

              <DialogHeader className="space-y-4 pb-6">
                <div className="flex items-start gap-4">
                  <motion.div variants={warningVariants} className="relative">
                    <motion.div
                      className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 border-2 border-destructive/20"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(239, 68, 68, 0.4)",
                          "0 0 0 10px rgba(239, 68, 68, 0)",
                          "0 0 0 0 rgba(239, 68, 68, 0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      }}
                    >
                      <AlertTriangle className="h-6 w-6 text-destructive" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                      Delete Release
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-base mt-1">
                      This action cannot be undone and will permanently remove the release and all associated data.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <motion.div variants={contentVariants} initial="hidden" animate="visible" className="space-y-6 py-2">
                <motion.div
                  variants={itemVariants}
                  className="rounded-lg bg-destructive/5 p-6 border-2 border-destructive/20 relative overflow-hidden"
                >
                  {/* Animated warning stripes */}
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-destructive/50 to-destructive/20"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-destructive" />
                      <p className="font-medium text-foreground">
                        You are about to permanently delete release{" "}
                        <span className="font-bold text-destructive">&ldquo;{release.versionTag}&rdquo;</span>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">This will permanently delete:</p>
                      <motion.ul
                        className="text-sm text-muted-foreground space-y-2"
                        variants={contentVariants}
                        initial="hidden"
                        animate="visible"
                      >
                        {[
                          "All bugs associated with this release",
                          "All hotfixes linked to this release",
                          "Release deployment history",
                          "QA status and testing data",
                        ].map((item, index) => (
                          <motion.li
                            key={item}
                            variants={itemVariants}
                            className="flex items-center gap-2 p-2 rounded bg-destructive/5"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-destructive/60" />
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-3">
                  <Label htmlFor="confirmation" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <span>Type</span>
                    <code className="text-destructive font-bold font-mono mt-0.5">{expectedConfirmation}</code>
                    <span>to confirm:</span>
                  </Label>
                  <motion.div
                    variants={confirmationText && !isConfirmationValid ? shakeVariants : {}}
                    animate={confirmationText && !isConfirmationValid ? "shake" : ""}
                  >
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={`Type '${expectedConfirmation}' to confirm`}
                      autoFocus
                      disabled={deleteRelease.isPending}
                      className={`h-11 bg-background/50 border-2 transition-all duration-200 ${
                        confirmationText && !isConfirmationValid
                          ? "border-destructive/50 focus:border-destructive"
                          : isConfirmationValid
                            ? "border-green-500/50 focus:border-green-500"
                            : "border-border/50 focus:border-primary/50"
                      }`}
                    />
                  </motion.div>
                  {confirmationText && !isConfirmationValid && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive"
                    >
                      Please type the exact release version to confirm deletion.
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>

              <DialogFooter className="pt-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 w-full sm:w-auto"
                >
                  <motion.div whileTap={{ scale: 0.95 }} className="flex-1 sm:flex-none">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={deleteRelease.isPending}
                      className="w-full border-border/50 hover:bg-accent/50"
                    >
                      Cancel
                    </Button>
                  </motion.div>
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    whileHover={isConfirmationValid ? { scale: 1.02 } : {}}
                    className="flex-1 sm:flex-none"
                  >
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={!isConfirmationValid || deleteRelease.isPending}
                    >
                      {deleteRelease.isPending && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                      )}
                      <Trash2 className="w-4 h-4" />
                      Delete Release
                    </Button>
                  </motion.div>
                </motion.div>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
