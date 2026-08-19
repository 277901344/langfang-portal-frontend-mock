import React, { useEffect, useState } from 'react';
import { Button, DatePicker, Empty, Form, Input, Pagination, Select, Space, Table } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import type { ColumnsType } from 'antd/es/table';
import { useNavigate } from 'react-router-dom';
import type { CSSProperties } from 'react';

import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { listUsageRecords } from '../services/billing';
import type { BillingUsageItem, BillingUsageListQueryRequest } from '../types/api';

const { RangePicker } = DatePicker;

const USAGE_TYPE_OPTIONS = [
    { label: '全部类型', value: '' },
    { label: '调用量', value: 'API_CALL' },
    { label: '下载量', value: 'DOWNLOAD' },
    { label: '传输量', value: 'TRANSFER' },
];

const formatAmount = (value?: number, scale = 2) => Number(value || 0).toFixed(scale);

const defaultRange = (): [Dayjs, Dayjs] => [dayjs().subtract(6, 'day'), dayjs()];

const buildDateQuery = (range?: [Dayjs, Dayjs] | null) => ({
    startDate: range?.[0]?.format('YYYY-MM-DD'),
    endDate: range?.[1]?.format('YYYY-MM-DD'),
});

const UsagePage: React.FC = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<BillingUsageItem[]>([]);
    const [total, setTotal] = useState(0);
    const [query, setQuery] = useState<BillingUsageListQueryRequest>({
        pageNum: 1,
        pageSize: UI_CONFIG.pagination.tablePageSize,
        ...buildDateQuery(defaultRange()),
    });
    const usageTypeStyle: CSSProperties = { ['--ui-input-width' as any]: '160px' };
    const rangePickerStyle: CSSProperties = { width: 260 };

    useEffect(() => {
        form.setFieldsValue({ range: defaultRange() });
    }, [form]);

    useEffect(() => {
        const fetchRows = async () => {
            setLoading(true);
            try {
                const result = await listUsageRecords(query);
                setRows(result.data || []);
                setTotal(result.dataCount || 0);
            } finally {
                setLoading(false);
            }
        };
        fetchRows();
    }, [query]);

    const handleSearch = () => {
        const values = form.getFieldsValue();
        setQuery((prev) => ({
            ...prev,
            keyword: values.keyword,
            connectorId: values.connectorId,
            usageType: values.usageType,
            ...buildDateQuery(values.range),
            pageNum: 1,
        }));
    };

    const handleReset = () => {
        const range = defaultRange();
        form.resetFields();
        form.setFieldsValue({ range });
        setQuery({
            pageNum: 1,
            pageSize: UI_CONFIG.pagination.tablePageSize,
            ...buildDateQuery(range),
        });
    };

    const columns: ColumnsType<BillingUsageItem> = [
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
            title: '连接器',
            dataIndex: 'connectorId',
            width: 160,
            render: (value?: string) => value || '-',
        },
        {
            title: '使用类型',
            dataIndex: 'usageType',
            width: 120,
            render: (value?: string) => value || '-',
        },
        {
            title: '原始使用量',
            dataIndex: 'usageValue',
            width: 140,
            render: (value?: number) => formatAmount(value, 4),
        },
        {
            title: '计费用量',
            dataIndex: 'billableUsage',
            width: 140,
            render: (value?: number) => formatAmount(value, 4),
        },
        {
            title: '金额',
            dataIndex: 'amount',
            width: 120,
            render: (value?: number) => formatAmount(value),
        },
        {
            title: '传输编号',
            dataIndex: 'transferId',
            width: 180,
            render: (value?: string) => value || '-',
        },
        {
            title: '记录时间',
            dataIndex: 'recordedAt',
            width: 180,
            render: (value?: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
    ];

    return (
        <PageContainer
            title="使用明细"
            layout="fluid"
            onBack={() => navigate('/console/billing')}
        >
            <div
                className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.searchAreaPadding} ${UI_CONFIG.block.searchAreaShadow} ${UI_CONFIG.spacing.searchToContent}`}
            >
                <Form form={form} className="flex flex-wrap items-center gap-3">
                    <Form.Item name="keyword" style={{ margin: 0 }}>
                        <Input
                            allowClear
                            placeholder="订单编号 / 合约编号 / 商品 / 传输编号"
                            className="search-bar-input"
                            style={{ ['--custom-width' as any]: `${UI_CONFIG.input.inputWidth}px` }}
                        />
                    </Form.Item>
                    <Form.Item name="connectorId" style={{ margin: 0 }}>
                        <Input
                            allowClear
                            placeholder="连接器编号"
                            className="search-bar-input"
                            style={{ ['--custom-width' as any]: `${UI_CONFIG.input.inputWidth}px` }}
                        />
                    </Form.Item>
                    <Form.Item name="usageType" style={{ margin: 0 }}>
                        <Select
                            allowClear
                            options={USAGE_TYPE_OPTIONS}
                            placeholder="使用类型"
                            className="search-bar-select"
                            style={usageTypeStyle}
                        />
                    </Form.Item>
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

            <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding}`}>
                {rows.length === 0 && !loading ? (
                    <Empty description="暂无使用记录" />
                ) : (
                    <>
                        <Table
                            rowKey="id"
                            loading={loading}
                            columns={columns}
                            dataSource={rows}
                            pagination={false}
                            tableLayout="fixed"
                            scroll={{ x: 1560 }}
                        />
                        <div className="mt-4 flex justify-end" style={{ marginTop: UI_CONFIG.spacing.tableToPaginationNum }}>
                            <Pagination
                                current={query.pageNum}
                                pageSize={query.pageSize}
                                total={total}
                                showSizeChanger
                                showTotal={(count) => `共 ${count} 条记录`}
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

export default UsagePage;
