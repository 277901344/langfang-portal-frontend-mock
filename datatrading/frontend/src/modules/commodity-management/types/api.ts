export type CommodityStatus = 0 | 1 | 2 | 3 | 4 | 5;

export interface CommodityProductItem {
    id: string;
    productId: string;
    versionId?: string;
    productName: string;
    productType?: string;
    description?: string;
    publishStatus?: string;
    localStatus?: string;
    deliveryType?: string;
    topicCategory?: string;
    topicCategoryLabel?: string;
    organizationCategory?: string;
    organizationCategoryLabel?: string;
    applicationCategory?: string;
    applicationCategoryLabel?: string;
    industryCategory?: string;
    industryCategoryLabel?: string;
    dataAcquisition?: string;
    dataAcquisitionLabel?: string;
    updateFrequency?: string;
    updateFrequencyLabel?: string;
    dataQualityLevel?: string;
    dataQualityLevelLabel?: string;
    dataSecurityLevel?: string;
    dataSecurityLevelLabel?: string;
    serviceType?: string;
    pricingModel?: Record<string, unknown>;
    commercialTerms?: Record<string, unknown>;
    accessConstraints?: Record<string, unknown>;
    processConfig?: Record<string, unknown>;
    sampleData?: Record<string, unknown>;
    connectorId?: string;
    connectorName?: string;
    userIdentityCode?: string;
    isAuth?: number;
    publishedAt?: string;
    updatedAt?: string;
}

export interface CommodityStatusLog {
    id: string;
    commodityId: string;
    status: CommodityStatus;
    createTime?: string;
    errors?: string;
    operationUser?: number;
}

export interface CommodityProviderInfo {
    userId?: number;
    authType?: number;
    subjectType?: string;
    subjectName?: string;
    connectorName?: string;
    displayName?: string;
    phone?: string;
    unifiedSocialCreditCode?: string;
    operatorCertType?: string;
    operatorCertNumber?: string;
}

export interface CommodityManagementListItem {
    commodityId: string;
    userId?: number;
    commodityName: string;
    coverImage?: string;
    description?: string;
    commodityType?: string;
    pricingModel?: string;
    price: number;
    discount?: number;
    discountPrice?: number;
    deliveryMethod?: number;
    expiredTime?: string;
    status: CommodityStatus;
    productId?: string;
    versionId?: string;
    productName?: string;
    connectorId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CommodityManagementDetail extends CommodityManagementListItem {
    offerPer?: number;
    businessPer?: number;
    userId?: number;
    userIdentityCode?: string;
    product?: CommodityProductItem;
    providerInfo?: CommodityProviderInfo;
    statusLogs?: CommodityStatusLog[];
}

export interface CommodityManagementListQuery {
    keyword?: string;
    status?: CommodityStatus;
    commodityType?: string;
    pageNum?: number;
    pageSize?: number;
}

export interface CommodityManagementListResponse {
    data: CommodityManagementListItem[];
    dataCount: number;
    pageCount?: number;
}

export interface CommodityProductListQuery {
    keyword?: string;
    pageNum?: number;
    pageSize?: number;
}

export interface CommodityProductListResponse {
    data: CommodityProductItem[];
    dataCount: number;
    pageCount?: number;
}

export interface CommoditySavePayload {
    commodityId?: string;
    productId: string;
    versionId: string;
    commodityName: string;
    commodityType?: string;
    coverImage?: string;
    description?: string;
    pricingModel?: string;
    price: number;
    discount?: number;
    offerPer?: number;
    businessPer?: number;
    deliveryMethod?: number;
    expiredTime?: string;
}
