'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/context/PostContext';
import { 
  databases, 
  Query, 
  ID, 
  APPWRITE_DATABASE_ID, 
  NOTIFICATIONS_COLLECTION_ID,
  default as client
} from '@/lib/appwrite';

export type SignalType = 'SOCIAL' | 'SONIC' | 'POST' | 'SYSTEM';
export type PulseCategory = 'HOME' | 'FRIENDS' | 'MUSIC' | 'REELS' | 'MESSAGES';

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
  lofi: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationNode[]>([]);
  const [categoryPulses, setCategoryPulses] = useState<Record<PulseCategory, number>>({
    HOME: 0, FRIENDS: 0, MUSIC: 0, REELS: 0, MESSAGES: 0
  });
  const [hasPushPermission, setHasPushPermission] = useState(false);
  const { settings, triggerHaptic, currentUser } = usePosts();

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

  const refreshNotifications = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        [Query.equal('recipientId', currentUser.username), Query.orderDesc('$createdAt'), Query.limit(50)]
      );
      setNotifications(response.documents.map((d: any) => ({
        id: d.$id, type: d.type, title: d.title, content: d.content,
        time: "Recently", isRead: d.isRead, recipientId: d.recipientId,
        avatar: d.avatar, postId: d.postId, trackId: d.trackId
      })));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => { refreshNotifications(); }, [refreshNotifications]);

  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = client.subscribe(
      [`databases.${APPWRITE_DATABASE_ID}.collections.${NOTIFICATIONS_COLLECTION_ID}.documents`],
      response => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const payload = response.payload as any;
          if (payload.recipientId === currentUser.username) {
            triggerSound();
            triggerHaptic(15);
            refreshNotifications();
          }
        }
      }
    );
    return () => unsubscribe();
  }, [currentUser, triggerSound, triggerHaptic, refreshNotifications]);

  const addSignal = useCallback(async (signal: Omit<NotificationNode, 'id' | 'time' | 'isRead'>) => {
    if (!currentUser) return;
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        { ...signal, isRead: false, timestamp: new Date().toISOString() }
      );
    } catch (e) {}
  }, [currentUser]);

  const markAsRead = async (id: string) => {
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, id, { isRead: true });
      refreshNotifications();
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    for (const n of notifications.filter(n => !n.isRead)) {
      await databases.updateDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, n.id, { isRead: true });
    }
    refreshNotifications();
  };

  const purgeSignal = async (id: string) => {
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, id);
      refreshNotifications();
    } catch (e) {}
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
      notifications, unreadCount, categoryPulses, addSignal, markAsRead, markAllAsRead, purgeSignal, clearPulse, incrementPulse, requestPushPermission, hasPushPermission
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
