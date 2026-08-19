import React, { useEffect, useMemo, useState } from 'react';
import { Button, Empty, Form, Input, Pagination, Select, Space, Table } from 'antd';
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    ReloadOutlined,
    SearchOutlined,
    WalletOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { CSSProperties } from 'react';

import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { listMyFundAccounts, listMyFundFlows } from '../services/fundAccount';
import type { FundAccountItem, FundFlowItem, FundFlowQueryRequest } from '../types/api';

const ROLE_LABEL: Record<string, string> = {
    BUYER: '需求方账户',
    SELLER: '提供方账户',
};

const FLOW_TYPE_OPTIONS = [
    { label: '全部类型', value: '' },
    { label: '充值', value: 'RECHARGE' },
    { label: '扣费', value: 'DEBIT' },
    { label: '收入', value: 'INCOME' },
    { label: '充值作废', value: 'RECHARGE_VOID' },
    { label: '扣费作废', value: 'DEBIT_VOID' },
    { label: '收入冲回', value: 'INCOME_VOID' },
];

const FLOW_TYPE_LABEL: Record<string, string> = {
    RECHARGE: '充值',
    RECHARGE_VOID: '充值作废',
    DEBIT: '扣费',
    DEBIT_VOID: '扣费作废',
    INCOME: '收入',
    INCOME_VOID: '收入冲回',
};

const formatAmount = (value?: number) => Number(value || 0).toFixed(2);

const FundAccountPage: React.FC = () => {
    const [form] = Form.useForm();
    const [accounts, setAccounts] = useState<FundAccountItem[]>([]);
    const [flows, setFlows] = useState<FundFlowItem[]>([]);
    const [loadingFlows, setLoadingFlows] = useState(false);
    const [flowTotal, setFlowTotal] = useState(0);
    const [query, setQuery] = useState<FundFlowQueryRequest>({
        pageNum: 1,
        pageSize: UI_CONFIG.pagination.tablePageSize,
    });
    const flowTypeStyle: CSSProperties = { ['--ui-input-width' as any]: '160px' };

    const totals = useMemo(
        () =>
            accounts.reduce(
                (acc, item) => {
                    acc.balance += item.availableBalance || 0;
                    acc.recharge += item.totalRechargeAmount || 0;
                    acc.debit += item.totalDebitAmount || 0;
                    acc.income += item.totalIncomeAmount || 0;
                    return acc;
                },
                { balance: 0, recharge: 0, debit: 0, income: 0 }
            ),
        [accounts]
    );

    const statCards = useMemo(
        () => [
            {
                key: 'balance',
                title: '当前余额',
                value: totals.balance,
                note: '展示当前主体账户的可用虚拟余额',
                accent: 'bg-blue-50 text-blue-600',
                marker: 'bg-blue-500',
                panelClass: 'border-blue-100 bg-[linear-gradient(180deg,#ffffff_0%,#eff6ff_100%)]',
                icon: <WalletOutlined />,
            },
            {
                key: 'recharge',
                title: '累计充值',
                value: totals.recharge,
                note: '管理员充值成功后会累计到这里',
                accent: 'bg-cyan-50 text-cyan-600',
                marker: 'bg-cyan-500',
                panelClass: 'border-cyan-100 bg-[linear-gradient(180deg,#ffffff_0%,#ecfeff_100%)]',
                icon: <ArrowDownOutlined />,
            },
            {
                key: 'debit',
                title: '累计支出',
                value: totals.debit,
                note: '订单完成扣费后会计入支出累计',
                accent: 'bg-orange-50 text-orange-600',
                marker: 'bg-orange-500',
                panelClass: 'border-orange-100 bg-[linear-gradient(180deg,#ffffff_0%,#fff7ed_100%)]',
                icon: <ArrowUpOutlined />,
            },
            {
                key: 'income',
                title: '累计收入',
                value: totals.income,
                note: '提供方收入流水会同步累计展示',
                accent: 'bg-emerald-50 text-emerald-600',
                marker: 'bg-emerald-500',
                panelClass: 'border-emerald-100 bg-[linear-gradient(180deg,#ffffff_0%,#ecfdf5_100%)]',
                icon: <ArrowDownOutlined />,
            },
        ],
        [totals]
    );

    useEffect(() => {
        const loadAccounts = async () => {
            const result = await listMyFundAccounts();
            setAccounts(result.data || []);
        };
        loadAccounts();
    }, []);

    useEffect(() => {
        const loadFlows = async () => {
            setLoadingFlows(true);
            try {
                const result = await listMyFundFlows(query);
                setFlows(result.data || []);
                setFlowTotal(result.dataCount || 0);
            } finally {
                setLoadingFlows(false);
            }
        };
        loadFlows();
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

    const flowColumns: ColumnsType<FundFlowItem> = [
        {
            title: '流水号',
            dataIndex: 'flowNo',
            width: 220,
            ellipsis: true,
        },
        {
            title: '操作类型',
            dataIndex: 'flowType',
            width: 140,
            render: (value: string) => FLOW_TYPE_LABEL[value] || value || '-',
        },
        {
            title: '账户角色',
            dataIndex: 'accountRole',
            width: 140,
            render: (value: string) => ROLE_LABEL[value] || value || '-',
        },
        {
            title: '金额',
            dataIndex: 'amount',
            width: 120,
            render: (value: number) => formatAmount(value),
        },
        {
            title: '关联订单',
            dataIndex: 'orderNo',
            width: 180,
            render: (value?: string) => value || '-',
        },
        {
            title: '时间',
            dataIndex: 'createdAt',
            width: 180,
            render: (value: string) => (value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
            title: '备注',
            dataIndex: 'remark',
            ellipsis: true,
            render: (value?: string) => value || '-',
        },
    ];

    return (
        <PageContainer title="资金账户" layout="fluid">
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
                                        {formatAmount(item.value)}
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

            <div
                className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.searchAreaPadding} ${UI_CONFIG.block.searchAreaShadow} ${UI_CONFIG.spacing.searchToContent}`}
            >
                <Form form={form} className="flex flex-wrap items-center gap-3">
                    <Form.Item name="keyword" style={{ margin: 0 }}>
                        <Input
                            allowClear
                            placeholder="流水号 / 订单号"
                            className="search-bar-input"
                            style={{ ['--custom-width' as any]: `${UI_CONFIG.input.inputWidth}px` }}
                        />
                    </Form.Item>
                    <Form.Item name="flowType" style={{ margin: 0 }}>
                        <Select
                            allowClear
                            options={FLOW_TYPE_OPTIONS}
                            placeholder="全部类型"
                            className="search-bar-select"
                            style={flowTypeStyle}
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
                {flows.length === 0 && !loadingFlows ? (
                    <Empty description="暂无资金流水" />
                ) : (
                    <>
                        <Table
                            rowKey="id"
                            loading={loadingFlows}
                            columns={flowColumns}
                            dataSource={flows}
                            pagination={false}
                            tableLayout="fixed"
                            scroll={{ x: 1120 }}
                        />
                        <div className="mt-4 flex justify-end" style={{ marginTop: UI_CONFIG.spacing.tableToPaginationNum }}>
                            <Pagination
                                current={query.pageNum}
                                pageSize={query.pageSize}
                                total={flowTotal}
                                showSizeChanger
                                showTotal={(count) => `共 ${count} 条`}
                                onChange={(page, pageSize) =>
                                    setQuery((prev) => ({ ...prev, pageNum: page, pageSize }))
                                }
                            />
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
};

export default FundAccountPage;
