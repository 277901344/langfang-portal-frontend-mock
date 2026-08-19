import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Button,
    Descriptions,
    Empty,
    Popconfirm,
    Select,
    Space,
    Tag,
    Timeline,
    Typography,
    message,
} from 'antd';
import dayjs from 'dayjs';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { getOrderSummaries, refreshBilling } from '@/modules/billing/services/billing';
import type { BillingOrderSummaryItem } from '@/modules/billing/types/api';
import type { CommodityProviderInfo } from '@/modules/commodity-management/types/api';
import { getSubjectTypeLabel, getSubjectTypeTagColor } from '@/modules/commodity-management/utils/format';
import { FormSection } from '@/shared/components/FormSection';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import {
    formatCommodityTypeLabel,
    formatDeliveryTypeLabel,
    formatPricingModelLabel,
    getTradeOrderStatusMeta,
} from '@/shared/utils/tradingLabels';
import { useUserStore } from '@/store/useUserStore';

import * as orderService from '../../services/order';
import type { TradeOrderContractItem, TradeOrderDetailResponse } from '../../types/api';
import './index.scss';

const { Title, Text } = Typography;

const contentBlockClassName = `${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding} shadow-sm`;

const formatCurrency = (value?: number) => (value != null ? `${value} 元` : '-');
const formatQuantity = (value?: number) => (value != null ? `${value}` : '-');
const formatUsageValue = (value?: number) => (value != null ? Number(value || 0).toFixed(4) : '-');
const formatDateTime = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-');

const formatProductBinding = (
    productName?: string,
    productId?: string,
    versionId?: string,
    fallbackCommodityName?: string
) => {
    const displayName = productName || fallbackCommodityName;
    if (displayName) {
        return `${displayName}${versionId ? ` / ${versionId}` : ''}`;
    }
    return productId ? `${productId}${versionId ? ` / ${versionId}` : ''}` : '-';
};

const formatContractDisplay = (contractName?: string, contractId?: string) => contractName || contractId || '-';

const formatStatusLogReason = (reason?: string) => {
    if (!reason) {
        return '-';
    }
    const reasonMap: Record<string, string> = {
        'Accepted demand response': '已接受需求响应，创建订单',
        'Marketplace commodity purchase submitted': '已提交市场商品订单',
        'Confirmed order': '已确认订单，进入履约阶段',
        'Cancelled order': '已取消订单',
        'Completed order': '已完成订单',
    };
    return reasonMap[reason] || reason;
};

const getParticipantContact = (info?: CommodityProviderInfo) => {
    return {
        label: '联系电话',
        value: info?.phone || '-',
    };
};

const formatSourceType = (sourceType?: string) => {
    if (sourceType === 'DEMAND_ACCEPT') {
        return '需求接受';
    }
    if (sourceType === 'MARKETPLACE_QUICK_ORDER') {
        return '市场直购';
    }
    return sourceType || '-';
};

const getDetailOrderStatusMeta = (status?: string) => {
    const meta = getTradeOrderStatusMeta(status);
    if (status === 'CONFIRMED') {
        return { ...meta, text: '履约中' };
    }
    return meta;
};

const formatPaymentStatus = (status?: string) => {
    if (status === 'UNPAID') {
        return { text: '待完成后扣费', color: 'default' as const };
    }
    if (status === 'PAID') {
        return { text: '已完成扣费', color: 'green' as const };
    }
    if (status === 'VOID') {
        return { text: '扣费已作废', color: 'orange' as const };
    }
    return { text: status || '-', color: 'default' as const };
};

