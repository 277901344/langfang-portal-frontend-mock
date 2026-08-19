import { getAppConfig } from '@/config';

export const getFileName = (fileUrl: string) => {
    const parts = fileUrl.split('/');
    return parts[parts.length - 1] || '商品封面';
};

export const getFileDownloadUrl = (fileUrl?: string) => {
    if (!fileUrl) {
        return undefined;
    }
    if (/^https?:\/\//i.test(fileUrl)) {
        return fileUrl;
    }
    const baseUrl = getAppConfig().VITE_API_BASE_URL.replace(/\/$/, '');
    return `${baseUrl}/file/download?fileUrl=${encodeURIComponent(fileUrl)}`;
};
