'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X, Music2, Timer, Sparkles,
  MoreHorizontal, ChevronRight, Upload, Clapperboard,
  FlipHorizontal2, Gauge, Zap, ZapOff,
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

  const [phase, setPhase] = useState<Phase>('camera');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [hasCamera, setHasCamera] = useState(false);
  const [camError, setCamError] = useState('');
  const [flashOn, setFlashOn] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [clips, setClips] = useState<Blob[]>([]);
  const [clipDurations, setClipDurations] = useState<number[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [maxDuration, setMaxDuration] = useState<Duration>(30);

  const [countdownSetting, setCountdownSetting] = useState<CountdownSec>(0);
  const [countdownActive, setCountdownActive] = useState(0);
  const [speed, setSpeed] = useState<SpeedVal>(1);
  const [showSpeedPicker, setShowSpeedPicker] = useState(false);
  const [selectedEffect, setSelectedEffect] = useState<EffectId>('none');
  const [showEffects, setShowEffects] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);
  const [selectedSound, setSelectedSound] = useState<SelectedSound | null>(null);
  const preloadSoundId = searchParams.get('sound_id') || undefined;

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ─── TORCH TOGGLE ─── */
  const toggleFlash = useCallback(async () => {
    const stream = streamRef.current;
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const newFlash = !flashOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: newFlash } as MediaTrackConstraintSet] });
      setFlashOn(newFlash);
    } catch {
      /* torch not supported on this device/browser */
    }
  }, [flashOn]);

  /* ─── INIT CAMERA ─── */
  const initCamera = useCallback(async (facing: 'user' | 'environment') => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setFlashOn(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width:  { ideal: 720 },
          height: { ideal: 960 },
          aspectRatio: { ideal: 3 / 4 },
          frameRate: { ideal: 60 },
        },
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
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    const w = canvas.width;
    const h = canvas.height;

    /* ── object-fit: cover crop so nothing gets stretched ── */
    const vw = video.videoWidth  || w;
    const vh = video.videoHeight || h;
    const videoAspect  = vw / vh;
    const canvasAspect = w  / h;
    let sx = 0, sy = 0, sw = vw, sh = vh;
    if (videoAspect > canvasAspect) {
      // video is wider → crop left & right
      sw = vh * canvasAspect;
      sx = (vw - sw) / 2;
    } else {
      // video is taller → crop top & bottom
      sh = vw / canvasAspect;
      sy = (vh - sh) / 2;
    }

    const eff = EFFECTS.find(e => e.id === selectedEffect) as (typeof EFFECTS[number] & { special?: string }) | undefined;
    ctx.save();
    if (eff?.special === 'mirror') {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.filter = (eff && eff.filter !== 'none') ? eff.filter : 'none';
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
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
    const canvasStream = canvas.captureStream(60);
    const audioTracks = stream.getAudioTracks();
    audioTracks.forEach(t => canvasStream.addTrack(t));
    const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
    const mime = mimeTypes.find(m => MediaRecorder.isTypeSupported(m)) || '';
    const recorder = new MediaRecorder(canvasStream, {
      ...(mime ? { mimeType: mime } : {}),
      videoBitsPerSecond: 2_500_000,
    });
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

  const totalElapsed = elapsed;
  const progress = Math.min(totalElapsed / maxDuration, 1);

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
    <div className="fixed inset-0 bg-black overflow-hidden select-none">
      {/* Hidden video source */}
      <video ref={videoRef} className="hidden" playsInline muted />

      {/* ── FULL-SCREEN CANVAS (mirrored for front cam, zooms in when recording) ── */}
      <canvas
        ref={canvasRef}
        width={720}
        height={960}
        className="absolute inset-0 w-full h-full"
        style={{
          objectFit: 'cover',
          transform: `${facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'} ${isRecording ? 'scale(1.05)' : 'scale(1)'}`,
          transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      />

      {/* Neon scan-line overlay */}
      {selectedEffect === 'neon' && (
        <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-10"
          style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.08) 2px, rgba(0,255,255,0.08) 4px)' }} />
      )}

      {/* ── LINEAR PROGRESS BAR (very top) ── */}
      <div className="absolute top-0 left-0 right-0 h-[3px] z-30 bg-white/10">
        <div
          className="h-full bg-red-500 origin-left"
          style={{
            width: `${progress * 100}%`,
            transition: isRecording ? 'width 0.1s linear' : 'none',
          }}
        />
      </div>

      {/* ── CLIP SEGMENT TICKS (just below progress bar) ── */}
      {clipDurations.length > 0 && (
        <div className="absolute top-[3px] left-0 right-0 h-[2px] z-30 flex">
          {clipDurations.map((_, i) => (
            <div
              key={i}
              className="h-full bg-white/40"
              style={{
                width: `${(clipDurations[i] / maxDuration) * 100}%`,
                borderRight: '1px solid rgba(255,255,255,0.6)',
              }}
            />
          ))}
        </div>
      )}

      {/* ── TOP GRADIENT ── */}
      <div
        className="absolute top-0 left-0 right-0 h-44 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)' }}
      />

      {/* ── BOTTOM GRADIENT ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-72 z-20 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)' }}
      />

      {/* ── CAMERA ERROR ── */}
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

      {/* ══════════════════════════════════════════
          TOP BAR: X  |  Add Sound  |  (space)
      ══════════════════════════════════════════ */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pt-10 pb-4">
        {/* Close — large thumb-friendly */}
        <button
          onClick={() => router.back()}
          className="h-12 w-12 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center active:scale-95 transition-transform"
        >
          <X className="h-6 w-6 text-white" strokeWidth={2.5} />
        </button>

        {/* Add Sound — glass pill, always centered */}
        <button
          onClick={() => setShowSoundPicker(true)}
          className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-full backdrop-blur-md border text-sm font-bold transition-all active:scale-95",
            selectedSound
              ? "bg-primary/30 border-primary text-primary"
              : "bg-black/40 border-white/20 text-white"
          )}
        >
          <Music2 className="h-4 w-4" />
          {selectedSound ? (
            <span className="max-w-[110px] truncate text-xs">{selectedSound.title}</span>
          ) : (
            'Add sound'
          )}
        </button>

        {/* Spacer to balance flex */}
        <div className="h-12 w-12" />
      </div>

      {/* ══════════════════════════════════════════
          RIGHT-SIDE CONTROLS (vertical stack)
      ══════════════════════════════════════════ */}
      <div className="absolute right-3 z-30 flex flex-col gap-4" style={{ top: '50%', transform: 'translateY(-50%)' }}>

        {/* Flip camera */}
        <button
          onClick={flipCamera}
          disabled={isRecording}
          className="h-13 w-13 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center gap-0.5 p-3 disabled:opacity-40 active:scale-95 transition-transform"
        >
          <FlipHorizontal2 className="h-5 w-5 text-white" strokeWidth={1.5} />
          <span className="text-white/60 text-[9px] font-bold mt-0.5">FLIP</span>
        </button>

        {/* Flash / Torch — only useful on rear camera */}
        <button
          onClick={toggleFlash}
          disabled={facingMode === 'user'}
          className={cn(
            "h-13 w-13 rounded-2xl backdrop-blur-md border flex flex-col items-center justify-center gap-0.5 p-3 active:scale-95 transition-all disabled:opacity-30",
            flashOn ? "bg-yellow-400/30 border-yellow-400" : "bg-black/50 border-white/20"
          )}
        >
          {flashOn
            ? <Zap className="h-5 w-5 text-yellow-300" strokeWidth={1.5} fill="currentColor" />
            : <ZapOff className="h-5 w-5 text-white" strokeWidth={1.5} />
          }
          <span className={cn("text-[9px] font-bold", flashOn ? "text-yellow-300" : "text-white/60")}>
            {flashOn ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Timer / Countdown */}
        <button
          onClick={() => setCountdownSetting(s => ([0, 3, 10] as CountdownSec[])[(([0, 3, 10] as CountdownSec[]).indexOf(s) + 1) % 3])}
          className={cn(
            "h-13 w-13 rounded-2xl backdrop-blur-md border flex flex-col items-center justify-center gap-0.5 p-3 active:scale-95 transition-all",
            countdownSetting > 0 ? "bg-primary/30 border-primary" : "bg-black/50 border-white/20"
          )}
        >
          <Timer className={cn("h-5 w-5", countdownSetting > 0 ? "text-primary" : "text-white")} strokeWidth={1.5} />
          <span className={cn("text-[9px] font-bold", countdownSetting > 0 ? "text-primary" : "text-white/60")}>
            {countdownSetting > 0 ? `${countdownSetting}s` : 'OFF'}
          </span>
        </button>

        {/* Speed */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedPicker(p => !p)}
            className="h-13 w-13 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 flex flex-col items-center justify-center gap-0.5 p-3 active:scale-95 transition-transform"
          >
            <Gauge className="h-5 w-5 text-white" strokeWidth={1.5} />
            <span className="text-white/60 text-[9px] font-bold">{speed}×</span>
          </button>
          {showSpeedPicker && (
            <div className="absolute right-14 top-0 bg-black/90 backdrop-blur-xl border border-white/15 rounded-2xl overflow-hidden flex flex-col z-40">
              {([0.5, 1, 2] as SpeedVal[]).map(s => (
                <button key={s} onClick={() => { setSpeed(s); setShowSpeedPicker(false); }}
                  className={cn("px-5 py-3 text-sm font-black transition-colors", speed === s ? "text-primary bg-primary/15" : "text-white")}>
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Effects / FX */}
        <button
          onClick={() => setShowEffects(p => !p)}
          className={cn(
            "h-13 w-13 rounded-2xl backdrop-blur-md border flex flex-col items-center justify-center gap-0.5 p-3 active:scale-95 transition-all",
            showEffects || selectedEffect !== 'none' ? "bg-primary/30 border-primary" : "bg-black/50 border-white/20"
          )}
        >
          <Sparkles className={cn("h-5 w-5", showEffects || selectedEffect !== 'none' ? "text-primary" : "text-white")} strokeWidth={1.5} />
          <span className={cn("text-[9px] font-bold truncate w-full text-center", showEffects || selectedEffect !== 'none' ? "text-primary" : "text-white/60")}>
            {selectedEffect !== 'none' ? EFFECTS.find(e => e.id === selectedEffect)?.name : 'FX'}
          </span>
        </button>

        {/* More */}
        <button className="h-13 w-13 rounded-2xl bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center p-3 active:scale-95 transition-transform">
          <MoreHorizontal className="h-5 w-5 text-white" strokeWidth={1.5} />
        </button>
      </div>

      {/* ── EFFECTS PANEL ── */}
      {showEffects && (
        <div className="absolute inset-y-0 right-0 z-40 flex">
          <div className="absolute inset-0" onClick={() => setShowEffects(false)} />
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
                    selectedEffect === eff.id ? "border-primary bg-primary/20" : "border-white/8 bg-white/4"
                  )}>
                  <div className="h-12 w-full rounded-xl" style={{ background: `linear-gradient(135deg, ${eff.colors[0]}, ${eff.colors[1]})` }} />
                  <span className={cn("text-[10px] font-bold", selectedEffect === eff.id ? "text-primary" : "text-white/70")}>
                    {eff.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          BOTTOM BAR
      ══════════════════════════════════════════ */}
      <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center pb-10 px-6">

        {/* Duration tabs */}
        <div className="flex items-center gap-5 mb-6">
          {([15, 30, 60] as Duration[]).map(d => (
            <button
              key={d}
              onClick={() => { if (!isRecording) setMaxDuration(d); }}
              disabled={isRecording}
              className={cn(
                "text-sm font-black transition-all",
                maxDuration === d ? "text-white scale-110" : "text-white/35"
              )}
            >
              {d}s
            </button>
          ))}
          <div className={cn(
            "px-3 py-1 rounded-full border text-sm font-black transition-all",
            maxDuration === 60 ? "border-white text-white" : "border-white/20 text-white/35"
          )}>
            REEL
          </div>
        </div>

        {/* Bottom action row */}
        <div className="flex items-center justify-between w-full">

          {/* Left: Upload or Undo */}
          <div className="w-16 flex flex-col items-center gap-1">
            {clipDurations.length > 0 ? (
              <button
                onClick={deleteLastClip}
                disabled={isRecording}
                className="h-14 w-14 rounded-2xl border-2 border-white/25 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-1 disabled:opacity-30 active:scale-95 transition-transform"
              >
                <X className="h-4 w-4 text-red-400" />
                <span className="text-[9px] text-white/50 font-bold">UNDO</span>
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-14 w-14 rounded-2xl border-2 border-white/25 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
              >
                <Upload className="h-4 w-4 text-white/70" />
                <span className="text-[9px] text-white/50 font-bold">UPLOAD</span>
              </button>
            )}
          </div>

          {/* Center: RECORD BUTTON — thick white ring + pulsing red inner */}
          <button
            onClick={handleRecordToggle}
            disabled={!!camError}
            className="relative flex items-center justify-center active:scale-95 transition-transform disabled:opacity-30"
            style={{ width: 88, height: 88 }}
          >
            {/* Outer white ring */}
            <span
              className="absolute inset-0 rounded-full border-[4px] border-white"
              style={{ boxSizing: 'border-box' }}
            />
            {/* Inner circle — white idle, red pulsing when recording */}
            <span
              className={cn(
                "rounded-full transition-all duration-200",
                isRecording
                  ? "w-9 h-9 bg-red-500 animate-pulse"
                  : "w-[68px] h-[68px] bg-white"
              )}
            />
          </button>

          {/* Right: Next or flip shortcut */}
          <div className="w-16 flex flex-col items-center gap-1">
            {clips.length > 0 ? (
              <button
                onClick={() => setPhase('finalize')}
                className="h-14 w-14 rounded-2xl bg-primary flex flex-col items-center justify-center gap-1 shadow-lg shadow-primary/40 active:scale-95 transition-transform"
              >
                <ChevronRight className="h-5 w-5 text-white" />
                <span className="text-[9px] text-white font-black">NEXT</span>
              </button>
            ) : (
              /* Placeholder to keep layout balanced */
              <div className="h-14 w-14" />
            )}
          </div>
        </div>

        {/* Elapsed timer */}
        {(isRecording || clips.length > 0) && (
          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">
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

      {/* Hidden file input */}
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

export default function ReelStudio() {
  return (
    <Suspense>
      <ReelStudioInner />
    </Suspense>
  );
}
