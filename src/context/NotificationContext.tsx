
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePosts } from '@/context/PostContext';
import client, { databases, APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, MESSAGES_COLLECTION_ID, Query, ID } from '@/lib/appwrite';

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
  requestPushPermission: () => Promise<void>;
  hasPushPermission: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SOUNDS = {
  cyberpunk: "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3",
  lofi: "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
};

// Maximum nodes to keep in local view
const SIGNAL_DISPLAY_LIMIT = 50;

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

  const fetchNotifications = useCallback(async () => {
    if (!currentUser.id) return;
    try {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        [
          Query.equal('recipientId', currentUser.id),
          Query.orderDesc('$createdAt'),
          Query.limit(SIGNAL_DISPLAY_LIMIT)
        ]
      );
      
      const nodes: NotificationNode[] = response.documents.map(doc => ({
        id: doc.$id,
        type: doc.type,
        title: doc.title,
        content: doc.content,
        recipientId: doc.recipientId,
        time: new Date(doc.$createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isRead: doc.isRead,
        avatar: doc.avatar,
        image: doc.image,
        postId: doc.postId,
        trackId: doc.trackId,
        targetUsername: doc.targetUsername,
        actionHref: doc.actionHref,
        actionLabel: doc.actionLabel
      }));
      
      setNotifications(nodes);
    } catch (e) {
      console.warn("Signal vault fetch failed.");
    }
  }, [currentUser.id]);

  useEffect(() => {
    fetchNotifications();

    if (!currentUser.id) return;

    // REAL-TIME NOTIFICATION HANDSHAKE
    const notificationUnsubscribe = client.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.${NOTIFICATIONS_COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as any;
        if (payload.recipientId === currentUser.id) {
          fetchNotifications();
          triggerSound();
          triggerHaptic(10);

          // Update Category Pulse
          setCategoryPulses(prev => {
            const next = { ...prev };
            if (payload.type === 'SOCIAL') next.FRIENDS += 1;
            if (payload.type === 'POST') next.HOME += 1;
            if (payload.type === 'SONIC') next.MUSIC += 1;
            return next;
          });
        }
      }
    );

    // REAL-TIME MESSAGE PULSE
    const messageUnsubscribe = client.subscribe(
      `databases.${APPWRITE_DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
      (response) => {
        const payload = response.payload as any;
        // If message is incoming, increment message pulse badge
        if (payload.senderId !== currentUser.username) {
          setCategoryPulses(prev => ({ ...prev, MESSAGES: prev.MESSAGES + 1 }));
          triggerHaptic(5);
          triggerSound();
        }
      }
    );

    return () => {
      notificationUnsubscribe();
      messageUnsubscribe();
    };
  }, [currentUser.id, currentUser.username, fetchNotifications, triggerHaptic, triggerSound]);

  useEffect(() => {
    if (typeof window !== 'undefined' && "Notification" in window) {
      setHasPushPermission(Notification.permission === "granted");
    }
  }, []);

  const addSignal = useCallback(async (signal: Omit<NotificationNode, 'id' | 'time' | 'isRead'>) => {
    try {
      await databases.createDocument(
        APPWRITE_DATABASE_ID,
        NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        {
          ...signal,
          isRead: false,
          timestamp: Date.now()
        }
      );
    } catch (e) {
      console.error("Signal transmission failed:", e);
    }
  }, []);

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await databases.updateDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, id, { isRead: true });
    } catch (e) {}
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      for (const n of unread) {
        await databases.updateDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, n.id, { isRead: true });
      }
    } catch (e) {}
  };

  const purgeSignal = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await databases.deleteDocument(APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID, id);
    } catch (e) {}
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
