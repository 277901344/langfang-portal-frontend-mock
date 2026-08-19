import { useMemo, useState } from 'react';
import { Button, Descriptions, Empty, InputNumber, Skeleton, Tag, Typography, message } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { CommonCard } from '@/shared/components/CommonCard';
import { PageContainer } from '@/shared/components/PageContainer';
import { useQuery } from '@/shared/hooks/useQuery';
import {
    getCommodityTypeLabel,
    getDisplayValue,
    getSubjectTypeLabel,
    getSubjectTypeTagColor,
} from '@/modules/commodity-management/utils/format';
import { useUserStore } from '@/store/useUserStore';
import { formatPricingModelLabel } from '@/shared/utils/tradingLabels';
import { getMarketCommodityDetail, getMarketCommodityProviderInfo, purchaseMarketCommodity } from '../services/marketplace';
import type { MarketplaceCommodityDetail } from '../types';

const { Title } = Typography;

const normalizeQuantity = (value?: string | number | null) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return 1;
    }
    return Math.min(999, Math.max(1, Math.floor(parsed)));
};

const formatAmount = (value?: number | string | null) => {
    if (value === undefined || value === null || value === '') {
        return '-';
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return '-';
    }
    return parsed.toFixed(2);
};

const getPaymentMethodText = (value?: number) => {
    if (value === 0) {
        return '线下支付';
    }
    if (value === 1) {
        return '线上支付';
    }
    return '-';
};

const getIdentityText = (certType?: string, certNumber?: string) =>
    [certType, certNumber].filter(Boolean).join(' ');

function MarketplaceOrderConfirmPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams();
    const [searchParams] = useSearchParams();
    const commodityId = params.id || '';
    const currentUserId = useUserStore((state) => state.userInfo?.id);
    const [quantity, setQuantity] = useState(() => normalizeQuantity(searchParams.get('quantity')));
    const [submitting, setSubmitting] = useState(false);
    const [createdOrderId, setCreatedOrderId] = useState('');
    const routeCommodityDetail = (location.state as { commodityDetail?: MarketplaceCommodityDetail } | null)?.commodityDetail;
    const initialCommodityDetail = routeCommodityDetail?.commodityId === commodityId ? routeCommodityDetail : undefined;

    const { data, isLoading } = useQuery({
        queryKey: ['market-commodity-confirm', commodityId],
        queryFn: () => getMarketCommodityDetail(commodityId),
        enabled: Boolean(commodityId) && !initialCommodityDetail,
        initialData: initialCommodityDetail,
        refetchOnWindowFocus: false,
    });
    const { data: providerInfo, isLoading: isProviderInfoLoading } = useQuery({
        queryKey: ['market-commodity-provider-info', commodityId],
        queryFn: () => getMarketCommodityProviderInfo(commodityId),
        enabled: Boolean(commodityId),
        refetchOnWindowFocus: false,
    });

    const unitPrice = useMemo(() => {
        if ((data?.pricingModel || 'FREE') === 'FREE') {
            return 0;
        }
        const price = data?.price !== undefined && data?.price !== null ? Number(data.price) : undefined;
        const discountPrice = data?.discountPrice !== undefined && data?.discountPrice !== null
            ? Number(data.discountPrice)
            : undefined;
        if (price !== undefined && discountPrice !== undefined && discountPrice < price) {
            return discountPrice;
        }
        return price;
    }, [data]);
    const pricingModel = data?.pricingModel || 'FREE';
    const quantityLocked = pricingModel === 'FREE' || pricingModel === 'MONTHLY';
    const effectiveQuantity = quantityLocked ? 1 : quantity;
    const totalAmount = unitPrice === undefined ? undefined : unitPrice * effectiveQuantity;
    const priceSuffix = pricingModel === 'MONTHLY' ? '/月' : pricingModel === 'PER_CALL' ? '/次' : '';
    const providerSubjectName = providerInfo?.subjectName || providerInfo?.displayName || data?.userIdentityCode || data?.userId;
    const providerIdentity = providerInfo?.phone
        || providerInfo?.unifiedSocialCreditCode
        || getIdentityText(providerInfo?.operatorCertType, providerInfo?.operatorCertNumber);
    const providerIdentityLabel = providerInfo?.phone ? '联系电话' : '证件号码';

    const handleSubmit = async () => {
        if (!data) {
            return;
        }
        if (currentUserId && data.userId === currentUserId) {
            message.warning('不能购买自己发布的商品');
            return;
        }
        setSubmitting(true);
        try {
            const order = await purchaseMarketCommodity({
                commodityId: data.commodityId,
                quantity: effectiveQuantity,
            });
            setCreatedOrderId(order.id);
        } finally {
            setSubmitting(false);
        }
    };

    if (!commodityId) {
        return (
            <PageContainer title="订单确认" layout="fluid">
                <Empty description="缺少商品标识，无法确认订单。" />
            </PageContainer>
        );
    }

    return (
        <PageContainer title={createdOrderId ? undefined : '订单确认'} layout="fluid" onBack={createdOrderId ? undefined : () => navigate(-1)}>
            <div className="mx-auto w-full max-w-6xl">
                {createdOrderId ? (
                    <div className="flex min-h-[460px] flex-col items-center justify-center bg-white">
                        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#4cca12] text-white">
                            <CheckOutlined className="text-[32px]" />
                        </div>
                        <Title level={3} className="!mb-8 !text-[24px] !font-semibold !text-slate-900">
                            订单创建成功
                        </Title>
                        <div className="flex items-center gap-4">
                            <Button
                                type="primary"
                                className="!h-9 !rounded !bg-[#0d8fc5] !px-6 !text-sm !font-medium"
                                onClick={() => navigate('/marketplace')}
                            >
                                返回交易市场
                            </Button>
                            <Button
                                className="!h-9 !rounded !px-6 !text-sm !font-medium"
                                onClick={() => navigate(`/console/trade-order/${createdOrderId}`)}
                            >
                                查看订单
                            </Button>
                        </div>
                    </div>
                ) : isLoading || isProviderInfoLoading || !data ? (
                    <CommonCard padding="large">
                        <Skeleton active paragraph={{ rows: 8 }} />
                    </CommonCard>
                ) : (
                    <CommonCard padding={24} className="rounded-2xl">
                        <div className="space-y-7">
                            <section>
                                <Title level={4} className="!mb-4 !text-slate-900">数据提供方</Title>
                                <div className="grid grid-cols-1 gap-x-8 gap-y-3 rounded-lg border border-slate-100 bg-slate-50/50 px-5 py-4 md:grid-cols-2">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="shrink-0 text-sm font-semibold text-slate-500">主体名称</span>
                                        <span className="truncate text-base font-semibold text-slate-900">
                                            {getDisplayValue(providerSubjectName)}
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="shrink-0 text-sm font-semibold text-slate-500">主体类型</span>
                                        <Tag
                                            color={getSubjectTypeTagColor(providerInfo?.authType, providerInfo?.subjectType)}
                                            className="m-0"
                                        >
                                            {getSubjectTypeLabel(providerInfo?.authType, providerInfo?.subjectType)}
                                        </Tag>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="shrink-0 text-sm font-semibold text-slate-500">连接名称</span>
                                        <span className="truncate text-base font-medium text-slate-800">
                                            {getDisplayValue(providerInfo?.connectorName)}
                                        </span>
                                    </div>
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="shrink-0 text-sm font-semibold text-slate-500">{providerIdentityLabel}</span>
                                        <span className="truncate text-base font-medium text-slate-800">
                                            {getDisplayValue(providerIdentity)}
                                        </span>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <Title level={4} className="!mb-4 !text-slate-900">商品信息</Title>
                                <Descriptions column={3} colon={false} labelStyle={{ color: '#667085', fontWeight: 600 }}>
                                    <Descriptions.Item label="商品名称">
                                        {getDisplayValue(data.commodityName)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="商品类型">
                                        {getCommodityTypeLabel(data.commodityType)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="支付方式">
                                        {getPaymentMethodText(data.deliveryMethod)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="定价模式">
                                        {formatPricingModelLabel(pricingModel)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="成交价格">
                                        {pricingModel === 'FREE' ? '免费' : `${formatAmount(unitPrice)}${priceSuffix}`}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="购买数量">
                                        <InputNumber
                                            min={1}
                                            max={999}
                                            value={effectiveQuantity}
                                            disabled={quantityLocked}
                                            onChange={(value) => setQuantity(normalizeQuantity(value))}
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="订单总价">
                                        {formatAmount(totalAmount)}
                                    </Descriptions.Item>
                                </Descriptions>
                            </section>
                        </div>

                        <div className="mt-24 flex justify-center border-t border-slate-100 pt-6">
                            <Button
                                type="primary"
                                size="large"
                                className="!px-8 !font-medium"
                                loading={submitting}
                                onClick={handleSubmit}
                            >
                                提交订单
                            </Button>
                        </div>
                    </CommonCard>
                )}
            </div>
        </PageContainer>
    );
}

export default MarketplaceOrderConfirmPage;
