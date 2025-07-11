'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Wrench, Plus, X } from 'lucide-react';
import { useHotfix } from '@/hooks/use-hotfixes';
import { HotfixStatus } from '@repo/types';
import type { HotfixResponse } from '@repo/types';

const editHotfixSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.nativeEnum(HotfixStatus),
});

type EditHotfixFormData = z.infer<typeof editHotfixSchema>;

interface EditHotfixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotfix: HotfixResponse;
  releaseId: string;
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
      ease: 'easeIn',
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
      ease: 'easeOut',
    },
  },
};

export function EditHotfixDialog({
  open,
  onOpenChange,
  hotfix,
  releaseId,
}: EditHotfixDialogProps) {
  const { updateHotfix } = useHotfix();
  const [commits, setCommits] = useState<string[]>(
    hotfix.attachedCommits || []
  );
  const [newCommit, setNewCommit] = useState('');

  const form = useForm<EditHotfixFormData>({
    resolver: zodResolver(editHotfixSchema),
    defaultValues: {
      title: hotfix.title,
      description: hotfix.description,
      status: hotfix.status,
    },
  });

  // Reset form when hotfix changes
  useEffect(() => {
    if (hotfix) {
      form.reset({
        title: hotfix.title,
        description: hotfix.description,
        status: hotfix.status,
      });
      setCommits(hotfix.attachedCommits || []);
    }
  }, [hotfix, form]);

  const addCommit = () => {
    if (newCommit.trim() && !commits.includes(newCommit.trim())) {
      setCommits([...commits, newCommit.trim()]);
      setNewCommit('');
    }
  };

  const removeCommit = (commitToRemove: string) => {
    setCommits(commits.filter((commit) => commit !== commitToRemove));
  };

  const handleSubmit = async (data: EditHotfixFormData) => {
    const updateData = {
      ...data,
      attachedCommits: commits.length > 0 ? commits : undefined,
    };

    await updateHotfix.mutateAsync({
      hotfixId: hotfix._id,
      data: updateData,
      releaseId: releaseId,
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    form.reset();
    setCommits(hotfix.attachedCommits || []);
    setNewCommit('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <DialogHeader className="space-y-3">
                <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                  <motion.div
                    className="p-2 rounded-full bg-orange-50 border border-orange-200"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.1,
                      type: 'spring',
                      stiffness: 200,
                      damping: 15,
                    }}
                  >
                    <Wrench className="h-5 w-5 text-orange-600" />
                  </motion.div>
                  Edit Hotfix
                </DialogTitle>
                <DialogDescription>
                  Update the hotfix details and status.
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
                  <Label htmlFor="title">Hotfix Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the hotfix"
                    {...form.register('title')}
                    className={
                      form.formState.errors.title ? 'border-destructive' : ''
                    }
                  />
                  <AnimatePresence>
                    {form.formState.errors.title && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors.title.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={fieldVariants} className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed description of the hotfix and what it fixes..."
                    rows={3}
                    {...form.register('description')}
                    className={
                      form.formState.errors.description
                        ? 'border-destructive'
                        : ''
                    }
                  />
                  <AnimatePresence>
                    {form.formState.errors.description && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-destructive"
                      >
                        {form.formState.errors.description.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div variants={fieldVariants} className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.watch('status')}
                    onValueChange={(value) =>
                      form.setValue('status', value as HotfixStatus)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select hotfix status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={HotfixStatus.PENDING}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value={HotfixStatus.IN_PROGRESS}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value={HotfixStatus.COMPLETED}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value={HotfixStatus.DEPLOYED}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          Deployed
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={fieldVariants} className="space-y-2">
                  <Label>Attached Commits</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Commit hash (e.g., abc1234)"
                      value={newCommit}
                      onChange={(e) => setNewCommit(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addCommit();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCommit}
                      disabled={!newCommit.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {commits.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commits.map((commit) => (
                        <div
                          key={commit}
                          className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm"
                        >
                          <code className="text-xs">{commit}</code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeCommit(commit)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Update commit hashes that are part of this hotfix
                  </p>
                </motion.div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={updateHotfix.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateHotfix.isPending}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {updateHotfix.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    Update Hotfix
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
