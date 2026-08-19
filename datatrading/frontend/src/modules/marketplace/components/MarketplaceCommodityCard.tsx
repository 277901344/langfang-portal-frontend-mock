import { Image, Typography } from 'antd';
import { FileImageOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { CommonCard } from '@/shared/components/CommonCard';
import { formatPricingModelLabel } from '@/shared/utils/tradingLabels';
import { getMarketCommodityCoverUrl } from '../services/marketplace';
import type { MarketplaceCommodityItem } from '../types';

const { Paragraph, Text } = Typography;

interface MarketplaceCommodityCardProps {
    item: MarketplaceCommodityItem;
}

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

const formatPricingPrice = (pricingModel?: string, price?: number | string | null, discountPrice?: number | string | null) => {
    if ((pricingModel || 'FREE') === 'FREE') {
        return '免费';
    }
    const value = discountPrice !== undefined && discountPrice !== null && Number(discountPrice) < Number(price)
        ? discountPrice
        : price;
    const suffix = pricingModel === 'MONTHLY' ? '/月' : pricingModel === 'PER_CALL' ? '/次' : '';
    return `${formatMarketPrice(value)}${suffix}`;
};

export function MarketplaceCommodityCard({ item }: MarketplaceCommodityCardProps) {
    const navigate = useNavigate();
    const pricingModel = item.pricingModel || 'FREE';
    const hasDiscount =
        pricingModel !== 'FREE'
        && item.price !== undefined && item.price !== null
        && item.discountPrice !== undefined && item.discountPrice !== null
        && Number(item.discountPrice) < Number(item.price);

    const handleClick = () => {
        navigate(`/marketplace/products/${item.commodityId}`);
    };

    return (
        <CommonCard
            hoverable
            onClick={handleClick}
            className="group h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_34px_rgba(37,99,235,0.12)]"
            padding={0}
        >
            <div className="flex h-full flex-col">
                <div className="flex aspect-[16/9] items-center justify-center overflow-hidden bg-slate-50">
                    {item.coverImage ? (
                        <Image
                            src={getMarketCommodityCoverUrl(item.commodityId)}
                            alt={item.commodityName}
                            preview={false}
                            width="100%"
                            height="100%"
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                            <FileImageOutlined style={{ fontSize: 36 }} />
                            <span style={{ fontSize: 12 }}>暂无封面</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
                    <Text strong className="line-clamp-1 !text-[15px] !text-slate-900">
                        {item.commodityName || '未命名商品'}
                    </Text>
                    <Paragraph
                        className="!mb-0 !line-clamp-2 !text-[13px] !leading-5 !text-slate-500"
                    >
                        {item.description || '暂无商品描述'}
                    </Paragraph>
                    <div className="mt-auto flex justify-end border-t border-slate-100 pt-2.5">
                        <div className="flex items-baseline gap-2">
                        <Text className="!text-xs !text-slate-400">
                            {formatPricingModelLabel(pricingModel)}
                        </Text>
                        {hasDiscount ? (
                            <>
                                <Text className="!text-base !font-semibold !text-[#1593d1]">
                                    {formatPricingPrice(pricingModel, item.price, item.discountPrice)}
                                </Text>
                                <Text className="!text-xs !text-slate-400 line-through">
                                    {formatMarketPrice(item.price)}
                                </Text>
                            </>
                        ) : (
                            <Text className="!text-base !font-semibold !text-[#1593d1]">
                                {formatPricingPrice(pricingModel, item.price, item.discountPrice)}
                            </Text>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </CommonCard>
    );
}
