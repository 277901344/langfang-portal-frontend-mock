import { useState } from 'react';
import { Button, Empty, InputNumber, message, Skeleton, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';

import { CommonCard } from '@/shared/components/CommonCard';
import { LoginRequiredModal } from '@/shared/components/LoginRequiredModal';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { useQuery } from '@/shared/hooks/useQuery';
import { CommodityViewPanel } from '@/modules/commodity-management/components/CommodityViewPanel';
import { useUserStore } from '@/store/useUserStore';
import { formatPricingModelLabel } from '@/shared/utils/tradingLabels';
import { getMarketCommodityCoverUrl, getMarketCommodityDetail } from '../services/marketplace';

const { Text } = Typography;

const formatMarketPrice = (value?: number | string | null) => {
    if (value === undefined || value === null || value === '') {
        return '-';
    }
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return '-';
    }
    return num.toFixed(2);
};

function MarketplaceProductDetailPage() {
    const navigate = useNavigate();
    const params = useParams();
    const commodityId = params.id || '';
    const token = useUserStore((state) => state.token);
    const currentUserId = useUserStore((state) => state.userInfo?.id);
    const [quantity, setQuantity] = useState<number>(1);
    const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['market-commodity-detail', commodityId],
        queryFn: () => getMarketCommodityDetail(commodityId),
        enabled: Boolean(commodityId),
        refetchOnWindowFocus: false,
    });

    if (!commodityId) {
        return (
            <PageContainer title="商品详情" layout="narrow">
                <Empty description="缺少商品标识，无法加载详情。" />
            </PageContainer>
        );
    }

    const price = data?.price !== undefined && data?.price !== null ? Number(data.price) : undefined;
    const discountPrice =
        data?.discountPrice !== undefined && data?.discountPrice !== null
            ? Number(data.discountPrice)
            : undefined;
    const hasDiscount =
        data?.pricingModel !== 'FREE' && price !== undefined && discountPrice !== undefined && discountPrice < price;
    const pricingModel = data?.pricingModel || 'FREE';
    const quantityLocked = pricingModel === 'FREE' || pricingModel === 'MONTHLY';
    const effectiveQuantity = quantityLocked ? 1 : quantity;
    const unitPrice = pricingModel === 'FREE' ? 0 : hasDiscount ? discountPrice! : price;
    const subtotal = unitPrice !== undefined ? unitPrice * effectiveQuantity : undefined;
    const priceSuffix = pricingModel === 'MONTHLY' ? '/月' : pricingModel === 'PER_CALL' ? '/次' : '';

    const handlePurchase = () => {
        if (!data) {
            return;
        }
        if (!token) {
            setLoginRequiredOpen(true);
            return;
        }
        if (currentUserId && data.userId === currentUserId) {
            message.warning('不能购买自己发布的商品');
            return;
        }
        navigate(`/marketplace/products/${data.commodityId}/confirm?quantity=${effectiveQuantity}`, {
            state: { commodityDetail: data },
        });
    };

    return (
        <PageContainer title="商品详情" layout="narrow" onBack={() => navigate(-1)}>
            <div className="mx-auto w-full max-w-6xl">
            {isLoading || !data ? (
                <CommonCard padding="large">
                    <Skeleton active paragraph={{ rows: 8 }} />
                </CommonCard>
            ) : (
                <div className={`grid grid-cols-[minmax(0,1fr)_280px] ${UI_CONFIG.spacing.blockInnerGap}`}>
                    <div className="min-w-0">
                        <CommodityViewPanel
                            detail={data}
                            coverImageUrl={getMarketCommodityCoverUrl(data.commodityId)}
                            mode="market"
                        />
                    </div>
                    <div className="sticky top-5 w-full self-start">
                        <CommonCard
                            padding={16}
                            className="rounded-2xl shadow-sm"
                        >
                            <div className="flex flex-col gap-3">
                                <Text strong className="!text-sm !text-slate-900 line-clamp-2">
                                    {data.commodityName || '未命名商品'}
                                </Text>
                                <div>
                                    <Text className="!text-xs !text-slate-400">定价模式</Text>
                                    <div className="mt-1">
                                        <Text className="!text-sm !font-medium !text-slate-700">
                                            {formatPricingModelLabel(pricingModel)}
                                        </Text>
                                    </div>
                                </div>
                                <div>
                                    <Text className="!text-xs !text-slate-400">价格</Text>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        {pricingModel === 'FREE' ? (
                                            <Text className="!text-xl !font-semibold !text-rose-500">
                                                免费
                                            </Text>
                                        ) : hasDiscount ? (
                                            <>
                                                <Text className="!text-xl !font-semibold !text-rose-500">
                                                    {formatMarketPrice(discountPrice)}{priceSuffix}
                                                </Text>
                                                <Text className="!text-xs !text-slate-400 line-through">
                                                    {formatMarketPrice(price)}
                                                </Text>
                                            </>
                                        ) : (
                                            <Text className="!text-xl !font-semibold !text-slate-900">
                                                {formatMarketPrice(price)}{priceSuffix}
                                            </Text>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <Text className="!text-xs !text-slate-400">数量</Text>
                                    <div className="mt-1">
                                        <InputNumber
                                            min={1}
                                            max={999}
                                            value={effectiveQuantity}
                                            disabled={quantityLocked}
                                            onChange={(value) =>
                                                setQuantity(typeof value === 'number' && value > 0 ? value : 1)
                                            }
                                            className="!w-full"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-lg bg-slate-50 px-3 py-2">
                                    <div className="flex items-center justify-between">
                                        <Text className="!text-xs !text-slate-500">应付小计</Text>
                                        <Text strong className="!text-base !text-rose-500">
                                            {subtotal !== undefined ? formatMarketPrice(subtotal) : '-'}
                                        </Text>
                                    </div>
                                </div>
                                <Button
                                    type="primary"
                                    block
                                    className="!font-medium"
                                    onClick={handlePurchase}
                                >
                                    立即购买
                                </Button>
                            </div>
                        </CommonCard>
                    </div>
                </div>
            )}
            </div>
            <LoginRequiredModal
                open={loginRequiredOpen}
                onCancel={() => setLoginRequiredOpen(false)}
            />
        </PageContainer>
    );
}

export default MarketplaceProductDetailPage;
