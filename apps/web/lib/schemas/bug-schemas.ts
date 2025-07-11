import { z } from 'zod';
import { BugSeverity, BugStatus } from '@repo/types';

// Create Bug Schema
export const createBugSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters'),
  severity: z.nativeEnum(BugSeverity, {
    required_error: 'Severity is required',
  }),
  releaseId: z.string().min(1, 'Release is required'),
  assignedTo: z.string().min(1, 'Assignment is required'), // Still a string ID for creation
  stepsToReproduce: z
    .string()
    .max(2000, 'Steps to reproduce must be less than 2000 characters')
    .optional(),
  expectedBehavior: z
    .string()
    .max(1000, 'Expected behavior must be less than 1000 characters')
    .optional(),
  actualBehavior: z
    .string()
    .max(1000, 'Actual behavior must be less than 1000 characters')
    .optional(),
});

// Update Bug Schema
export const updateBugSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(1000, 'Description must be less than 1000 characters')
    .optional(),
  severity: z.nativeEnum(BugSeverity).optional(),
  status: z.nativeEnum(BugStatus).optional(),
  stepsToReproduce: z
    .string()
    .max(2000, 'Steps to reproduce must be less than 2000 characters')
    .optional(),
  expectedBehavior: z
    .string()
    .max(1000, 'Expected behavior must be less than 1000 characters')
    .optional(),
  actualBehavior: z
    .string()
    .max(1000, 'Actual behavior must be less than 1000 characters')
    .optional(),
  assignedTo: z.string().optional(), // Still a string ID for updates
});

// Export types
export type CreateBugFormData = z.infer<typeof createBugSchema>;
export type UpdateBugFormData = z.infer<typeof updateBugSchema>;
