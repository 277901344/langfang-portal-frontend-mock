import { useTradingDictionaryStore } from '@/store/useTradingDictionaryStore';

export type TradingStatusMeta = {
    color: string;
    text: string;
};

const PRODUCT_TYPE_LABEL_MAP: Record<string, string> = {
    数据集: '数据集',
    API产品: 'API产品',
    数据应用: '数据应用',
    数据报告: '数据报告',
    数字对象: '数字对象',
    其他: '其他',
};

export const COMMODITY_TYPE_LABEL_MAP: Record<string, string> = {
    数据集: '数据集',
    API产品: 'API产品',
    数据应用: '数据应用',
    数据报告: '数据报告',
    数字对象: '数字对象',
    其他: '其他',
};

const PRICING_MODEL_LABEL_MAP: Record<string, string> = {
    FREE: '免费',
    PER_CALL: '按次计费',
    MONTHLY: '包月',
    FIXED_PRICE: '固定价格',
};

const DELIVERY_TYPE_LABEL_MAP: Record<string, string> = {
    ...COMMODITY_TYPE_LABEL_MAP,
    API_SERVICE: 'API 接口服务',
    FILE_DUMP: '文件交付',
    OFFLINE: '线下支付',
    ONLINE: '线上支付',
};

export const UPDATE_FREQUENCY_OPTIONS = [
    { label: '实时', value: '实时' },
    { label: '每日', value: '每日' },
    { label: '每周', value: '每周' },
    { label: '每月', value: '每月' },
    { label: '每季度', value: '每季度' },
    { label: '每半年', value: '每半年' },
    { label: '每年', value: '每年' },
    { label: '不定期', value: '不定期' },
];

const UPDATE_FREQUENCY_LABEL_MAP: Record<string, string> = {
    REALTIME: '实时',
    HOURLY: '每小时',
    DAILY: '每日',
    WEEKLY: '每周',
    MONTHLY: '每月',
    QUARTERLY: '每季度',
    HALF_YEARLY: '每半年',
    SEMI_ANNUAL: '每半年',
    YEARLY: '每年',
    IRREGULAR: '不定期',
    UNSCHEDULED: '不定期',
    实时: '实时',
    每日: '每日',
    每周: '每周',
    每月: '每月',
    每季度: '每季度',
    每半年: '每半年',
    每年: '每年',
    不定期: '不定期',
};

const TOPIC_CATEGORY_LABEL_MAP: Record<string, string> = {};

const APPLICATION_CATEGORY_LABEL_MAP: Record<string, string> = {};

const DEMAND_STATUS_META_MAP: Record<string, TradingStatusMeta> = {
    DRAFT: { color: 'default', text: '未发布' },
    PUBLISHED: { color: 'processing', text: '已发布' },
    RESPONDED: { color: 'warning', text: '已有响应' },
    MATCHED: { color: 'success', text: '已匹配' },
    COMPLETED: { color: 'green', text: '已完成' },
    CLOSED: { color: 'default', text: '已关闭' },
    EXPIRED: { color: 'error', text: '已过期' },
};

const DEMAND_RESPONSE_STATUS_META_MAP: Record<string, TradingStatusMeta> = {
    PENDING: { color: 'processing', text: '待处理' },
    ACCEPTED: { color: 'success', text: '已接受' },
    REJECTED: { color: 'error', text: '已拒绝' },
};

const TRADE_ORDER_STATUS_META_MAP: Record<string, TradingStatusMeta> = {
    PENDING: { color: 'processing', text: '待确认' },
    CONFIRMED: { color: 'success', text: '已确认' },
    CANCELLED: { color: 'default', text: '已取消' },
    COMPLETED: { color: 'green', text: '已完成' },
};

export const PRODUCT_TYPE_OPTIONS = [
    { label: '数据集', value: '数据集' },
    { label: 'API产品', value: 'API产品' },
    { label: '数据应用', value: '数据应用' },
    { label: '数据报告', value: '数据报告' },
    { label: '数字对象', value: '数字对象' },
    { label: '其他', value: '其他' },
];

export const COMMODITY_TYPE_OPTIONS = [
    { label: '数据集', value: '数据集' },
    { label: 'API产品', value: 'API产品' },
    { label: '数据应用', value: '数据应用' },
    { label: '数据报告', value: '数据报告' },
    { label: '数字对象', value: '数字对象' },
    { label: '其他', value: '其他' },
];

export const PRICING_MODEL_OPTIONS = [
    { label: '免费', value: 'FREE' },
    { label: '按次计费', value: 'PER_CALL' },
    { label: '包月', value: 'MONTHLY' },
];

export const DELIVERY_TYPE_OPTIONS = [
    { label: 'API 接口服务', value: 'API_SERVICE' },
    { label: '文件交付', value: 'FILE_DUMP' },
];

export const DEMAND_SCOPE_OPTIONS = [
    { label: '全部需求', value: 'all' },
    { label: '我的需求', value: 'my' },
];

