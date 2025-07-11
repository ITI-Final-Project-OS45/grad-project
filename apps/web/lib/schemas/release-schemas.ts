import { z } from 'zod';
import { BugSeverity, BugStatus, HotfixStatus } from '@repo/types';

// Release schemas
export const createReleaseSchema = z.object({
  versionTag: z
    .string()
    .min(1, 'Version tag is required')
    .regex(
      /^v?\d+\.\d+\.\d+$/,
      'Version tag must follow semantic versioning (e.g., v1.0.0)'
    ),
  description: z.string().min(1, 'Description is required'),
  plannedDate: z.string().min(1, 'Planned date is required'),
  workspaceId: z.string().min(1, 'Workspace ID is required'),
});

export const updateReleaseSchema = z.object({
  versionTag: z
    .string()
    .min(1, 'Version tag is required')
    .regex(
      /^v?\d+\.\d+\.\d+$/,
      'Version tag must follow semantic versioning (e.g., v1.0.0)'
    )
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  plannedDate: z.string().min(1, 'Planned date is required').optional(),
});

// Bug schemas
export const createBugSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  severity: z.nativeEnum(BugSeverity),
  releaseId: z.string().min(1, 'Release ID is required'),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  assignedTo: z.string().optional(),
});

export const updateBugSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  severity: z.nativeEnum(BugSeverity).optional(),
  status: z.nativeEnum(BugStatus).optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  assignedTo: z.string().optional(),
});

// Hotfix schemas
export const createHotfixSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  attachedCommits: z.array(z.string()).optional(),
  deploymentNotes: z.string().optional(),
});

export const updateHotfixSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  status: z.nativeEnum(HotfixStatus).optional(),
  attachedCommits: z.array(z.string()).optional(),
  deploymentNotes: z.string().optional(),
  fixedDate: z.string().optional(),
});

// Type exports
export type CreateReleaseFormData = z.infer<typeof createReleaseSchema>;
export type UpdateReleaseFormData = z.infer<typeof updateReleaseSchema>;
export type CreateBugFormData = z.infer<typeof createBugSchema>;
export type UpdateBugFormData = z.infer<typeof updateBugSchema>;
export type CreateHotfixFormData = z.infer<typeof createHotfixSchema>;
export type UpdateHotfixFormData = z.infer<typeof updateHotfixSchema>;
