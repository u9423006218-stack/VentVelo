import { useEffect, useState } from 'react';

const blobUrlCache = new Map<string, string>();
const packBufferPromises = new Map<number, Promise<ArrayBuffer>>();

function loadPackBuffer(packIdx: number): Promise<ArrayBuffer> {
  const existing = packBufferPromises.get(packIdx);
  if (existing) return existing;

  const base = import.meta.env.BASE_URL || '/';
  const url = `${base}bike-packs/p${packIdx}.bin`;

  const promise = fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to load bike image pack ${packIdx}: ${res.status}`);
    }
    return res.arrayBuffer();
  });

  packBufferPromises.set(packIdx, promise);
  return promise;
}

export async function resolveBikeImageSrc(src: string): Promise<string> {
  if (!src.startsWith('vv:')) return src;
  const cached = blobUrlCache.get(src);
  if (cached) return cached;

  const parts = src.split(':');
  const packIdx = Number(parts[1]);
  const start = Number(parts[2]);
  const end = Number(parts[3]);

  const buffer = await loadPackBuffer(packIdx);
  const blob = new Blob([buffer.slice(start, end)], { type: 'image/webp' });
  const objectUrl = URL.createObjectURL(blob);
  blobUrlCache.set(src, objectUrl);
  return objectUrl;
}

export function useBikeImageSrc(src: string | undefined): string {
  const [resolved, setResolved] = useState<string>(() => {
    if (!src) return '';
    if (!src.startsWith('vv:')) return src;
    return blobUrlCache.get(src) || '';
  });

  useEffect(() => {
    if (!src) {
      setResolved('');
      return;
    }
    if (!src.startsWith('vv:')) {
      setResolved(src);
      return;
    }
    const cached = blobUrlCache.get(src);
    if (cached) {
      setResolved(cached);
      return;
    }

    let cancelled = false;
    setResolved('');
    resolveBikeImageSrc(src)
      .then((url) => {
        if (!cancelled) setResolved(url);
      })
      .catch(() => {
        if (!cancelled) setResolved('');
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  return resolved;
}
