import { QAStatus, ReleaseStatus } from "../enums";

export interface ReleaseResponse {
  _id: string;
  versionTag: string;
  workspaceId: string;
  description: string;
  plannedDate: string;
  deployedDate?: string;
  createdBy: string;
  deployedBy?: string;
  qaStatus: QAStatus;
  status: ReleaseStatus;
  bugs: string[];
  hotfixes: string[];
  createdAt: string;
  updatedAt: string;
}