const buildOrderFlowHint = (detail: TradeOrderDetailResponse | null) => {
    if (!detail) {
        return '';
    }
    if (detail.status === 'PENDING') {
        return '确认订单后进入履约阶段；完成订单时才会根据订单金额执行真实扣费。';
    }
    if (detail.status === 'CONFIRMED' && detail.paymentStatus === 'UNPAID') {
        return '订单已进入履约阶段，待买方确认履约完成后再执行真实扣费。';
    }
    if (detail.status === 'COMPLETED' && detail.paymentStatus === 'PAID') {
        return '订单已完成履约，平台已按订单金额完成扣费。';
    }
    return '当前订单按“先确认进入履约、后完成执行扣费”的步骤处理。';
};

const TradeOrderDetailPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const permissions = useUserStore((state) => state.permissions);
    const roleCodes = useUserStore((state) => state.roleCodes);
    const userInfo = useUserStore((state) => state.userInfo);
    const hasBillingPermission = permissions.includes('billing:view');
    const isAdmin = roleCodes.includes('SUPER_ADMIN') || roleCodes.includes('ADMIN');

    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [completing, setCompleting] = useState(false);
    const [meteringLoading, setMeteringLoading] = useState(false);
    const [refreshingMetering, setRefreshingMetering] = useState(false);
    const [contractLoading, setContractLoading] = useState(false);
    const [bindingContract, setBindingContract] = useState(false);
    const [selectedContractId, setSelectedContractId] = useState<string>();
    const [detail, setDetail] = useState<TradeOrderDetailResponse | null>(null);
    const [meterSummary, setMeterSummary] = useState<BillingOrderSummaryItem | null>(null);
    const [contracts, setContracts] = useState<TradeOrderContractItem[]>([]);

    const fetchDetail = useCallback(async () => {
        if (!orderId) {
            return;
        }
        setLoading(true);
        try {
            const result = await orderService.getOrderDetail(orderId);
            setDetail(result);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    const fetchMeteringSummary = useCallback(async () => {
        if (!orderId || !hasBillingPermission) {
            setMeterSummary(null);
            return;
        }
        setMeteringLoading(true);
        try {
            const result = await getOrderSummaries({ orderId });
            setMeterSummary(result.data?.[0] || null);
        } finally {
            setMeteringLoading(false);
        }
    }, [hasBillingPermission, orderId]);

    const fetchContracts = useCallback(async (currentOrderId?: string) => {
        const normalizedOrderId = String(currentOrderId || '').trim();
        if (!normalizedOrderId) {
            setContracts([]);
            return;
        }
        setContractLoading(true);
        try {
            const result = await orderService.listBindableContracts(normalizedOrderId);
            setContracts(result || []);
        } finally {
            setContractLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    useEffect(() => {
        fetchMeteringSummary();
    }, [fetchMeteringSummary]);

    useEffect(() => {
        setSelectedContractId(detail?.contractId || undefined);
    }, [detail?.contractId]);

    const handleConfirm = async () => {
        if (!orderId) {
            return;
        }
        setConfirming(true);
        try {
            await orderService.confirmOrder(orderId);
            message.success('订单已确认，已进入履约阶段');
            await fetchDetail();
        } finally {
            setConfirming(false);
        }
    };

    const handleCancel = async () => {
        if (!orderId) {
            return;
        }
        setCancelling(true);
        try {
            await orderService.cancelOrder(orderId);
            message.success('订单取消成功');
            await fetchDetail();
        } finally {
            setCancelling(false);
        }
    };

    const handleComplete = async () => {
        if (!orderId) {
            return;
        }
        setCompleting(true);
        try {
            await orderService.completeOrder(orderId);
            message.success('订单已完成，并已执行扣费');
            await Promise.all([fetchDetail(), fetchMeteringSummary()]);
        } finally {
            setCompleting(false);
        }
    };

    const handleRefreshMetering = async () => {
        if (!orderId) {
            return;
        }
        setRefreshingMetering(true);
        try {
            const result = await refreshBilling({ orderId });
            message.success(`计量刷新完成，已同步 ${result.refreshedOrderCount || 0} 笔订单`);
            await Promise.all([fetchDetail(), fetchMeteringSummary()]);
        } finally {
            setRefreshingMetering(false);
        }
    };

    const handleBindContract = async () => {
        if (!orderId || !selectedContractId) {
            return;
        }
        setBindingContract(true);
        try {
            await orderService.bindOrderContract(orderId, selectedContractId);
            message.success('订单关联合约成功');
            await Promise.all([fetchDetail(), fetchMeteringSummary()]);
        } finally {
            setBindingContract(false);
        }
    };

    const status = detail ? getDetailOrderStatusMeta(detail.status) : null;
    const paymentStatus = formatPaymentStatus(detail?.paymentStatus);
    const isMarketplaceOrder = detail?.sourceType === 'MARKETPLACE_QUICK_ORDER';
    const detailOrderRole = (location.state as { orderRole?: string } | null)?.orderRole
        || new URLSearchParams(location.search).get('orderRole');
    const providerInfo = detail?.providerInfo;
    const demanderInfo = detail?.demanderInfo;
    const providerContact = getParticipantContact(providerInfo);
    const demanderContact = getParticipantContact(demanderInfo);
    const currentUserIds = [userInfo?.id, userInfo?.ownerUserId]
        .filter((value): value is number => value != null)
        .map((value) => Number(value));

    const normalizedBuyerName = detail?.buyerName?.trim();
    const normalizedBuyerSubjectName = detail?.buyerSubjectName?.trim();
    const normalizedUsername = userInfo?.username?.trim();
    const normalizedDisplayName = userInfo?.displayName?.trim();
    const normalizedSubjectName = userInfo?.subjectName?.trim();
    const normalizedLegacyName = userInfo?.name?.trim();

    const isBuyerById = Boolean(detail?.buyerId != null && currentUserIds.includes(Number(detail.buyerId)));
    const isBuyerByName = Boolean(
        [normalizedBuyerName, normalizedBuyerSubjectName]
            .filter((value): value is string => Boolean(value))
            .some(
                (value) =>
                    value === normalizedUsername
                    || value === normalizedDisplayName
                    || value === normalizedSubjectName
                    || value === normalizedLegacyName
            )
    );
    const isBuyer = isBuyerById || isBuyerByName;
    const normalizedSellerName = detail?.sellerName?.trim();
    const normalizedSellerSubjectName = detail?.sellerSubjectName?.trim();
    const isSellerById = Boolean(
        detail?.sellerId != null && currentUserIds.includes(Number(detail.sellerId))
    );
    const isSellerByName = Boolean(
        [normalizedSellerName, normalizedSellerSubjectName]
            .filter((value): value is string => Boolean(value))
            .some(
                (value) =>
                    value === normalizedUsername
                    || value === normalizedDisplayName
                    || value === normalizedSubjectName
                    || value === normalizedLegacyName
            )
    );
    const isSeller = isSellerById || isSellerByName;
    const showDemanderAsPrimary = Boolean(
        isMarketplaceOrder && (detailOrderRole === 'SALE' || (!isAdmin && isSeller && !isBuyer))
    );
    const primaryParticipantInfo = showDemanderAsPrimary ? demanderInfo : providerInfo;
    const primaryParticipantContact = showDemanderAsPrimary ? demanderContact : providerContact;
    const primaryParticipantTitle = showDemanderAsPrimary ? '需求方信息' : '提供方信息';
    const primaryParticipantSubjectName = showDemanderAsPrimary
        ? demanderInfo?.subjectName || detail?.buyerSubjectName || detail?.buyerUserIdentityCode || '-'
        : providerInfo?.subjectName || detail?.sellerSubjectName || detail?.sellerUserIdentityCode || '-';
    const primaryParticipantUser = showDemanderAsPrimary
        ? demanderInfo?.displayName || detail?.buyerName || '-'
        : providerInfo?.connectorName || detail?.connectorId || '-';
    const primaryParticipantUserLabel = showDemanderAsPrimary ? '用户' : '连接器名称';
    const canOperateOrder = isAdmin || isBuyer;

    const fallbackCanConfirm = Boolean(
        detail && detail.status === 'PENDING' && permissions.includes('order:confirm') && canOperateOrder
    );
    const fallbackCanCancel = Boolean(
        detail && ['PENDING', 'CONFIRMED'].includes(detail.status) && permissions.includes('order:cancel') && canOperateOrder
    );
    const fallbackCanComplete = Boolean(
        detail && detail.status === 'CONFIRMED' && permissions.includes('order:complete') && canOperateOrder
    );
    const canBindContract = Boolean(
        detail &&
        permissions.includes('order:update') &&
        canOperateOrder &&
        !detail.contractId &&
        detail.productId &&
        ['PENDING', 'CONFIRMED'].includes(detail.status)
    );
    const shouldShowContractSection = Boolean(detail && (detail.contractId || canOperateOrder));
    const canConfirm = Boolean(detail?.canConfirm || fallbackCanConfirm);
    const canCancel = Boolean(detail?.canCancel || fallbackCanCancel);
    const canComplete = Boolean(detail?.canComplete || fallbackCanComplete);
    const hasActions = Boolean(canConfirm || canCancel || canComplete);
    const canRefreshMetering = Boolean(meterSummary?.meteringReady);
    const showResponseSection = Boolean(!isMarketplaceOrder && detail?.proposal);
    const shouldLoadContracts = Boolean(detail?.productId && canOperateOrder);

    useEffect(() => {
        if (shouldLoadContracts && detail?.id) {
            fetchContracts(detail.id);
            return;
        }
        setContracts([]);
    }, [detail?.id, fetchContracts, shouldLoadContracts]);

    const contractOptions = useMemo(
        () =>
            contracts.map((item) => ({
                label: item.contractName || item.contractId,
                value: item.contractId,
            })),
        [contracts]
    );

    const currentContract = useMemo(
        () => contracts.find((item) => item.contractId === detail?.contractId),
        [contracts, detail?.contractId]
    );
    const statusRecordTitle = (
        <div className="section-heading-inline">
            <span>状态记录</span>
            <span className="section-heading-hint">{buildOrderFlowHint(detail)}</span>
        </div>
    );

    return (
        <PageContainer title="订单详情" layout="narrow" onBack={() => navigate(-1)} loading={loading} contentClassName="pb-5">
            {detail ? (
                <div className="trade-order-detail-page flex w-full flex-col gap-6">
                    <div className={contentBlockClassName}>
                        <div className="flex flex-col gap-5">
                            <div className="flex items-start justify-between">
                                <Title level={4} style={{ margin: 0 }}>
                                    {detail.orderTitle}
                                </Title>
                                {status && <Tag color={status.color}>{status.text}</Tag>}
                            </div>

                            <FormSection title="订单概览" variant="shaded">
                                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                                    <Descriptions.Item label="订单编号">{detail.orderNo}</Descriptions.Item>
                                    <Descriptions.Item label="订单来源">{formatSourceType(detail.sourceType)}</Descriptions.Item>
                                    <Descriptions.Item label="创建时间">{formatDateTime(detail.createdAt)}</Descriptions.Item>
                                    <Descriptions.Item label={isMarketplaceOrder ? '来源商品' : '来源需求'}>
                                        {isMarketplaceOrder ? (
                                            detail.commodityName || '-'
                                        ) : detail.demandId && detail.demandNo ? (
                                            <Button
                                                type="link"
                                                style={{ padding: 0 }}
                                                onClick={() => navigate(`/demand-center/${detail.demandId}`)}
                                            >
                                                {detail.demandNo}
                                            </Button>
                                        ) : (
                                            detail.demandNo || '-'
                                        )}
                                    </Descriptions.Item>
                                    {!isMarketplaceOrder ? (
                                        <Descriptions.Item label="响应编号">{detail.responseId || '-'}</Descriptions.Item>
                                    ) : null}
                                    <Descriptions.Item label="关联合约">
                                        {formatContractDisplay(detail.contractName || currentContract?.contractName, detail.contractId)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="买方主体">
                                        {detail.buyerSubjectName || detail.buyerUserIdentityCode || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="卖方主体">
                                        {detail.sellerSubjectName || detail.sellerUserIdentityCode || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={`${showDemanderAsPrimary ? '买方' : '卖方'}主体类型`}>
                                        <Tag color={getSubjectTypeTagColor(primaryParticipantInfo?.authType, primaryParticipantInfo?.subjectType)}>
                                            {getSubjectTypeLabel(primaryParticipantInfo?.authType, primaryParticipantInfo?.subjectType)}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={primaryParticipantUserLabel}>
                                        {primaryParticipantUser}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={primaryParticipantContact.label}>
                                        {primaryParticipantContact.value}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="确认时间">{formatDateTime(detail.confirmedAt)}</Descriptions.Item>
                                    <Descriptions.Item label="完成时间">{formatDateTime(detail.completedAt)}</Descriptions.Item>
                                </Descriptions>
                            </FormSection>

                            <FormSection title="交易信息" variant="shaded">
                                <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                                    <Descriptions.Item label="关联产品">
                                        {formatProductBinding(
                                            detail.productName,
                                            detail.productId,
                                            detail.versionId,
                                            detail.commodityName
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="产品类型">{formatCommodityTypeLabel(detail.commodityType)}</Descriptions.Item>
                                    <Descriptions.Item label="交付方式">{formatDeliveryTypeLabel(detail.deliveryType)}</Descriptions.Item>
                                    <Descriptions.Item label="定价方式">{formatPricingModelLabel(detail.pricingModel)}</Descriptions.Item>
                                    <Descriptions.Item label="单价">{formatCurrency(detail.unitPrice)}</Descriptions.Item>
                                    <Descriptions.Item label="购买数量">{formatQuantity(detail.quantity)}</Descriptions.Item>
                                    <Descriptions.Item label="预计金额">{formatCurrency(detail.estimatedAmount)}</Descriptions.Item>
                                    <Descriptions.Item label="当前金额">{formatCurrency(detail.actualAmount)}</Descriptions.Item>
                                    <Descriptions.Item label="扣费状态">
                                        <Tag color={paymentStatus.color}>{paymentStatus.text}</Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="已扣费金额">{formatCurrency(detail.paidAmount)}</Descriptions.Item>
                                    <Descriptions.Item label="扣费时间">{formatDateTime(detail.paidAt)}</Descriptions.Item>
                                    <Descriptions.Item label="订单备注">{detail.remark || '-'}</Descriptions.Item>
                                    {isAdmin ? <Descriptions.Item label="连接器">{detail.connectorId || '-'}</Descriptions.Item> : null}
                                    {isAdmin ? <Descriptions.Item label="扣费流水">{detail.debitFlowId || '-'}</Descriptions.Item> : null}
                                    {isAdmin ? <Descriptions.Item label="收入流水">{detail.incomeFlowId || '-'}</Descriptions.Item> : null}
                                </Descriptions>
                            </FormSection>

                            {shouldShowContractSection ? (
                                <FormSection title="合约关联" variant="shaded">
                                    {detail.contractId ? (
                                        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                                            <Descriptions.Item label="当前合约">
                                                {formatContractDisplay(detail.contractName || currentContract?.contractName, detail.contractId)}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="合约编号">{detail.contractId}</Descriptions.Item>
                                            <Descriptions.Item label="关联产品">
                                                {formatProductBinding(
                                                    detail.productName,
                                                    detail.productId,
                                                    detail.versionId,
                                                    detail.commodityName
                                                )}
                                            </Descriptions.Item>
                                        </Descriptions>
                                    ) : detail.productId ? (
                                        <div className="flex flex-col gap-4">
                                            <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                                                <Descriptions.Item label="关联产品">
                                                    {formatProductBinding(
                                                        detail.productName,
                                                        detail.productId,
                                                        detail.versionId,
                                                        detail.commodityName
                                                    )}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="可选合约数">{contracts.length}</Descriptions.Item>
                                                <Descriptions.Item label="当前状态">{status?.text || '-'}</Descriptions.Item>
                                            </Descriptions>
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                                <Select
                                                    className="min-w-[320px]"
                                                    showSearch
                                                    allowClear
                                                    loading={contractLoading}
                                                    value={selectedContractId}
                                                    options={contractOptions}
                                                    placeholder="请选择需要关联的合约"
                                                    optionFilterProp="label"
                                                    onChange={(value) => setSelectedContractId(value)}
                                                />
                                                <Button
                                                    type="primary"
                                                    loading={bindingContract}
                                                    disabled={!canBindContract || !selectedContractId}
                                                    onClick={handleBindContract}
                                                >
                                                    关联合约
                                                </Button>
                                            </div>
                                            {!contractLoading && contracts.length === 0 ? (
                                                <div className="text-sm text-slate-500">当前产品下暂无可选合约。</div>
                                            ) : null}
                                            {!canBindContract ? (
                                                <div className="text-sm text-slate-500">
                                                    当前订单状态或当前登录身份不允许执行手动关联合约。
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : (
                                        <div className="text-sm leading-6 text-slate-500">
                                            当前订单未携带产品标识，暂时无法查询匹配合约。请先补齐订单产品快照或从原始响应重新关联。
                                        </div>
                                    )}
                                </FormSection>
                            ) : null}

                            {hasBillingPermission ? (
                                <FormSection
                                    title="计量摘要"
                                    variant="shaded"
                                    headerExtra={(
                                        <Button
                                            type="link"
                                            style={{ padding: 0 }}
                                            loading={refreshingMetering}
                                            disabled={!canRefreshMetering}
                                            onClick={handleRefreshMetering}
                                        >
                                            刷新计量
                                        </Button>
                                    )}
                                >
                                    {meteringLoading ? (
                                        <div className="text-sm text-slate-500">计量摘要加载中...</div>
                                    ) : meterSummary ? (
                                        meterSummary.meteringReady || (meterSummary.usageCount || 0) > 0 ? (
                                            <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                                                <Descriptions.Item label="使用次数">{meterSummary.usageCount ?? 0}</Descriptions.Item>
                                                <Descriptions.Item label="当前累计使用量">
                                                    {formatUsageValue(meterSummary.totalUsageValue)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="当前累计计费用量">
                                                    {formatUsageValue(meterSummary.totalBillableUsage)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="当前累计金额">
                                                    {formatCurrency(meterSummary.totalAmount)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="最近计量时间">
                                                    {formatDateTime(meterSummary.latestRecordedAt)}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        ) : (
                                            <div className="text-sm leading-6 text-slate-500">
                                                当前订单暂未形成可计量关联，请先完成合约绑定或等待执行侧产生使用事实后再刷新计量。
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-sm text-slate-500">暂无计量摘要</div>
                                    )}
                                </FormSection>
                            ) : null}

                            {false && <FormSection title={primaryParticipantTitle} variant="shaded">
                                <Descriptions column={{ xs: 1, sm: 2, md: 2 }}>
                                    <Descriptions.Item label="主体名称">
                                        {primaryParticipantSubjectName}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="主体类型">
                                        <Tag color={getSubjectTypeTagColor(primaryParticipantInfo?.authType, primaryParticipantInfo?.subjectType)}>
                                            {getSubjectTypeLabel(primaryParticipantInfo?.authType, primaryParticipantInfo?.subjectType)}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label={primaryParticipantUserLabel}>
                                        {primaryParticipantUser}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={primaryParticipantContact.label}>
                                        {primaryParticipantContact.value}
                                    </Descriptions.Item>
                                </Descriptions>
                            </FormSection>}

                            {isAdmin && !showDemanderAsPrimary && (
                                <FormSection title="需求方信息" variant="shaded">
                                    <Descriptions column={{ xs: 1, sm: 2, md: 2 }}>
                                        <Descriptions.Item label="主体名称">
                                            {demanderInfo?.subjectName || detail.buyerSubjectName || detail.buyerUserIdentityCode || '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="主体类型">
                                            <Tag color={getSubjectTypeTagColor(demanderInfo?.authType, demanderInfo?.subjectType)}>
                                                {getSubjectTypeLabel(demanderInfo?.authType, demanderInfo?.subjectType)}
                                            </Tag>
                                        </Descriptions.Item>
                                        <Descriptions.Item label="用户">
                                            {demanderInfo?.displayName || detail.buyerName || '-'}
                                        </Descriptions.Item>
                                        <Descriptions.Item label={demanderContact.label}>
                                            {demanderContact.value}
                                        </Descriptions.Item>
                                    </Descriptions>
                                </FormSection>
                            )}

                            {false && showResponseSection ? (
                                <FormSection title="响应方案" variant="shaded">
                                    <Text className="whitespace-pre-wrap text-gray-600">{detail?.proposal ?? '-'}</Text>
                                </FormSection>
                            ) : null}

                            <FormSection title={statusRecordTitle} variant="shaded">
                                {detail.statusLogs && detail.statusLogs.length > 0 ? (
                                    <Timeline
                                        items={detail.statusLogs.map((log) => ({
                                            color: getDetailOrderStatusMeta(log.toStatus).color || 'gray',
                                            children: (
                                                <div className="pb-2">
                                                    <div className="font-medium">{getDetailOrderStatusMeta(log.toStatus).text}</div>
                                                    <div className="text-sm text-gray-500">
                                                        {log.createdAt ? dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                                                    </div>
                                                    {log.operatorName ? (
                                                        <div className="text-sm text-gray-500">操作人：{log.operatorName}</div>
                                                    ) : null}
                                                    {log.reason ? (
                                                        <div className="text-sm text-gray-500">说明：{formatStatusLogReason(log.reason)}</div>
                                                    ) : null}
                                                </div>
                                            ),
                                        }))}
                                    />
                                ) : (
                                    <Empty description="暂无状态记录" />
                                )}
                            </FormSection>

                            {showResponseSection ? (
                                <FormSection title="响应方案" variant="shaded">
                                    <Text className="whitespace-pre-wrap text-gray-600">{detail.proposal}</Text>
                                </FormSection>
                            ) : null}

                            {hasActions ? (
                                <div className="flex justify-end border-t border-slate-200 pt-5">
                                    <Space size={UI_CONFIG.spacing.buttonGapNum}>
                                        {canCancel ? (
                                            <Popconfirm
                                                title="确定要取消该订单吗？取消后将结束当前交易。"
                                                onConfirm={handleCancel}
                                            >
                                                <Button danger loading={cancelling}>
                                                    取消订单
                                                </Button>
                                            </Popconfirm>
                                        ) : null}
                                        {canConfirm ? (
                                            <Button type="primary" loading={confirming} onClick={handleConfirm}>
                                                确认并进入履约
                                            </Button>
                                        ) : null}
                                        {canComplete ? (
                                            <Popconfirm
                                                title="确定要确认履约完成并执行扣费吗？"
                                                onConfirm={handleComplete}
                                            >
                                                <Button type="primary" loading={completing}>
                                                    确认完成并扣费
                                                </Button>
                                            </Popconfirm>
                                        ) : null}
                                    </Space>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : (
                <div className={contentBlockClassName}>
                    <Empty description="未找到订单详情" />
                </div>
            )}
        </PageContainer>
    );
};

export default TradeOrderDetailPage;
