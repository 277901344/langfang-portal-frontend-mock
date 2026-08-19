import { formatCommodityTypeLabel, formatProductTypeLabel } from '@/shared/utils/tradingLabels';

export const getProductTypeLabel = (value?: string) => formatProductTypeLabel(value);

export const getCommodityTypeLabel = (value?: string) => formatCommodityTypeLabel(value);

export const getSubjectTypeLabel = (authType?: number, subjectType?: string) => {
    if (subjectType) {
        return subjectType;
    }
    if (authType === 1) {
        return '个人';
    }
    if (authType === 2) {
        return '机构/法人';
    }
    if (authType === 3) {
        return '经办人';
    }
    return '未认证';
};

export const getSubjectTypeTagColor = (authType?: number, subjectType?: string) => {
    const label = getSubjectTypeLabel(authType, subjectType);
    if (label === '个人') {
        return 'blue';
    }
    if (label === '机构/法人') {
        return 'purple';
    }
    if (label === '经办人') {
        return 'orange';
    }
    return 'default';
};

export const getDisplayValue = (value?: string | number | null) => {
    if (value === undefined || value === null || value === '') {
        return '-';
    }
    return String(value);
};

export const getQualityLevelLabel = (value?: string) => {
    if (!value) {
        return '-';
    }
    return value.endsWith('级') ? value : `${value}级`;
};

export const getSecurityLevelLabel = (value?: string) => {
    if (!value) {
        return '-';
    }
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
        return `${Math.min(parsed, 3)}级`;
    }
    return value.endsWith('级') ? value : `${value}级`;
};

export const PAYMENT_METHOD_LABEL: Record<number, string> = {
    0: '线下支付',
    1: '线上交付',
};

export const getPaymentMethodLabel = (value?: number) =>
    (value === undefined || value === null ? '-' : PAYMENT_METHOD_LABEL[value] || '-');

export const formatPrice = (value?: number | string | null) => {
    if (value === undefined || value === null || value === '') {
        return '-';
    }
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return '-';
    }
    return num.toFixed(2);
};
