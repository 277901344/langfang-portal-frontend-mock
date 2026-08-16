const BROWSER_MANAGED_URL = /^(?:https?:|data:|blob:)/i;

export function publicAssetUrl(path: string, baseUrl = import.meta.env.BASE_URL): string {
  const trimmedPath = path.trim();
  if (BROWSER_MANAGED_URL.test(trimmedPath)) {
    return trimmedPath;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedPath = trimmedPath
    .replace(/^public\//i, '')
    .replace(/^\/+/, '');

  return `${normalizedBase}${normalizedPath}`;
}

type ImageFallbackTarget = Pick<HTMLImageElement, 'src' | 'dataset'>;

export function applyImageFallback(image: ImageFallbackTarget, fallbackSrc: string): void {
  if (image.dataset.imageFallbackApplied === 'true') {
    return;
  }

  image.dataset.imageFallbackApplied = 'true';
  image.src = fallbackSrc;
}
