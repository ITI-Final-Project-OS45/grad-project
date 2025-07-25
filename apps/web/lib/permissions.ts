import { UserRole } from "@repo/types";

/**
 * Permission utility for workspace role-based access control
 * Based on backend controllers and authorization guards
 */

export interface PermissionContext {
  currentUserId?: string;
  currentUserRole?: UserRole;
  targetUserId?: string;
  workspaceCreatedBy?: string;
}

export const WorkspacePermissions = {
  // Member management permissions (based on workspace-member.controller.ts)
  canAddMember: (context: PermissionContext): boolean => {
    // Only managers can add members (POST /workspace-member/:id requires MANAGER permission)
    return context.currentUserRole === UserRole.Manager;
  },

  canUpdateMemberRole: (context: PermissionContext): boolean => {
    // Only managers can update member roles (PATCH /workspace-member/:id requires MANAGER permission)
    return context.currentUserRole === UserRole.Manager;
  },

  canRemoveMember: (context: PermissionContext): boolean => {
    // Only managers can remove members (DELETE /workspace-member/:id requires MANAGER permission)
    return context.currentUserRole === UserRole.Manager;
  },

  canViewMembers: (context: PermissionContext): boolean => {
    // Any workspace member can view members (GET /workspace-member/:id requires MEMBER permission)
    return !!context.currentUserRole;
  },

  // Invite management permissions (based on invite.controller.ts)
  canCreateInvite: (context: PermissionContext): boolean => {
    // Only managers can create invites
    return context.currentUserRole === UserRole.Manager;
  },

  canDeleteInvite: (context: PermissionContext): boolean => {
    // Only managers can delete invites
    return context.currentUserRole === UserRole.Manager;
  },

  canViewWorkspaceInvites: (context: PermissionContext): boolean => {
    // Only managers can view workspace invites (based on invite.controller.ts)
    return context.currentUserRole === UserRole.Manager;
  },

  // Workspace management permissions (based on workspace.controller.ts)
  canUpdateWorkspace: (context: PermissionContext): boolean => {
    // Only managers can update workspace (PATCH /workspaces/:id requires MANAGER permission)
    return context.currentUserRole === UserRole.Manager;
  },

  canDeleteWorkspace: (context: PermissionContext): boolean => {
    // Only managers can delete workspace (DELETE /workspaces/:id requires MANAGER permission)
    return context.currentUserRole === UserRole.Manager;
  },

  canViewWorkspace: (context: PermissionContext): boolean => {
    // Any workspace member can view workspace (GET /workspaces/:id requires MEMBER permission)
    return !!context.currentUserRole;
  },

  // Release management permissions (based on release.controller.ts)
  canCreateRelease: (context: PermissionContext): boolean => {
    // Only managers can create releases
    return context.currentUserRole === UserRole.Manager;
  },

  canUpdateRelease: (context: PermissionContext): boolean => {
    // Only managers can update releases
    return context.currentUserRole === UserRole.Manager;
  },

  canDeleteRelease: (context: PermissionContext): boolean => {
    // Only managers can delete releases
    return context.currentUserRole === UserRole.Manager;
  },

  canUpdateQAStatus: (context: PermissionContext): boolean => {
    // Both managers and QA can update QA status
    return [UserRole.Manager, UserRole.QA].includes(
      context.currentUserRole as UserRole
    );
  },

  canViewReleases: (context: PermissionContext): boolean => {
    // Any workspace member can view releases
    return !!context.currentUserRole;
  },

  // Bug management permissions (based on bugs.service.ts validation methods)
  canCreateBug: (context: PermissionContext): boolean => {
    // Only QA and Manager can create bugs
    return [UserRole.QA, UserRole.Manager].includes(
      context.currentUserRole as UserRole
    );
  },

  canUpdateBug: (context: PermissionContext): boolean => {
    // QA, Manager, and Developer roles can update bugs (matches backend validateWorkspacePermissionForUpdate)
    return [UserRole.QA, UserRole.Manager, UserRole.Developer].includes(
      context.currentUserRole as UserRole
    );
  },

  canDeleteBug: (context: PermissionContext): boolean => {
    // Only QA and Manager can delete bugs (matches backend validateWorkspacePermissionForDelete)
    return [UserRole.QA, UserRole.Manager].includes(
      context.currentUserRole as UserRole
    );
  },

  // Hotfix management permissions (based on hotfixes.service.ts validation methods)
  canCreateHotfix: (context: PermissionContext): boolean => {
    // Only QA and Manager can create hotfixes
    return [UserRole.QA, UserRole.Manager].includes(
      context.currentUserRole as UserRole
    );
  },

  canUpdateHotfix: (context: PermissionContext): boolean => {
    // Only QA and Manager can update hotfixes
    return [UserRole.QA, UserRole.Manager].includes(
      context.currentUserRole as UserRole
    );
  },

  canDeleteHotfix: (context: PermissionContext): boolean => {
    // Only QA and Manager can delete hotfixes
    return [UserRole.QA, UserRole.Manager].includes(
      context.currentUserRole as UserRole
    );
  },

  // Task management permissions
  canCreateTask: (context: PermissionContext): boolean => {
    // Only managers can create tasks
    return context.currentUserRole === UserRole.Manager;
  },

  canUpdateTask: (
    context: PermissionContext,
    taskAssignedUsers?: string[]
  ): boolean => {
    // Managers can update any task, users can only update assigned tasks
    if (context.currentUserRole === UserRole.Manager) {
      return true;
    }
    return !!(
      context.currentUserId &&
      taskAssignedUsers?.includes(context.currentUserId)
    );
  },

  canUpdateTaskDetails: (
    context: PermissionContext,
    taskAssignedUsers?: string[]
  ): boolean => {
    // Only managers can update task details (title, description, etc.)
    // Developers can only update status via drag & drop
    return context.currentUserRole === UserRole.Manager;
  },

  canUpdateTaskStatus: (
    context: PermissionContext,
    taskAssignedUsers?: string[]
  ): boolean => {
    // Managers can update any task status, developers can only update assigned tasks status
    if (context.currentUserRole === UserRole.Manager) {
      return true;
    }
    return !!(
      context.currentUserId &&
      taskAssignedUsers?.includes(context.currentUserId)
    );
  },

  canDeleteTask: (context: PermissionContext): boolean => {
    // Only managers can delete tasks
    return context.currentUserRole === UserRole.Manager;
  },

  canViewTasks: (context: PermissionContext): boolean => {
    // Any workspace member can view tasks (filtered by assignment for non-managers)
    return !!context.currentUserRole;
  },

  canCreateDesign: (context: PermissionContext): boolean => {
    return [UserRole.Manager, UserRole.Designer].includes(
      context.currentUserRole as UserRole
    );
  },

  canUpdateDesign: (context: PermissionContext): boolean => {
    return [UserRole.Manager, UserRole.Designer].includes(
      context.currentUserRole as UserRole
    );
  },

  canDeleteDesign: (context: PermissionContext): boolean => {
    return [UserRole.Manager, UserRole.Designer].includes(
      context.currentUserRole as UserRole
    );
  },

  // General utility functions
  isManager: (role?: UserRole): boolean => {
    return role === UserRole.Manager;
  },

  isCurrentUser: (currentUserId?: string, targetUserId?: string): boolean => {
    return !!currentUserId && !!targetUserId && currentUserId === targetUserId;
  },

  hasAnyRole: (role?: UserRole): boolean => {
    return !!role && Object.values(UserRole).includes(role);
  },
};

