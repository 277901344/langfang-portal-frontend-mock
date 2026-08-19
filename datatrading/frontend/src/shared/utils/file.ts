import { getAppConfig } from '@/config';

export const getFileNameFromUrl = (fileUrl?: string) => {
  if (!fileUrl) {
    return '';
  }

  const cleanedUrl = fileUrl.split('?')[0];
  const fileName = cleanedUrl.split('/').pop() || '';

  try {
    return decodeURIComponent(fileName);
  } catch {
    return fileName;
  }
};

export const getFileDownloadUrl = (fileUrl?: string) => {
  if (!fileUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl;
  }

  const baseUrl = getAppConfig().VITE_API_BASE_URL.replace(/\/$/, '');
  return `${baseUrl}/file/download?fileUrl=${encodeURIComponent(fileUrl)}`;
};

export const isTextPreviewFile = (fileNameOrUrl = '', contentType = '') => {
  const lowerName = fileNameOrUrl.toLowerCase();
  const lowerType = contentType.toLowerCase();

  return (
    lowerType.startsWith('text/') ||
    lowerType.includes('json') ||
    lowerType.includes('xml') ||
    lowerName.endsWith('.txt') ||
    lowerName.endsWith('.sql') ||
    lowerName.endsWith('.json') ||
    lowerName.endsWith('.log') ||
    lowerName.endsWith('.md') ||
    lowerName.endsWith('.csv')
  );
};
