'use client';

import React, {
  createContext, useContext, useState, useRef,
  useCallback, useEffect, ReactNode,
} from 'react';
import { Permission, Role } from 'appwrite';
import { databases, client, DATABASE_ID, COL, ID, getAvatarUrl, BUCKET } from '@/lib/appwrite';
import { usePosts } from '@/context/PostContext';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CallPhase = 'idle' | 'dialing' | 'ringing' | 'active';
export type CallType  = 'video' | 'audio';

export interface CallInfo {
  docId:           string;
  callType:        CallType;
  isOutgoing:      boolean;
  contactId:       string;
  contactUsername: string;
  contactName:     string;
  contactAvatar:   string;
}

interface CallContextType {
  callPhase:     CallPhase;
  callInfo:      CallInfo | null;
  callError:     string | null;
  localStream:   MediaStream | null;
  remoteStream:  MediaStream | null;
  isMuted:       boolean;
  isVideoOff:    boolean;
  initiateCall:  (contactId: string, contactUsername: string, contactName: string, contactAvatar: string, callType?: CallType) => Promise<void>;
  acceptCall:    () => Promise<void>;
  declineCall:   () => Promise<void>;
  endCall:       () => Promise<void>;
  toggleMute:    () => void;
  switchToAudio: () => void;
  clearCallError: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width:     { ideal: 640, max: 640 },
  height:    { ideal: 360, max: 360 },
  frameRate: { ideal: 20,  max: 20  },
};

/** Ring for 30 s then auto-cancel as missed (same as WhatsApp default). */
const DIAL_TIMEOUT_MS = 30_000;

