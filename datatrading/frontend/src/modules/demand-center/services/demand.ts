import { get, post, put } from '@/shared/utils/request';
import type {
    DemandAcceptResult,
    DemandListQueryRequest,
    DemandListResponse,
    DemandSaveRequest,
    DemandDetailResponse,
    DemandRespondRequest,
    DemandResponseItem,
    DemandResponseRejectRequest
} from '../types/api';

const BASE_URL = '/demand-center';

export const listDemands = (params: DemandListQueryRequest) => {
    return get<DemandListResponse>(`${BASE_URL}/demands`, { params });
};

export const getDemandDetail = (demandId: string) => {
    return get<DemandDetailResponse>(`${BASE_URL}/demands/${demandId}`);
};

export const createDemand = (data: DemandSaveRequest) => {
    return post<DemandDetailResponse>(`${BASE_URL}/demands`, data);
};

export const updateDemand = (demandId: string, data: DemandSaveRequest) => {
    return put<DemandDetailResponse>(`${BASE_URL}/demands/${demandId}`, data);
};

export const publishDemand = (demandId: string) => {
    return post<string>(`${BASE_URL}/demands/${demandId}/publish`);
};

export const closeDemand = (demandId: string) => {
    return post<string>(`${BASE_URL}/demands/${demandId}/close`);
};

export const respondDemand = (demandId: string, data: DemandRespondRequest) => {
    return post<DemandResponseItem>(`${BASE_URL}/demands/${demandId}/responses`, data);
};

export const acceptResponse = (responseId: string) => {
    return post<DemandAcceptResult>(`${BASE_URL}/responses/${responseId}/accept`);
};

export const rejectResponse = (responseId: string, data: DemandResponseRejectRequest) => {
    return post<string>(`${BASE_URL}/responses/${responseId}/reject`, data);
};
