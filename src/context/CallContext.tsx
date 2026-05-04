'use client';

import {
  createContext, useContext, useState, useRef, useEffect, useCallback, ReactNode,
} from 'react';
import { databases, ID, Query, COL, DATABASE_ID } from '@/lib/appwrite';
import { usePosts } from '@/context/PostContext';
import { buildRoomId, CallType, CallSignalType } from '@/lib/zego';
import { useToast } from '@/hooks/use-toast';

const RING_TIMEOUT_MS = 60_000;
const POLL_MS = 2_000;
const COLLECTION = COL.CALL_SIGNALS;

export interface CallContact {
  $id: string;
  name: string;
  username: string;
  avatar: string;
}

type CallStatus = 'idle' | 'outgoing' | 'incoming' | 'active';

interface CallState {
  status: CallStatus;
  contact: CallContact | null;
  callType: CallType;
  roomId: string;
  incomingSignalId: string | null;
  outgoingSignalId: string | null;
  startedAt: number | null;
}

const IDLE: CallState = {
  status: 'idle',
  contact: null,
  callType: 'audio',
  roomId: '',
  incomingSignalId: null,
  outgoingSignalId: null,
  startedAt: null,
};

interface CallContextType {
  callState: CallState;
  initiateCall: (contact: CallContact, type: CallType) => Promise<void>;
  acceptCall: () => void;
  declineCall: () => void;
  endCall: () => void;
  cancelCall: () => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used inside CallProvider');
  return ctx;
}

function createSignal(
  type: CallSignalType,
  fromId: string,
  toId: string,
  roomId: string,
  callType: CallType,
  callerName: string,
  callerUsername: string,
  callerId: string,
  callerAvatar: string,
) {
  return databases.createDocument(DATABASE_ID, COLLECTION, ID.unique(), {
    type,
    from_user_id: fromId,
    to_user_id: toId,
    room_id: roomId,
    call_type: callType,
    caller_name: callerName,
    caller_username: callerUsername,
    caller_id: callerId,
    caller_avatar: callerAvatar,
  });
}

async function deleteSignal(docId: string) {
  try {
    await databases.deleteDocument(DATABASE_ID, COLLECTION, docId);
  } catch { /* already gone */ }
}

