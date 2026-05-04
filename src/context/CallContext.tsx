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

      let docs: any[] = [];
      try {
        const res = await databases.listDocuments(DATABASE_ID, COLLECTION, [
          Query.greaterThanEqual('$createdAt', since),
          Query.orderDesc('$createdAt'),
          Query.limit(25),
        ]);
        docs = res.documents as any[];
      } catch { return; }

      const forme = docs.filter(
        (d) => d.to_user_id === currentUser.$id && !seenSignalIds.current.has(d.$id),
      );

      if (cs.status === 'idle') {
        const incoming = forme.find((d) => d.type === 'CALL_INCOMING');
        if (incoming) {
          seenSignalIds.current.add(incoming.$id);
          const contact: CallContact = {
            $id: incoming.from_user_id,
            name: incoming.caller_name || '',
            username: incoming.caller_username || '',
            avatar: incoming.caller_avatar || '',
          };
          sync({
            status: 'incoming',
            contact,
            callType: incoming.call_type as CallType,
            roomId: incoming.room_id,
            incomingSignalId: incoming.$id,
            outgoingSignalId: null,
            startedAt: null,
          });
          clearRingTimer();
          ringTimerRef.current = setTimeout(() => {
            const s = callStateRef.current;
            if (s.status === 'incoming' && s.incomingSignalId === incoming.$id) {
              if (s.incomingSignalId) deleteSignal(s.incomingSignalId);
              doReset();
            }
          }, RING_TIMEOUT_MS);
        }
      }

      if (cs.status === 'outgoing' && cs.outgoingSignalId) {
        const response = forme.find(
          (d) => d.type === 'CALL_ACCEPTED' || d.type === 'CALL_DECLINED',
        );
        if (response) {
          seenSignalIds.current.add(response.$id);
          deleteSignal(response.$id);
          if (response.type === 'CALL_ACCEPTED') {
            clearRingTimer();
            sync({ ...callStateRef.current, status: 'active', startedAt: Date.now() });
          } else {
            clearRingTimer();
            if (cs.contact) writeCallBubble(cs.contact, cs.callType, 'missed');
            doReset();
          }
        }
      }

      if (cs.status === 'active') {
        const ended = forme.find((d) => d.type === 'CALL_ENDED');
        if (ended) {
          seenSignalIds.current.add(ended.$id);
          deleteSignal(ended.$id);
          doReset();
        }
      }

      if (cs.status === 'incoming') {
        const cancelled = forme.find((d) => d.type === 'CALL_CANCELLED');
        if (cancelled) {
          seenSignalIds.current.add(cancelled.$id);
          deleteSignal(cancelled.$id);
          clearRingTimer();
          doReset();
        }
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
