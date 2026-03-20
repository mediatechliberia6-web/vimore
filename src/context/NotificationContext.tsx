'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/context/PostContext';
import { MOCK_NOTIFICATIONS } from '@/lib/mock-data';

export type SignalType = 'SOCIAL' | 'SONIC' | 'POST' | 'SYSTEM';
export type PulseCategory = 'HOME' | 'FRIENDS' | 'MUSIC' | 'MESSAGES';

export interface NotificationNode {
  id: string;
  type: SignalType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  recipientId: string;
  avatar?: string;
  image?: string;
  actionLabel?: string;
  actionHref?: string;
  postId?: string;
  trackId?: string | number;
  targetUsername?: string;
}

interface NotificationContextType {
  notifications: NotificationNode[];
  unreadCount: number;
  categoryPulses: Record<PulseCategory, number>;
  addSignal: (signal: Omit<NotificationNode, 'id' | 'time' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  purgeSignal: (id: string) => void;
  clearPulse: (category: PulseCategory) => void;
  incrementPulse: (category: PulseCategory) => void;
  requestPushPermission: () => Promise<void>;
  hasPushPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SOUNDS = {
  cyberpunk: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
  lofi: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationNode[]>(MOCK_NOTIFICATIONS);
  const [categoryPulses, setCategoryPulses] = useState<Record<PulseCategory, number>>({
    HOME: 0, FRIENDS: 0, MUSIC: 0, MESSAGES: 0,
  });
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const { settings, triggerHaptic } = usePosts();

  const triggerSound = useCallback(() => {
    if (settings.isSilenceActive) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const isSilenced = settings.silenceStart < settings.silenceEnd
        ? (currentTime >= settings.silenceStart && currentTime <= settings.silenceEnd)
        : (currentTime >= settings.silenceStart || currentTime <= settings.silenceEnd);
      if (isSilenced) return;
    }
    const soundUrl = settings.activeSoundSet === 'cyberpunk' ? SOUNDS.cyberpunk : SOUNDS.lofi;
    const audio = new Audio(soundUrl);
    audio.volume = 0.4;
    audio.play().catch(() => {});
  }, [settings]);

  const addSignal = useCallback((signal: Omit<NotificationNode, 'id' | 'time' | 'isRead'>) => {
    const newNotif: NotificationNode = {
      ...signal,
      id: 'notif_' + Date.now(),
      time: 'Just now',
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    triggerSound();
    triggerHaptic(15);
  }, [triggerSound, triggerHaptic]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const purgeSignal = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearPulse = useCallback((category: PulseCategory) => {
    setCategoryPulses(prev => ({ ...prev, [category]: 0 }));
  }, []);

  const incrementPulse = useCallback((category: PulseCategory) => {
    setCategoryPulses(prev => ({ ...prev, [category]: (prev[category] || 0) + 1 }));
    triggerSound();
  }, [triggerSound]);

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setHasPushPermission(permission === "granted");
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount, categoryPulses, addSignal, markAsRead, markAllAsRead,
      purgeSignal, clearPulse, incrementPulse, requestPushPermission, hasPushPermission,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
}
