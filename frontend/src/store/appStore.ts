import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

interface AppStore {
  user: User | null;
  token: string | null;
  activeSection: string;
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  theme: 'dark';
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setActiveSection: (s: string) => void;
  toggleSidebar: () => void;
  toggleAIPanel: () => void;
  logout: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      activeSection: 'dashboard',
      sidebarCollapsed: false,
      aiPanelOpen: false,
      theme: 'dark',
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setActiveSection: (activeSection) => set({ activeSection }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
      logout: () => set({ user: null, token: null, activeSection: 'dashboard' }),
    }),
    { name: 'lwb-store', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);
