import type { CommodityProviderInfo } from '@/modules/commodity-management/types/api';

export interface OrderStatusLogItem {
    id: string;
    orderId: string;
    fromStatus?: string;
    toStatus: string;
    operatorId?: number;
    operatorName?: string;
    reason?: string;
    createdAt: string;
}

export interface TradeOrderListItem {
    id: string;
    orderNo: string;
    orderTitle: string;
    sourceType: string;
    demandId?: string;
    demandNo?: string;
    responseId?: string;
    contractId?: string;
    commodityId?: string;
    productId?: string;
    versionId?: string;
    commodityName?: string;
    commodityType?: string;
    deliveryType?: string;
    buyerId?: number;
    buyerName?: string;
    buyerUserIdentityCode?: string;
    buyerSubjectName?: string;
    sellerId?: number;
    sellerName?: string;
    sellerUserIdentityCode?: string;
    sellerSubjectName?: string;
    connectorId?: string;
    quotedPrice?: number;
    pricingModel?: string;
    unitPrice?: number;
    quantity?: number;
    freeQuota?: number;
    estimatedAmount?: number;
    actualAmount?: number;
    status: string;
    paymentStatus?: string;
    paidAmount?: number;
    paidAt?: string;
    createdAt: string;
    updatedAt: string;
    confirmedAt?: string;
    completedAt?: string;
}

export interface TradeOrderDetailResponse extends TradeOrderListItem {
    remark?: string;
    proposal?: string;
    canConfirm?: boolean;
    canCancel?: boolean;
    canComplete?: boolean;
    debitFlowId?: number;
    incomeFlowId?: number;
    providerInfo?: CommodityProviderInfo;
    demanderInfo?: CommodityProviderInfo;
    productId?: string;
    versionId?: string;
    productName?: string;
    contractName?: string;
    statusLogs: OrderStatusLogItem[];
}

export interface TradeOrderContractItem {
    contractId: string;
    contractName?: string;
    contractAbstract?: string;
    contractStatus?: string;
    activationTime?: string;
    endTime?: string;
    createTime?: string;
    issuerId?: string;
    issuerEntityId?: string;
    partuserId?: string;
    partuserEntityId?: string;
    signTime?: string;
    expansionItem?: string;
    issuerName?: string;
    partuserName?: string;
}

export interface TradeOrderListResponse {
    data: TradeOrderListItem[];
    dataCount: number;
    pageCount: number;
}

export interface TradeOrderListQueryRequest {
    keyword?: string;
    status?: string;
    sourceType?: string;
    orderRole?: 'PURCHASE' | 'SALE';
    pageNum?: number;
    pageSize?: number;
}
