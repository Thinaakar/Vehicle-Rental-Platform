'use client';

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';

type SafeImageProps = React.ComponentPropsWithoutRef<'img'> & {
  fallbackLabel: string;
};

function makeFallbackDataUri(label: string) {
  const safeLabel = label.length > 42 ? `${label.slice(0, 39)}...` : label;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#0f172a" />
          <stop offset="55%" stop-color="#38bdf8" />
          <stop offset="100%" stop-color="#22d3ee" />
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#g)" />
      <circle cx="980" cy="170" r="180" fill="rgba(255,255,255,0.08)" />
      <circle cx="170" cy="640" r="250" fill="rgba(255,255,255,0.06)" />
      <rect x="120" y="510" width="960" height="140" rx="32" fill="rgba(15,23,42,0.45)" />
      <text x="120" y="420" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="700" fill="#ffffff">${safeLabel}</text>
      <text x="120" y="575" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="600" fill="rgba(255,255,255,0.82)">Image unavailable</text>
      <text x="120" y="620" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="rgba(255,255,255,0.72)">DriveXPro</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export default function SafeImage({ fallbackLabel, className, src, alt, ...rest }: SafeImageProps) {
  const [failed, setFailed] = useState(false);
  const fallbackSrc = useMemo(() => makeFallbackDataUri(fallbackLabel), [fallbackLabel]);
  const resolvedSrc = failed ? fallbackSrc : src;

  return (
    <img
      {...rest}
      alt={alt}
      src={resolvedSrc}
      className={clsx(className)}
      onError={(event) => {
        setFailed(true);
        rest.onError?.(event);
      }}
    />
  );
}