// ─── Context ──────────────────────────────────────────────────────────────────

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const { currentUser, sendChatMessage } = usePosts();

  const [callPhase,    setCallPhase]    = useState<CallPhase>('idle');
  const [callInfo,     setCallInfo]     = useState<CallInfo | null>(null);
  const [callError,    setCallError]    = useState<string | null>(null);
  const [localStream,  setLocalStream]  = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted,      setIsMuted]      = useState(false);
  const [isVideoOff,   setIsVideoOff]   = useState(false);

  // ── Stable refs for async operations ────────────────────────────────────
  const currentUserRef       = useRef(currentUser);
  const callPhaseRef         = useRef<CallPhase>('idle');
  const callInfoRef          = useRef<CallInfo | null>(null);
  const callDocIdRef         = useRef<string | null>(null);
  const isCallerRef          = useRef(false);
  const contactUsernameRef   = useRef('');
  const pcRef                = useRef<RTCPeerConnection | null>(null);
  const localStreamRef       = useRef<MediaStream | null>(null);
  const remoteDescSetRef     = useRef(false);
  const addedCandidatesRef   = useRef<Set<string>>(new Set());
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const localCandidatesRef   = useRef<RTCIceCandidateInit[]>([]);
  const iceFlusherRef        = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialTimerRef         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringtoneRef          = useRef<HTMLAudioElement | null>(null);
  const sendChatMessageRef   = useRef(sendChatMessage);

  useEffect(() => { currentUserRef.current     = currentUser;    }, [currentUser]);
  useEffect(() => { callPhaseRef.current        = callPhase;     }, [callPhase]);
  useEffect(() => { callInfoRef.current         = callInfo;      }, [callInfo]);
  useEffect(() => { sendChatMessageRef.current  = sendChatMessage; }, [sendChatMessage]);

  // ── Ringtone ─────────────────────────────────────────────────────────────
  const startRingtone = useCallback(() => {
    try {
      if (!ringtoneRef.current) {
        ringtoneRef.current = new Audio('/sounds/ringtone.wav');
        ringtoneRef.current.loop = true;
      }
      ringtoneRef.current.currentTime = 0;
      ringtoneRef.current.volume = 0.85;
      ringtoneRef.current.play().catch(() => {});
    } catch { /* ignore */ }
  }, []);

  const stopRingtone = useCallback(() => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  }, []);

  // ── Full cleanup ──────────────────────────────────────────────────────────
  const cleanup = useCallback(async (docIdToDelete?: string) => {
    // Snapshot before resetting (used for missed-call message below)
    const wasActive      = callPhaseRef.current === 'active';
    const wasCaller      = isCallerRef.current;
    const snapCallType   = callInfoRef.current?.callType;
    const snapUsername   = contactUsernameRef.current;
    const snapUser       = currentUserRef.current;

    stopRingtone();
    if (dialTimerRef.current)  { clearTimeout(dialTimerRef.current);  dialTimerRef.current  = null; }
    if (iceFlusherRef.current) { clearTimeout(iceFlusherRef.current); iceFlusherRef.current = null; }
    if (pcRef.current)         { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    // Reset all refs
    callDocIdRef.current       = null;
    isCallerRef.current        = false;
    contactUsernameRef.current = '';
    remoteDescSetRef.current   = false;
    addedCandidatesRef.current.clear();
    pendingCandidatesRef.current = [];
    localCandidatesRef.current   = [];

    // Reset state
    setCallPhase('idle');
    setCallInfo(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);

    // Delete the Appwrite document (immediate)
    if (docIdToDelete) {
      try { await databases.deleteDocument(DATABASE_ID, COL.CALLS, docIdToDelete); }
      catch { /* already gone */ }
    }

    // Write missed-call message into the chat thread (caller side only)
    // This fires whenever the call ended before reaching 'active', regardless
    // of who triggered the cleanup (timeout, manual cancel, or receiver decline).
    if (wasCaller && !wasActive && snapUsername && snapUser && snapCallType) {
      const label = snapCallType === 'video' ? 'video call' : 'voice call';
      const emoji = snapCallType === 'video' ? '📹' : '📞';
      try {
        await sendChatMessageRef.current(snapUsername, {
          text: `${emoji} Missed ${label}`,
          type: 'text',
        });
      } catch { /* best effort */ }
    }
  }, [stopRingtone]);

  // ── ICE candidate management ─────────────────────────────────────────────
  const flushLocalCandidates = useCallback(async () => {
    const docId = callDocIdRef.current;
    if (!docId || localCandidatesRef.current.length === 0) return;
    const field = isCallerRef.current ? 'caller_ice' : 'receiver_ice';
    try {
      await databases.updateDocument(DATABASE_ID, COL.CALLS, docId, {
        [field]: JSON.stringify(localCandidatesRef.current),
      });
    } catch { /* transient */ }
  }, []);

  const scheduleIceFlush = useCallback(() => {
    if (iceFlusherRef.current) clearTimeout(iceFlusherRef.current);
    iceFlusherRef.current = setTimeout(flushLocalCandidates, 250);
  }, [flushLocalCandidates]);

  const processRemoteCandidates = useCallback(async (json: string) => {
    if (!json || !pcRef.current) return;
    try {
      const candidates: RTCIceCandidateInit[] = JSON.parse(json);
      for (const c of candidates) {
        const key = JSON.stringify(c);
        if (addedCandidatesRef.current.has(key)) continue;
        addedCandidatesRef.current.add(key);
        if (!remoteDescSetRef.current) {
          pendingCandidatesRef.current.push(c);
        } else {
          try { await pcRef.current.addIceCandidate(new RTCIceCandidate(c)); } catch { /* skip */ }
        }
      }
    } catch { /* bad JSON */ }
  }, []);

  // ── Apply remote description + drain pending candidates ──────────────────
  const applyRemoteDesc = useCallback(async (
    pc: RTCPeerConnection,
    sdp: RTCSessionDescriptionInit,
  ) => {
    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
    remoteDescSetRef.current = true;
    for (const c of pendingCandidatesRef.current) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* skip */ }
    }
    pendingCandidatesRef.current = [];
  }, []);

  // ── RTCPeerConnection factory ─────────────────────────────────────────────
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        localCandidatesRef.current.push(e.candidate.toJSON());
        scheduleIceFlush();
      }
    };

    pc.ontrack = (e) => {
      if (e.streams?.[0]) setRemoteStream(e.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      if (state === 'connected') {
        stopRingtone();
        setCallPhase('active');
      } else if (state === 'failed' || state === 'closed') {
        cleanup(callDocIdRef.current ?? undefined);
      }
    };

    pcRef.current = pc;
    return pc;
  }, [scheduleIceFlush, stopRingtone, cleanup]);

  // ── Get user media ────────────────────────────────────────────────────────
  const getMedia = useCallback(async (callType: CallType) => {
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: callType === 'video' ? VIDEO_CONSTRAINTS : false,
      });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  // ══ INITIATE CALL ══════════════════════════════════════════════════════════
  const initiateCall = useCallback(async (
    contactId:       string,
    contactUsername: string,
    contactName:     string,
    contactAvatar:   string,
    callType:        CallType = 'video',
  ) => {
    const user = currentUserRef.current;
    if (!user || callPhaseRef.current !== 'idle') return;

    // ── Show connecting screen IMMEDIATELY before any async work ──────────
    isCallerRef.current        = true;
    contactUsernameRef.current = contactUsername;
    setCallPhase('dialing');
    setCallInfo({
      docId: '', callType, isOutgoing: true,
      contactId, contactUsername, contactName, contactAvatar,
    });

    // ── Start 30-second "no answer" timeout right away ───────────────────
    dialTimerRef.current = setTimeout(() => {
      setCallError('Unable to connect — the user appears to be offline.');
      cleanup(callDocIdRef.current ?? undefined);
    }, DIAL_TIMEOUT_MS);

    try {
      const stream = await getMedia(callType);
      const pc     = createPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      await pc.setLocalDescription(offer);

      const callerAvatar = user.avatar
        ? getAvatarUrl(BUCKET.AVATARS, user.avatar, 'lg')
        : '';

      const doc = await databases.createDocument(
        DATABASE_ID, COL.CALLS, ID.unique(),
        {
          caller_id:       user.$id,
          caller_username: user.username,
          receiver_id:     contactId,
          caller_name:     user.name || user.username,
          caller_avatar:   callerAvatar,
          call_type:       callType,
          status:          'ringing',
          offer:           JSON.stringify(offer),
          answer:          '',
          caller_ice:      '[]',
          receiver_ice:    '[]',
        },
        [
          Permission.read(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
      );

      callDocIdRef.current = doc.$id;
      // Update callInfo with the real doc ID now that we have it
      setCallInfo({
        docId: doc.$id, callType, isOutgoing: true,
        contactId, contactUsername, contactName, contactAvatar,
      });
      startRingtone();

    } catch (err: any) {
      console.error('[call] initiateCall error:', err);
      if (dialTimerRef.current) { clearTimeout(dialTimerRef.current); dialTimerRef.current = null; }
      cleanup(callDocIdRef.current ?? undefined);
      const msg = err?.name === 'NotAllowedError' || err?.message?.includes('Permission')
        ? 'Microphone permission denied. Please allow microphone access and try again.'
        : err?.name === 'NotFoundError'
        ? 'No microphone found on this device.'
        : 'Could not start the call. Please try again.';
      setCallError(msg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getMedia, createPC, startRingtone, cleanup]);

  // ══ ACCEPT CALL ════════════════════════════════════════════════════════════
  const acceptCall = useCallback(async () => {
    const docId = callDocIdRef.current;
    if (!docId || callPhaseRef.current !== 'ringing') return;
    stopRingtone();

    try {
      const doc = await databases.getDocument(DATABASE_ID, COL.CALLS, docId) as any;
      const callType: CallType = doc.call_type || 'video';

      const stream = await getMedia(callType);
      const pc     = createPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      await applyRemoteDesc(pc, JSON.parse(doc.offer));
      if (doc.caller_ice) await processRemoteCandidates(doc.caller_ice);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      await databases.updateDocument(DATABASE_ID, COL.CALLS, docId, {
        status: 'accepted',
        answer: JSON.stringify(answer),
      });
    } catch (err) {
      console.error('[call] acceptCall error:', err);
      cleanup(docId);
    }
  }, [stopRingtone, getMedia, createPC, applyRemoteDesc, processRemoteCandidates, cleanup]);

  // ══ DECLINE / END ══════════════════════════════════════════════════════════
  const declineCall = useCallback(async () => {
    cleanup(callDocIdRef.current ?? undefined);
  }, [cleanup]);

  const endCall = useCallback(async () => {
    cleanup(callDocIdRef.current ?? undefined);
  }, [cleanup]);

  // ══ CONTROLS ══════════════════════════════════════════════════════════════
  const toggleMute = useCallback(() => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    setIsMuted(m => !m);
  }, []);

  const switchToAudio = useCallback(() => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = false; t.stop(); });
    setIsVideoOff(true);
  }, []);

  const clearCallError = useCallback(() => setCallError(null), []);

  // ══ GLOBAL REALTIME SUBSCRIPTION ══════════════════════════════════════════
  useEffect(() => {
    if (!currentUser?.$id) return;

    const channel = `databases.${DATABASE_ID}.collections.${COL.CALLS}.documents`;

    const unsubscribe = client.subscribe(channel, async (response) => {
      const events: string[] = response.events as string[];
      const payload = response.payload as any;
      if (!payload) return;

      const userId   = currentUserRef.current?.$id;
      if (!userId) return;

      const isCreate = events.some(e => e.endsWith('.create'));
      const isUpdate = events.some(e => e.endsWith('.update'));
      const isDelete = events.some(e => e.endsWith('.delete'));

      // ── Incoming call ──────────────────────────────────────────────────
      if (isCreate && payload.receiver_id === userId && payload.status === 'ringing') {
        if (callPhaseRef.current !== 'idle') {
          // Already in a call — immediately delete to signal busy
          try { await databases.deleteDocument(DATABASE_ID, COL.CALLS, payload.$id); }
          catch { /* ignore */ }
          return;
        }
        callDocIdRef.current       = payload.$id;
        isCallerRef.current        = false;
        // Store caller's username so the chat thread can be identified if needed
        contactUsernameRef.current = payload.caller_username || '';
        setCallPhase('ringing');
        setCallInfo({
          docId:           payload.$id,
          callType:        payload.call_type || 'video',
          isOutgoing:      false,
          contactId:       payload.caller_id,
          contactUsername: payload.caller_username || '',
          contactName:     payload.caller_name     || 'Unknown',
          contactAvatar:   payload.caller_avatar   || '',
        });
        startRingtone();
        return;
      }

      // ── Updates to the active call doc ────────────────────────────────
      if (payload.$id !== callDocIdRef.current) return;

      if (isUpdate) {
        const isCaller = isCallerRef.current;

        // Caller receives answer from receiver → set remote description
        if (isCaller && payload.answer && pcRef.current && !remoteDescSetRef.current) {
          try { await applyRemoteDesc(pcRef.current, JSON.parse(payload.answer)); }
          catch (err) { console.warn('[call] applyRemoteDesc failed:', err); }
        }

        // Process remote ICE candidates
        const remoteField = isCaller ? 'receiver_ice' : 'caller_ice';
        if (payload[remoteField]) await processRemoteCandidates(payload[remoteField]);

        if (payload.status === 'ended' || payload.status === 'declined') cleanup();
      }

      // Doc was deleted by the other party (end / decline / timeout)
      if (isDelete) cleanup();
    });

    return () => { unsubscribe(); };
  }, [currentUser?.$id, startRingtone, applyRemoteDesc, processRemoteCandidates, cleanup]);

  return (
    <CallContext.Provider value={{
      callPhase, callInfo, callError, localStream, remoteStream, isMuted, isVideoOff,
      initiateCall, acceptCall, declineCall, endCall, toggleMute, switchToAudio, clearCallError,
    }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall must be used within CallProvider');
  return ctx;
}
