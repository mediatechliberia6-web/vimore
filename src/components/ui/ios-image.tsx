"use client";

import { useState, useEffect, useRef } from "react";
import { isIOSDevice, fetchMediaAsBlob, getMediaFallback } from "@/lib/ios-media";

interface IOSImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
}

export function IOSImage({ src, alt, fallback, className, style, onClick, ...rest }: IOSImageProps) {
  const [displaySrc, setDisplaySrc] = useState<string>(src);
  const [hasFailed, setHasFailed] = useState(false);
  const isIOS = useRef(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    isIOS.current = isIOSDevice();
  }, []);

  useEffect(() => {
    if (!src) return;
    setHasFailed(false);

    if (!isIOS.current) {
      setDisplaySrc(src);
      return;
    }

    let cancelled = false;
    fetchMediaAsBlob(src)
      .then((blobUrl) => {
        if (cancelled) return;
        blobUrlRef.current = blobUrl;
        setDisplaySrc(blobUrl);
      })
      .catch(() => {
        if (cancelled) return;
        setDisplaySrc(src);
      });

    return () => { cancelled = true; };
  }, [src]);

  const handleError = () => {
    if (hasFailed) return;
    setHasFailed(true);
    const fb = fallback || getMediaFallback();
    setDisplaySrc(fb);
  };

  return (
    <img
      src={displaySrc}
      alt={alt}
      className={className}
      style={style}
      onClick={onClick}
      onError={handleError}
      {...rest}
    />
  );
}
