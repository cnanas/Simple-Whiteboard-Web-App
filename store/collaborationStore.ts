import { create } from "zustand";

interface CollaborationState {
  isCollaborative: boolean;
  roomId: string | null;
  setRoom: (roomId: string | null) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  isCollaborative: false,
  roomId: null,
  setRoom: (roomId) =>
    set({
      roomId,
      isCollaborative: roomId !== null,
    }),
}));
