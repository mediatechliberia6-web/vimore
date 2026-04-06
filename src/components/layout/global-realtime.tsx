'use client';

import { useEffect, useRef } from 'react';
import { client, DATABASE_ID, COL } from '@/lib/appwrite';
import { usePosts } from '@/context/PostContext';
import { useNotifications } from '@/context/NotificationContext';
import { formatTimeAgo } from '@/lib/appwrite';

export function GlobalRealtimeListener() {
  const { currentUser, selectedChatId } = usePosts();
  const { incrementPulse, updateMessagePreview, refreshNotifications } = useNotifications();

  const currentUserRef = useRef(currentUser);
  const selectedChatIdRef = useRef(selectedChatId);

  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { selectedChatIdRef.current = selectedChatId; }, [selectedChatId]);

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
      const chatId = selectedChatIdRef.current;

      if (isMessageEvent && (isCreate || isUpdate)) {
        if (payload.sender_id !== user?.$id) {
          const clusterId: string = payload.cluster_id || '';

          if (clusterId) {
            const rawText: string =
              payload.text
                ? String(payload.text).slice(0, 80)
                : payload.media_url
                  ? '📷 Media'
                  : payload.voice_url
                    ? '🎤 Voice note'
                    : 'New message';

            const timeStr = payload.$createdAt
              ? formatTimeAgo(payload.$createdAt)
              : 'Just now';

            updateMessagePreview(clusterId, rawText, timeStr);
          }

          const isInCurrentChat =
            chatId && clusterId && (clusterId === chatId || clusterId.includes(chatId));

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

    return () => {
      unsubscribe();
    };
  }, [currentUser?.$id, currentUser?.role, incrementPulse, updateMessagePreview, refreshNotifications]);

  return null;
}
