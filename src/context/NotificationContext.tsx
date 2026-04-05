'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';
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
  const { settings, triggerHaptic, currentUser, selectedChatId } = usePosts();

  const loadNotifications = useCallback(async (userId: string) => {
    try {
      const res = await databases.listDocuments(DATABASE_ID, COL.NOTIFICATIONS, [
        Query.equal('user_id', userId),
        Query.notEqual('type', 'CALL_INCOMING'),
        Query.orderDesc('$createdAt'),
        Query.limit(50),
      ]);
      const mapped: NotificationNode[] = res.documents.map((doc: any) => ({
        id: doc.$id,
        type: (doc.type as SignalType) || 'SYSTEM',
        title: doc.title || '',
        content: doc.content || doc.message || '',
        time: formatTimeAgoSimple(doc.$createdAt),
        isRead: doc.is_read || false,
        recipientId: doc.user_id || '',
        postId: doc.post_id || undefined,
        trackId: doc.track_id || undefined,
        targetUsername: doc.target_username || undefined,
        avatar: doc.avatar || undefined,
        image: doc.image || undefined,
        actionLabel: doc.action_label || undefined,
        actionHref: doc.action_href || undefined,
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

  // Poll for new notifications every 4 seconds so users see them without refreshing
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      loadNotifications(currentUser.$id);
    }, 4000);
    return () => clearInterval(interval);
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

    const targetUserId = signal.recipientId || (currentUser?.$id);
    if (targetUserId) {
      const notifData: Record<string, any> = {
        user_id: targetUserId,
        from_user_id: currentUser?.$id || '',
        from_user_name: currentUser?.name || currentUser?.username || '',
        from_user_avatar: currentUser?.avatar || '',
        type: signal.type,
        message: signal.content || signal.title || '',
        is_read: false,
      };
      if (signal.title) notifData.title = signal.title;
      if (signal.content) notifData.content = signal.content;
      if (signal.postId) notifData.post_id = signal.postId;
      if (signal.trackId) notifData.track_id = String(signal.trackId);
      if (signal.targetUsername) notifData.target_username = signal.targetUsername;
      databases.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), notifData).catch((err) => {
        console.error('addSignal DB write failed:', err);
      });
    }
  }, [triggerSound, triggerHaptic, currentUser]);

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

  // Background poll for new chat messages — updates the MESSAGES badge when not in chat
  const lastMsgTimestampRef = useRef<string | null>(null);
  useEffect(() => {
    if (!currentUser) return;

    const checkNewMessages = async () => {
      try {
        const queries: any[] = [
          Query.orderDesc('$createdAt'),
          Query.limit(50),
        ];
        if (lastMsgTimestampRef.current) {
          queries.push(Query.greaterThan('$createdAt', lastMsgTimestampRef.current));
        }

        const result = await databases.listDocuments(DATABASE_ID, COL.MESSAGES, queries);
        if (result.documents.length === 0) return;

        const newestTimestamp = result.documents[0].$createdAt;

        if (lastMsgTimestampRef.current) {
          const newFromOthers = result.documents.filter(doc => {
            if (doc.sender_id === currentUser.$id) return false;
            const clusterId: string = doc.cluster_id || '';
            if (!clusterId) return false;
            const sId = selectedChatId || '';
            if (sId && clusterId.includes(sId)) return false;
            return true;
          });
          if (newFromOthers.length > 0) {
            incrementPulse('MESSAGES');
          }
        }

        lastMsgTimestampRef.current = newestTimestamp;
      } catch { /* ignore */ }
    };

    const interval = setInterval(checkNewMessages, 2000);
    return () => clearInterval(interval);
  }, [currentUser, selectedChatId, incrementPulse]);

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
