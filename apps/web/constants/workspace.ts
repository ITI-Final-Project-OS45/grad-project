export const workspaceConstants = {
  createDialog: {
    title: "Create New Workspace",
    description: "Create a new workspace to organize your projects and collaborate with your team.",
    namePlaceholder: "Enter workspace name",
    descriptionPlaceholder: "Describe your workspace (optional)",
    nameLabel: "Workspace Name *",
    descriptionLabel: "Description",
    cancelButton: "Cancel",
    createButton: "Create Workspace",
  },
};

export const inviteMembersConstants = {
  dialog: {
    title: "Invite Team Members",
    description: "Invite people to collaborate on this workspace by email or username.",
    inviteLinkLabel: "Invite Link",
    inviteLinkNote: "Anyone with this link can join the workspace",
    copyLinkSuccess: "Invite link copied. Share this link with team members to invite them.",
    copyLinkError: "Failed to copy link. Please try again.",
    addInvitesLabel: "Send Individual Invites",
    emailOrUsernamePlaceholder: "Email or username",
    roleManager: "Manager",
    roleDeveloper: "Developer",
    roleDesigner: "Designer",
    roleQA: "QA",
    pendingInvitesLabel: (count: number) => `Pending Invites (${count})`,
    cancelButton: "Cancel",
    sendButton: (count: number) => `Send ${count > 0 ? count + " " : ""}Invite${count !== 1 ? "s" : ""}`,
    sendSuccess: (count: number) => `${count} invitation(s) have been sent.`,
    sendError: "Error sending invites. Please try again later.",
  },
};
