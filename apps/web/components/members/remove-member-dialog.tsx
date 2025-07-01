"use client";

import { useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { AlertTriangle, Loader2, Trash2, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { WorkspaceMember } from "@/services/workspace-member.service";

interface RemoveMemberDialogProps {
  member: WorkspaceMember | null;
  open: boolean;
  onClose: () => void;
  onConfirm: (memberId: string) => Promise<void>;
  isDeleting?: boolean;
}

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
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

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
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

export function RemoveMemberDialog({ member, open, onClose, onConfirm, isDeleting = false }: RemoveMemberDialogProps) {
  const [confirmationText, setConfirmationText] = useState("");

  const memberName = member?.userId.displayName || member?.userId.username || "";
  const expectedConfirmation = `remove ${memberName}`;
  const isConfirmationValid = confirmationText.toLowerCase() === expectedConfirmation.toLowerCase();

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText("");
      onClose();
    }
  };

  const handleRemove = async () => {
    if (!member || !isConfirmationValid || isDeleting) return;

    try {
      await onConfirm(member.userId.username || member.userId.email);
      handleClose();
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-md border-border/50">
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
                      <UserX className="h-6 w-6 text-destructive" />
                    </motion.div>
                  </motion.div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                      Remove Member
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-base mt-1">
                      This action will permanently remove the member from the workspace.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <motion.div variants={itemVariants} className="space-y-4">
                {/* Member Info */}
                <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">{memberName.slice(0, 2).toUpperCase()}</span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{memberName}</div>
                      <div className="text-sm text-muted-foreground">
                        @{member.userId.username} • {member.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Warning Info */}
                <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-medium text-foreground">What happens when you remove this member:</h4>
                      <motion.ul variants={itemVariants} className="text-sm text-muted-foreground space-y-1">
                        {[
                          "They will lose access to the workspace immediately",
                          "All their workspace permissions will be revoked",
                          "They won't receive any workspace notifications",
                          "Their assigned tasks and roles will remain for reference",
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
                      Please type the exact text to confirm member removal.
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
                    <Button variant="destructive" onClick={handleRemove} disabled={!isConfirmationValid || isDeleting}>
                      {isDeleting && (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="w-4 h-4" />
                        </motion.div>
                      )}
                      <Trash2 className="w-4 h-4" />
                      Remove Member
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
