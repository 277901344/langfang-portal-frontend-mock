import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Col, Empty, Input, message, Modal, Pagination, Row, Select, Space, Tag, Typography } from 'antd';
import {
    AppstoreOutlined,
    ClockCircleOutlined,
    FileTextFilled,
    HistoryOutlined,
    PlusOutlined,
    SettingOutlined,
    TransactionOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { CSSProperties } from 'react';

import { CardActions } from '@/shared/components/CardActions';
import { CommonCard } from '@/shared/components/CommonCard';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { useUserStore } from '@/store/useUserStore';
import { formatCommodityTypeLabel, formatPricingModelLabel } from '@/shared/utils/tradingLabels';
import {
    deleteCommodityManagementItem,
    listCommodityManagementItems,
    publishCommodityManagementItem,
    unpublishCommodityManagementItem,
} from '../services/commodityManagement';
import type { CommodityStatus, CommodityManagementListItem } from '../types/api';
import '../styles';

const { Paragraph, Text } = Typography;

const STATUS_OPTIONS: Array<{ value: CommodityStatus; label: string }> = [
    { value: 0, label: '待完善' },
    { value: 1, label: '待审核（未上架）' },
    { value: 2, label: '审核通过' },
    { value: 3, label: '已驳回' },
    { value: 4, label: '已上架' },
    { value: 5, label: '已下架' },
];

const statusConfig = (status: CommodityStatus) => {
    const map: Record<CommodityStatus, { text: string; color: string; badge: 'default' | 'processing' | 'success' | 'warning' | 'error' }> = {
        0: { text: '待完善', color: 'default', badge: 'default' },
        1: { text: '待审核（未上架）', color: 'processing', badge: 'processing' },
        2: { text: '审核通过', color: 'success', badge: 'success' },
        3: { text: '已驳回', color: 'error', badge: 'error' },
        4: { text: '已上架', color: 'green', badge: 'success' },
        5: { text: '已下架', color: 'orange', badge: 'warning' },
    };
    return map[status] || map[0];
};

const formatMoney = (value?: number) => {
    if (value === undefined || value === null) {
        return '未定价';
    }
    return Number(value).toFixed(2);
};

const formatCommodityPrice = (item: CommodityManagementListItem) => {
    if ((item.pricingModel || 'FREE') === 'FREE') {
        return '免费';
    }
    const suffix = item.pricingModel === 'MONTHLY' ? '/月' : item.pricingModel === 'PER_CALL' ? '/次' : '';
    return `${formatMoney(item.discountPrice ?? item.price)}${suffix}`;
};

const formatDate = (value?: string) => {
    if (!value) {
        return '暂无时间';
    }
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '暂无时间';
};

const getPaymentMethodLabel = (value?: number) => (value === 0 ? '线下支付' : '线上支付');

const ADMIN_STATUS_OPTIONS = STATUS_OPTIONS.filter((option) => option.value !== 0);

const CommodityManagementPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<CommodityManagementListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<CommodityStatus | undefined>();
    const [pageNum, setPageNum] = useState(1);
    const [pageSize, setPageSize] = useState(UI_CONFIG.pagination.gridPageSize);
    const [operatingKey, setOperatingKey] = useState('');
    const roleCodes = useUserStore((state) => state.roleCodes);
    const userInfo = useUserStore((state) => state.userInfo);
    const hasAdminRole = roleCodes.includes('SUPER_ADMIN') || roleCodes.includes('ADMIN');
    const canManageOwnCommodity = !hasAdminRole || userInfo?.accountType === 2;
    const statusSelectStyle: CSSProperties = { ['--ui-input-width' as any]: '180px' };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const result = await listCommodityManagementItems({
                keyword: keyword || undefined,
                status,
                pageNum,
                pageSize,
            });
            setItems(result.data || []);
            setTotal(result.dataCount || 0);
        } catch {
            message.error('获取商品列表失败');
        } finally {
            setLoading(false);
        }
    }, [keyword, pageNum, pageSize, status]);

    useEffect(() => {
        void fetchData();
    }, [fetchData]);

    const handleReset = () => {
        setKeyword('');
        setStatus(undefined);
        setPageNum(1);
    };

    const handlePublish = (commodityId: string) => {
        Modal.confirm({
            title: '确定提交该商品审核吗？',
            content: '提交后商品会进入“待审核（未上架）”状态，管理员审核通过后才会出现在数据市场。',
            onOk: async () => {
                setOperatingKey(`publish:${commodityId}`);
                try {
                    await publishCommodityManagementItem(commodityId);
                    message.success('商品已提交审核，审核通过后才会出现在数据市场');
                    await fetchData();
                } finally {
                    setOperatingKey('');
                }
            },
        });
    };

    const handleUnpublish = (commodityId: string) => {
        Modal.confirm({
            title: '确定下架该商品吗？',
            onOk: async () => {
                setOperatingKey(`unpublish:${commodityId}`);
                try {
                    await unpublishCommodityManagementItem(commodityId);
                    message.success('商品已下架');
                    await fetchData();
                } finally {
                    setOperatingKey('');
                }
            },
        });
    };

    const handleDelete = (commodityId: string) => {
        Modal.confirm({
            title: '确定删除该商品吗？',
            okType: 'danger',
            onOk: async () => {
                setOperatingKey(`delete:${commodityId}`);
                try {
                    await deleteCommodityManagementItem(commodityId);
                    message.success('商品已删除');
                    await fetchData();
                } finally {
                    setOperatingKey('');
                }
            },
        });
    };

    const renderCard = (item: CommodityManagementListItem) => {
        const cfg = statusConfig(item.status);
        const isPublished = item.status === 4;
        const isReviewing = item.status === 1;
        const isOwnCommodity = canManageOwnCommodity && Number(item.userId) === Number(userInfo?.id);
        const currentOperating = operatingKey.endsWith(`:${item.commodityId}`);
        return (
            <CommonCard
                className="h-full group variant-standard commodity-card"
                padding={12}
                title={
                    <div className="flex flex-col overflow-hidden">
                        <div className="flex items-center gap-2">
                            <FileTextFilled className="shrink-0 text-blue-600 transition-transform group-hover:scale-110" />
                            <Text strong className="truncate text-[15px] text-gray-800">
                                {item.commodityName}
                            </Text>
                        </div>
                        <div className="mt-1 flex items-center gap-1 overflow-hidden rounded border border-slate-100 bg-slate-50 px-1.5 py-0.5">
                            <Text type="secondary" style={{ fontSize: 12 }} className="shrink-0 opacity-70">
                                商品标识:
                            </Text>
                            <Text type="secondary" style={{ fontSize: 12 }} className="min-w-0 flex-1 truncate font-mono opacity-80">
                                {item.commodityId}
                            </Text>
                        </div>
                    </div>
                }
                status={
                    <Tag bordered={false} color={cfg.color} className="m-0 flex items-center rounded-full px-2 py-0">
                        <Badge status={cfg.badge} className="mr-1 scale-75" />
                        <span className="font-semibold" style={{ fontSize: 12 }}>{cfg.text}</span>
                    </Tag>
                }
                footer={
                    <div className="flex w-full items-center justify-between" onClick={(event) => event.stopPropagation()}>
                        <div className="flex shrink-0 items-center gap-1 text-gray-400">
                            <ClockCircleOutlined style={{ fontSize: 12 }} className="opacity-60" />
                            <span style={{ fontSize: 12 }} className="font-medium opacity-80">
                                {formatDate(item.createdAt)}
                            </span>
                        </div>
                        <CardActions
                            actions={[
                                {
                                    key: 'edit',
                                    label: '编辑',
                                    show: isOwnCommodity && !isReviewing && !isPublished,
                                    disabled: Boolean(operatingKey),
                                    onClick: () => navigate(`/console/commodity-management/edit/${item.commodityId}`),
                                },
                                {
                                    key: 'publish',
                                    label: '提交审核',
                                    show: isOwnCommodity && !isReviewing && !isPublished,
                                    loading: operatingKey === `publish:${item.commodityId}`,
                                    disabled: Boolean(operatingKey) && !currentOperating,
                                    onClick: () => handlePublish(item.commodityId),
                                },
                                {
                                    key: 'view',
                                    label: '查看详情',
                                    disabled: Boolean(operatingKey),
                                    onClick: () => navigate(`/console/commodity-management/view/${item.commodityId}`),
                                },
                                {
                                    key: 'unpublish',
                                    label: '下架',
                                    show: isOwnCommodity && isPublished,
                                    danger: true,
                                    loading: operatingKey === `unpublish:${item.commodityId}`,
                                    disabled: Boolean(operatingKey) && !currentOperating,
                                    onClick: () => handleUnpublish(item.commodityId),
                                },
                                {
                                    key: 'delete',
                                    label: '删除',
                                    show: isOwnCommodity && !isReviewing && !isPublished,
                                    danger: true,
                                    loading: operatingKey === `delete:${item.commodityId}`,
                                    disabled: Boolean(operatingKey) && !currentOperating,
                                    onClick: () => handleDelete(item.commodityId),
                                },
                            ]}
                        />
                    </div>
                }
            >
                <div className="space-y-3.5">
                    <Paragraph style={{ fontSize: 12 }} className="mb-0 min-h-[36px] text-gray-500 line-clamp-2">
                        {item.description || '该商品暂无详细描述'}
                    </Paragraph>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                        <div className="flex flex-col overflow-hidden">
                            <Text style={{ fontSize: 12 }} className="mb-0.5 text-slate-400">定价模式</Text>
                            <div className="text-[12px] font-bold text-slate-700">
                                {formatPricingModelLabel(item.pricingModel || 'FREE')}
                            </div>
                            <div className="mt-0.5 text-[12px] font-bold text-slate-700">{formatCommodityPrice(item)}</div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <Text style={{ fontSize: 12 }} className="mb-0.5 text-slate-400">商品类型</Text>
                            <div className="flex items-center text-[12px] font-bold text-slate-700">
                                <div className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-emerald-50">
                                    <AppstoreOutlined className="text-emerald-600" style={{ fontSize: 12 }} />
                                </div>
                                <span className="truncate">{formatCommodityTypeLabel(item.commodityType)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <Text style={{ fontSize: 12 }} className="mb-0.5 text-slate-400">支付方式</Text>
                            <div className="flex items-center text-[12px] font-bold text-slate-700">
                                <div className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-50">
                                    <TransactionOutlined className="text-blue-600" style={{ fontSize: 12 }} />
                                </div>
                                <span className="truncate">{getPaymentMethodLabel(item.deliveryMethod)}</span>
                            </div>
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <Text style={{ fontSize: 12 }} className="mb-0.5 text-slate-400">有效期</Text>
                            <div className="flex items-center text-[12px] font-bold text-slate-700">
                                <div className="mr-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-indigo-50">
                                    <HistoryOutlined className="text-indigo-600" style={{ fontSize: 12 }} />
                                </div>
                                <span className="truncate">{item.expiredTime ? formatDate(item.expiredTime) : '永久'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </CommonCard>
        );
    };

    return (
        <PageContainer
            title="商品管理"
            flexLayout
            extra={
                canManageOwnCommodity ? <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => navigate('/console/commodity-management/create')}
                    className="h-9 rounded-lg bg-[#f59e0b] px-4 font-bold shadow-sm hover:bg-[#d97706]"
                >
                    新建商品
                </Button> : undefined
            }
        >
            <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.searchAreaShadow} ${UI_CONFIG.block.searchAreaPadding} mb-5 flex shrink-0 flex-wrap items-center gap-3 border border-slate-100`}>
                <Input
                    placeholder="商品名称 / 商品编码 / 产品名称 / 产品编码"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onPressEnter={() => {
                        setPageNum(1);
                        void fetchData();
                    }}
                    allowClear
                    className="search-bar-input"
                    style={{ ['--custom-width' as any]: `320px` }}
                />
                <Select
                    placeholder="全部状态"
                    value={status}
                    onChange={setStatus}
                    allowClear
                    options={hasAdminRole && !canManageOwnCommodity ? ADMIN_STATUS_OPTIONS : STATUS_OPTIONS}
                    className="search-bar-select"
                    style={statusSelectStyle}
                />
                <Space className={UI_CONFIG.spacing.buttonGap}>
                    <Button
                        type="primary"
                        className="search-bar-btn"
                        onClick={() => {
                            setPageNum(1);
                            void fetchData();
                        }}
                    >
                        搜索
                    </Button>
                    <Button className="search-bar-btn" icon={<SettingOutlined />} onClick={handleReset}>
                        重置
                    </Button>
                </Space>
            </div>

            <div className={`flex-1 overflow-y-auto custom-scrollbar ${loading ? 'pointer-events-none opacity-60' : ''} ${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding}`}>
                {items.length === 0 && !loading ? (
                    <div className="rounded-xl border border-dashed border-gray-200 bg-white py-12 text-center">
                        <Empty description="暂无商品" />
                    </div>
                ) : (
                    <>
                        <Row gutter={[UI_CONFIG.spacing.cardGap, UI_CONFIG.spacing.cardGap]}>
                            {items.map((item) => (
                                <Col key={item.commodityId} xs={24} sm={12} md={8} lg={8} xl={8}>
                                    {renderCard(item)}
                                </Col>
                            ))}
                        </Row>
                        <div className="mt-4 flex justify-end">
                            <Pagination
                                current={pageNum}
                                pageSize={pageSize}
                                total={total}
                                onChange={(nextPage, nextPageSize) => {
                                    setPageNum(nextPage);
                                    if (nextPageSize !== pageSize) {
                                        setPageSize(nextPageSize);
                                    }
                                }}
                                showSizeChanger
                                pageSizeOptions={['12', '24', '36', '48']}
                                showTotal={(count) => `共 ${count} 个商品`}
                                size="small"
                            />
                        </div>
                    </>
                )}
            </div>
        </PageContainer>
    );
};

export default CommodityManagementPage;
