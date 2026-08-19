import React, { useEffect, useState } from 'react';
import { Button, Empty, Form, Input, Pagination, Select, Space, Table, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import {
    formatCommodityTypeLabel,
    getTradeOrderStatusMeta,
    TRADE_ORDER_STATUS_FILTER_OPTIONS,
} from '@/shared/utils/tradingLabels';
import { useUserStore } from '@/store/useUserStore';
import * as orderService from '../services/order';
import type { TradeOrderListItem, TradeOrderListQueryRequest } from '../types/api';

const SOURCE_TYPE_OPTIONS = [
    { label: '需求接受', value: 'DEMAND_ACCEPT' },
    { label: '市场直购', value: 'MARKETPLACE_QUICK_ORDER' },
];

const ORDER_ROLE_OPTIONS = [
    { label: '采购订单', value: 'PURCHASE' },
    { label: '销售订单', value: 'SALE' },
];

const formatSourceType = (sourceType?: string) => {
    if (sourceType === 'DEMAND_ACCEPT') {
        return '需求接受';
    }
    if (sourceType === 'MARKETPLACE_QUICK_ORDER') {
        return '市场直购';
    }
    return sourceType || '-';
};

const formatAmount = (value?: number) => {
    return value == null ? '-' : Number(value).toFixed(2);
};

const nowrapCell = (value?: React.ReactNode) => (
    <span className="block truncate whitespace-nowrap">{value === undefined || value === null || value === '' ? '-' : value}</span>
);

const ORDER_ROLE_BADGE = {
    PURCHASE: { text: '我采购', color: 'blue' },
    SALE: { text: '我销售', color: 'orange' },
} as const;

const withNoWrapCells = (columns: ColumnsType<TradeOrderListItem>): ColumnsType<TradeOrderListItem> => columns.map((column) => {
    const baseColumn = column as any;
    return {
        ...column,
        onCell: (record: TradeOrderListItem, rowIndex?: number) => {
            const cellProps = typeof baseColumn.onCell === 'function' ? baseColumn.onCell(record, rowIndex) : {};
            return {
                ...cellProps,
                style: {
                    ...cellProps?.style,
                    whiteSpace: 'nowrap',
                },
            };
        },
        onHeaderCell: (col: any) => {
            const headerProps = typeof baseColumn.onHeaderCell === 'function' ? baseColumn.onHeaderCell(col) : {};
            return {
                ...headerProps,
                style: {
                    ...headerProps?.style,
                    whiteSpace: 'nowrap',
                },
            };
        },
    };
});

const TradeOrderPage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const roleCodes = useUserStore((state) => state.roleCodes);
    const userInfo = useUserStore((state) => state.userInfo);
    const isAdmin = roleCodes.includes('SUPER_ADMIN') || roleCodes.includes('ADMIN');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<TradeOrderListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState<TradeOrderListQueryRequest>({
        pageNum: 1,
        pageSize: UI_CONFIG.pagination.tablePageSize,
    });

    const fetchOrders = async (nextQuery: TradeOrderListQueryRequest) => {
        setLoading(true);
        try {
            const result = await orderService.listOrders(nextQuery);
            setOrders(result.data || []);
            setTotal(result.dataCount || 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(query);
    }, [query]);

    const handleSearch = () => {
        const values = form.getFieldsValue();
        setQuery((prev) => ({
            ...prev,
            ...values,
            pageNum: 1,
        }));
    };

    const handleReset = () => {
        form.resetFields();
        setQuery({
            pageNum: 1,
            pageSize: UI_CONFIG.pagination.tablePageSize,
        });
    };

    const sourceType = query.sourceType;
    const useMarketplaceColumns = sourceType === 'MARKETPLACE_QUICK_ORDER';
    const isSaleOrderView = !isAdmin && query.orderRole === 'SALE';
    const detailQuery = isAdmin ? '' : (query.orderRole ? `?orderRole=${query.orderRole}` : '');
    const detailState = isAdmin ? { sourceType: query.sourceType } : { orderRole: query.orderRole, sourceType: query.sourceType };
    const keywordPlaceholder = useMarketplaceColumns
        ? '订单编码、商品名称'
        : '订单编号、商品/产品名称、需求标题';
    const compactSelectStyle: CSSProperties = { ['--ui-input-width' as any]: '140px' };
    const compactStatusSelectStyle: CSSProperties = { ['--ui-input-width' as any]: '148px' };
    const currentUserId = userInfo?.id ? Number(userInfo.id) : null;
    const resolveOrderRole = (record: TradeOrderListItem) => {
        if (currentUserId != null) {
            if (record.buyerId != null && Number(record.buyerId) === currentUserId) {
                return 'PURCHASE' as const;
            }
            if (record.sellerId != null && Number(record.sellerId) === currentUserId) {
                return 'SALE' as const;
            }
        }
        if (query.orderRole === 'SALE') {
            return 'SALE' as const;
        }
        if (query.orderRole === 'PURCHASE') {
            return 'PURCHASE' as const;
        }
        return undefined;
    };
    const renderOrderRoleTag = (record: TradeOrderListItem) => {
        const role = resolveOrderRole(record);
        if (!role) {
            return <Tag bordered={false}>-</Tag>;
        }
        const badge = ORDER_ROLE_BADGE[role];
        return <Tag bordered={false} color={badge.color}>{badge.text}</Tag>;
    };
    const renderCounterparty = (record: TradeOrderListItem) => {
        const role = resolveOrderRole(record);
        if (role === 'SALE') {
            return record.buyerSubjectName || record.buyerName || record.buyerUserIdentityCode || '-';
        }
        return record.sellerSubjectName || record.sellerName || record.sellerUserIdentityCode || '-';
    };
    const buildOrderDetailPath = (record: TradeOrderListItem) => `/console/trade-order/${record.id}${detailQuery}`;
    const openOrderDetail = (record: TradeOrderListItem) => {
        navigate(buildOrderDetailPath(record), { state: detailState });
    };
    const renderOrderNoLink = (record: TradeOrderListItem) => (
        <Button
            type="link"
            onClick={() => openOrderDetail(record)}
            className="whitespace-nowrap"
            style={{ padding: 0 }}
        >
            {record.orderNo}
        </Button>
    );
    const renderTradeTarget = (record: TradeOrderListItem) => {
        const title = record.commodityName || record.orderTitle || record.productId || record.commodityId || record.demandNo || '-';
        const sourceLabel = record.sourceType === 'MARKETPLACE_QUICK_ORDER'
            ? `商品${record.commodityType ? ` · ${formatCommodityTypeLabel(record.commodityType)}` : ''}`
            : `需求${record.demandNo ? ` · ${record.demandNo}` : ''}`;
        const amount = record.estimatedAmount ?? record.unitPrice;
        const amountText = amount == null ? undefined : `金额 ${formatAmount(amount)}`;
        const quantityText = record.quantity == null ? undefined : `数量 ${record.quantity}`;
        const extra = [sourceLabel, quantityText, amountText].filter(Boolean).join(' / ');

        return (
            <button
                type="button"
                onClick={() => openOrderDetail(record)}
                className="block max-w-full cursor-pointer border-0 bg-transparent p-0 text-left"
                style={{ whiteSpace: 'normal' }}
            >
                <span className="block truncate text-sm font-medium text-slate-900">{title}</span>
                <span className="mt-1 block truncate text-xs text-slate-400">{extra || '-'}</span>
            </button>
        );
    };
    const getNextStepText = (record: TradeOrderListItem) => {
        const role = resolveOrderRole(record);
        const isOperator = isAdmin || role === 'PURCHASE';

        if (record.status === 'PENDING') {
            return isOperator ? '待确认订单' : '等待买方确认订单';
        }
        if (record.status === 'CONFIRMED') {
            return isOperator ? '待完成后扣费' : '等待买方完成';
        }
        if (record.status === 'COMPLETED') {
            return '订单已完成';
        }
        if (record.status === 'CANCELLED') {
            return '订单已取消，无需处理';
        }
        return '查看详情确认下一步';
    };
    const getNextStepActionText = (record: TradeOrderListItem) => {
        const role = resolveOrderRole(record);
        const isOperator = isAdmin || role === 'PURCHASE';
        if ((record.status === 'PENDING' || record.status === 'CONFIRMED') && isOperator) {
            return '去处理';
        }
        return '查看详情';
    };
    const renderNextStep = (record: TradeOrderListItem) => (
        <div className="flex items-center gap-2" style={{ whiteSpace: 'normal' }}>
            <span className="text-sm text-slate-700">{getNextStepText(record)}</span>
            <Button type="link" size="small" onClick={() => openOrderDetail(record)} style={{ padding: 0 }}>
                {getNextStepActionText(record)}
            </Button>
        </div>
    );
    const defaultColumns: ColumnsType<TradeOrderListItem> = [
        {
            title: '订单编号',
            dataIndex: 'orderNo',
            width: 170,
            render: (_, record) => renderOrderNoLink(record),
        },
        {
            title: '来源',
            dataIndex: 'sourceType',
            width: 120,
            render: (value: string) => formatSourceType(value),
        },
        ...(!isAdmin ? [{
            title: '我的角色',
            key: 'orderRoleTag',
            width: 110,
            render: (_: unknown, record: TradeOrderListItem) => renderOrderRoleTag(record),
        }] as ColumnsType<TradeOrderListItem> : []),
        {
            title: '交易内容',
            dataIndex: 'orderTitle',
            width: 300,
            render: (_: string | undefined, record: TradeOrderListItem) => renderTradeTarget(record),
        },
        ...(!isAdmin ? [{
            title: '交易对方',
            key: 'counterparty',
            width: 180,
            render: (_: unknown, record: TradeOrderListItem) => nowrapCell(renderCounterparty(record)),
            onHeaderCell: () => ({ title: '根据当前登录人自动区分需求方 / 提供方' }),
        }] as ColumnsType<TradeOrderListItem> : [
            {
                title: '买方',
                dataIndex: 'buyerName',
                width: 140,
                render: (value?: string) => value || '-',
            },
            {
                title: '卖方',
                dataIndex: 'sellerName',
                width: 140,
                render: (value?: string) => value || '-',
            },
        ]),
        {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: (value: string) => {
                const status = getTradeOrderStatusMeta(value);
                return <Tag color={status.color}>{status.text}</Tag>;
            },
        },
        {
            title: '待办提示',
            key: 'nextStep',
            width: 210,
            render: (_: unknown, record: TradeOrderListItem) => renderNextStep(record),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 180,
            render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
        },
    ];

    const marketplaceColumns: ColumnsType<TradeOrderListItem> = [
        {
            title: '订单编号',
            dataIndex: 'orderNo',
            width: 170,
            render: (_, record) => renderOrderNoLink(record),
        },
        {
            title: '交易内容',
            dataIndex: 'commodityName',
            width: 240,
            render: (_: string | undefined, record: TradeOrderListItem) => renderTradeTarget(record),
        },
        ...(!isAdmin ? [{
            title: '我的角色',
            key: 'orderRoleTag',
            width: 96,
            render: (_: unknown, record: TradeOrderListItem) => renderOrderRoleTag(record),
        }] as ColumnsType<TradeOrderListItem> : []),
        {
            title: '商品类型',
            dataIndex: 'commodityType',
            width: 90,
            render: (value?: string) => nowrapCell(formatCommodityTypeLabel(value)),
        },
        {
            title: !isAdmin ? '交易对方' : (isSaleOrderView ? '数据需求方' : '数据提供方'),
            dataIndex: !isAdmin ? undefined : (isSaleOrderView ? 'buyerSubjectName' : 'sellerSubjectName'),
            width: 150,
            ellipsis: true,
            render: (value: string | undefined, record: TradeOrderListItem) => nowrapCell(
                !isAdmin
                    ? renderCounterparty(record)
                    : (value
                        || (isSaleOrderView ? record.buyerName : record.sellerName)
                        || (isSaleOrderView ? record.buyerUserIdentityCode : record.sellerUserIdentityCode))
            ),
        },
        ...(isAdmin && !isSaleOrderView ? [{
            title: '数据需求方',
            dataIndex: 'buyerSubjectName',
            width: 130,
            ellipsis: true,
            render: (value: string | undefined, record: TradeOrderListItem) => nowrapCell(value || record.buyerName || record.buyerUserIdentityCode),
        }] as ColumnsType<TradeOrderListItem> : []),
        {
            title: '单价',
            dataIndex: 'unitPrice',
            width: 96,
            align: 'right',
            render: (value?: number) => nowrapCell(formatAmount(value)),
        },
        {
            title: '数量',
            dataIndex: 'quantity',
            width: 72,
            align: 'right',
            render: (value?: number) => nowrapCell(value ?? '-'),
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 96,
            render: (value: string) => {
                const status = getTradeOrderStatusMeta(value);
                return <Tag color={status.color} className="whitespace-nowrap">{status.text}</Tag>;
            },
        },
        {
            title: '待办提示',
            key: 'nextStep',
            width: 200,
            render: (_: unknown, record: TradeOrderListItem) => renderNextStep(record),
        },
        {
            title: '创建时间',
            dataIndex: 'createdAt',
            width: 160,
            render: (value: string) => nowrapCell(value ? dayjs(value).format('YYYY-MM-DD HH:mm') : '-'),
        },
    ];

    const columns = withNoWrapCells(useMarketplaceColumns ? marketplaceColumns : defaultColumns);

    return (
        <PageContainer title="交易订单" layout="fluid">
            <div
                className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.searchAreaPadding} ${UI_CONFIG.block.searchAreaShadow} ${UI_CONFIG.spacing.searchToContent}`}
            >
                <Form form={form} className="flex flex-wrap items-center gap-3">
                    <Form.Item name="keyword" style={{ margin: 0 }}>
                        <Input
                            allowClear
                            placeholder={keywordPlaceholder}
                            className="search-bar-input"
                            style={{ ['--custom-width' as any]: `${UI_CONFIG.input.inputWidth}px` }}
                        />
                    </Form.Item>
                    <Form.Item name="sourceType" initialValue={query.sourceType} style={{ margin: 0 }}>
                        <Select
                            placeholder="来源"
                            className="search-bar-select"
                            style={compactSelectStyle}
                            options={SOURCE_TYPE_OPTIONS}
                        />
                    </Form.Item>
                    {!isAdmin && (
                        <Form.Item name="orderRole" style={{ margin: 0 }}>
                            <Select
                                placeholder="订单类型"
                                className="search-bar-select"
                                style={compactSelectStyle}
                                options={ORDER_ROLE_OPTIONS}
                            />
                        </Form.Item>
                    )}
                    <Form.Item name="status" style={{ margin: 0 }}>
                        <Select
                            allowClear
                            placeholder="全部状态"
                            className="search-bar-select"
                            style={compactStatusSelectStyle}
                            options={TRADE_ORDER_STATUS_FILTER_OPTIONS}
                        />
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

            <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding}`}>
                {orders.length === 0 && !loading ? (
                    <Empty description="暂无订单" />
                ) : (
                    <>
                        <Table
                            rowKey="id"
                            loading={loading}
                            columns={columns}
                            dataSource={orders}
                            pagination={false}
                            tableLayout={useMarketplaceColumns ? 'fixed' : undefined}
                        />
                        <div className="mt-4 flex justify-end" style={{ marginTop: UI_CONFIG.spacing.tableToPaginationNum }}>
                            <Pagination
                                current={query.pageNum}
                                pageSize={query.pageSize}
                                total={total}
                                showSizeChanger
                                showTotal={(count) => `共 ${count} 条订单`}
                                onChange={(page, pageSize) =>
                                    setQuery((prev) => ({
                                        ...prev,
                                        pageNum: page,
                                        pageSize,
                                    }))
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
};

export default TradeOrderPage;
