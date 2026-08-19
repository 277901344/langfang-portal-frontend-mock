export interface BillingSummaryResponse {
    totalOrderCount: number;
    totalUsageValue: number;
    totalBillableUsage: number;
    totalAmount: number;
    latestRecordedAt?: string;
}

export interface BillingUsageStatisticPoint {
    statDate: string;
    totalUsageValue: number;
    totalBillableUsage: number;
    totalAmount: number;
}

export interface BillingUsageStatisticsResponse {
    data: BillingUsageStatisticPoint[];
}

export interface BillingUsageItem {
    id: number;
    orderId?: string;
    orderNo?: string;
    contractId?: string;
    commodityId?: string;
    commodityName?: string;
    connectorId?: string;
    transferId?: string;
    usageType?: string;
    usageValue?: number;
    billableUsage?: number;
    amount?: number;
    sourceType?: string;
    sourceStatus?: string;
    recordedAt?: string;
}

export interface BillingUsageListResponse {
    data: BillingUsageItem[];
    dataCount: number;
    pageCount: number;
}

export interface BillingOrderSummaryItem {
    orderId: string;
    orderNo?: string;
    orderTitle?: string;
    orderStatus?: string;
    contractId?: string;
    connectorId?: string;
    commodityId?: string;
    commodityName?: string;
    usageCount?: number;
    totalUsageValue?: number;
    totalBillableUsage?: number;
    totalAmount?: number;
    latestRecordedAt?: string;
    meteringReady?: boolean;
}

export interface BillingOrderSummaryResponse {
    data: BillingOrderSummaryItem[];
}

export interface BillingRefreshResponse {
    refreshedOrderCount: number;
    refreshedUsageCount: number;
    latestRecordedAt?: string;
}

export interface BillingDateRangeQueryRequest {
    startDate?: string;
    endDate?: string;
}

export interface BillingUsageListQueryRequest extends BillingDateRangeQueryRequest {
    keyword?: string;
    connectorId?: string;
    usageType?: string;
    pageNum?: number;
    pageSize?: number;
}

export interface BillingOrderSummaryQueryRequest extends BillingDateRangeQueryRequest {
    orderId?: string;
    limit?: number;
}

export interface BillingRefreshRequest {
    orderId?: string;
}
