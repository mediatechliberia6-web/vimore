'use client';

import React, {
  createContext, useContext, useState, useRef,
  useCallback, useEffect, ReactNode,
} from 'react';
import { Permission, Role } from 'appwrite';
import { databases, client, DATABASE_ID, COL, ID, getAvatarUrl, BUCKET } from '@/lib/appwrite';
import { usePosts } from '@/context/PostContext';
import { firePush } from '@/lib/push-fire';

// ─── Types ────────────────────────────────────────────────────────────────────

export type CallPhase = 'idle' | 'dialing' | 'ringing' | 'active';
export type CallType  = 'video' | 'audio';
/** Sub-phase within 'dialing': preparing = gathering ICE; ringing = receiver notified */
export type DialStep  = 'preparing' | 'ringing';

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
  dialStep:      DialStep | null;
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
    // Multiple Google STUN servers — fast direct path when NAT allows it
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Cloudflare STUN — reliable globally, good for West Africa
    { urls: 'stun:stun.cloudflare.com:3478' },
    // Extra public STUN servers
    { urls: 'stun:stunserver.stunprotocol.org:3478' },
    { urls: 'stun:stun.voip.blackberry.com:3478' },
    // OpenRelay TURN — relay of last resort for symmetric NAT / CGNAT
    // (used only when no direct path can be established)
    {
      urls: [
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
        'turns:openrelay.metered.ca:443',
      ],
      username:   'openrelayproject',
      credential: 'openrelayproject',
    },
    // Metered.ca free STUN
    { urls: 'stun:openrelay.metered.ca:80' },
  ],
  iceCandidatePoolSize: 10,
  bundlePolicy: 'max-bundle',
  rtcpMuxPolicy: 'require',
};

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width:     { ideal: 640, max: 640 },
  height:    { ideal: 360, max: 360 },
  frameRate: { ideal: 20,  max: 20  },
};

/** Ring for 45 s before marking as missed. */
const DIAL_TIMEOUT_MS = 45_000;

/** How long to wait for ICE gathering before giving up and using what we have. */
const ICE_GATHER_TIMEOUT_MS = 8_000;

