import { create } from 'zustand';
import type { User, Notification } from './types';
import { auth, notifications as notificationsService } from './services/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
}

interface UIState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  error: null,

  signUp: async (email: string, password: string, username: string) => {
    set({ loading: true, error: null });
    try {
      await auth.signUp(email, password, username);
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      await auth.signIn(email, password);
      await get().fetchUser();
      set({ loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await auth.signOut();
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },

  fetchUser: async () => {
    set({ loading: true });
    try {
      const current = await auth.getCurrentUser();
      if (current) {
        // Fetch user profile from database
        const { users } = await import('./services/supabase');
        const profile = await users.getProfile(current.id);
        set({ user: profile as User, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({ user: null, loading: false });
    }
  },
}));

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async (userId: string) => {
    set({ loading: true });
    try {
      const data = await notificationsService.getNotifications(userId, 50);
      const unreadCount = data.filter(n => !n.is_read).length;
      set({ notifications: data as Notification[], unreadCount, loading: false });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      set({ loading: false });
    }
  },

  markAsRead: async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllAsRead: async (userId: string) => {
    try {
      await notificationsService.markAllAsRead(userId);
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },
}));

export const useUIStore = create<UIState>((set) => ({
  isDarkMode: localStorage.getItem('darkMode') === 'true',
  toggleDarkMode: () => {
    set((state) => {
      const newDarkMode = !state.isDarkMode;
      localStorage.setItem('darkMode', String(newDarkMode));
      if (newDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
      return { isDarkMode: newDarkMode };
    });
  },
  sidebarOpen: false,
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },
}));
