import { BugSeverity, BugStatus } from "../enums";

export interface BugResponse {
  _id: string;
  title: string;
  description: string;
  severity: BugSeverity;
  status: BugStatus;
  releaseId: string;
  reportedBy: {
    _id: string;
    username: string;
    displayName: string;
    email: string;
  };
  assignedTo: {
    _id: string;
    username: string;
    displayName: string;
    email: string;
  };
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  createdAt: string;
  updatedAt: string;
}