// ─── Context ──────────────────────────────────────────────────────────────────

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: ReactNode }) {
  const { currentUser, sendChatMessage } = usePosts();

  const [callPhase,    setCallPhase]    = useState<CallPhase>('idle');
  const [dialStep,     setDialStep]     = useState<DialStep | null>(null);
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
  const dialTimerRef         = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ringtoneRef          = useRef<HTMLAudioElement | null>(null);
  const sendChatMessageRef   = useRef(sendChatMessage);

  useEffect(() => { currentUserRef.current    = currentUser;     }, [currentUser]);
  useEffect(() => { callPhaseRef.current       = callPhase;      }, [callPhase]);
  useEffect(() => { callInfoRef.current        = callInfo;       }, [callInfo]);
  useEffect(() => { sendChatMessageRef.current = sendChatMessage; }, [sendChatMessage]);

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
    const wasActive    = callPhaseRef.current === 'active';
    const wasCaller    = isCallerRef.current;
    const snapCallType = callInfoRef.current?.callType;
    const snapUsername = contactUsernameRef.current;
    const snapUser     = currentUserRef.current;

    stopRingtone();
    if (dialTimerRef.current) { clearTimeout(dialTimerRef.current); dialTimerRef.current = null; }
    if (pcRef.current)        { pcRef.current.close(); pcRef.current = null; }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    callDocIdRef.current       = null;
    isCallerRef.current        = false;
    contactUsernameRef.current = '';
    remoteDescSetRef.current   = false;

    setCallPhase('idle');
    setDialStep(null);
    setCallInfo(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsVideoOff(false);

    if (docIdToDelete) {
      try { await databases.deleteDocument(DATABASE_ID, COL.CALLS, docIdToDelete); }
      catch { /* already gone */ }
    }

    // Write missed-call message into the chat thread (caller side only, when not answered)
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

  // ── Wait for ICE gathering to complete (vanilla ICE) ─────────────────────
  // Instead of trickling candidates via separate Appwrite updates, we wait for
  // gathering to finish so the SDP itself contains all candidates.  This
  // eliminates the race condition between offer/answer and ICE candidate writes.
  const waitForIceGathering = useCallback((pc: RTCPeerConnection): Promise<void> => {
    return new Promise<void>((resolve) => {
      if (pc.iceGatheringState === 'complete') { resolve(); return; }

      const timer = setTimeout(() => {
        // Timed out — use whatever candidates we have so far
        pc.removeEventListener('icegatheringstatechange', onStateChange);
        resolve();
      }, ICE_GATHER_TIMEOUT_MS);

      function onStateChange() {
        if (pc.iceGatheringState === 'complete') {
          clearTimeout(timer);
          pc.removeEventListener('icegatheringstatechange', onStateChange);
          resolve();
        }
      }

      pc.addEventListener('icegatheringstatechange', onStateChange);
    });
  }, []);

  // ── RTCPeerConnection factory ─────────────────────────────────────────────
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.ontrack = (e) => {
      if (e.streams?.[0]) setRemoteStream(e.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('[call] connectionState:', state);
      if (state === 'connected') {
        stopRingtone();
        setCallPhase('active');
      } else if (state === 'failed') {
        console.warn('[call] connection failed — cleaning up');
        cleanup(callDocIdRef.current ?? undefined);
      } else if (state === 'closed') {
        if (callPhaseRef.current !== 'idle') cleanup(callDocIdRef.current ?? undefined);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[call] iceConnectionState:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed') {
        // Try ICE restart before giving up
        if (isCallerRef.current) {
          pc.restartIce();
          console.log('[call] ICE restart triggered');
        }
      }
    };

    pcRef.current = pc;
    return pc;
  }, [stopRingtone, cleanup]);

  // ── Get user media ────────────────────────────────────────────────────────
  const getMedia = useCallback(async (callType: CallType) => {
    // Try with video first for video calls, fall back to audio-only
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: callType === 'video' ? VIDEO_CONSTRAINTS : false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (videoErr: any) {
      if (callType === 'video') {
        console.warn('[call] video getUserMedia failed, trying audio-only:', videoErr?.message);
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
            video: false,
          });
          localStreamRef.current = stream;
          setLocalStream(stream);
          return stream;
        } catch (audioErr: any) {
          throw audioErr;
        }
      }
      throw videoErr;
    }
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

    // Show connecting screen immediately — 'preparing' while we get media + gather ICE
    isCallerRef.current        = true;
    contactUsernameRef.current = contactUsername;
    setCallPhase('dialing');
    setDialStep('preparing');
    setCallInfo({
      docId: '', callType, isOutgoing: true,
      contactId, contactUsername, contactName, contactAvatar,
    });

    // 45-second "no answer" timeout
    const capturedContactId = contactId;
    const capturedCallType  = callType;
    const capturedUser      = currentUserRef.current;
    dialTimerRef.current = setTimeout(async () => {
      setCallError('No answer — the user may be unavailable.');
      if (capturedUser && capturedContactId) {
        const label = capturedCallType === 'video' ? 'video call' : 'voice call';
        try {
          await databases.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), {
            user_id:         capturedContactId,
            from_user_id:    capturedUser.$id,
            from_user_name:  capturedUser.name || capturedUser.username || '',
            from_user_avatar: capturedUser.avatar
              ? getAvatarUrl(BUCKET.AVATARS, capturedUser.avatar, 'sm')
              : '',
            type:        'SYSTEM',
            title:       'Missed Call',
            content:     `${capturedUser.name || capturedUser.username} tried to ${label} you`,
            message:     `${capturedUser.name || capturedUser.username} tried to ${label} you`,
            is_read:     false,
            action_href: '/messages',
          });
        } catch { /* non-fatal */ }
      }
      cleanup(callDocIdRef.current ?? undefined);
    }, DIAL_TIMEOUT_MS);

    try {
      const stream = await getMedia(callType);
      const pc     = createPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      // Create offer and set local description
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      await pc.setLocalDescription(offer);

      // ── VANILLA ICE: wait for all candidates to be gathered ──────────
      // This embeds all ICE candidates into the SDP so the receiver gets
      // a complete picture in one write — no trickle race condition.
      console.log('[call] waiting for ICE gathering...');
      await waitForIceGathering(pc);
      console.log('[call] ICE gathering complete, candidates in SDP');

      const completeSdp = pc.localDescription!;

      const callerAvatar = user.avatar
        ? getAvatarUrl(BUCKET.AVATARS, user.avatar, 'lg')
        : '';

      // Write the complete offer (with ICE candidates embedded) to Appwrite
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
          offer:           JSON.stringify(completeSdp),
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
      setCallInfo({
        docId: doc.$id, callType, isOutgoing: true,
        contactId, contactUsername, contactName, contactAvatar,
      });
      // Switch to 'ringing' step — receiver has now been notified
      setDialStep('ringing');
      startRingtone();
      console.log('[call] call doc created:', doc.$id);

      // Push-notify receiver so they see the call even when the app is backgrounded
      const callerDisplayName = user.name || user.username || 'Someone';
      firePush({
        userId:             contactId,
        title:              `📞 Incoming ${callType === 'video' ? 'Video' : 'Voice'} Call`,
        body:               `${callerDisplayName} is calling you`,
        url:                '/messages',
        tag:                `call-${doc.$id}`,
        requireInteraction: true,
        icon:               callerAvatar || '/icons/icon-192.png',
        data: {
          type:         'incoming-call',
          callDocId:    doc.$id,
          callType,
          callerName:   callerDisplayName,
          callerAvatar: callerAvatar,
        },
        actions: [
          { action: 'accept-call', title: '✅ Accept' },
          { action: 'decline-call', title: '❌ Decline' },
        ],
      });

    } catch (err: any) {
      console.error('[call] initiateCall failed — name:', err?.name, 'msg:', err?.message, 'code:', err?.code);
      if (dialTimerRef.current) { clearTimeout(dialTimerRef.current); dialTimerRef.current = null; }
      cleanup(callDocIdRef.current ?? undefined);

      const msg =
        err?.name === 'NotAllowedError' || err?.message?.includes('Permission denied')
          ? 'Microphone/camera permission denied. Please allow access in your browser settings and try again.'
          : err?.name === 'NotFoundError'
          ? 'No microphone found. Please check your device and try again.'
          : err?.name === 'NotReadableError' || err?.message?.includes('Could not start')
          ? 'Camera or microphone is already in use by another app. Close that app and try again.'
          : err?.code === 401 || err?.message?.includes('401')
          ? 'Your session expired — please log in again and retry.'
          : err?.code === 404 || err?.message?.includes('Collection with the requested ID could not be found')
          ? 'Calls are not fully set up on the server. Please contact the admin.'
          : `Call failed: ${err?.message || 'Unknown error. Please try again.'}`;
      setCallError(msg);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getMedia, createPC, waitForIceGathering, startRingtone, cleanup]);

  // ══ ACCEPT CALL ════════════════════════════════════════════════════════════
  const acceptCall = useCallback(async () => {
    const docId = callDocIdRef.current;
    if (!docId || callPhaseRef.current !== 'ringing') return;
    stopRingtone();

    try {
      const doc      = await databases.getDocument(DATABASE_ID, COL.CALLS, docId) as any;
      const callType: CallType = doc.call_type || 'audio';

      const stream = await getMedia(callType);
      const pc     = createPC();
      stream.getTracks().forEach(t => pc.addTrack(t, stream));

      // Apply the caller's complete offer (includes their ICE candidates)
      const offerSdp: RTCSessionDescriptionInit = JSON.parse(doc.offer);
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      remoteDescSetRef.current = true;
      console.log('[call] remote description set (caller offer)');

      // Create answer and set local description
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // ── VANILLA ICE: wait for all answer candidates ───────────────────
      console.log('[call] waiting for ICE gathering (answer side)...');
      await waitForIceGathering(pc);
      console.log('[call] ICE gathering complete, writing complete answer');

      const completeAnswer = pc.localDescription!;

      // Write complete answer (with ICE candidates in SDP) back to Appwrite
      await databases.updateDocument(DATABASE_ID, COL.CALLS, docId, {
        status: 'accepted',
        answer: JSON.stringify(completeAnswer),
      });
    } catch (err: any) {
      console.error('[call] acceptCall error — name:', err?.name, 'msg:', err?.message);
      cleanup(docId);
    }
  }, [stopRingtone, getMedia, createPC, waitForIceGathering, cleanup]);

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

  // ══ SERVICE-WORKER MESSAGE HANDLER (accept/decline from push notification) ═
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.serviceWorker) return;

    const handleSwMessage = (event: MessageEvent) => {
      const msg = event.data || {};
      if (msg.type !== 'CALL_ACTION') return;

      if (msg.action === 'accept') {
        if (callPhaseRef.current === 'ringing' && callDocIdRef.current === msg.callDocId) {
          acceptCall();
        } else if (msg.callDocId && callPhaseRef.current === 'idle') {
          callDocIdRef.current       = msg.callDocId;
          isCallerRef.current        = false;
          contactUsernameRef.current = '';
          setCallPhase('ringing');
          setCallInfo({
            docId:           msg.callDocId,
            callType:        (msg.callType as CallType) || 'audio',
            isOutgoing:      false,
            contactId:       '',
            contactUsername: '',
            contactName:     msg.callerName || 'Unknown',
            contactAvatar:   msg.callerAvatar || '',
          });
          setTimeout(() => acceptCall(), 300);
        }
      }

      if (msg.action === 'decline') {
        if (callPhaseRef.current !== 'idle') declineCall();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleSwMessage);
    return () => { navigator.serviceWorker.removeEventListener('message', handleSwMessage); };
  }, [acceptCall, declineCall]);

  // ══ GLOBAL REALTIME SUBSCRIPTION ══════════════════════════════════════════
  useEffect(() => {
    if (!currentUser?.$id) return;

    const channel = `databases.${DATABASE_ID}.collections.${COL.CALLS}.documents`;

    const unsubscribe = client.subscribe(channel, async (response) => {
      const events: string[] = response.events as string[];
      const payload = response.payload as any;
      if (!payload) return;

      const userId = currentUserRef.current?.$id;
      if (!userId) return;

      const isCreate = events.some(e => e.endsWith('.create'));
      const isUpdate = events.some(e => e.endsWith('.update'));
      const isDelete = events.some(e => e.endsWith('.delete'));

      // ── Incoming call (receiver side) ─────────────────────────────────
      if (isCreate && payload.receiver_id === userId && payload.status === 'ringing') {
        if (callPhaseRef.current !== 'idle') {
          // Already in a call — signal busy by deleting the doc
          try { await databases.deleteDocument(DATABASE_ID, COL.CALLS, payload.$id); }
          catch { /* ignore */ }
          return;
        }
        callDocIdRef.current       = payload.$id;
        isCallerRef.current        = false;
        contactUsernameRef.current = payload.caller_username || '';
        setCallPhase('ringing');
        setCallInfo({
          docId:           payload.$id,
          callType:        payload.call_type || 'audio',
          isOutgoing:      false,
          contactId:       payload.caller_id,
          contactUsername: payload.caller_username || '',
          contactName:     payload.caller_name     || 'Unknown',
          contactAvatar:   payload.caller_avatar   || '',
        });
        startRingtone();
        return;
      }

      // ── Updates to our active call doc ────────────────────────────────
      if (payload.$id !== callDocIdRef.current) return;

      if (isUpdate) {
        const isCaller = isCallerRef.current;

        // Caller receives the complete answer (with ICE candidates embedded)
        if (isCaller && payload.answer && pcRef.current && !remoteDescSetRef.current) {
          try {
            const answerSdp: RTCSessionDescriptionInit = JSON.parse(payload.answer);
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(answerSdp));
            remoteDescSetRef.current = true;
            console.log('[call] remote description set (receiver answer) — waiting for ICE connection');
          } catch (err) {
            console.warn('[call] setRemoteDescription (answer) failed:', err);
          }
        }

        if (payload.status === 'ended' || payload.status === 'declined') cleanup();
      }

      // Doc deleted by the other party (end / decline / timeout)
      if (isDelete) cleanup();
    });

    return () => { unsubscribe(); };
  }, [currentUser?.$id, startRingtone, cleanup]);

  return (
    <CallContext.Provider value={{
      callPhase, dialStep, callInfo, callError, localStream, remoteStream, isMuted, isVideoOff,
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
