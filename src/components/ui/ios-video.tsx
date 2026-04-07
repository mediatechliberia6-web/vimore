"use client";

import { useState, useEffect, useRef, forwardRef } from "react";
import { isIOSDevice, fetchMediaAsBlob } from "@/lib/ios-media";

interface IOSVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  poster?: string;
}

export const IOSVideo = forwardRef<HTMLVideoElement, IOSVideoProps>(function IOSVideo(
  { src, poster, className, style, children, muted, controls, playsInline, ...rest },
  ref
) {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [displayPoster, setDisplayPoster] = useState<string | undefined>(poster);
  const isIOS = useRef(false);

  useEffect(() => {
    isIOS.current = isIOSDevice();
  }, []);

  useEffect(() => {
    if (!src) return;

    if (!isIOS.current) {
      setDisplaySrc(src);
      return;
    }

    let cancelled = false;
    fetchMediaAsBlob(src)
      .then((blobUrl) => {
        if (!cancelled) setDisplaySrc(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setDisplaySrc(src);
      });

    return () => { cancelled = true; };
  }, [src]);

  useEffect(() => {
    if (!poster) {
      setDisplayPoster(undefined);
      return;
    }
    if (!isIOS.current) {
      setDisplayPoster(poster);
      return;
    }

    let cancelled = false;
    fetchMediaAsBlob(poster)
      .then((blobUrl) => {
        if (!cancelled) setDisplayPoster(blobUrl);
      })
      .catch(() => {
        if (!cancelled) setDisplayPoster(poster);
      });

    return () => { cancelled = true; };
  }, [poster]);

  const effectiveMuted = muted ?? (isIOS.current ? true : false);

  return (
    <video
      ref={ref}
      src={displaySrc}
      poster={displayPoster}
      className={className}
      style={style}
      playsInline
      muted={effectiveMuted}
      controls={controls}
      {...rest}
    >
      {children}
    </video>
  );
});
