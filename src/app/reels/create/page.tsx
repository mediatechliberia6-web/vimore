'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X, Music2, RefreshCw, Timer, Gauge, Sparkles,
  MoreHorizontal, Zap, ZapOff, ChevronRight, Upload, Clapperboard,
} from 'lucide-react';
import { usePosts } from '@/context/PostContext';
import { cn } from '@/lib/utils';
import { SoundPicker } from '@/components/reels/sound-picker';
import { ReelFinalize } from '@/components/reels/reel-finalize';
import type { SelectedSound } from '@/components/reels/sound-picker';

/* ─────────────── EFFECTS ─────────────── */
const EFFECTS = [
  { id: 'none',       name: 'Normal',   filter: 'none',                                                       colors: ['#1a1a2e','#0d0d1a'] },
  { id: 'grayscale',  name: 'B&W',      filter: 'grayscale(100%)',                                            colors: ['#888','#333'] },
  { id: 'sepia',      name: 'Sepia',    filter: 'sepia(100%)',                                                 colors: ['#b88040','#7a5020'] },
  { id: 'invert',     name: 'Invert',   filter: 'invert(100%)',                                                colors: ['#00ffff','#220022'] },
  { id: 'warm',       name: 'Warm',     filter: 'sepia(50%) saturate(160%) hue-rotate(-10deg)',               colors: ['#ff7043','#f9a825'] },
  { id: 'cool',       name: 'Cool',     filter: 'saturate(130%) hue-rotate(200deg) brightness(1.1)',          colors: ['#29b6f6','#0277bd'] },
  { id: 'noir',       name: 'Noir',     filter: 'grayscale(100%) contrast(160%) brightness(0.75)',            colors: ['#000','#fff'] },
  { id: 'faded',      name: 'Faded',    filter: 'saturate(50%) brightness(1.15) contrast(0.85)',              colors: ['#cbbfaf','#9e8e80'] },
  { id: 'vivid',      name: 'Vivid',    filter: 'saturate(230%) contrast(115%)',                              colors: ['#ff1744','#00e676'] },
  { id: 'desert',     name: 'Desert',   filter: 'sepia(40%) saturate(70%) hue-rotate(15deg) brightness(1.1)',colors: ['#c9a86c','#8b6914'] },
  { id: 'vintage',    name: 'Vintage',  filter: 'sepia(70%) contrast(120%) brightness(0.85) saturate(80%)',  colors: ['#8b7355','#c4a882'] },
  { id: 'dreamy',     name: 'Dreamy',   filter: 'blur(0.8px) brightness(1.25) saturate(130%)',               colors: ['#ffd6e7','#ffefba'] },
  { id: 'neon',       name: 'Neon',     filter: 'brightness(0.6) saturate(400%) hue-rotate(280deg)',         colors: ['#e040fb','#00e5ff'] },
  { id: 'aqua',       name: 'Aqua',     filter: 'hue-rotate(160deg) saturate(160%) brightness(1.1)',         colors: ['#00e5ff','#00b8d4'] },
  { id: 'matrix',     name: 'Matrix',   filter: 'sepia(100%) hue-rotate(80deg) saturate(250%) brightness(0.65)', colors: ['#003300','#00ff41'] },
  { id: 'mirror',     name: 'Mirror',   filter: 'none',                                                       colors: ['#9c27b0','#e040fb'], special: 'mirror' as const },
  { id: 'vignette',   name: 'Vignette', filter: 'none',                                                       colors: ['#000','#555'],        special: 'vignette' as const },
  { id: 'beauty',     name: 'Beauty',   filter: 'blur(0.6px) brightness(1.1) saturate(108%) contrast(0.92)', colors: ['#fce4ec','#f8bbd0'] },
  { id: 'colorboost', name: 'Boost',    filter: 'saturate(200%) contrast(118%)',                             colors: ['#ff4081','#ffeb3b'] },
  { id: 'softfocus',  name: 'Soft',     filter: 'blur(1.2px) brightness(1.15)',                              colors: ['#f5f5f5','#e0e0e0'] },
  { id: 'bright',     name: 'Bright',   filter: 'brightness(1.5) contrast(0.88)',                            colors: ['#fff','#f0f0f0'] },
  { id: 'dark',       name: 'Dark',     filter: 'brightness(0.55) contrast(135%)',                           colors: ['#111','#222'] },
  { id: 'golden',     name: 'Golden',   filter: 'sepia(30%) hue-rotate(-20deg) saturate(170%) brightness(1.15)', colors: ['#ffd700','#ff8f00'] },
  { id: 'rose',       name: 'Rose',     filter: 'sepia(15%) hue-rotate(300deg) saturate(140%) brightness(1.1)', colors: ['#ff80ab','#f06292'] },
  { id: 'purple',     name: 'Purple',   filter: 'hue-rotate(250deg) saturate(160%) brightness(0.85)',        colors: ['#7c4dff','#e040fb'] },
  { id: 'summer',     name: 'Summer',   filter: 'hue-rotate(-25deg) saturate(170%) brightness(1.2) contrast(110%)', colors: ['#ff7043','#ffd740'] },
  { id: 'winter',     name: 'Winter',   filter: 'hue-rotate(190deg) saturate(70%) brightness(1.15) contrast(110%)', colors: ['#b3e5fc','#4fc3f7'] },
  { id: 'film',       name: 'Film',     filter: 'sepia(15%) contrast(145%) brightness(0.88) saturate(75%)',  colors: ['#9e9e9e','#424242'] },
  { id: 'punch',      name: 'Punch',    filter: 'contrast(165%) saturate(165%) brightness(0.88)',            colors: ['#ff1744','#ff6d00'] },
  { id: 'matte',      name: 'Matte',    filter: 'contrast(75%) brightness(1.18) saturate(72%)',              colors: ['#b0bec5','#78909c'] },
] as const;

