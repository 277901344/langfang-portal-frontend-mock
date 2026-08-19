import { get } from '@/shared/utils/request';
import type { FundAccountListResponse, FundFlowListResponse, FundFlowQueryRequest } from '../types/api';

export const listMyFundAccounts = () => get<FundAccountListResponse>('/fund/my/accounts');

export const listMyFundFlows = (params?: FundFlowQueryRequest) =>
    get<FundFlowListResponse>('/fund/my/flows', { params });