export function CallProvider({ children }: { children: ReactNode }) {
  const { currentUser, sendChatMessage } = usePosts();
  const { toast } = useToast();

  const [callState, setCallState] = useState<CallState>(IDLE);
  const callStateRef = useRef<CallState>(IDLE);
  const ringTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const seenSignalIds = useRef<Set<string>>(new Set());
  const writingBubble = useRef(false);

  const sync = (s: CallState) => {
    callStateRef.current = s;
    setCallState(s);
  };

  const clearRingTimer = () => {
    if (ringTimerRef.current) { clearTimeout(ringTimerRef.current); ringTimerRef.current = null; }
  };

  const writeCallBubble = useCallback(async (
    contact: CallContact,
    type: CallType,
    status: 'missed' | 'ended',
    duration?: string,
  ) => {
    if (writingBubble.current || !currentUser) return;
    writingBubble.current = true;
    try {
      await sendChatMessage(contact.username, {
        type: 'call',
        text: JSON.stringify({ type, status, duration }),
      });
    } catch { /* best-effort */ } finally {
      writingBubble.current = false;
    }
  }, [currentUser, sendChatMessage]);

  const doReset = useCallback(() => {
    clearRingTimer();
    sync(IDLE);
  }, []);

  const endCall = useCallback(() => {
    const cs = callStateRef.current;
    if (cs.status === 'idle') return;

    const { contact, callType, roomId, startedAt } = cs;

    if (cs.outgoingSignalId) deleteSignal(cs.outgoingSignalId);
    if (cs.incomingSignalId) deleteSignal(cs.incomingSignalId);

    if (cs.status === 'active' && contact && currentUser) {
      const durationSec = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0;
      const mins = Math.floor(durationSec / 60);
      const secs = durationSec % 60;
      const durationStr = `${mins}:${secs.toString().padStart(2, '0')}`;

      createSignal(
        'CALL_ENDED',
        currentUser.$id, contact.$id,
        roomId, callType,
        currentUser.name, currentUser.username, currentUser.$id, currentUser.avatar,
      ).catch(() => {});
      writeCallBubble(contact, callType, 'ended', durationStr);
    }

    doReset();
  }, [currentUser, writeCallBubble, doReset]);

  const cancelCall = useCallback(() => {
    const cs = callStateRef.current;
    if (cs.status !== 'outgoing') return;
    if (cs.outgoingSignalId) deleteSignal(cs.outgoingSignalId);
    if (cs.contact && currentUser) {
      createSignal(
        'CALL_CANCELLED',
        currentUser.$id, cs.contact.$id,
        cs.roomId, cs.callType,
        currentUser.name, currentUser.username, currentUser.$id, currentUser.avatar,
      ).catch(() => {});
    }
    doReset();
  }, [currentUser, doReset]);

  const missedCall = useCallback(() => {
    const cs = callStateRef.current;
    if (!cs.contact || cs.status !== 'outgoing') return;
    if (cs.outgoingSignalId) deleteSignal(cs.outgoingSignalId);
    if (cs.contact && currentUser) {
      createSignal(
        'CALL_CANCELLED',
        currentUser.$id, cs.contact.$id,
        cs.roomId, cs.callType,
        currentUser.name, currentUser.username, currentUser.$id, currentUser.avatar,
      ).catch(() => {});
      writeCallBubble(cs.contact, cs.callType, 'missed');
    }
    doReset();
  }, [currentUser, writeCallBubble, doReset]);

  const initiateCall = useCallback(async (contact: CallContact, type: CallType) => {
    if (!currentUser) {
      toast({ title: 'Not logged in', description: 'Please log in to make calls.', variant: 'destructive' });
      return;
    }
    if (callStateRef.current.status !== 'idle') return;

    const roomId = buildRoomId(currentUser.username, contact.username);

    sync({
      status: 'outgoing',
      contact,
      callType: type,
      roomId,
      incomingSignalId: null,
      outgoingSignalId: null,
      startedAt: null,
    });

    clearRingTimer();
    ringTimerRef.current = setTimeout(() => { missedCall(); }, RING_TIMEOUT_MS);

    try {
      const doc = await createSignal(
        'CALL_INCOMING',
        currentUser.$id, contact.$id,
        roomId, type,
        currentUser.name || currentUser.username,
        currentUser.username,
        currentUser.$id,
        currentUser.avatar,
      );
      seenSignalIds.current.add(doc.$id);
      sync({ ...callStateRef.current, outgoingSignalId: doc.$id });
    } catch (err: any) {
      console.error('[Call] Signal failed:', err);
      toast({
        title: 'Could not reach the other party',
        description: 'Tap cancel and try again.',
        variant: 'destructive',
      });
    }
  }, [currentUser, missedCall, toast]);

  const acceptCall = useCallback(() => {
    const cs = callStateRef.current;
    if (cs.status !== 'incoming' || !cs.contact || !currentUser) return;
    clearRingTimer();

    createSignal(
      'CALL_ACCEPTED',
      currentUser.$id, cs.contact.$id,
      cs.roomId, cs.callType,
      currentUser.name, currentUser.username, currentUser.$id, currentUser.avatar,
    ).catch(() => {});
    if (cs.incomingSignalId) deleteSignal(cs.incomingSignalId);

    sync({ ...cs, status: 'active', incomingSignalId: null, startedAt: Date.now() });
  }, [currentUser]);

  const declineCall = useCallback(() => {
    const cs = callStateRef.current;
    if (cs.status !== 'incoming' || !cs.contact || !currentUser) return;
    clearRingTimer();

    createSignal(
      'CALL_DECLINED',
      currentUser.$id, cs.contact.$id,
      cs.roomId, cs.callType,
      currentUser.name, currentUser.username, currentUser.$id, currentUser.avatar,
    ).catch(() => {});
    if (cs.incomingSignalId) deleteSignal(cs.incomingSignalId);
    doReset();
  }, [currentUser, doReset]);

  useEffect(() => {
    if (!currentUser) return;

    const poll = async () => {
      const cs = callStateRef.current;
      const since = new Date(Date.now() - 65_000).toISOString();

      if (cs.status === 'idle') {
        try {
          const res = await databases.listDocuments(DATABASE_ID, COLLECTION, [
            Query.equal('to_user_id', currentUser.$id),
            Query.equal('type', 'CALL_INCOMING'),
            Query.greaterThanEqual('$createdAt', since),
            Query.orderDesc('$createdAt'),
            Query.limit(1),
          ]);
          const doc = res.documents[0] as any;
          if (doc && !seenSignalIds.current.has(doc.$id)) {
            seenSignalIds.current.add(doc.$id);
            const contact: CallContact = {
              $id: doc.from_user_id,
              name: doc.caller_name || '',
              username: doc.caller_username || '',
              avatar: doc.caller_avatar || '',
            };
            sync({
              status: 'incoming',
              contact,
              callType: doc.call_type as CallType,
              roomId: doc.room_id,
              incomingSignalId: doc.$id,
              outgoingSignalId: null,
              startedAt: null,
            });
            clearRingTimer();
            ringTimerRef.current = setTimeout(() => {
              const s = callStateRef.current;
              if (s.status === 'incoming' && s.incomingSignalId === doc.$id) {
                if (s.incomingSignalId) deleteSignal(s.incomingSignalId);
                doReset();
              }
            }, RING_TIMEOUT_MS);
          }
        } catch { /* poll fail — ignore */ }
      }

      if (cs.status === 'outgoing' && cs.outgoingSignalId) {
        try {
          const res = await databases.listDocuments(DATABASE_ID, COLLECTION, [
            Query.equal('to_user_id', currentUser.$id),
            Query.oneOf('type', ['CALL_ACCEPTED', 'CALL_DECLINED']),
            Query.greaterThanEqual('$createdAt', since),
            Query.orderDesc('$createdAt'),
            Query.limit(1),
          ]);
          const doc = res.documents[0] as any;
          if (doc && !seenSignalIds.current.has(doc.$id)) {
            seenSignalIds.current.add(doc.$id);
            deleteSignal(doc.$id);
            if (doc.type === 'CALL_ACCEPTED') {
              clearRingTimer();
              sync({ ...callStateRef.current, status: 'active', startedAt: Date.now() });
            } else {
              clearRingTimer();
              if (cs.contact) writeCallBubble(cs.contact, cs.callType, 'missed');
              doReset();
            }
          }
        } catch { /* poll fail — ignore */ }
      }

      if (cs.status === 'active') {
        try {
          const res = await databases.listDocuments(DATABASE_ID, COLLECTION, [
            Query.equal('to_user_id', currentUser.$id),
            Query.equal('type', 'CALL_ENDED'),
            Query.greaterThanEqual('$createdAt', since),
            Query.orderDesc('$createdAt'),
            Query.limit(1),
          ]);
          const doc = res.documents[0] as any;
          if (doc && !seenSignalIds.current.has(doc.$id)) {
            seenSignalIds.current.add(doc.$id);
            deleteSignal(doc.$id);
            doReset();
          }
        } catch { /* poll fail — ignore */ }
      }

      if (cs.status === 'incoming') {
        try {
          const res = await databases.listDocuments(DATABASE_ID, COLLECTION, [
            Query.equal('to_user_id', currentUser.$id),
            Query.equal('type', 'CALL_CANCELLED'),
            Query.greaterThanEqual('$createdAt', since),
            Query.orderDesc('$createdAt'),
            Query.limit(1),
          ]);
          const doc = res.documents[0] as any;
          if (doc && !seenSignalIds.current.has(doc.$id)) {
            seenSignalIds.current.add(doc.$id);
            deleteSignal(doc.$id);
            clearRingTimer();
            doReset();
          }
        } catch { /* poll fail — ignore */ }
      }
    };

    pollRef.current = setInterval(poll, POLL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      clearRingTimer();
    };
  }, [currentUser, doReset, writeCallBubble]);

  return (
    <CallContext.Provider value={{ callState, initiateCall, acceptCall, declineCall, endCall, cancelCall }}>
      {children}
    </CallContext.Provider>
  );
}
