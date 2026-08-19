import { get, post } from '@/shared/utils/request';
import type {
    TradeOrderContractItem,
    TradeOrderDetailResponse,
    TradeOrderListQueryRequest,
    TradeOrderListResponse,
} from '../types/api';

const BASE_URL = '/trade-order';

export const listOrders = (params: TradeOrderListQueryRequest) => {
    return get<TradeOrderListResponse>(`${BASE_URL}/orders`, { params });
};

export const getOrderDetail = (orderId: string) => {
    return get<TradeOrderDetailResponse>(`${BASE_URL}/orders/${orderId}`);
};

export const listBindableContracts = (orderId: string) => {
    return get<TradeOrderContractItem[]>(`${BASE_URL}/orders/${orderId}/contracts`);
};

export const bindOrderContract = (orderId: string, contractId: string) => {
    return post<string>(`${BASE_URL}/orders/${orderId}/bind-contract`, { contractId });
};

export const confirmOrder = (orderId: string) => {
    return post<string>(`${BASE_URL}/orders/${orderId}/confirm`);
};

export const cancelOrder = (orderId: string) => {
    return post<string>(`${BASE_URL}/orders/${orderId}/cancel`);
};

export const completeOrder = (orderId: string) => {
    return post<string>(`${BASE_URL}/orders/${orderId}/complete`);
};
