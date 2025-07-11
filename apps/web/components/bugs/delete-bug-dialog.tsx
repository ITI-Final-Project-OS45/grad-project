"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
import { Loader2, Bug, AlertTriangle, Trash2 } from "lucide-react";
import { BugResponse } from "@repo/types";

interface DeleteBugDialogProps {
  bug: BugResponse | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (bugId: string) => Promise<void>;
  isDeleting?: boolean;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
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

const shakeVariants = {
  shake: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.4 },
  },
};

export function DeleteBugDialog({ bug, open, onClose, onConfirm, isDeleting = false }: DeleteBugDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");

  const expectedConfirmation = `delete ${bug?.title}`;
  const isConfirmationValid = confirmationText.toLowerCase() === expectedConfirmation.toLowerCase();

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText("");
      onClose();
    }
  };

  const handleDelete = async () => {
    if (!bug || !isConfirmationValid || isDeleting) return;

    await onConfirm(bug._id);
    handleClose();
  };

  if (!bug) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-destructive/20 shadow-2xl">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <DialogHeader className="space-y-4">
                <div className="flex items-start gap-4">
                  <motion.div variants={warningVariants} className="relative">
                    <motion.div
                      className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          "0 0 0 0 rgba(239, 68, 68, 0.2)",
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
                      <Bug className="h-6 w-6 text-destructive" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                      Delete Bug Report
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-base mt-1">
                      This action cannot be undone and will permanently delete this bug report.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <motion.div variants={itemVariants} className="space-y-4">
                {/* Bug Info */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground truncate">{bug.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <span className="capitalize">{bug.severity}</span> severity • Reported by{" "}
                        {bug.reportedBy.displayName || bug.reportedBy.username}
                      </div>
                      {bug.description && (
                        <div className="text-sm text-muted-foreground mt-2 line-clamp-2">{bug.description}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Warning Info */}
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">What happens when you delete this bug:</h4>
                      <motion.ul variants={itemVariants} className="text-sm text-muted-foreground space-y-1">
                        {[
                          "The bug report will be permanently removed",
                          "All related data and comments will be lost",
                          "This action cannot be undone",
                          "The bug will be removed from release tracking",
                        ].map((item, index) => (
                          <motion.li key={index} variants={itemVariants} className="flex items-start gap-2">
                            <span className="text-destructive mt-1">•</span>
                            <span>{item}</span>
                          </motion.li>
                        ))}
                      </motion.ul>
                    </div>
                  </div>
                </div>

                {/* Confirmation Input */}
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
                      disabled={isDeleting}
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
                      Please type the exact text to confirm bug deletion.
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
                      disabled={isDeleting}
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
                    <Button variant="destructive" onClick={handleDelete} disabled={!isConfirmationValid || isDeleting}>
                      {isDeleting && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                      )}
                      <Trash2 className="w-4 h-4" />
                      Delete Bug
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
