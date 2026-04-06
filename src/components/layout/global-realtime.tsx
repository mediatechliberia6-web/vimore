'use client';

import { useEffect, useRef, useCallback } from 'react';
import { client, DATABASE_ID, COL, formatTimeAgo } from '@/lib/appwrite';
import { usePosts, PostComment } from '@/context/PostContext';
import { useNotifications } from '@/context/NotificationContext';
import { useAdminAlerts } from '@/context/AdminAlertsContext';
import { useFeedSignal } from '@/context/FeedSignalContext';

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
  const {
    currentUser, selectedChatId, refreshAdminData,
    followingUserIds, applyPostCountUpdate, addStreamedComment, activeCommentPostId,
  } = usePosts();
  const { incrementPulse, updateMessagePreview, refreshNotifications } = useNotifications();
  const {
    incrementPendingPayments,
    incrementPendingWithdrawals,
    incrementOpenTickets,
  } = useAdminAlerts();
  const { incrementNewPosts } = useFeedSignal();

  const currentUserRef       = useRef(currentUser);
  const selectedChatRef      = useRef(selectedChatId);
  const followingUserIdsRef  = useRef(followingUserIds);
  const activeCommentPostRef = useRef(activeCommentPostId);
  const adminRefTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);
  useEffect(() => { selectedChatRef.current = selectedChatId; }, [selectedChatId]);
  useEffect(() => { followingUserIdsRef.current = followingUserIds; }, [followingUserIds]);
  useEffect(() => { activeCommentPostRef.current = activeCommentPostId; }, [activeCommentPostId]);

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

  // ─── Core social + admin channels ───────────────────────────────────────
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

  // ─── Post interaction counts (likes / comments / shares) ─────────────────
  useEffect(() => {
    if (!currentUser?.$id) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COL.POSTS}.documents`,
      (response) => {
        const events: string[] = response.events as string[];
        const payload = response.payload as any;
        const postId: string = payload.$id;
        if (!postId) return;

        const isCreate = events.some(e => e.endsWith('.create'));
        const isUpdate = events.some(e => e.endsWith('.update'));

        if (isUpdate) {
          const update: { likes?: number; unlikes?: number; comments?: number; shares?: number } = {};
          if (typeof payload.likes_count === 'number')    update.likes    = payload.likes_count;
          if (typeof payload.unlikes_count === 'number')  update.unlikes  = payload.unlikes_count;
          if (typeof payload.comments_count === 'number') update.comments = payload.comments_count;
          if (typeof payload.shares_count === 'number')   update.shares   = payload.shares_count;
          if (Object.keys(update).length > 0) {
            applyPostCountUpdate(postId, update);
          }
        }

        if (isCreate) {
          const authorId: string = payload.user_id || '';
          const me = currentUserRef.current;
          if (authorId && me && authorId !== me.$id) {
            if (followingUserIdsRef.current.has(authorId)) {
              incrementNewPosts();
              incrementPulse('HOME');
            }
          }
        }
      }
    );

    return () => { unsubscribe(); };
  }, [currentUser?.$id, applyPostCountUpdate, incrementNewPosts, incrementPulse]);

  // ─── Real-time comment streaming ─────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.$id) return;

    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COL.POST_COMMENTS}.documents`,
      (response) => {
        const events: string[] = response.events as string[];
        const payload = response.payload as any;
        const isCreate = events.some(e => e.endsWith('.create'));
        if (!isCreate) return;

        const targetPostId: string = payload.post_id || '';
        const activeId = activeCommentPostRef.current;
        if (!targetPostId || !activeId || targetPostId !== activeId) return;

        const comment: PostComment = {
          $id: payload.$id,
          userId: payload.user_id || '',
          userName: payload.user_name || 'Unknown',
          userAvatar: payload.user_avatar || '',
          text: payload.text || payload.content || '',
          time: payload.$createdAt ? formatTimeAgo(payload.$createdAt) : 'Just now',
          timestamp: payload.$createdAt ? new Date(payload.$createdAt).getTime() : Date.now(),
          parentId: payload.parent_id || undefined,
        };
        addStreamedComment(comment);
      }
    );

    return () => { unsubscribe(); };
  }, [currentUser?.$id, addStreamedComment]);

  // ─── Admin financial channels ─────────────────────────────────────────────
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
