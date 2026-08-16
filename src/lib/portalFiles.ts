export function buildPortalProductImageUrl(value?: string) {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  return normalized;
}

export function buildPortalProductDocumentDownloadUrl(value?: string) {
  const normalized = value?.trim();
  if (!normalized) {
    return undefined;
  }
  return normalized;
}

export function extractPortalFileName(value?: string) {
  const normalized = value?.trim();
  if (!normalized) {
    return '';
  }
  const pathWithoutQuery = normalized.split(/[?#]/)[0];
  const segments = pathWithoutQuery.split(/[\\/]/).filter(Boolean);
  return segments[segments.length - 1] || normalized;
}

export function rewritePortalRichTextImageUrls(html?: string) {
  if (!html || typeof window === 'undefined') {
    return html || '';
  }
  const container = document.createElement('div');
  container.innerHTML = html;
  container.querySelectorAll('img').forEach((image) => {
    const dataObjectKey = image.getAttribute('data-oss-key') || image.getAttribute('data-object-key');
    const objectKey = dataObjectKey?.trim() || undefined;
    if (objectKey) {
      image.setAttribute('src', objectKey);
    }
  });
  return container.innerHTML;
}