type EffectId = (typeof EFFECTS)[number]['id'];
type Phase = 'camera' | 'finalize';
type Duration = 15 | 30 | 60;
type CountdownSec = 0 | 3 | 10;
type SpeedVal = 0.5 | 1 | 2;

/* ─────────────── MAIN COMPONENT ─────────────── */
function ReelStudioInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = usePosts();

  /* Phase */
  const [phase, setPhase] = useState<Phase>('camera');

  /* Camera */
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasCamera, setHasCamera] = useState(false);
  const [camError, setCamError] = useState('');
  const [flashOn, setFlashOn] = useState(false);

  /* Recording */
  const [isRecording, setIsRecording] = useState(false);
  const [clips, setClips] = useState<Blob[]>([]);
  const [clipDurations, setClipDurations] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [maxDuration, setMaxDuration] = useState<Duration>(30);

  /* Countdown */
  const [countdownSetting, setCountdownSetting] = useState<CountdownSec>(0);
  const [countdownActive, setCountdownActive] = useState(0);

  /* Speed */
  const [speed, setSpeed] = useState<SpeedVal>(1);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);

  /* Effects */
  const [selectedEffect, setSelectedEffect] = useState<EffectId>('none');
  const [showEffects, setShowEffects] = useState(false);

  /* Sound */
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SelectedSound | null>(null);
  const preloadSoundId = searchParams.get('sound_id') || undefined;

  /* Refs */
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const animRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const elapsedRef = useRef(0);
  const clipStartRef = useRef(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  /* ─── INIT CAMERA ─── */
  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 720 }, height: { ideal: 1280 } },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCamera(true);
      setCamError('');
    } catch (e: unknown) {
      setCamError(e instanceof Error && e.name === 'NotAllowedError'
        ? 'Camera permission denied. Please allow camera access.'
        : 'Unable to access camera.');
    }
  }, []);

  useEffect(() => {
    initCamera(facingMode);
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  /* ─── CANVAS DRAW LOOP ─── */
  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animRef.current = requestAnimationFrame(drawFrame);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const eff = EFFECTS.find(e => e.id === selectedEffect) as (typeof EFFECTS[number] & { special?: string }) | undefined;
    ctx.save();
    if (eff?.special === 'mirror') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.filter = (eff && eff.filter !== 'none') ? eff.filter : 'none';
    ctx.drawImage(video, 0, 0, w, h);
    ctx.filter = 'none';
    if (eff?.special === 'vignette') {
      const grd = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.85);
      grd.addColorStop(0, 'rgba(0,0,0,0)');
      grd.addColorStop(1, 'rgba(0,0,0,0.72)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
    animRef.current = requestAnimationFrame(drawFrame);
  }, [selectedEffect]);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(animRef.current);
  }, [drawFrame]);

  /* ─── FLIP CAMERA ─── */
  const flipCamera = useCallback(async () => {
    if (isRecording) return;
    const next = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(next);
    await initCamera(next);
  }, [facingMode, isRecording, initCamera]);

  /* ─── START RECORDING ─── */
  const startRecording = useCallback(() => {
    const canvas = canvasRef.current;
    const stream = streamRef.current;
    if (!canvas || !stream) return;
    const canvasStream = canvas.captureStream(30);
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach(t => canvasStream.addTrack(t));
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
    const recorder = new MediaRecorder(canvasStream, { ...(mime ? { mimeType: mime } : {}) });
    chunksRef.current = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: chunksRef.current[0]?.type || 'video/webm' });
      const dur = elapsedRef.current - clipStartRef.current;
      setClips(p => [...p, blob]);
      setClipDurations(p => [...p, dur]);
    };
    recorder.start(100);
    recorderRef.current = recorder;
    clipStartRef.current = elapsedRef.current;
    if (selectedSound) {
      const audio = new Audio();
      audio.src = `/api/file/${encodeURIComponent('sounds')}/${encodeURIComponent(selectedSound.fileId)}`;
      audio.currentTime = selectedSound.startTime;
      audio.playbackRate = speed;
      audio.play().catch(() => {});
      audioRef.current = audio;
    }
    recordingTimerRef.current = setInterval(() => {
      elapsedRef.current += 0.1;
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= maxDuration) stopRecording();
    }, 100);
    setIsRecording(true);
  }, [selectedSound, speed, maxDuration]);

  /* ─── STOP RECORDING ─── */
  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    audioRef.current?.pause();
    setIsRecording(false);
  }, []);

  /* ─── COUNTDOWN + TOGGLE ─── */
  const handleRecordToggle = useCallback(() => {
    if (isRecording) { stopRecording(); return; }
    if (countdownSetting > 0) {
      setCountdownActive(countdownSetting);
      let n = countdownSetting;
      const id = setInterval(() => {
        n -= 1;
        setCountdownActive(n);
        if (n <= 0) { clearInterval(id); startRecording(); }
      }, 1000);
    } else {
      startRecording();
    }
  }, [isRecording, stopRecording, countdownSetting, startRecording]);

  /* ─── DELETE LAST CLIP ─── */
  const deleteLastClip = () => {
    if (isRecording) return;
    setClips(p => p.slice(0, -1));
    setClipDurations(p => {
      const next = p.slice(0, -1);
      const newElapsed = next.reduce((a, b) => a + b, 0);
      elapsedRef.current = newElapsed;
      setElapsed(newElapsed);
      return next;
    });
  };

  /* ─── UPLOAD FROM DEVICE ─── */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const blob = new Blob([file], { type: file.type });
    setClips([blob]);
    setClipDurations([30]);
    elapsedRef.current = 30;
    setElapsed(30);
    setPhase('finalize');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const totalElapsed = elapsed;
  const progress = Math.min(totalElapsed / maxDuration, 1);
  const RADIUS = 42;
  const CIRC = 2 * Math.PI * RADIUS;

  if (phase === 'finalize') {
    return (
      <ReelFinalize
        clips={clips}
        totalDuration={totalElapsed}
        effect={selectedEffect}
        selectedSound={selectedSound}
        onBack={() => setPhase('camera')}
        currentUser={currentUser}
      />
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Hidden video source */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* Canvas — full screen */}
      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'none' }}
      />

      {/* Glitch overlay for glitch effect */}
      {selectedEffect === 'neon' && (
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-10"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.08) 2px, rgba(0,255,255,0.08) 4px)' }} />
      )}

      {/* Camera error */}
      {camError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-50 px-8 gap-4">
          <Clapperboard className="h-16 w-16 text-white/20" />
          <p className="text-white text-center font-bold">{camError}</p>
          <button onClick={() => initCamera(facingMode)} className="px-6 py-3 bg-primary rounded-2xl text-white font-black text-sm">
            Try Again
          </button>
          <button onClick={() => router.back()} className="text-white/40 text-sm">Go Back</button>
        </div>
      )}

      {/* ── TOP BAR ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-12 pb-6"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 100%)' }}>
        {/* Close */}
        <button onClick={() => router.back()}
          className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Add Sound */}
        <button
          onClick={() => setShowSoundPicker(true)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md text-sm font-bold transition-all",
            selectedSound
              ? "bg-primary/30 border-primary text-primary"
              : "bg-black/50 border-white/20 text-white"
          )}>
          <Music2 className="h-4 w-4" />
          {selectedSound ? (
            <span className="max-w-[120px] truncate text-xs">{selectedSound.title}</span>
          ) : (
            'Add sound'
          )}
        </button>

        {/* Flip */}
        <button onClick={flipCamera} disabled={isRecording}
          className="h-10 w-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center disabled:opacity-40">
          <RefreshCw className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* ── RIGHT SIDEBAR ── */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
        {/* Speed */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedPicker(p => !p)}
            className="h-12 w-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 flex flex-col items-center justify-center gap-0.5">
            <Gauge className="h-4 w-4 text-white" />
            <span className="text-white text-[9px] font-black">{speed}×</span>
          </button>
          {showSpeedPicker && (
            <div className="absolute right-14 top-0 bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden flex flex-col">
              {([0.5, 1, 2] as SpeedVal[]).map(s => (
                <button key={s} onClick={() => { setSpeed(s); setShowSpeedPicker(false); }}
                  className={cn("px-5 py-2.5 text-sm font-black transition-colors", speed === s ? "text-primary bg-primary/15" : "text-white hover:bg-white/8")}>
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Countdown */}
        <button
          onClick={() => setCountdownSetting(s => ([0, 3, 10] as CountdownSec[])[(([0, 3, 10] as CountdownSec[]).indexOf(s) + 1) % 3])}
          className={cn(
            "h-12 w-12 rounded-2xl backdrop-blur-md border flex flex-col items-center justify-center gap-0.5 transition-all",
            countdownSetting > 0 ? "bg-primary/30 border-primary" : "bg-black/50 border-white/15"
          )}>
          <Timer className={cn("h-4 w-4", countdownSetting > 0 ? "text-primary" : "text-white")} />
          <span className={cn("text-[9px] font-black", countdownSetting > 0 ? "text-primary" : "text-white/60")}>
            {countdownSetting > 0 ? `${countdownSetting}s` : 'OFF'}
          </span>
        </button>

        {/* Effects */}
        <button
          onClick={() => setShowEffects(p => !p)}
          className={cn(
            "h-12 w-12 rounded-2xl backdrop-blur-md border flex flex-col items-center justify-center gap-0.5 transition-all",
            showEffects || selectedEffect !== 'none' ? "bg-primary/30 border-primary" : "bg-black/50 border-white/15"
          )}>
          <Sparkles className={cn("h-4 w-4", showEffects || selectedEffect !== 'none' ? "text-primary" : "text-white")} />
          <span className={cn("text-[9px] font-black truncate w-full text-center px-1", showEffects || selectedEffect !== 'none' ? "text-primary" : "text-white/60")}>
            {selectedEffect !== 'none' ? EFFECTS.find(e => e.id === selectedEffect)?.name : 'FX'}
          </span>
        </button>

        {/* More */}
        <button
          className="h-12 w-12 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 flex items-center justify-center">
          <MoreHorizontal className="h-4 w-4 text-white" />
        </button>
      </div>

      {/* ── EFFECTS PANEL (slides in from right) ── */}
      {showEffects && (
        <div className="absolute inset-y-0 right-0 z-30 flex">
          <div className="absolute inset-0 -right-0" onClick={() => setShowEffects(false)} />
          <div className="relative ml-auto w-[200px] bg-black/90 backdrop-blur-2xl border-l border-white/10 overflow-y-auto animate-in slide-in-from-right duration-250">
            <div className="sticky top-0 bg-black/80 backdrop-blur-xl px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <span className="text-white font-black text-sm">Effects</span>
              <button onClick={() => setShowEffects(false)}>
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-3">
              {EFFECTS.map(eff => (
                <button
                  key={eff.id}
                  onClick={() => setSelectedEffect(eff.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-2xl border transition-all",
                    selectedEffect === eff.id
                      ? "border-primary bg-primary/20"
                      : "border-white/8 bg-white/4 hover:border-white/20"
                  )}>
                  <div
                    className="h-12 w-full rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${eff.colors[0]}, ${eff.colors[1]})` }}
                  />
                  <span className={cn("text-[10px] font-bold", selectedEffect === eff.id ? "text-primary" : "text-white/70")}>
                    {eff.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM SECTION ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center pb-8"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}>

        {/* Clip segments indicator */}
        {clipDurations.length > 0 && (
          <div className="flex gap-1 w-full px-8 mb-3">
            {clipDurations.map((dur, i) => (
              <div
                key={i}
                className={cn("h-1 rounded-full", i === clipDurations.length - 1 ? "bg-primary" : "bg-white/60")}
                style={{ flex: dur }}
              />
            ))}
            {isRecording && (
              <div
                className="h-1 rounded-full bg-red-500 animate-pulse"
                style={{ flex: elapsed - clipDurations.reduce((a, b) => a + b, 0) }}
              />
            )}
            <div className="h-1 rounded-full bg-white/15"
              style={{ flex: maxDuration - elapsed }} />
          </div>
        )}

        {/* Duration mode tabs */}
        <div className="flex items-center gap-4 mb-5">
          {([15, 30, 60] as Duration[]).map(d => (
            <button
              key={d}
              onClick={() => { if (!isRecording) setMaxDuration(d); }}
              disabled={isRecording}
              className={cn(
                "text-sm font-black transition-all px-1",
                maxDuration === d ? "text-white scale-110" : "text-white/35"
              )}>
              {d}s
            </button>
          ))}
          <div className={cn(
            "px-3 py-1 rounded-full border font-black text-sm transition-all",
            maxDuration === 60 ? "border-white text-white" : "border-white/20 text-white/35"
          )}>
            REEL
          </div>
        </div>

        {/* Bottom row: recent clips + record + upload */}
        <div className="flex items-center justify-between w-full px-8">
          {/* Left: delete or upload */}
          <div className="w-16 flex flex-col items-center gap-1">
            {clipDurations.length > 0 ? (
              <button onClick={deleteLastClip} disabled={isRecording}
                className="h-14 w-14 rounded-2xl border-2 border-white/25 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-1 disabled:opacity-30">
                <X className="h-4 w-4 text-red-400" />
                <span className="text-[9px] text-white/50 font-bold">UNDO</span>
              </button>
            ) : (
              <button onClick={() => fileInputRef.current?.click()}
                className="h-14 w-14 rounded-2xl border-2 border-white/25 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-1">
                <Upload className="h-4 w-4 text-white/70" />
                <span className="text-[9px] text-white/50 font-bold">UPLOAD</span>
              </button>
            )}
          </div>

          {/* Center: Record button with SVG arc */}
          <div className="relative flex items-center justify-center">
            <svg width="96" height="96" viewBox="0 0 96 96" className="absolute">
              <circle cx="48" cy="48" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" />
              <circle
                cx="48" cy="48" r={RADIUS}
                fill="none"
                stroke={isRecording ? '#ef4444' : '#6200ea'}
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - progress)}
                transform="rotate(-90 48 48)"
                style={{ transition: isRecording ? 'stroke-dashoffset 0.1s linear' : 'none' }}
              />
            </svg>
            <button
              onClick={handleRecordToggle}
              disabled={!!camError}
              className="relative z-10 h-16 w-16 flex items-center justify-center transition-all duration-200 disabled:opacity-30"
            >
              <span className={cn(
                "block transition-all duration-200 shadow-lg",
                isRecording
                  ? "h-7 w-7 rounded-[6px] bg-red-500 scale-100"
                  : "h-16 w-16 rounded-full bg-white"
              )} />
            </button>
          </div>

          {/* Right: Next button or flip shortcut */}
          <div className="w-16 flex flex-col items-center gap-1">
            {clips.length > 0 ? (
              <button
                onClick={() => setPhase('finalize')}
                className="h-14 w-14 rounded-2xl bg-primary flex flex-col items-center justify-center gap-1 shadow-lg shadow-primary/40">
                <ChevronRight className="h-5 w-5 text-white" />
                <span className="text-[9px] text-white font-black">NEXT</span>
              </button>
            ) : (
              <button onClick={flipCamera} disabled={isRecording}
                className="h-14 w-14 rounded-2xl border-2 border-white/25 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-1 disabled:opacity-30">
                <RefreshCw className="h-4 w-4 text-white/70" />
                <span className="text-[9px] text-white/50 font-bold">FLIP</span>
              </button>
            )}
          </div>
        </div>

        {/* Elapsed / max */}
        {(isRecording || clips.length > 0) && (
          <div className="mt-4 flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">
            {isRecording && <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />}
            <span className="text-white text-xs font-mono font-bold">
              {Math.floor(totalElapsed / 60).toString().padStart(2, '0')}:{(totalElapsed % 60).toFixed(0).padStart(2, '0')}
              <span className="text-white/30"> / {Math.floor(maxDuration / 60).toString().padStart(2, '0')}:{(maxDuration % 60).toString().padStart(2, '0')}</span>
            </span>
          </div>
        )}
      </div>

      {/* ── COUNTDOWN OVERLAY ── */}
      {countdownActive > 0 && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
          <div className="h-40 w-40 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 flex items-center justify-center">
            <span className="text-white font-black text-8xl leading-none animate-in zoom-in duration-300">
              {countdownActive}
            </span>
          </div>
        </div>
      )}

      {/* ── MODALS ── */}
      {showSoundPicker && (
        <SoundPicker
          onSelect={setSelectedSound}
          onClose={() => setShowSoundPicker(false)}
          preloadSoundId={preloadSoundId}
          currentSound={selectedSound}
        />
      )}

      {/* Hidden file input for upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
}

export default function ReelStudioPage() {
  return (
    <Suspense>
      <ReelStudioInner />
    </Suspense>
  );
}
