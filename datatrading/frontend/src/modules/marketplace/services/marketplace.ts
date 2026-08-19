import { getAppConfig } from '@/config';
import { get, post } from '@/shared/utils/request';
import type {
    MarketplaceCategoriesResponse,
    MarketplaceCommodityDetail,
    MarketplaceCommodityListResponse,
    MarketplaceCommodityProviderInfo,
    MarketplaceCommodityQuery,
    MarketplacePurchaseRequest,
    MarketplacePurchaseResponse,
} from '../types';

export const listMarketCommodities = async (
    query: MarketplaceCommodityQuery
): Promise<MarketplaceCommodityListResponse> => {
    return post<MarketplaceCommodityListResponse>('/marketplace/commodities', query);
};

export const getMarketCommodityDetail = async (
    commodityId: string
): Promise<MarketplaceCommodityDetail> => {
    return post<MarketplaceCommodityDetail>('/marketplace/commodities/detail', { commodityId });
};

export const getMarketCommodityCoverUrl = (commodityId?: string) => {
    if (!commodityId) {
        return undefined;
    }
    const baseUrl = getAppConfig().VITE_API_BASE_URL.replace(/\/$/, '');
    return `${baseUrl}/marketplace/commodities/${encodeURIComponent(commodityId)}/cover`;
};

export const getMarketCommodityProviderInfo = async (
    commodityId: string
): Promise<MarketplaceCommodityProviderInfo> => {
    return post<MarketplaceCommodityProviderInfo>('/marketplace/commodities/provider-info', { commodityId });
};

export const getMarketplaceCategories = async (): Promise<MarketplaceCategoriesResponse> => {
    return get<MarketplaceCategoriesResponse>('/marketplace/categories');
};

export const purchaseMarketCommodity = async (
    payload: MarketplacePurchaseRequest
): Promise<MarketplacePurchaseResponse> => {
    return post<MarketplacePurchaseResponse>('/marketplace/commodities/purchase', payload);
};
