import { useState, useCallback } from "react";
import { Task, TaskStatus } from "@repo/types";

export type ModalType = "add" | "edit" | "preview" | null;

export interface UseModalStateReturn {
  // Modal type and states
  activeModal: ModalType;
  editTask: Task | null;
  previewTask: Task | null;
  addModalStatus: TaskStatus | null;
  modalColumn: TaskStatus | null;

  // Modal control functions
  openEditModal: (task: Task) => void;
  openPreviewModal: (task: Task) => void;
  openAddModal: (status: TaskStatus) => void;
  setModalColumn: (status: TaskStatus | null) => void;
  closeAllModals: () => void;
  closeEditModal: () => void;
  closePreviewModal: () => void;
  closeAddModal: () => void;
}

export const useModalState = (): UseModalStateReturn => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [addModalStatus, setAddModalStatus] = useState<TaskStatus | null>(null);
  const [modalColumn, setModalColumn] = useState<TaskStatus | null>(null);

  const closeAllModals = useCallback(() => {
    setActiveModal(null);
    setEditTask(null);
    setPreviewTask(null);
    setAddModalStatus(null);
    setModalColumn(null);
  }, []);

  const openEditModal = useCallback(
    (task: Task) => {
      closeAllModals();
      setActiveModal("edit");
      setEditTask(task);
    },
    [closeAllModals]
  );

  const openPreviewModal = useCallback(
    (task: Task) => {
      closeAllModals();
      setActiveModal("preview");
      setPreviewTask(task);
    },
    [closeAllModals]
  );

  const openAddModal = useCallback(
    (status: TaskStatus) => {
      closeAllModals();
      setActiveModal("add");
      setAddModalStatus(status);
    },
    [closeAllModals]
  );

  const closeEditModal = useCallback(() => {
    setActiveModal(null);
    setEditTask(null);
  }, []);

  const closePreviewModal = useCallback(() => {
    setActiveModal(null);
    setPreviewTask(null);
  }, []);

  const closeAddModal = useCallback(() => {
    setActiveModal(null);
    setAddModalStatus(null);
  }, []);

  return {
    activeModal,
    editTask,
    previewTask,
    addModalStatus,
    modalColumn,
    openEditModal,
    openPreviewModal,
    openAddModal,
    setModalColumn,
    closeAllModals,
    closeEditModal,
    closePreviewModal,
    closeAddModal,
  };
};
