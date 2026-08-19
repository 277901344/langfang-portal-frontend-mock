import { get, post, service } from '@/shared/utils/request';
import type {
  FundAccountListResponse,
  FundAccountQueryRequest,
  FundFlowListResponse,
  FundFlowQueryRequest,
  FundRechargeRequest,
  FundSubjectListResponse,
} from '../types/api';

export const listFundSubjects = (params?: { keyword?: string; pageNum?: number; pageSize?: number }) =>
  get<FundSubjectListResponse>('/fund/subjects', { params });

export const listAdminFundAccounts = (params?: FundAccountQueryRequest) =>
  get<FundAccountListResponse>('/fund/admin/accounts', { params });

export const listAdminFundFlows = (params?: FundFlowQueryRequest) =>
  get<FundFlowListResponse>('/fund/admin/flows', { params });

export const rechargeFundAccount = (data: FundRechargeRequest) =>
  post<string>('/fund/admin/recharge', data);

export const uploadFundAttachment = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return post<string>('/file/uploadFile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const removeFundAttachment = (fileUrl: string) =>
  post<string>('/file/removeFile', undefined, {
    params: { fileUrl },
  });

export const previewFundAttachment = async (fileUrl: string) => {
  const response = await service.get('/file/download', {
    params: { fileUrl },
    responseType: 'blob',
  });

  return {
    blob: response.data as Blob,
    contentType: response.headers['content-type'] as string | undefined,
  };
};

export const voidRechargeFlow = (flowId: number) =>
  post<string>(`/fund/admin/recharge/${flowId}/void`);

export const voidDebitFlow = (flowId: number) =>
  post<string>(`/fund/admin/debit/${flowId}/void`);
