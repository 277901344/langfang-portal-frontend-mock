import React, { useEffect, useMemo, useState } from 'react';
import { Button, Col, Empty, Form, Input, Pagination, Popover, Row, Space, Tag } from 'antd';
import {
    CalendarOutlined,
    ClockCircleOutlined,
    MessageOutlined,
    PlusOutlined,
    SearchOutlined,
    TagsOutlined,
    UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import bannerImg from '@/modules/marketplace/banner-list.png';
import { CommonCard } from '@/shared/components/CommonCard';
import { LoginRequiredModal } from '@/shared/components/LoginRequiredModal';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import {
    DEMAND_STATUS_FILTER_OPTIONS,
    formatProductTypeLabel,
    getDemandStatusMeta,
} from '@/shared/utils/tradingLabels';
import { useTradingDictionaryStore } from '@/store/useTradingDictionaryStore';
import { useUserStore } from '@/store/useUserStore';

import * as demandService from '../services/demand';
import type { DemandListItem, DemandListQueryRequest } from '../types/api';

type DemandTypeFilter = 'all' | 'responded' | 'my' | 'canRespond';

const DEMAND_TYPE_OPTIONS: Array<{ label: string; value: DemandTypeFilter }> = [
    { label: '不限', value: 'all' },
    { label: '已有响应', value: 'responded' },
    { label: '我发布的', value: 'my' },
    { label: '可响应的', value: 'canRespond' },
];

const DEFAULT_QUERY: DemandListQueryRequest = {
    pageNum: 1,
    pageSize: UI_CONFIG.pagination.gridPageSize,
    scope: 'all',
    demandType: 'all',
};

const DEMAND_BANNER_BOTTOM_GAP = 40;
const TOPIC_COLLAPSED_HEIGHT = 114;

const TAG_CLASS =
    '!m-0 !rounded-sm !border !px-3 !py-1 !text-sm transition-colors';

function getFilterTagClass(checked: boolean): string {
    return checked
        ? `${TAG_CLASS} !border-[#1677ff] !bg-[#1677ff] !text-white`
        : `${TAG_CLASS} !border-transparent !bg-transparent !text-slate-700 hover:!text-[#1677ff]`;
}

interface FilterRowProps<T extends string> {
    label: string;
    value?: T;
    options: Array<{ label: string; value: T }>;
    showUnlimited?: boolean;
    collapsedHeight?: number;
    onChange: (nextValue: T | '') => void;
}

interface FilterTagsProps<T extends string> {
    value?: T;
    options: Array<{ label: string; value: T }>;
    showUnlimited?: boolean;
    onChange: (nextValue: T | '') => void;
}

function FilterTags<T extends string>({
    value,
    options,
    showUnlimited = true,
    onChange,
}: FilterTagsProps<T>) {
    return (
        <>
            {showUnlimited ? (
                <Tag.CheckableTag
                    checked={!value}
                    className={getFilterTagClass(!value)}
                    onChange={() => onChange('')}
                >
                    不限
                </Tag.CheckableTag>
            ) : null}
            {options.map((option) => {
                const checked = value === option.value;
                return (
                    <Tag.CheckableTag
                        key={option.value}
                        checked={checked}
                        className={getFilterTagClass(checked)}
                        onChange={() => onChange(option.value)}
                    >
                        {option.label}
                    </Tag.CheckableTag>
                );
            })}
        </>
    );
}

function FilterRow<T extends string>({
    label,
    value,
    options,
    showUnlimited = true,
    collapsedHeight,
    onChange,
}: FilterRowProps<T>) {
    const listRef = React.useRef<HTMLDivElement>(null);
    const [canToggle, setCanToggle] = React.useState(false);
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    React.useLayoutEffect(() => {
        const list = listRef.current;

        if (!list || !collapsedHeight) {
            setCanToggle(false);
            return;
        }

        setCanToggle(list.scrollHeight > collapsedHeight + 2);
    }, [collapsedHeight, options, showUnlimited, value]);

    React.useEffect(() => {
        if (!canToggle && popoverOpen) {
            setPopoverOpen(false);
        }
    }, [canToggle, popoverOpen]);

    const handleChange = (nextValue: T | '') => {
        onChange(nextValue);
        setPopoverOpen(false);
    };

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <div className="w-[88px] shrink-0 text-sm font-semibold text-slate-700">{label}</div>
            <div className="flex min-w-0 flex-1 items-start gap-2">
                <div
                    ref={listRef}
                    className="flex min-w-0 flex-1 flex-wrap gap-x-2 gap-y-3 overflow-hidden"
                    style={collapsedHeight ? { maxHeight: collapsedHeight } : undefined}
                >
                    <FilterTags
                        value={value}
                        options={options}
                        showUnlimited={showUnlimited}
                        onChange={handleChange}
                    />
                </div>
                {canToggle ? (
                    <Popover
                        trigger="click"
                        placement="bottomRight"
                        open={popoverOpen}
                        onOpenChange={setPopoverOpen}
                        overlayInnerStyle={{ padding: 16 }}
                        content={(
                            <div className="flex max-h-[240px] w-[520px] max-w-[min(520px,calc(100vw-80px))] flex-wrap gap-x-2 gap-y-3 overflow-y-auto pr-1">
                                <FilterTags
                                    value={value}
                                    options={options}
                                    showUnlimited={showUnlimited}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                    >
                        <Button
                            type="link"
                            className="!h-7 !shrink-0 !px-0 !text-sm !text-[#1677ff]"
                        >
                            更多
                        </Button>
                    </Popover>
                ) : null}
            </div>
        </div>
    );
}

const DemandCenterPage: React.FC = () => {
    const navigate = useNavigate();
    const token = useUserStore((state) => state.token);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [demands, setDemands] = useState<DemandListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [demandType, setDemandType] = useState<DemandTypeFilter>('all');
    const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
    const topicCategoryOptions = useTradingDictionaryStore((state) => state.topicCategoryOptions);
    const demandTopicCategoryOptions = useMemo(
        () =>
            topicCategoryOptions.map((option) => ({
                ...option,
                value: option.label,
            })),
        [topicCategoryOptions],
    );

    const [queryParams, setQueryParams] = useState<DemandListQueryRequest>(DEFAULT_QUERY);

    const fetchDemands = async (params: DemandListQueryRequest) => {
        setLoading(true);
        try {
            const res = await demandService.listDemands(params);
            setDemands(res.data || []);
            setTotal(res.dataCount || 0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDemands(queryParams);
    }, [queryParams]);

    const handleSearch = () => {
        const keyword = String(form.getFieldValue('keyword') || '').trim();
        setQueryParams((prev) => ({
            ...prev,
            keyword: keyword || undefined,
            pageNum: 1,
        }));
    };

    const handleDemandTypeChange = (nextValue: DemandTypeFilter | '') => {
        const nextDemandType = (nextValue || 'all') as DemandTypeFilter;
        if (!token && (nextDemandType === 'my' || nextDemandType === 'canRespond')) {
            setLoginRequiredOpen(true);
            return;
        }
        setDemandType(nextDemandType);
        setQueryParams((prev) => ({
            ...prev,
            demandType: nextDemandType,
            scope: nextDemandType === 'my' ? 'my' : 'all',
            pageNum: 1,
        }));
    };

    const handleStatusChange = (nextValue: string) => {
        setQueryParams((prev) => ({
            ...prev,
            status: nextValue || undefined,
            pageNum: 1,
        }));
    };

    const handleTopicChange = (nextValue: string) => {
        setQueryParams((prev) => ({
            ...prev,
            topicCategory: nextValue || undefined,
            pageNum: 1,
        }));
    };

    const handlePageChange = (page: number, pageSize: number) => {
        setQueryParams((prev) => ({
            ...prev,
            pageNum: page,
            pageSize,
        }));
    };

    const renderStatusTag = (status: string) => {
        const config = getDemandStatusMeta(status);
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const renderDemandMeta = (demand: DemandListItem) => {
        const productTypeLabel = formatProductTypeLabel(demand.productType);
        const categoryLabel = demand.topicCategory || '未设置主题';
        const deadlineLabel = demand.deadline ? dayjs(demand.deadline).format('YYYY-MM-DD') : '未设置截止';

        return (
            <div className="mt-4 grid grid-cols-1 gap-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                    <TagsOutlined className="text-blue-500" />
                    <span className="truncate">
                        {categoryLabel} / {productTypeLabel}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <ClockCircleOutlined className="text-emerald-500" />
                    <span>截止：{deadlineLabel}</span>
                </div>
            </div>
        );
    };

    return (
        <PageContainer layout="fluid" className="!py-0" contentClassName="!px-0">
            <div className="flex w-full flex-col" style={{ paddingBottom: UI_CONFIG.spacing.blockInnerGapNum }}>
                <div
                    className="relative overflow-hidden bg-no-repeat"
                    style={{
                        marginInline: UI_CONFIG.layout.outerPageGapNum40,
                        backgroundImage: `url(${bannerImg})`,
                        backgroundPosition: 'center top',
                        backgroundSize: 'cover',
                    }}
                >
                    <div
                        className="flex items-start justify-center px-6 pt-10 lg:px-10"
                        style={{ paddingBottom: DEMAND_BANNER_BOTTOM_GAP }}
                    >
                        <div className="w-full max-w-[1280px]">
                            <CommonCard
                                padding={16}
                                className="w-full rounded-2xl bg-white shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
                            >
                                <Form form={form} className="flex items-stretch gap-3">
                                    <Form.Item name="keyword" className="!mb-0 flex-1">
                                        <Input
                                            allowClear
                                            size="large"
                                            placeholder="需求标题、需求描述"
                                            prefix={<SearchOutlined className="text-slate-400" />}
                                            className="flex-1 !rounded-md !px-4 [&>input]:!text-base"
                                            style={{ height: UI_CONFIG.input.bannerSearchHeight }}
                                            onPressEnter={handleSearch}
                                        />
                                    </Form.Item>
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="!min-w-[120px] !rounded-md !px-8 !text-base !font-medium"
                                        style={{ height: UI_CONFIG.input.bannerSearchHeight }}
                                        onClick={handleSearch}
                                    >
                                        查询
                                    </Button>
                                    <Button
                                        type="primary"
                                        size="large"
                                        icon={<PlusOutlined />}
                                        className="!min-w-[132px] !rounded-md !px-8 !text-base !font-medium"
                                        style={{ height: UI_CONFIG.input.bannerSearchHeight }}
                                        onClick={() => {
                                            if (!token) {
                                                setLoginRequiredOpen(true);
                                                return;
                                            }
                                            navigate('/demand-center/create');
                                        }}
                                    >
                                        发布需求
                                    </Button>
                                </Form>
                            </CommonCard>

                            <div style={{ marginTop: UI_CONFIG.spacing.blockInnerGapNum }}>
                                <CommonCard
                                    variant="standard"
                                    padding={24}
                                    className="rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.10)]"
                                >
                                    <Space direction="vertical" size={22} className="!flex">
                                        <FilterRow<DemandTypeFilter>
                                            label="需求类型:"
                                            value={demandType}
                                            options={DEMAND_TYPE_OPTIONS}
                                            showUnlimited={false}
                                            onChange={handleDemandTypeChange}
                                        />
                                        <FilterRow
                                            label="状态:"
                                            value={queryParams.status}
                                            options={DEMAND_STATUS_FILTER_OPTIONS}
                                            onChange={handleStatusChange}
                                        />
                                        <FilterRow
                                            label="主题分类:"
                                            value={queryParams.topicCategory}
                                            options={demandTopicCategoryOptions}
                                            collapsedHeight={TOPIC_COLLAPSED_HEIGHT}
                                            onChange={handleTopicChange}
                                        />
                                    </Space>
                                </CommonCard>
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="mx-auto w-full max-w-[1280px] px-4 lg:px-0"
                    style={{ paddingTop: UI_CONFIG.spacing.blockInnerGapNum }}
                >
                    <CommonCard
                        padding={24}
                        className="w-full rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
                    >
                        {demands.length === 0 && !loading ? (
                            <div className="flex min-h-[260px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60">
                                <Empty description="暂无需求" />
                            </div>
                        ) : (
                            <>
                                <Row gutter={[UI_CONFIG.spacing.cardGap, UI_CONFIG.spacing.cardGap]}>
                                    {demands.map((demand) => (
                                        <Col xs={24} sm={12} md={8} lg={6} key={demand.id}>
                                            <CommonCard
                                                hoverable
                                                padding={0}
                                                className="group h-full overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_34px_rgba(37,99,235,0.12)]"
                                                onClick={() => navigate(`/demand-center/${demand.id}`)}
                                            >
                                                <div className="flex h-full min-h-[184px] flex-col p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="min-w-0">
                                                            <div className="truncate text-base font-semibold text-slate-900" title={demand.title}>
                                                                {demand.title}
                                                            </div>
                                                            <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                                                <UserOutlined />
                                                                <span className="truncate">{demand.publisherName || '-'}</span>
                                                            </div>
                                                        </div>
                                                        <div className="shrink-0">{renderStatusTag(demand.status)}</div>
                                                    </div>

                                                    <div className="mt-4 min-h-[44px] line-clamp-2 text-sm leading-6 text-slate-500">
                                                        {demand.description || '暂无描述'}
                                                    </div>

                                                    {renderDemandMeta(demand)}

                                                    <div className="mt-auto flex items-end justify-between border-t border-slate-100 pt-4">
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <MessageOutlined className="text-amber-500" />
                                                            <span>{Number(demand.responseCount || 0)} 个响应</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <CalendarOutlined />
                                                            <span>{dayjs(demand.createdAt).format('YYYY-MM-DD')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CommonCard>
                                        </Col>
                                    ))}
                                </Row>
                                <div className="flex justify-end" style={{ marginTop: UI_CONFIG.spacing.tableToPaginationNum }}>
                                    <Pagination
                                        current={queryParams.pageNum}
                                        pageSize={queryParams.pageSize}
                                        total={total}
                                        onChange={handlePageChange}
                                        showSizeChanger
                                        showTotal={(count) => `共 ${count} 条`}
                                    />
                                </div>
                            </>
                        )}
                    </CommonCard>
                </div>
            </div>
            <LoginRequiredModal
                open={loginRequiredOpen}
                onCancel={() => setLoginRequiredOpen(false)}
            />
        </PageContainer>
    );
};

export default DemandCenterPage;
