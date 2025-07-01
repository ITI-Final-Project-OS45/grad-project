import { BugSeverity, BugStatus } from "../enums";

export interface BugResponse {
  _id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  releaseId: string;
  reportedBy: string;
  assignedTo?: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  createdAt: string;
  updatedAt: string;
}
