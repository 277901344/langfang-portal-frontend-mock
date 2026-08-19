import React, { useEffect, useMemo, useState } from 'react';
import { Button, DatePicker, Empty, Form, Space, Table, message } from 'antd';
import {
    ClockCircleOutlined,
    DatabaseOutlined,
    DollarOutlined,
    ReloadOutlined,
    SearchOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';

import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { getBillingSummary, getOrderSummaries, getUsageStatistics, refreshBilling } from '../services/billing';
import type {
    BillingDateRangeQueryRequest,
    BillingOrderSummaryItem,
    BillingSummaryResponse,
    BillingUsageStatisticPoint,
} from '../types/api';

const { RangePicker } = DatePicker;

const formatNumber = (value?: number, scale = 2) => Number(value || 0).toFixed(scale);

const formatDateTime = (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-');

const defaultRange = (): [Dayjs, Dayjs] => [dayjs().subtract(6, 'day'), dayjs()];

const buildDateQuery = (range?: [Dayjs, Dayjs] | null): BillingDateRangeQueryRequest => ({
    startDate: range?.[0]?.format('YYYY-MM-DD'),
    endDate: range?.[1]?.format('YYYY-MM-DD'),
});

const BillingPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [query, setQuery] = useState<BillingDateRangeQueryRequest>(buildDateQuery(defaultRange()));
    const [summary, setSummary] = useState<BillingSummaryResponse>({
        totalOrderCount: 0,
        totalUsageValue: 0,
        totalBillableUsage: 0,
        totalAmount: 0,
    });
    const [statistics, setStatistics] = useState<BillingUsageStatisticPoint[]>([]);
    const [orderSummaries, setOrderSummaries] = useState<BillingOrderSummaryItem[]>([]);
    const rangePickerStyle: CSSProperties = { width: 260 };

    useEffect(() => {
        form.setFieldsValue({ range: defaultRange() });
    }, [form]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [summaryResult, statisticsResult, orderSummaryResult] = await Promise.all([
                    getBillingSummary(query),
                    getUsageStatistics(query),
                    getOrderSummaries({ ...query, limit: 5 }),
                ]);
                setSummary(summaryResult);
                setStatistics(statisticsResult.data || []);
                setOrderSummaries(orderSummaryResult.data || []);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [query]);

    const statCards = useMemo(
        () => [
            {
                key: 'orders',
                title: '计量订单数',
                value: `${summary.totalOrderCount || 0}`,
                note: '当前筛选范围内已形成计量记录的订单数',
                marker: 'bg-blue-500',
                accent: 'bg-blue-50 text-blue-600',
                panelClass: 'border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)]',
                icon: <DatabaseOutlined />,
            },
            {
                key: 'usage',
                title: '累计使用量',
                value: formatNumber(summary.totalUsageValue, 4),
                note: '按 usage_record 实时聚合得到的原始累计使用量',
                marker: 'bg-cyan-500',
                accent: 'bg-cyan-50 text-cyan-600',
                panelClass: 'border-cyan-100 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)]',
                icon: <UnorderedListOutlined />,
            },
            {
                key: 'amount',
                title: '当前累计金额',
                value: formatNumber(summary.totalAmount, 2),
                note: '基于订单价格快照和计量记录汇总出的当前累计金额',
                marker: 'bg-orange-500',
                accent: 'bg-orange-50 text-orange-600',
                panelClass: 'border-orange-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)]',
                icon: <DollarOutlined />,
            },
            {
                key: 'latest',
                title: '最近计量时间',
                value: summary.latestRecordedAt ? dayjs(summary.latestRecordedAt).format('MM-DD HH:mm') : '-',
                note: '当前筛选范围内最新一条使用记录的入库时间',
                marker: 'bg-emerald-500',
                accent: 'bg-emerald-50 text-emerald-600',
                panelClass: 'border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)]',
                icon: <ClockCircleOutlined />,
            },
        ],
        [summary]
    );

    const statisticColumns: ColumnsType<BillingUsageStatisticPoint> = [
        {
            title: '日期',
            dataIndex: 'statDate',
            width: 180,
            render: (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD') : '-'),
        },
        {
            title: '累计使用量',
            dataIndex: 'totalUsageValue',
            width: 160,
            render: (value?: number) => formatNumber(value, 4),
        },
        {
            title: '累计计费用量',
            dataIndex: 'totalBillableUsage',
            width: 160,
            render: (value?: number) => formatNumber(value, 4),
        },
        {
            title: '累计金额',
            dataIndex: 'totalAmount',
            width: 160,
            render: (value?: number) => formatNumber(value, 2),
        },
    ];

    const orderSummaryColumns: ColumnsType<BillingOrderSummaryItem> = [
        {
            title: '订单编号',
            dataIndex: 'orderNo',
            width: 180,
            render: (_value, record) =>
                record.orderId ? (
                    <Button
                        type="link"
                        style={{ padding: 0 }}
                        onClick={() => navigate(`/console/trade-order/${record.orderId}`)}
                    >
                        {record.orderNo || record.orderId}
                    </Button>
                ) : (
                    record.orderNo || '-'
                ),
        },
        {
            title: '订单标题',
            dataIndex: 'orderTitle',
            ellipsis: true,
        },
        {
            title: '合约编号',
            dataIndex: 'contractId',
            width: 180,
            render: (value?: string) => value || '-',
        },
        {
            title: '商品',
            dataIndex: 'commodityName',
            width: 180,
            render: (_value, record) => record.commodityName || record.commodityId || '-',
        },
        {
            title: '使用次数',
            dataIndex: 'usageCount',
            width: 120,
            render: (value?: number) => value ?? 0,
        },
        {
            title: '累计使用量',
            dataIndex: 'totalUsageValue',
            width: 140,
            render: (value?: number) => formatNumber(value, 4),
        },
        {
            title: '当前累计金额',
            dataIndex: 'totalAmount',
            width: 140,
            render: (value?: number) => formatNumber(value, 2),
        },
        {
            title: '最近计量时间',
            dataIndex: 'latestRecordedAt',
            width: 180,
            render: (value?: string) => formatDateTime(value),
        },
    ];

    const handleSearch = () => {
        const values = form.getFieldsValue();
        setQuery(buildDateQuery(values.range));
    };

    const handleReset = () => {
        const range = defaultRange();
        form.resetFields();
        form.setFieldsValue({ range });
        setQuery(buildDateQuery(range));
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            const result = await refreshBilling();
            message.success(`计量刷新完成，已更新 ${result.refreshedOrderCount || 0} 个订单`);
            setQuery((prev) => ({ ...prev }));
        } finally {
            setRefreshing(false);
        }
    };

    return (
        <PageContainer
            title="计量计费"
            layout="fluid"
            extra={
                <Space size={UI_CONFIG.spacing.buttonGapNum}>
                    <Button onClick={() => navigate('/console/billing/usage')}>查看使用明细</Button>
                    <Button type="primary" loading={refreshing} onClick={handleRefresh}>
                        刷新计量
                    </Button>
                </Space>
            }
            loading={loading}
        >
            <div
                className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.searchAreaPadding} ${UI_CONFIG.block.searchAreaShadow} ${UI_CONFIG.spacing.searchToContent}`}
            >
                <Form form={form} className="flex flex-wrap items-center gap-3">
                    <Form.Item name="range" style={{ margin: 0 }}>
                        <RangePicker allowClear={false} style={rangePickerStyle} />
                    </Form.Item>
                    <Form.Item style={{ margin: 0 }}>
                        <Space size={UI_CONFIG.spacing.buttonGapNum}>
                            <Button className="search-bar-btn" type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
                                查询
                            </Button>
                            <Button className="search-bar-btn" icon={<ReloadOutlined />} onClick={handleReset}>
                                重置
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding} ${UI_CONFIG.spacing.searchToContent}`}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.map((item) => (
                        <div
                            key={item.key}
                            className={`relative overflow-hidden rounded-xl border px-5 py-5 shadow-sm ${item.panelClass}`}
                        >
                            <div className={`absolute inset-x-0 top-0 h-1 ${item.marker}`} />
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                        <span className={`h-2 w-2 rounded-full ${item.marker}`} />
                                        <span>{item.title}</span>
                                    </div>
                                    <div className="mt-4 text-[30px] font-semibold leading-none tracking-tight text-slate-900">
                                        {item.value}
                                    </div>
                                    <div className="mt-3 text-xs leading-5 text-slate-500">{item.note}</div>
                                </div>
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${item.accent}`}
                                >
                                    {item.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding} ${UI_CONFIG.spacing.searchToContent}`}>
                <div className="mb-4">
                    <div className="text-base font-semibold text-slate-900">计量趋势</div>
                    <div className="mt-1 text-sm text-slate-500">按天查看当前筛选范围内的使用量与金额趋势</div>
                </div>
                {statistics.length === 0 ? (
                    <Empty description="暂无趋势数据" />
                ) : (
                    <Table
                        rowKey={(record) => record.statDate}
                        columns={statisticColumns}
                        dataSource={statistics}
                        pagination={false}
                        tableLayout="fixed"
                    />
                )}
            </div>

            <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding}`}>
                <div className="mb-4">
                    <div className="text-base font-semibold text-slate-900">订单计量摘要</div>
                    <div className="mt-1 text-sm text-slate-500">展示最近形成计量记录的订单累计用量和金额</div>
                </div>
                {orderSummaries.length === 0 ? (
                    <Empty description="暂无订单计量摘要" />
                ) : (
                    <Table
                        rowKey={(record) => record.orderId}
                        columns={orderSummaryColumns}
                        dataSource={orderSummaries}
                        pagination={false}
                        tableLayout="fixed"
                        scroll={{ x: 1280 }}
                    />
                )}
            </div>
        </PageContainer>
    );
};

export default BillingPage;
