export interface FundSubjectOption {
    id: string;
    subjectName: string;
    subjectType?: string;
    authStatus?: number;
}

export interface FundSubjectListResponse {
    data: FundSubjectOption[];
    dataCount: number;
    pageCount: number;
}

export interface FundAccountItem {
    id: string;
    accountNo: string;
    userIdentityCode: string;
    subjectName: string;
    accountRole: string;
    availableBalance: number;
    totalRechargeAmount: number;
    totalDebitAmount: number;
    totalIncomeAmount: number;
    status: string;
}

export interface FundAccountListResponse {
    data: FundAccountItem[];
    dataCount: number;
    pageCount: number;
}

export interface FundFlowItem {
    id: number;
    flowNo: string;
    userIdentityCode: string;
    subjectName: string;
    accountRole: string;
    flowType: string;
    amount: number;
    beforeBalance: number;
    afterBalance: number;
    orderId?: string;
    orderNo?: string;
    relatedFlowId?: number;
    attachmentUrl?: string;
    remark?: string;
    operatorId?: number;
    operatorName?: string;
    createdAt: string;
}

export interface FundFlowListResponse {
    data: FundFlowItem[];
    dataCount: number;
    pageCount: number;
}

export interface FundAccountQueryRequest {
    keyword?: string;
    accountRole?: string;
    pageNum?: number;
    pageSize?: number;
}

export interface FundFlowQueryRequest {
    keyword?: string;
    flowType?: string;
    accountRole?: string;
    pageNum?: number;
    pageSize?: number;
}

export interface FundRechargeRequest {
    userIdentityCode: string;
    subjectName: string;
    amount: number;
    attachmentUrl?: string;
    remark?: string;
}
