'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { usePosts } from '@/context/PostContext';
import { databases, DATABASE_ID, COL, ID, Query } from '@/lib/appwrite';

export type SignalType = 'SOCIAL' | 'SONIC' | 'POST' | 'SYSTEM';
export type PulseCategory = 'HOME' | 'FRIENDS' | 'MUSIC' | 'MESSAGES';

export interface NotificationNode {
  id: string;
  type: SignalType;
  title: string;
  content: string;
  time: string;
  isRead: boolean;
  recipientId?: string;
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

const NOTIFICATION_SOUND = "/sounds/notification.mp3";

function formatTimeAgoSimple(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationNode[]>([]);
  const [categoryPulses, setCategoryPulses] = useState<Record<PulseCategory, number>>({
    HOME: 0, FRIENDS: 0, MUSIC: 0, MESSAGES: 0,
  });
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const { settings, triggerHaptic, currentUser } = usePosts();

  const loadNotifications = useCallback(async (userId: string) => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.NOTIFICATIONS, [
        Query.equal('user_id', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]);
      const mapped: NotificationNode[] = res.documents.map((doc: any) => ({
        id: doc.$id,
        type: (doc.type as SignalType) || 'SYSTEM',
        title: '',
        content: doc.message || '',
        time: formatTimeAgoSimple(doc.$createdAt),
        isRead: doc.is_read || false,
        recipientId: doc.user_id || '',
        postId: doc.post_id || undefined,
        trackId: doc.track_id || undefined,
        targetUsername: doc.target_username || undefined,
      }));
      setNotifications(mapped);
    } catch (err) {
      console.error('loadNotifications error:', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadNotifications(currentUser.$id);
    } else {
      setNotifications([]);
    }
  }, [currentUser, loadNotifications]);

  const triggerSound = useCallback(() => {
    if (settings.isSilenceActive) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const isSilenced = settings.silenceStart < settings.silenceEnd
        ? (currentTime >= settings.silenceStart && currentTime <= settings.silenceEnd)
        : (currentTime >= settings.silenceStart || currentTime <= settings.silenceEnd);
      if (isSilenced) return;
    }
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.volume = 0.5;
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

    if (signal.recipientId) {
      const notifData: Record<string, any> = {
        user_id: signal.recipientId,
        type: signal.type,
        message: signal.content || signal.title || '',
        is_read: false,
      };
      if (signal.postId) notifData.post_id = signal.postId;
      databases.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), notifData).catch(() => { /* ignore */ });
    }
  }, [triggerSound, triggerHaptic]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    databases.updateDocument(DATABASE_ID, COL.NOTIFICATIONS, id, { is_read: true }).catch(() => { /* ignore */ });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      prev.filter(n => !n.isRead).forEach(n => {
        databases.updateDocument(DATABASE_ID, COL.NOTIFICATIONS, n.id, { is_read: true }).catch(() => { /* ignore */ });
      });
      return prev.map(n => ({ ...n, isRead: true }));
    });
  }, []);

  const purgeSignal = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    databases.deleteDocument(DATABASE_ID, COL.NOTIFICATIONS, id).catch(() => { /* ignore */ });
  }, []);

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
