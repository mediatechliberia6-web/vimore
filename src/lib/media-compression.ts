/**
 * Client-side media compression for uploads.
 * - Images: canvas re-encode to WebP (or JPEG fallback) with downscale.
 * - Videos: MediaRecorder re-encode to lower bitrate (Chrome/Firefox), passthrough on Safari.
 * - Audio: MediaRecorder re-encode to opus, passthrough where unsupported.
 *
 * All functions are safe — on any failure they return the original file.
 * Target: ≥30% size reduction with no perceptible quality loss for typical UGC.
 */

import { getCurrentNetworkTier } from '@/context/NetworkContext';

export interface CompressOptions {
  /** Skip if file is already smaller than this many bytes. Default: 80 KB */
  skipUnderBytes?: number;
}

const DEFAULTS: Required<CompressOptions> = {
  skipUnderBytes: 80 * 1024,
};

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

/* ─────────────────────────  IMAGES  ───────────────────────── */

export async function compressImage(file: File, opts: CompressOptions = {}): Promise<File> {
  const o = { ...DEFAULTS, ...opts };
  if (!isBrowser) return file;
  if (!file.type.startsWith('image/')) return file;
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  if (file.size < o.skipUnderBytes) return file;

  try {
    const tier = getCurrentNetworkTier();
    // Adaptive max dimension + quality. Aim for ~30-60% reduction.
    const maxDim = tier === 'lite' ? 1280 : tier === 'standard' ? 1600 : 1920;
    const quality = tier === 'lite' ? 0.62 : tier === 'standard' ? 0.7 : 0.78;

    const dataUrl = await readAsDataURL(file);
    const img = await loadImage(dataUrl);

    let { width, height } = img;
    if (Math.max(width, height) > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    // Try WebP first (better compression). Fall back to JPEG.
    const blob: Blob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('toBlob webp failed'))),
        'image/webp',
        quality
      );
    }).catch(() => new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        b => (b ? resolve(b) : reject(new Error('toBlob jpeg failed'))),
        'image/jpeg',
        quality
      );
    }));

    // Only keep the recompressed version if it actually saved bytes.
    if (blob.size >= file.size * 0.95) return file;

    const ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${baseName}.${ext}`, { type: blob.type, lastModified: Date.now() });
  } catch {
    return file;
  }
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

/* ─────────────────────────  VIDEO  ───────────────────────── */

function pickVideoMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
  ];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch { /* ignore */ }
  }
  return null;
}

export async function compressVideo(file: File, opts: CompressOptions = {}): Promise<File> {
  const o = { ...DEFAULTS, ...opts };
  if (!isBrowser) return file;
  if (!file.type.startsWith('video/')) return file;
  if (file.size < Math.max(o.skipUnderBytes, 256 * 1024)) return file;

  const mime = pickVideoMime();
  if (!mime) return file;
  // Safari iOS: captureStream is unreliable — bail out
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  if (isSafari) return file;

  try {
    const tier = getCurrentNetworkTier();
    const targetBitrate = tier === 'lite' ? 800_000 : tier === 'standard' ? 1_400_000 : 2_200_000;

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('video load failed'));
    });

    // @ts-ignore captureStream not in some lib types
    const stream: MediaStream | undefined = video.captureStream ? video.captureStream() : undefined;
    if (!stream) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: mime,
      videoBitsPerSecond: targetBitrate,
      audioBitsPerSecond: 96_000,
    });

    const chunks: Blob[] = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };

    const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
    recorder.start(250);
    await video.play().catch(() => {});

    // Stop when video ends, or after a hard cap (5 min) for safety.
    const ended = new Promise<void>((resolve) => { video.onended = () => resolve(); });
    const cap = new Promise<void>((resolve) => setTimeout(resolve, 5 * 60 * 1000));
    await Promise.race([ended, cap]);
    if (recorder.state !== 'inactive') recorder.stop();
    await stopped;

    URL.revokeObjectURL(objectUrl);

    const blob = new Blob(chunks, { type: mime });
    if (blob.size === 0 || blob.size >= file.size * 0.9) return file;

    const ext = mime.includes('webm') ? 'webm' : 'mp4';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'video';
    return new File([blob], `${baseName}.${ext}`, { type: mime.split(';')[0], lastModified: Date.now() });
  } catch {
    return file;
  }
}

/* ─────────────────────────  AUDIO  ───────────────────────── */

function pickAudioMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
  for (const c of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(c)) return c;
    } catch { /* ignore */ }
  }
  return null;
}

export async function compressAudio(file: File, opts: CompressOptions = {}): Promise<File> {
  const o = { ...DEFAULTS, ...opts };
  if (!isBrowser) return file;
  if (!file.type.startsWith('audio/')) return file;
  if (file.size < Math.max(o.skipUnderBytes, 200 * 1024)) return file;

  const mime = pickAudioMime();
  if (!mime) return file;
  const ua = navigator.userAgent;
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  if (isSafari) return file;

  try {
    const audio = document.createElement('audio');
    audio.muted = false;
    audio.crossOrigin = 'anonymous';
    const objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    await new Promise<void>((resolve, reject) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => reject(new Error('audio load failed'));
    });

    // @ts-ignore captureStream not in lib types
    const stream: MediaStream | undefined = (audio as any).captureStream
      ? (audio as any).captureStream()
      : undefined;
    if (!stream) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    const tier = getCurrentNetworkTier();
    const bitrate = tier === 'lite' ? 64_000 : tier === 'standard' ? 96_000 : 128_000;

    const recorder = new MediaRecorder(stream, { mimeType: mime, audioBitsPerSecond: bitrate });
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    const stopped = new Promise<void>((resolve) => { recorder.onstop = () => resolve(); });
    recorder.start(250);
    await audio.play().catch(() => {});

    const ended = new Promise<void>((resolve) => { audio.onended = () => resolve(); });
    const cap = new Promise<void>((resolve) => setTimeout(resolve, 15 * 60 * 1000));
    await Promise.race([ended, cap]);
    if (recorder.state !== 'inactive') recorder.stop();
    await stopped;

    URL.revokeObjectURL(objectUrl);

    const blob = new Blob(chunks, { type: mime });
    if (blob.size === 0 || blob.size >= file.size * 0.9) return file;

    const ext = mime.includes('webm') ? 'webm' : 'mp4';
    const baseName = file.name.replace(/\.[^.]+$/, '') || 'audio';
    return new File([blob], `${baseName}.${ext}`, { type: mime.split(';')[0], lastModified: Date.now() });
  } catch {
    return file;
  }
}

/* ─────────────────────────  ROUTER  ───────────────────────── */

/**
 * Auto-route to the right compressor based on file MIME.
 * Use this in upload functions: `const compressed = await compressForUpload(file);`
 */
export async function compressForUpload(file: File, opts: CompressOptions = {}): Promise<File> {
  if (!file) return file;
  if (file.type.startsWith('image/')) return compressImage(file, opts);
  if (file.type.startsWith('video/')) return compressVideo(file, opts);
  if (file.type.startsWith('audio/')) return compressAudio(file, opts);
  return file;
}
