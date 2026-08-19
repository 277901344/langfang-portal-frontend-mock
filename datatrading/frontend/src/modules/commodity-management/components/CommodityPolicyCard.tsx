import { Typography } from 'antd';
import {
    ClockCircleOutlined,
    EnvironmentOutlined,
    GlobalOutlined,
    RocketOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import type { ReactNode } from 'react';

import type { CommodityProductItem } from '../types/api';
import {
    asRecord,
    getNestedRecord,
    getStrategyValue,
    toStrategyConfig,
} from '../utils/preview-helpers';

const { Text } = Typography;

interface CommodityPolicyCardProps {
    product?: CommodityProductItem;
}

function renderPolicySummaryItems(product?: CommodityProductItem) {
    const strategyValue = toStrategyConfig(getStrategyValue(product));
    const behaviors = getNestedRecord(strategyValue, 'behaviors');
    const delivery = getNestedRecord(behaviors, 'delivery');
    const operations = getNestedRecord(behaviors, 'operations');
    const constraints = getNestedRecord(strategyValue, 'constraints');
    const time = getNestedRecord(constraints, 'time');
    const location = getNestedRecord(constraints, 'location');
    const items: ReactNode[] = [];

    if (delivery) {
        const actions = [
            delivery.masking ? '脱敏' : '',
            delivery.encrypt ? '加密' : '',
            delivery.anonymize ? '匿名' : '',
            delivery.convert ? '转换' : '',
        ].filter(Boolean);
        if (actions.length > 0) {
            items.push(
                <div key="delivery" className="flex items-center gap-2 rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-600">
                    <RocketOutlined className="shrink-0" />
                    <span className="truncate font-medium">交付: {actions.join('/')}</span>
                </div>,
            );
        }
    }

    if (operations) {
        const actions = [
            operations.view ? '查看' : '',
            operations.download ? '下载' : '',
            operations.sandbox ? '沙箱' : '',
            operations.trade ? '交易' : '',
            operations.recordSending ? '记录发送' : '',
            operations.distribute ? '分发' : '',
        ].filter(Boolean);
        if (actions.length > 0) {
            items.push(
                <div key="ops" className="flex items-center gap-2 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] text-blue-600">
                    <SafetyCertificateOutlined className="shrink-0" />
                    <span className="truncate font-medium">操作: {actions.join(', ')}</span>
                </div>,
            );
        }
    }

    if (time && (time.range || time.window || time.maxCount || time.frequency)) {
        const frequency = asRecord(time.frequency);
        const frequencyText = frequency?.count
            ? `${String(frequency.count)}次/${String(frequency.unit || '')}`
            : '';
        items.push(
            <div key="time" className="flex items-center gap-2 rounded border border-purple-100 bg-purple-50 px-3 py-2 text-[12px] text-purple-600">
                <ClockCircleOutlined className="shrink-0" />
                <span className="truncate font-medium">
                    时间: {time.range ? '日期范围' : ''}{time.window ? ' 时段' : ''}{time.maxCount ? ` ${time.maxCount}次` : ''}{frequencyText ? ` ${frequencyText}` : ''}{(!time.range && !time.window && !time.maxCount && !frequencyText) ? '受限' : ''}
                </span>
            </div>,
        );
    }

    const regions = Array.isArray(location?.regions) ? location?.regions : [];
    const ipWhitelist = Array.isArray(location?.ipWhitelist) ? location?.ipWhitelist : [];
    if (regions.length > 0 || ipWhitelist.length > 0) {
        items.push(
            <div key="location" className="flex items-center gap-2 rounded border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] text-amber-600">
                <EnvironmentOutlined className="shrink-0" />
                <span className="truncate font-medium">地点: 受控区域/IP</span>
            </div>,
        );
    }

    return items.length > 0 ? items : (
        <div className="flex items-center gap-2 rounded border border-dashed border-slate-100 bg-slate-50 px-3 py-2 text-[12px] text-slate-400">
            <GlobalOutlined className="shrink-0" />
            <span className="truncate">基础通用策略</span>
        </div>
    );
}

export function CommodityPolicyCard({ product }: CommodityPolicyCardProps) {
    const policy = product?.accessConstraints;
    if (!policy) {
        return <div className="py-8 text-center text-slate-400 italic">未绑定授权策略</div>;
    }
    return (
        <div className="space-y-4 p-1">
            {Boolean(policy.strategyName) && (
                <Text strong className="block text-slate-700" style={{ fontSize: 13 }}>
                    {String(policy.strategyName)}
                </Text>
            )}
            {Boolean(policy.strategyDesc) && (
                <Text type="secondary" className="block" style={{ fontSize: 12 }}>
                    {String(policy.strategyDesc)}
                </Text>
            )}
            <div className="flex flex-col gap-2">
                {renderPolicySummaryItems(product)}
            </div>
        </div>
    );
}
