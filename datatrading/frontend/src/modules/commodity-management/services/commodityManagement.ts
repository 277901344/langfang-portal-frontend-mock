import { post, service } from '@/shared/utils/request';
import type {
    CommodityProductListQuery,
    CommodityProductListResponse,
    CommodityProductItem,
    CommoditySavePayload,
    CommodityManagementDetail,
    CommodityManagementListQuery,
    CommodityManagementListResponse,
} from '../types/api';

export const COMMODITY_MANAGEMENT_BASE_URL = '/commodity-management';

export function listCommodityManagementItems(
    query: CommodityManagementListQuery
): Promise<CommodityManagementListResponse> {
    return post<CommodityManagementListResponse>(`${COMMODITY_MANAGEMENT_BASE_URL}/list`, query);
}

export function getCommodityManagementDetail(commodityId: string): Promise<CommodityManagementDetail> {
    return post<CommodityManagementDetail>(`${COMMODITY_MANAGEMENT_BASE_URL}/detail`, { commodityId });
}

export function saveCommodityManagementItem(payload: CommoditySavePayload): Promise<CommodityManagementDetail> {
    return post<CommodityManagementDetail>(`${COMMODITY_MANAGEMENT_BASE_URL}/save`, payload);
}

export function publishCommodityManagementItem(commodityId: string): Promise<CommodityManagementDetail> {
    return post<CommodityManagementDetail>(`${COMMODITY_MANAGEMENT_BASE_URL}/publish`, { commodityId });
}

export function unpublishCommodityManagementItem(commodityId: string): Promise<CommodityManagementDetail> {
    return post<CommodityManagementDetail>(`${COMMODITY_MANAGEMENT_BASE_URL}/unpublish`, { commodityId });
}

export function rejectCommodityManagementItem(commodityId: string, errors?: string): Promise<CommodityManagementDetail> {
    return post<CommodityManagementDetail>(`${COMMODITY_MANAGEMENT_BASE_URL}/reject`, { commodityId, errors });
}

export function deleteCommodityManagementItem(commodityId: string): Promise<string> {
    return post<string>(`${COMMODITY_MANAGEMENT_BASE_URL}/delete`, { commodityId });
}

export function listOwnDataProducts(query: CommodityProductListQuery): Promise<CommodityProductListResponse> {
    return post<CommodityProductListResponse>(`${COMMODITY_MANAGEMENT_BASE_URL}/products`, query);
}

export function getOwnDataProductDetail(productId: string, versionId: string): Promise<CommodityProductItem> {
    return post<CommodityProductItem>(`${COMMODITY_MANAGEMENT_BASE_URL}/products/detail`, { productId, versionId });
}

export function uploadCommodityFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    return post<string>('/file/uploadFile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
}

export function removeCommodityFile(fileUrl: string): Promise<string> {
    return post<string>('/file/removeFile', undefined, {
        params: { fileUrl },
    });
}

const parseFileNameFromDisposition = (contentDisposition?: string): string | undefined => {
    if (!contentDisposition) return undefined;

    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utf8Match?.[1]) {
        return decodeURIComponent(utf8Match[1]);
    }

    const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (plainMatch?.[1]) {
        return plainMatch[1];
    }

    return undefined;
};

export async function downloadCommoditySampleFile(sampleFileUrl: string): Promise<{ blob: Blob; fileName?: string }> {
    const response = await service.post<Blob>('/file/sp/download', { fileUrl: sampleFileUrl }, {
        responseType: 'blob',
    });

    return {
        blob: response.data,
        fileName: parseFileNameFromDisposition(response.headers['content-disposition']),
    };
}
