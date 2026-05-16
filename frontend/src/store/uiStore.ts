import { create } from "zustand";

interface UIState {
  isMobileSidebarOpen: boolean;
  isCaptureModalOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setCaptureModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileSidebarOpen: false,
  isCaptureModalOpen: false,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setCaptureModalOpen: (open) => set({ isCaptureModalOpen: open }),
}));
