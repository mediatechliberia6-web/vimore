'use client';

import { useEffect, useRef, useCallback } from 'react';
import { client, DATABASE_ID, COL, formatTimeAgo } from '@/lib/appwrite';
import { usePosts } from '@/context/PostContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAdminAlerts } from '@/context/AdminAlertsContext';

const ADMIN_ALERT_SOUND = '/sounds/notification.mp3';

function playAdminSound(type: 'withdrawal' | 'highTicket' | 'payment') {
  if (typeof window === 'undefined') return;
  try {
    const audio = new Audio(ADMIN_ALERT_SOUND);
    audio.volume = type === 'withdrawal' ? 0.9 : type === 'highTicket' ? 0.75 : 0.6;
    audio.playbackRate = type === 'withdrawal' ? 1.3 : 1.0;
    audio.play().catch(() => {});
  } catch { /* ignore */ }
}

export function GlobalRealtimeListener() {
  const { currentUser, selectedChatId, refreshAdminData } = usePosts();
  const { incrementPulse, updateMessagePreview, refreshNotifications } = useNotifications();
  const {
    incrementPendingPayments,
    incrementPendingWithdrawals,
    incrementOpenTickets,
  } = useAdminAlerts();

  const currentUserRef  = useRef(currentUser);
  const selectedChatRef = useRef(selectedChatId);
  const adminRefTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { selectedChatRef.current = selectedChatId; }, [selectedChatId]);

  const debouncedAdminRefresh = useCallback(() => {
    if (adminRefTimerRef.current) clearTimeout(adminRefTimerRef.current);
    adminRefTimerRef.current = setTimeout(() => {
      refreshAdminData().catch(() => {});
    }, 700);
  }, [refreshAdminData]);

  useEffect(() => {
    return () => {
      if (adminRefTimerRef.current) clearTimeout(adminRefTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.$id) return;

    const isAdmin = currentUser.role && currentUser.role !== 'USER';

    const channels: string[] = [
      `databases.${DATABASE_ID}.collections.${COL.MESSAGES}.documents`,
      `databases.${DATABASE_ID}.collections.${COL.NOTIFICATIONS}.documents`,
      `databases.${DATABASE_ID}.collections.${COL.FRIEND_REQUESTS}.documents`,
    ];
    if (isAdmin) {
      channels.push(`databases.${DATABASE_ID}.collections.${COL.REPORTS}.documents`);
    }

    const unsubscribe = client.subscribe(channels, (response) => {
      const events: string[] = response.events as string[];
      const payload = response.payload as any;

      const isCreate = events.some(e => e.endsWith('.create'));
      const isUpdate = events.some(e => e.endsWith('.update'));

      const isMessageEvent      = events.some(e => e.includes(`.${COL.MESSAGES}.`));
      const isNotificationEvent = events.some(e => e.includes(`.${COL.NOTIFICATIONS}.`));
      const isFriendReqEvent    = events.some(e => e.includes(`.${COL.FRIEND_REQUESTS}.`));
      const isReportEvent       = events.some(e => e.includes(`.${COL.REPORTS}.`));

      const user   = currentUserRef.current;
      const chatId = selectedChatRef.current;

      if (isMessageEvent && (isCreate || isUpdate)) {
        if (payload.sender_id !== user?.$id) {
          const clusterId: string = payload.cluster_id || '';
          if (clusterId) {
            const rawText =
              payload.text
                ? String(payload.text).slice(0, 80)
                : payload.media_url
                  ? '📷 Media'
                  : payload.voice_url
                    ? '🎤 Voice note'
                    : 'New message';
            const timeStr = payload.$createdAt ? formatTimeAgo(payload.$createdAt) : 'Just now';
            updateMessagePreview(clusterId, rawText, timeStr);
          }
          const isInCurrentChat = chatId && clusterId && (clusterId === chatId || clusterId.includes(chatId));
          if (!isInCurrentChat) {
            incrementPulse('MESSAGES');
          }
        }
      }

      if (isNotificationEvent && isCreate) {
        if (payload.user_id === user?.$id) {
          refreshNotifications(user.$id);
        }
      }

      if (isFriendReqEvent && isCreate) {
        if (payload.to_user_id === user?.$id) {
          incrementPulse('FRIENDS');
        }
      }

      if (isReportEvent && isCreate && isAdmin) {
        incrementPulse('ADMIN');
      }
    });

    return () => { unsubscribe(); };
  }, [currentUser?.$id, currentUser?.role, incrementPulse, updateMessagePreview, refreshNotifications]);

  useEffect(() => {
    if (!currentUser?.$id) return;
    const isAdmin = currentUser.role && currentUser.role !== 'USER';
    if (!isAdmin) return;

    const adminChannels = [
      `databases.${DATABASE_ID}.collections.${COL.PAYMENT_REQUESTS}.documents`,
      `databases.${DATABASE_ID}.collections.${COL.WITHDRAWAL_REQUESTS}.documents`,
      `databases.${DATABASE_ID}.collections.${COL.SUPPORT_TICKETS}.documents`,
    ];

    const unsubscribe = client.subscribe(adminChannels, (response) => {
      const events: string[] = response.events as string[];
      const payload = response.payload as any;

      const isCreate = events.some(e => e.endsWith('.create'));
      const isUpdate = events.some(e => e.endsWith('.update'));

      const isPaymentEvent    = events.some(e => e.includes(`.${COL.PAYMENT_REQUESTS}.`));
      const isWithdrawalEvent = events.some(e => e.includes(`.${COL.WITHDRAWAL_REQUESTS}.`));
      const isTicketEvent     = events.some(e => e.includes(`.${COL.SUPPORT_TICKETS}.`));

      if (isPaymentEvent && isCreate) {
        const status = (payload.status || '').toUpperCase();
        if (!status || status === 'PENDING' || status === 'AWAITING_REVIEW') {
          incrementPendingPayments();
          incrementPulse('ADMIN');
          playAdminSound('payment');
          debouncedAdminRefresh();
        }
      }

      if (isWithdrawalEvent && isCreate) {
        const status = (payload.status || '').toUpperCase();
        if (!status || status === 'PENDING' || status === 'AWAITING_REVIEW') {
          incrementPendingWithdrawals();
          incrementPulse('ADMIN');
          playAdminSound('withdrawal');
          debouncedAdminRefresh();
        }
      }

      if (isTicketEvent && (isCreate || isUpdate)) {
        const status   = (payload.status || '').toUpperCase();
        const priority = (payload.priority || '').toUpperCase();
        if (isCreate && (status === 'OPEN' || !status)) {
          incrementOpenTickets();
          incrementPulse('ADMIN');
          if (priority === 'HIGH' || priority === 'URGENT') {
            playAdminSound('highTicket');
          }
          debouncedAdminRefresh();
        } else if (isUpdate) {
          debouncedAdminRefresh();
        }
      }
    });

    return () => { unsubscribe(); };
  }, [
    currentUser?.$id,
    currentUser?.role,
    incrementPendingPayments,
    incrementPendingWithdrawals,
    incrementOpenTickets,
    incrementPulse,
    debouncedAdminRefresh,
  ]);

  return null;
}
