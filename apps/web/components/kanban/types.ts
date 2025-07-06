export type KanbanUser = {
  _id: string;
  username: string;
  displayName: string;
  email: string;
};

export type ViewMode = "kanban" | "list";

export type ModalType = "add" | "edit" | "preview" | null;
