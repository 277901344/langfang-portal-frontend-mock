import type {
    CommodityManagementDetail,
    CommodityManagementListItem,
    CommodityProviderInfo,
} from '@/modules/commodity-management/types/api';

export interface MarketplaceCategoryOption {
    label: string;
    value: string;
}

export type MarketplaceCommodityItem = CommodityManagementListItem;

export type MarketplaceCommodityDetail = CommodityManagementDetail;

export type MarketplaceCommodityProviderInfo = CommodityProviderInfo;

export interface MarketplaceCommodityListResponse {
    data: MarketplaceCommodityItem[];
    dataCount: number;
    pageCount?: number;
}

export interface MarketplaceCategoriesResponse {
    productTypes: MarketplaceCategoryOption[];
    topicCategories: MarketplaceCategoryOption[];
    applicationCategories: MarketplaceCategoryOption[];
    industryCategories: MarketplaceCategoryOption[];
    organizationCategories: MarketplaceCategoryOption[];
    dataAcquisitions: MarketplaceCategoryOption[];
    updateFrequencies: MarketplaceCategoryOption[];
    qualityLevels: MarketplaceCategoryOption[];
    securityLevels: MarketplaceCategoryOption[];
    paymentMethods: MarketplaceCategoryOption[];
}

export interface MarketplaceCommodityQuery {
    keyword?: string;
    commodityType?: string;
    topicCategory?: string;
    applicationCategory?: string;
    deliveryMethod?: number;
    pageNum?: number;
    pageSize?: number;
}

export interface MarketplacePurchaseRequest {
    commodityId: string;
    quantity: number;
}

export interface MarketplacePurchaseResponse {
    id: string;
    orderNo: string;
}
