import { Badge, Image, Tag, Typography } from 'antd';
import {
    AppstoreOutlined,
    BankOutlined,
    DeploymentUnitOutlined,
    FileImageOutlined,
    FileTextOutlined,
    HistoryOutlined,
    InfoCircleOutlined,
    SafetyCertificateOutlined,
    SecurityScanOutlined,
    TagOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

import { CommonCard } from '@/shared/components/CommonCard';
import { UI_CONFIG } from '@/shared/constants/ui';
import {
    formatApplicationCategoryLabel,
    formatDataAcquisitionLabel,
    formatIndustryCategoryLabel,
    formatOrganizationCategoryLabel,
    formatPricingModelLabel,
    formatQualityLevelLabel,
    formatSecurityLevelLabel,
    formatTopicCategoryLabel,
    formatUpdateFrequencyLabel,
} from '@/shared/utils/tradingLabels';
import { useTradingDictionaryStore } from '@/store/useTradingDictionaryStore';
import type { CommodityManagementDetail } from '../types/api';
import { getFileDownloadUrl } from '../utils/file';
import {
    formatPrice,
    getCommodityTypeLabel,
    getProductTypeLabel,
} from '../utils/format';
import { CommodityPolicyCard } from './CommodityPolicyCard';
import { CommodityUsagePreview } from './CommodityUsagePreview';

const { Paragraph, Text } = Typography;

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

const getPaymentMethodText = (value?: number) => {
    if (value === 0) {
        return '线下支付';
    }
    if (value === 1) {
        return '线上支付';
    }
    return '-';
};

const getCommodityPriceLabel = (
    displayPrice: (value?: number | string | null) => string,
    pricingModel?: string,
    price?: number | string | null,
    discountPrice?: number | string | null
) => {
    if (pricingModel === 'FREE') {
        return '免费';
    }
    const value = discountPrice !== undefined && discountPrice !== null && Number(discountPrice) < Number(price)
        ? discountPrice
        : price;
    const suffix = pricingModel === 'MONTHLY' ? '/月' : pricingModel === 'PER_CALL' ? '/次' : '';
    return `${displayPrice(value)}${suffix}`;
};

interface CommodityViewPanelProps {
    detail: CommodityManagementDetail;
    coverImageUrl?: string;
    /**
     * market: 商品信息卡只展示 名称/描述/价格/折后价；产品详情卡 + 授权策略 + 使用说明 完整展示
     * admin: 暂未启用（form.tsx 暂仍使用其内置 renderPreview）
     */
    mode?: 'market' | 'admin';
}

function ProductInfoItem({
    label,
    value,
    icon,
    iconClassName,
}: {
    label: string;
    value: string;
    icon: ReactNode;
    iconClassName: string;
}) {
    return (
        <div>
            <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${iconClassName}`}>
                    {icon}
                </div>
                <span style={{ fontSize: 12 }}>{label}</span>
            </div>
            <Text strong style={{ fontSize: 12 }} className="text-slate-700">
                {value}
            </Text>
        </div>
    );
}

export function CommodityViewPanel({ detail, coverImageUrl, mode = 'market' }: CommodityViewPanelProps) {
    useTradingDictionaryStore((state) => state.dictionaryRevision);
    const coverImage = detail.coverImage;
    const product = detail.product;
    const showProductTypeInDetails = mode !== 'market';
    const hasDiscount =
        detail.price !== undefined && detail.price !== null
        && detail.discountPrice !== undefined && detail.discountPrice !== null
        && Number(detail.discountPrice) < Number(detail.price);
    const displayPrice = mode === 'market' ? formatMarketPrice : formatPrice;
    const pricingModel = detail.pricingModel || 'FREE';

    return (
        <div className={`flex flex-col ${UI_CONFIG.spacing.blockInnerGap}`}>
            <CommonCard
                padding={18}
                title={
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50">
                            <TagOutlined className="text-amber-600 text-[12px]" />
                        </div>
                        <Text strong style={{ fontSize: 14 }}>商品信息</Text>
                    </div>
                }
            >
                <div className="grid grid-cols-[420px_1fr] gap-8">
                    <div className="flex aspect-[3/2] items-center justify-center overflow-hidden rounded-lg border-2 border-slate-200 bg-slate-50 shadow-sm">
                        {coverImage ? (
                            <Image
                                src={coverImageUrl || getFileDownloadUrl(coverImage)}
                                alt="商品图片"
                                width="100%"
                                height="100%"
                                style={{ objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                <FileImageOutlined style={{ fontSize: 36 }} />
                                <span style={{ fontSize: 12 }}>暂无图片</span>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <Text strong className="block truncate !text-2xl !text-slate-900">
                            {detail.commodityName || '未命名商品'}
                        </Text>
                        <Paragraph className="mb-4 mt-2 text-slate-500" style={{ fontSize: 13 }}>
                            {detail.description || '暂无商品描述'}
                        </Paragraph>
                        <div className="mb-5 flex flex-wrap gap-3">
                            <Tag
                                bordered={false}
                                className="m-0 rounded-none px-4 py-1.5 text-[13px] font-semibold text-white"
                                style={{ backgroundColor: '#5aa9c8' }}
                            >
                                {getCommodityTypeLabel(detail.commodityType)}
                            </Tag>
                            <Tag
                                bordered={false}
                                className="m-0 rounded-none px-4 py-1.5 text-[13px] font-semibold text-white"
                                style={{ backgroundColor: '#74b68b' }}
                            >
                                {formatTopicCategoryLabel(product?.topicCategoryLabel, product?.topicCategory)}
                            </Tag>
                            <Tag
                                bordered={false}
                                className="m-0 rounded-none px-4 py-1.5 text-[13px] font-semibold text-white"
                                style={{ backgroundColor: '#d8a76a' }}
                            >
                                {formatApplicationCategoryLabel(product?.applicationCategoryLabel, product?.applicationCategory)}
                            </Tag>
                            <Tag
                                bordered={false}
                                className="m-0 rounded-none px-4 py-1.5 text-[13px] font-semibold text-white"
                                style={{ backgroundColor: '#7d8cc4' }}
                            >
                                {getPaymentMethodText(detail.deliveryMethod)}
                            </Tag>
                            <Tag
                                bordered={false}
                                className="m-0 rounded-none px-4 py-1.5 text-[13px] font-semibold text-white"
                                style={{ backgroundColor: '#5f9ea0' }}
                            >
                                {formatPricingModelLabel(pricingModel)}
                            </Tag>
                        </div>
                        <div className="flex items-baseline gap-3">
                            {pricingModel === 'FREE' ? (
                                <Text className="!text-xl !font-semibold !text-[#1593d1]">
                                    免费
                                </Text>
                            ) : hasDiscount ? (
                                <>
                                    <Text className="!text-xl !font-semibold !text-[#1593d1]">
                                        {getCommodityPriceLabel(displayPrice, pricingModel, detail.price, detail.discountPrice)}
                                    </Text>
                                    <Text className="!text-sm !text-slate-400 line-through">
                                        {displayPrice(detail.price)}
                                    </Text>
                                </>
                            ) : (
                                <Text className="!text-xl !font-semibold !text-[#1593d1]">
                                    {getCommodityPriceLabel(displayPrice, pricingModel, detail.price, detail.discountPrice)}
                                </Text>
                            )}
                        </div>
                    </div>
                </div>
            </CommonCard>

            <CommonCard
                padding={18}
                title={
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                            <InfoCircleOutlined className="text-blue-600 text-[12px]" />
                        </div>
                        <Text strong style={{ fontSize: 14 }}>产品详情</Text>
                    </div>
                }
                className="bg-slate-50/30"
            >
                {product ? (
                    <div className="grid grid-cols-4 gap-x-6 gap-y-5 p-1">
                        <div className="col-span-4">
                            <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>产品名称</Text>
                            <Text strong className="mt-1 block text-slate-800" style={{ fontSize: 15 }}>
                                {product.productName || '-'}
                            </Text>
                        </div>
                        <div className="col-span-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 px-4 py-3">
                            <div>
                                <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>产品编码</Text>
                                <Text strong className="mt-1 block break-all text-slate-700" style={{ fontSize: 13 }}>
                                    {product.productId || '-'}
                                </Text>
                            </div>
                            <div>
                                <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>签约授权</Text>
                                <div className="mt-1">
                                {product.isAuth === 1 ? (
                                    <Tag color="warning" bordered={false} className="m-0 text-[11px] font-bold">需要授权</Tag>
                                ) : (
                                    <Tag color="success" bordered={false} className="m-0 text-[11px] font-bold">无需授权</Tag>
                                )}
                                </div>
                            </div>
                        </div>
                        <div className={`${showProductTypeInDetails ? 'col-span-3' : 'col-span-4'} mb-1 border-b border-slate-100 pb-4`}>
                            <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>描述信息</Text>
                            <Paragraph className="mb-0 mt-1 text-slate-600" style={{ fontSize: 12 }}>
                                {product.description || '暂无描述信息'}
                            </Paragraph>
                        </div>
                        {showProductTypeInDetails && (
                            <div className="mb-1 border-b border-slate-100 pb-4">
                                <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>产品类型</Text>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50">
                                        <AppstoreOutlined style={{ fontSize: 12 }} className="text-emerald-600" />
                                    </div>
                                    <Text strong className="!text-[12px] !text-slate-700">
                                        {getProductTypeLabel(product.productType)}
                                    </Text>
                                </div>
                            </div>
                        )}
                        <ProductInfoItem
                            label="主题分类"
                            value={formatTopicCategoryLabel(product.topicCategoryLabel, product.topicCategory)}
                            icon={<TagOutlined style={{ fontSize: 12 }} className="text-blue-600" />}
                            iconClassName="bg-blue-50"
                        />
                        <ProductInfoItem
                            label="行业分类"
                            value={formatIndustryCategoryLabel(product.industryCategoryLabel, product.industryCategory)}
                            icon={<DeploymentUnitOutlined style={{ fontSize: 12 }} className="text-indigo-600" />}
                            iconClassName="bg-indigo-50"
                        />
                        <ProductInfoItem
                            label="机构分类"
                            value={formatOrganizationCategoryLabel(product.organizationCategoryLabel, product.organizationCategory)}
                            icon={<BankOutlined style={{ fontSize: 12 }} className="text-cyan-600" />}
                            iconClassName="bg-cyan-50"
                        />
                        <ProductInfoItem
                            label="应用场景分类"
                            value={formatApplicationCategoryLabel(product.applicationCategoryLabel, product.applicationCategory)}
                            icon={<AppstoreOutlined style={{ fontSize: 12 }} className="text-emerald-600" />}
                            iconClassName="bg-emerald-50"
                        />
                        <ProductInfoItem
                            label="数据来源"
                            value={formatDataAcquisitionLabel(product.dataAcquisitionLabel, product.dataAcquisition)}
                            icon={<InfoCircleOutlined style={{ fontSize: 12 }} className="text-slate-600" />}
                            iconClassName="bg-slate-100"
                        />
                        <ProductInfoItem
                            label="更新频率"
                            value={formatUpdateFrequencyLabel(product.updateFrequencyLabel, product.updateFrequency)}
                            icon={<HistoryOutlined style={{ fontSize: 12 }} className="text-orange-600" />}
                            iconClassName="bg-orange-50"
                        />
                        <div>
                            <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                                <Badge status={product.dataQualityLevel ? 'success' : 'default'} className="m-0" />
                                <span style={{ fontSize: 12 }}>质量等级</span>
                            </div>
                            <Text strong style={{ fontSize: 12 }} className="text-slate-700">
                                {formatQualityLevelLabel(product.dataQualityLevelLabel, product.dataQualityLevel)}
                            </Text>
                        </div>
                        <ProductInfoItem
                            label="安全分级"
                            value={formatSecurityLevelLabel(product.dataSecurityLevelLabel, product.dataSecurityLevel)}
                            icon={<SecurityScanOutlined style={{ fontSize: 12 }} className="text-rose-600" />}
                            iconClassName="bg-rose-50"
                        />
                        <div className={`col-span-4 flex flex-col border-t border-slate-100 pt-6 ${UI_CONFIG.spacing.blockInnerGap}`}>
                            <CommonCard
                                padding={16}
                                title={
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                                            <SafetyCertificateOutlined className="text-purple-600 text-[12px]" />
                                        </div>
                                        <Text strong style={{ fontSize: 14 }}>授权控制策略</Text>
                                    </div>
                                }
                            >
                                <CommodityPolicyCard product={product} />
                            </CommonCard>
                            <CommonCard
                                padding={16}
                                title={
                                    <div className="flex items-center gap-2">
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                            <FileTextOutlined className="text-emerald-600 text-[12px]" />
                                        </div>
                                        <Text strong style={{ fontSize: 14 }}>使用说明预览</Text>
                                    </div>
                                }
                            >
                                <CommodityUsagePreview product={product} />
                            </CommonCard>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-400 italic">暂无产品详情</div>
                )}
            </CommonCard>
        </div>
    );
}
