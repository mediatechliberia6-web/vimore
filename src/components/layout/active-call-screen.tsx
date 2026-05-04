'use client';

import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCall } from '@/context/CallContext';
import { usePosts } from '@/context/PostContext';
import { ZEGO_APP_ID } from '@/lib/zego';

function useCallTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) { setSeconds(0); return; }
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, [active]);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function ActiveCallScreen() {
  const { callState, endCall } = useCall();
  const { currentUser } = usePosts();
  const containerRef = useRef<HTMLDivElement>(null);
  const zpRef = useRef<any>(null);
  const mountedRef = useRef(false);
  const timer = useCallTimer(callState.status === 'active');

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);

  const isActive = callState.status === 'active';
  const { contact, callType, roomId } = callState;
  const isVideo = callType === 'video';

  useEffect(() => {
    if (!isActive || !contact || !roomId || mountedRef.current || !currentUser) return;
    if (!containerRef.current) return;

    mountedRef.current = true;

    const mount = async () => {
      try {
        const { ZegoUIKitPrebuilt } = await import('@zegocloud/zego-uikit-prebuilt');

        const res = await fetch('/api/zego-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.$id, roomId }),
        });
        const { token } = await res.json();

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
          ZEGO_APP_ID, token, roomId, currentUser.$id, currentUser.name || currentUser.username,
        );

        const zp = ZegoUIKitPrebuilt.create(kitToken);
        zpRef.current = zp;

        zp.joinRoom({
          container: containerRef.current!,
          scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
          turnOnCameraWhenJoining: isVideo,
          turnOnMicrophoneWhenJoining: true,
          showPreJoinView: false,
          showLeavingView: false,
          showRoomDetailsButton: false,
          showScreenSharingButton: false,
          showUserList: false,
          showTextChat: false,
          showLayoutButton: false,
          maxUsers: 2,
          onLeaveRoom: () => { endCall(); },
        });
      } catch (err) {
        console.error('[Zego] Failed to join room:', err);
        endCall();
      }
    };

    mount();

    return () => {
      if (zpRef.current) {
        try { zpRef.current.destroy?.(); } catch { /* ignore */ }
        zpRef.current = null;
      }
      mountedRef.current = false;
    };
  }, [isActive, contact, roomId, isVideo, endCall, currentUser]);

  if (!isActive || !contact) return null;

  return (
    <div className="fixed inset-0 z-[550] flex flex-col bg-zinc-950 animate-in fade-in duration-200">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-violet-950/20 via-zinc-950 to-zinc-950" />
      </div>

      {/* Zegocloud UIKit container — only used for video calls */}
      <div
        ref={containerRef}
        className={cn('absolute inset-0 z-10', !isVideo && 'hidden')}
      />

      {/* Audio call — show avatar + timer */}
      {!isVideo && (
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative flex items-center justify-center">
            <span className="absolute h-40 w-40 rounded-full bg-violet-500/10 animate-ping" style={{ animationDuration: '2.5s' }} />
            <Avatar className="h-32 w-32 border-4 border-violet-500/40 shadow-[0_0_60px_rgba(153,64,229,0.3)]">
              <AvatarImage src={contact.avatar} />
              <AvatarFallback className="text-5xl font-black bg-violet-900 text-violet-200">
                {contact.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-white">{contact.name}</h2>
            <span className="text-sm font-mono text-green-400 tabular-nums mt-1 block">{timer}</span>
          </div>
        </div>
      )}

      {/* Video call — floating name + timer overlay */}
      {isVideo && (
        <div className="absolute top-safe top-14 left-4 z-30">
          <span className="font-mono text-sm text-white/80 tabular-nums bg-black/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {contact.name} · {timer}
          </span>
        </div>
      )}

      {/* Controls bar */}
      <div className={cn(
        'relative pb-safe pb-16 pt-8 flex flex-col items-center gap-6 z-30',
        isVideo && 'absolute bottom-0 left-0 right-0',
      )}>
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={() => {
              setMuted(m => !m);
              zpRef.current?.muteMicrophone?.(!muted);
            }}
            className={cn(
              'h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95',
              muted ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40' : 'bg-white/10 text-white hover:bg-white/20',
            )}
          >
            {muted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>

          <button
            onClick={endCall}
            className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center shadow-xl shadow-red-500/40"
          >
            <PhoneOff className="h-7 w-7 text-white" />
          </button>

          {isVideo ? (
            <button
              onClick={() => {
                setVideoOff(v => !v);
                zpRef.current?.muteCamera?.(!videoOff);
              }}
              className={cn(
                'h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95',
                videoOff ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40' : 'bg-white/10 text-white hover:bg-white/20',
              )}
            >
              {videoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            </button>
          ) : (
            <button
              onClick={() => setSpeakerOn(s => !s)}
              className={cn(
                'h-14 w-14 rounded-full flex items-center justify-center transition-all active:scale-95',
                speakerOn ? 'bg-violet-500/20 text-violet-400 ring-1 ring-violet-500/40' : 'bg-white/10 text-white hover:bg-white/20',
              )}
            >
              <Volume2 className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
