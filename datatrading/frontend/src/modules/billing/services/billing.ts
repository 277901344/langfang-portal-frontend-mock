import { get, post } from '@/shared/utils/request';
import type {
    BillingDateRangeQueryRequest,
    BillingOrderSummaryQueryRequest,
    BillingOrderSummaryResponse,
    BillingRefreshRequest,
    BillingRefreshResponse,
    BillingSummaryResponse,
    BillingUsageListQueryRequest,
    BillingUsageListResponse,
    BillingUsageStatisticsResponse,
} from '../types/api';

const BASE_URL = '/billing';

export const getBillingSummary = (params?: BillingDateRangeQueryRequest) =>
    get<BillingSummaryResponse>(`${BASE_URL}/summary`, { params });

export const getUsageStatistics = (params?: BillingDateRangeQueryRequest) =>
    get<BillingUsageStatisticsResponse>(`${BASE_URL}/usage/statistics`, { params });

export const listUsageRecords = (params?: BillingUsageListQueryRequest) =>
    get<BillingUsageListResponse>(`${BASE_URL}/usage/list`, { params });

export const getOrderSummaries = (params?: BillingOrderSummaryQueryRequest) =>
    get<BillingOrderSummaryResponse>(`${BASE_URL}/order-summary`, { params });

export const refreshBilling = (payload?: BillingRefreshRequest) =>
    post<BillingRefreshResponse>(`${BASE_URL}/refresh`, payload ?? {});
