'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export type SignalType = 'SOCIAL' | 'SONIC' | 'SYSTEM';

export interface NotificationNode {
  id: string;
  type: SignalType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  avatar?: string;
  image?: string;
  actionLabel?: string;
  actionHref?: string;
  postId?: string; // Anchor to a specific post data node
}

interface NotificationContextType {
  notifications: NotificationNode[];
  unreadCount: number;
  addSignal: (signal: Omit<NotificationNode, 'id' | 'time' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  purgeSignal: (id: string) => void;
  requestPushPermission: () => Promise<void>;
  hasPushPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_SOUND = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

const MOCK_SIGNALS: NotificationNode[] = [
  {
    id: 'sig-1',
    type: 'SOCIAL',
    title: 'New Mutual Connection',
    content: '**Julianne Moore** just followed you back. You are now mutual nodes.',
    time: '2m ago',
    isRead: false,
    avatar: 'https://picsum.photos/seed/50/100/100',
    actionLabel: 'Follow Back'
  },
  {
    id: 'sig-2',
    type: 'SONIC',
    title: 'Playlist Featured',
    content: 'Your **"Midnight Lo-Fi"** vibe was added to the "Global Rising" chart.',
    time: '15m ago',
    isRead: false,
    image: 'https://picsum.photos/seed/play2/100/100',
    actionLabel: 'View Chart'
  },
  {
    id: 'sig-3',
    type: 'SOCIAL',
    title: 'New Vibe Pulse',
    content: '**Sarah Chen** liked your post about clean aesthetics.',
    time: '30m ago',
    isRead: false,
    avatar: 'https://picsum.photos/seed/2/100/100',
    postId: '1'
  },
  {
    id: 'sig-4',
    type: 'SYSTEM',
    title: 'Security Handshake',
    content: 'Your high-velocity workspace was successfully synchronized with the main cluster.',
    time: '1h ago',
    isRead: true,
  }
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationNode[]>([]);
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const { toast } = useToast();

  // Load state from local node storage
  useEffect(() => {
    const saved = localStorage.getItem('vimore_signals');
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch (e) {
        setNotifications(MOCK_SIGNALS);
      }
    } else {
      setNotifications(MOCK_SIGNALS);
    }

    if ("Notification" in window) {
      setHasPushPermission(Notification.permission === "granted");
    }
  }, []);

  // Persist state
  useEffect(() => {
    localStorage.setItem('vimore_signals', JSON.stringify(notifications));
  }, [notifications]);

  const triggerSound = useCallback(() => {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = 0.4;
    audio.play().catch(() => {}); // Browsers might block autoplay without user interaction
  }, []);

  const addSignal = useCallback((signal: Omit<NotificationNode, 'id' | 'time' | 'isRead'>) => {
    const newNode: NotificationNode = {
      ...signal,
      id: `sig-${Date.now()}`,
      time: 'Just now',
      isRead: false
    };

    setNotifications(prev => [newNode, ...prev]);
    triggerSound();

    // Browser Level Push if active
    if (Notification.permission === "granted") {
      new Notification(signal.title, {
        body: signal.content.replace(/\*\*/g, ''),
        icon: signal.avatar || '/icon.svg'
      });
    }
  }, [triggerSound]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const purgeSignal = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const requestPushPermission = async () => {
    if (!("Notification" in window)) {
      toast({ variant: "destructive", title: "Unsupported", description: "This device doesn't support network pulses." });
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setHasPushPermission(true);
      toast({ title: "Authorized", description: "High-velocity push notifications enabled." });
    } else {
      toast({ variant: "destructive", title: "Access Denied", description: "You won't receive pulses while off-hub." });
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addSignal,
      markAsRead,
      markAllAsRead,
      purgeSignal,
      requestPushPermission,
      hasPushPermission
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
