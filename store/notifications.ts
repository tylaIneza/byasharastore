"use client";
import { create } from "zustand";
import { Notification } from "@/types";

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  setNotifications: (n: Notification[]) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length }),

  markRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + (n.read ? 0 : 1),
    })),
}));