export const DEMAND_STATUS_FILTER_OPTIONS = [
    { label: '已发布', value: 'PUBLISHED' },
    { label: '已有响应', value: 'RESPONDED' },
    { label: '已匹配', value: 'MATCHED' },
    { label: '已关闭', value: 'CLOSED' },
];

export const TRADE_ORDER_STATUS_FILTER_OPTIONS = [
    { label: '待确认', value: 'PENDING' },
    { label: '已确认', value: 'CONFIRMED' },
    { label: '已取消', value: 'CANCELLED' },
    { label: '已完成', value: 'COMPLETED' },
];

export function formatProductTypeLabel(value?: string | null): string {
    return formatLabel(value, PRODUCT_TYPE_LABEL_MAP, '数据集');
}

export function formatCommodityTypeLabel(value?: string | null): string {
    return formatLabel(value, COMMODITY_TYPE_LABEL_MAP, '数据集');
}

export function formatPricingModelLabel(value?: string | null): string {
    return formatLabel(value, PRICING_MODEL_LABEL_MAP);
}

export function formatDeliveryTypeLabel(value?: string | null): string {
    return formatLabel(value, DELIVERY_TYPE_LABEL_MAP);
}

export function formatTopicCategoryLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    return formatLabelWithFallback(
        label,
        value,
        resolveRuntimeDictionary('topicCategoryMap'),
        TOPIC_CATEGORY_LABEL_MAP,
        emptyText
    );
}

export function formatApplicationCategoryLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    return formatLabelWithFallback(
        label,
        value,
        resolveRuntimeDictionary('applicationCategoryMap'),
        APPLICATION_CATEGORY_LABEL_MAP,
        emptyText
    );
}

export function formatIndustryCategoryLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    return formatLabelWithFallback(label, value, resolveRuntimeDictionary('industryCategoryMap'), {}, emptyText);
}

export function formatOrganizationCategoryLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    return formatLabelWithFallback(label, value, resolveRuntimeDictionary('organizationCategoryMap'), {}, emptyText);
}

export function formatDataAcquisitionLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    return formatLabelWithFallback(label, value, resolveRuntimeDictionary('dataAcquisitionMap'), {}, emptyText);
}

export function formatUpdateFrequencyLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    return formatLabelWithFallback(
        label,
        value,
        resolveRuntimeDictionary('updateFrequencyMap'),
        UPDATE_FREQUENCY_LABEL_MAP,
        emptyText
    );
}

export function formatQualityLevelLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    const resolved = formatLabelWithFallback(label, value, resolveRuntimeDictionary('qualityLevelMap'), {}, emptyText);
    if (!value || resolved !== value) {
        return resolved;
    }
    return value.endsWith('级') ? value : `${value}级`;
}

export function formatSecurityLevelLabel(label?: string | null, value?: string | null, emptyText = '-'): string {
    const resolved = formatLabelWithFallback(label, value, resolveRuntimeDictionary('securityLevelMap'), {}, emptyText);
    if (!value || resolved !== value) {
        return resolved;
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        const level = Math.min(Math.max(Math.trunc(parsed), 1), 3);
        return ['一级', '二级', '三级'][level - 1];
    }
    return value.endsWith('级') ? value : `${value}级`;
}

export function getDemandStatusMeta(status?: string | null): TradingStatusMeta {
    return getStatusMeta(status, DEMAND_STATUS_META_MAP);
}

export function getDemandResponseStatusMeta(status?: string | null): TradingStatusMeta {
    return getStatusMeta(status, DEMAND_RESPONSE_STATUS_META_MAP);
}

export function getTradeOrderStatusMeta(status?: string | null): TradingStatusMeta {
    return getStatusMeta(status, TRADE_ORDER_STATUS_META_MAP);
}

function formatLabel(
    value: string | null | undefined,
    labelMap: Record<string, string>,
    emptyText = '-'
): string {
    if (!value) {
        return emptyText;
    }

    return labelMap[value] || value;
}

function formatLabelWithFallback(
    label: string | null | undefined,
    value: string | null | undefined,
    runtimeLabelMap: Record<string, string>,
    fallbackLabelMap: Record<string, string>,
    emptyText = '-'
): string {
    if (label && label !== value) {
        return label;
    }

    return formatLabel(value, { ...fallbackLabelMap, ...runtimeLabelMap }, label || emptyText);
}

function getStatusMeta(status: string | null | undefined, metaMap: Record<string, TradingStatusMeta>): TradingStatusMeta {
    if (!status) {
        return { color: 'default', text: '-' };
    }

    return metaMap[status] || { color: 'default', text: status };
}

function resolveRuntimeDictionary(
    key: 'topicCategoryMap'
        | 'applicationCategoryMap'
        | 'industryCategoryMap'
        | 'organizationCategoryMap'
        | 'dataAcquisitionMap'
        | 'updateFrequencyMap'
        | 'qualityLevelMap'
        | 'securityLevelMap'
): Record<string, string> {
    return useTradingDictionaryStore.getState()[key] || {};
}
