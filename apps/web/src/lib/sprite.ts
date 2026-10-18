/**
 * Sprite optimization and preloading utilities for Astranox
 */

export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  quality?: string | number;
  format?: 'auto' | 'webp' | 'png';
  dpr?: number;
}

/**
 * Injects Cloudinary auto-format and auto-quality transformation flags into Cloudinary URLs.
 * If url is not a Cloudinary URL, it is returned untouched.
 */
export function getOptimizedCloudinaryUrl(
  url: string | null | undefined,
  options?: CloudinaryTransformOptions
): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com')) return url;

  // Build transformation flags
  const flags: string[] = [];

  const format = options?.format || 'auto';
  const quality = options?.quality || 'auto';
  flags.push(`f_${format}`, `q_${quality}`);

  if (options?.width) {
    flags.push(`w_${options.width}`);
  }
  if (options?.height) {
    flags.push(`h_${options.height}`);
  }
  if (options?.dpr) {
    flags.push(`dpr_${options.dpr}`);
  }

  const transformString = flags.join(',');

  // Pattern: https://res.cloudinary.com/<cloud>/image/upload/(v\d+/)?(astranox/.*)
  // Insert transformations immediately after /image/upload/
  if (url.includes('/image/upload/')) {
    // Avoid double-injecting if flags already exist
    if (url.includes('/image/upload/f_auto') || url.includes('/image/upload/q_auto')) {
      return url;
    }
    return url.replace('/image/upload/', `/image/upload/${transformString}/`);
  }

  return url;
}

/**
 * Preload an array of sprite image URLs ahead of rendering.
 * Uses the HTMLImageElement decode API with fallback to onload/onerror.
 */
export async function preloadSprites(
  urls: (string | null | undefined)[]
): Promise<void[]> {
  if (typeof window === 'undefined') return [];

  const validUrls = Array.from(new Set(urls.filter((u): u is string => Boolean(u))));

  return Promise.all(
    validUrls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = 'async';

          const cleanup = () => {
            img.onload = null;
            img.onerror = null;
          };

          img.onload = () => {
            cleanup();
            if ('decode' in img) {
              img.decode().then(resolve).catch(() => resolve());
            } else {
              resolve();
            }
          };

          img.onerror = () => {
            cleanup();
            resolve(); // Don't reject the batch on single failed sprite
          };

          img.src = url;
        })
    )
  );
}
