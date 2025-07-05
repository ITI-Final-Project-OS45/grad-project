import { WorkspaceMember } from "@/services/workspace-member.service";

export function mapWorkspaceMembersToUsers(members: WorkspaceMember[]) {
  return members.map((m) => ({
    _id: m.userId._id,
    username: m.userId.username,
    displayName: m.userId.displayName,
    email: m.userId.email,
  }));
}
