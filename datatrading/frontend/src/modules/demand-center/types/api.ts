export interface DemandListItem {
    id: string;
    demandNo: string;
    title: string;
    description: string;
    topicCategory: string;
    applicationCategory: string;
    productType: string;
    updateFrequency: string;
    expectedFields: string[];
    usagePurpose: string;
    budgetType: string;
    budgetAmount: number;
    expectedDelivery: string;
    deadline: string;
    status: string;
    publisherId: number;
    publisherName: string;
    responseCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    ownDemand: boolean;
    canEdit: boolean;
    canClose: boolean;
    canRespond: boolean;
    canReviewResponses: boolean;
}

export interface DemandResponseItem {
    id: string;
    demandId: string;
    responderId: number;
    responderName: string;
    productId: string;
    versionId?: string;
    connectorId: string;
    proposal: string;
    quotedPrice: number;
    pricingModel: string;
    deliveryType: string;
    status: string;
    rejectReason: string;
    createdAt: string;
    updatedAt: string;
    canAccept: boolean;
    canReject: boolean;
}

export interface DemandDetailResponse extends DemandListItem {
    matchedResponseId: string;
    orderId: string;
    responses: DemandResponseItem[];
}

export interface DemandAcceptResult {
    demandId: string;
    responseId: string;
    orderId: string;
    orderNo: string;
}

export interface DemandListResponse {
    data: DemandListItem[];
    dataCount: number;
    pageCount: number;
}

export interface DemandSaveRequest {
    title: string;
    description?: string;
    topicCategory?: string;
    applicationCategory?: string;
    productType?: string;
    updateFrequency?: string;
    expectedFields?: string[];
    usagePurpose?: string;
    budgetType?: string;
    budgetAmount?: number;
    expectedDelivery?: string;
    deadline?: string;
}

export interface DemandListQueryRequest {
    scope?: string;
    demandType?: string;
    status?: string;
    keyword?: string;
    topicCategory?: string;
    pageNum?: number;
    pageSize?: number;
}

export interface DemandRespondRequest {
    productId?: string;
    versionId?: string;
    connectorId?: string;
    proposal: string;
    quotedPrice?: number;
    pricingModel?: string;
    deliveryType?: string;
}

export interface DemandResponseRejectRequest {
    rejectReason: string;
}
