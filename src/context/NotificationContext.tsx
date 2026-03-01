'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/context/PostContext';

export type SignalType = 'SOCIAL' | 'SONIC' | 'POST' | 'SYSTEM';
export type PulseCategory = 'HOME' | 'FRIENDS' | 'MUSIC' | 'REELS' | 'MESSAGES';

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
  requestPushPermission: () => Promise<void>;
  hasPushPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SOUNDS = {
  cyberpunk: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
  lofi: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
};

const MOCK_SIGNALS: NotificationNode[] = [
  {
    id: 'sig-paul',
    type: 'SOCIAL',
    title: 'Mutual Pulse',
    content: '**Paul Node** followed you back. You are now mutual nodes.',
    time: 'Just now',
    isRead: false,
    avatar: 'https://picsum.photos/seed/paul/100/100',
    targetUsername: 'paul'
  },
  {
    id: 'sig-1',
    type: 'SOCIAL',
    title: 'New Connection',
    content: '**Sarah Chen** just followed you back. You are now mutual nodes.',
    time: '2m ago',
    isRead: false,
    avatar: 'https://picsum.photos/seed/2/100/100',
    targetUsername: 'schen_dev'
  }
];

// Maximum nodes to keep in local storage to prevent QuotaExceededError
const SIGNAL_STORAGE_LIMIT = 30;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationNode[]>([]);
  const [categoryPulses, setCategoryPulses] = useState<Record<PulseCategory, number>>({
    HOME: 0,
    FRIENDS: 0,
    MUSIC: 0,
    REELS: 0,
    MESSAGES: 0
  });
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const { toast } = useToast();
  const { settings, triggerHaptic } = usePosts();

  useEffect(() => {
    const saved = localStorage.getItem('vimore_signals');
    const savedPulses = localStorage.getItem('vimore_pulses');
    
    if (saved) {
      try { setNotifications(JSON.parse(saved)); } catch (e) { setNotifications(MOCK_SIGNALS); }
    } else {
      setNotifications(MOCK_SIGNALS);
    }

    if (savedPulses) {
      try { setCategoryPulses(JSON.parse(savedPulses)); } catch (e) {}
    }

    if (typeof window !== 'undefined' && "Notification" in window) {
      setHasPushPermission(Notification.permission === "granted");
    }
  }, []);

  // Safe Persistence Protocol
  useEffect(() => {
    try {
      // Buffer Check: Keep only latest nodes
      const bufferedNotifications = notifications.slice(0, SIGNAL_STORAGE_LIMIT);
      localStorage.setItem('vimore_signals', JSON.stringify(bufferedNotifications));
    } catch (e) {
      console.warn("Signal buffer failed to sync. Clearing cache to restore handshake.");
      localStorage.removeItem('vimore_signals');
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem('vimore_pulses', JSON.stringify(categoryPulses));
    } catch (e) {}
  }, [categoryPulses]);

  // Synthetic Signal Simulator
  useEffect(() => {
    const categories: PulseCategory[] = ['HOME', 'FRIENDS', 'MUSIC', 'REELS', 'MESSAGES'];
    
    const interval = setInterval(() => {
      // 30% chance of a pulse every interval
      if (Math.random() > 0.7) {
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        setCategoryPulses(prev => ({
          ...prev,
          [randomCat]: Math.min(prev[randomCat] + 1, 10) // Cap at 10 for "9+" display
        }));
        triggerHaptic(5);
      }
    }, 45000); // Pulse check every 45 seconds

    return () => clearInterval(interval);
  }, [triggerHaptic]);

  const triggerSound = useCallback(() => {
    if (settings.isSilenceActive) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Handle overnight window (e.g., 22:00 to 07:00)
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
    const newNode: NotificationNode = {
      ...signal,
      id: `sig-${Date.now()}`,
      time: 'Just now',
      isRead: false
    };

    setNotifications(prev => [newNode, ...prev].slice(0, SIGNAL_STORAGE_LIMIT + 10)); // Local state buffer
    triggerSound();

    if (typeof window !== 'undefined' && "Notification" in window && Notification.permission === "granted") {
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

  const clearPulse = (category: PulseCategory) => {
    setCategoryPulses(prev => ({ ...prev, [category]: 0 }));
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
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      categoryPulses,
      addSignal,
      markAsRead,
      markAllAsRead,
      purgeSignal,
      clearPulse,
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
