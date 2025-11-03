import { create } from 'zustand'

import { User, Project } from '@/types';

interface AppState {
  user: User | null;
  currentProject: Project | null;
  sidebarOpen: boolean;
  setUser: (user: User | null) => void;
  setCurrentProject: (project: Project | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  currentProject: null,
  sidebarOpen: true,
  setUser: (user) => set({ user }),
  setCurrentProject: (project) => set({ currentProject: project }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));