/**
 * Hook to get current user's permissions within a workspace
 */
export const useWorkspacePermissions = (
  currentUserId?: string,
  currentUserRole?: UserRole,
  workspaceCreatedBy?: string
) => {
  const context: PermissionContext = {
    currentUserId,
    currentUserRole,
    workspaceCreatedBy,
  };

  return {
    // Member permissions
    canAddMember: WorkspacePermissions.canAddMember(context),
    canUpdateMemberRole: WorkspacePermissions.canUpdateMemberRole(context),
    canRemoveMember: WorkspacePermissions.canRemoveMember(context),
    canViewMembers: WorkspacePermissions.canViewMembers(context),

    // Invite permissions
    canCreateInvite: WorkspacePermissions.canCreateInvite(context),
    canDeleteInvite: WorkspacePermissions.canDeleteInvite(context),
    canViewWorkspaceInvites:
      WorkspacePermissions.canViewWorkspaceInvites(context),

    // Workspace permissions
    canUpdateWorkspace: WorkspacePermissions.canUpdateWorkspace(context),
    canDeleteWorkspace: WorkspacePermissions.canDeleteWorkspace(context),
    canViewWorkspace: WorkspacePermissions.canViewWorkspace(context),

    // Release permissions
    canCreateRelease: WorkspacePermissions.canCreateRelease(context),
    canUpdateRelease: WorkspacePermissions.canUpdateRelease(context),
    canDeleteRelease: WorkspacePermissions.canDeleteRelease(context),
    canUpdateQAStatus: WorkspacePermissions.canUpdateQAStatus(context),
    canViewReleases: WorkspacePermissions.canViewReleases(context),

    // Bug permissions
    canCreateBug: WorkspacePermissions.canCreateBug(context),
    canUpdateBug: WorkspacePermissions.canUpdateBug(context),
    canDeleteBug: WorkspacePermissions.canDeleteBug(context),

    // Hotfix permissions
    canCreateHotfix: WorkspacePermissions.canCreateHotfix(context),
    canUpdateHotfix: WorkspacePermissions.canUpdateHotfix(context),
    canDeleteHotfix: WorkspacePermissions.canDeleteHotfix(context),

    // Task permissions
    canCreateTask: WorkspacePermissions.canCreateTask(context),
    canUpdateTask: WorkspacePermissions.canUpdateTask(context),
    canUpdateTaskDetails: WorkspacePermissions.canUpdateTaskDetails(context),
    canUpdateTaskStatus: WorkspacePermissions.canUpdateTaskStatus(context),
    canDeleteTask: WorkspacePermissions.canDeleteTask(context),
    canViewTasks: WorkspacePermissions.canViewTasks(context),

    // Design permissions
    canCreateDesign: WorkspacePermissions.canCreateDesign(context),
    canUpdateDesign: WorkspacePermissions.canUpdateDesign(context),
    canDeleteDesign: WorkspacePermissions.canDeleteDesign(context),

    // Utility
    isManager: WorkspacePermissions.isManager(currentUserRole),
    hasAnyRole: WorkspacePermissions.hasAnyRole(currentUserRole),

    // Context for advanced checks
    getPermissionContext: (targetUserId?: string) => ({
      ...context,
      targetUserId,
    }),

    // Utility function for task-specific permissions
    canUpdateSpecificTask: (taskAssignedUsers?: string[]) =>
      WorkspacePermissions.canUpdateTask(context, taskAssignedUsers),
    canUpdateSpecificTaskDetails: (taskAssignedUsers?: string[]) =>
      WorkspacePermissions.canUpdateTaskDetails(context, taskAssignedUsers),
    canUpdateSpecificTaskStatus: (taskAssignedUsers?: string[]) =>
      WorkspacePermissions.canUpdateTaskStatus(context, taskAssignedUsers),
  };
};
