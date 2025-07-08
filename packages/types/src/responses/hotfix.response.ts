import { HotfixStatus } from "../enums";

export interface HotfixResponse {
  _id: string;
  title: string;
  description: string;
  releaseId: string;
  fixedBy:
    | {
        _id: string;
        username: string;
        displayName: string;
        email: string;
      }
    | string;
  fixedDate?: string;
  status: HotfixStatus;
  attachedCommits: string[];
  createdAt: string;
  updatedAt: string;
}
