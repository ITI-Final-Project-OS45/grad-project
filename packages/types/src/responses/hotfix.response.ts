import { HotfixStatus } from "../enums";

export interface HotfixResponse {
  _id: string;
  title: string;
  description: string;
  releaseId: string;
  fixedBy: string;
  fixedDate?: string;
  status: HotfixStatus;
  attachedCommits: string[];
  createdAt: string;
  updatedAt: string;
}
