import React from 'react';
import { Button, Empty, Input, Pagination, Skeleton, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '@/shared/components/PageContainer';
import { CommonCard } from '@/shared/components/CommonCard';
import { useQuery } from '@/shared/hooks/useQuery';
import { UI_CONFIG } from '@/shared/constants/ui';
import { MarketplaceFilterPanel } from '../components/MarketplaceFilterPanel';
import { MarketplaceCommodityCard } from '../components/MarketplaceCommodityCard';
import { getMarketplaceCategories, listMarketCommodities } from '../services/marketplace';
import type { MarketplaceCommodityQuery } from '../types';
import bannerImg from '@/modules/marketplace/banner-list.png';

const DEFAULT_QUERY: MarketplaceCommodityQuery = {
    keyword: '',
    commodityType: '',
    topicCategory: '',
    applicationCategory: '',
    pageNum: 1,
    pageSize: 12,
};

const PAGE_SIZE_OPTIONS = ['12', '24', '36'];
const MARKETPLACE_BANNER_BOTTOM_GAP = 40;

function parseSearchParams(searchParams: URLSearchParams): MarketplaceCommodityQuery {
    return {
        keyword: searchParams.get('keyword') || '',
        commodityType: searchParams.get('commodityType') || searchParams.get('productType') || '',
        topicCategory: searchParams.get('topicCategory') || '',
        applicationCategory: searchParams.get('applicationCategory') || '',
        pageNum: Number(searchParams.get('pageNum') || 1),
        pageSize: Number(searchParams.get('pageSize') || 12),
    };
}

function toSearchParams(query: MarketplaceCommodityQuery): URLSearchParams {
    const params = new URLSearchParams();

    Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
            return;
        }
        params.set(key, String(value));
    });

    return params;
}

function MarketplaceHomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [keyword, setKeyword] = React.useState(searchParams.get('keyword') || '');
    const query = React.useMemo(() => parseSearchParams(searchParams), [searchParams]);

    React.useEffect(() => {
        setKeyword(query.keyword || '');
    }, [query.keyword]);

    const { data: categories } = useQuery({
        queryKey: ['marketplace-categories'],
        queryFn: getMarketplaceCategories,
        refetchOnWindowFocus: false,
    });

    const { data, isLoading } = useQuery({
        queryKey: ['marketplace-commodities', query],
        queryFn: () => listMarketCommodities(query),
        staleTime: 0,
        refetchOnMount: 'always',
        refetchOnWindowFocus: false,
    });

    const updateQuery = React.useCallback(
        (patch: Partial<MarketplaceCommodityQuery>) => {
            const nextQuery = {
                ...DEFAULT_QUERY,
                ...query,
                ...patch,
            };
            setSearchParams(toSearchParams(nextQuery));
        },
        [query, setSearchParams],
    );

    const handleSearch = React.useCallback(
        (value?: string) => {
            updateQuery({
                keyword: (value ?? keyword).trim(),
                pageNum: 1,
            });
        },
        [keyword, updateQuery],
    );

    const total = data?.dataCount || 0;

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
                        className="flex items-start justify-center pt-10"
                        style={{ paddingBottom: MARKETPLACE_BANNER_BOTTOM_GAP }}
                    >
                        <div className="w-full max-w-[1280px]">
                            <CommonCard
                                padding={16}
                                className="w-full rounded-2xl bg-white shadow-[0_14px_36px_rgba(15,23,42,0.16)]"
                            >
                                <div className="flex items-stretch gap-3">
                                    <Input
                                        value={keyword}
                                        allowClear
                                        size="large"
                                        placeholder="商品名称 / 商品编码 / 产品名称 / 产品编码"
                                        prefix={<SearchOutlined className="text-slate-400" />}
                                        className="flex-1 !rounded-md !px-4 [&>input]:!text-base"
                                        style={{ height: UI_CONFIG.input.bannerSearchHeight }}
                                        onChange={(event) => setKeyword(event.target.value)}
                                        onPressEnter={() => handleSearch(keyword)}
                                    />
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="!min-w-[156px] !rounded-md !px-10 !text-base !font-medium"
                                        style={{ height: UI_CONFIG.input.bannerSearchHeight }}
                                        onClick={() => handleSearch(keyword)}
                                    >
                                        搜索
                                    </Button>
                                </div>
                            </CommonCard>

                            <div style={{ marginTop: UI_CONFIG.spacing.blockInnerGapNum }}>
                                <MarketplaceFilterPanel
                                    categories={categories}
                                    value={query}
                                    onChange={(patch) => updateQuery(patch)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div
                    className="mx-auto w-full max-w-[1280px] px-4 lg:px-0" style={{ paddingTop: UI_CONFIG.spacing.blockInnerGapNum }}
                >
                    <CommonCard
                        padding={24}
                        className="w-full rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
                    >
                        <Space direction="vertical" size={20} className="!flex">
                            {isLoading ? (
                                <>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {Array.from({ length: 6 }).map((_, index) => (
                                            <Skeleton
                                                key={index}
                                                active
                                                paragraph={{ rows: 4 }}
                                                className="rounded-xl bg-slate-50 p-5"
                                            />
                                        ))}
                                    </div>
                                </>
                            ) : data?.data?.length ? (
                                <>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                        {data.data.map((item) => (
                                            <MarketplaceCommodityCard key={item.commodityId} item={item} />
                                        ))}
                                    </div>
                                    <div
                                        className="flex justify-end border-t border-slate-100 pt-6"
                                        style={{ marginTop: UI_CONFIG.spacing.tableToPaginationNum }}
                                    >
                                        <Pagination
                                            current={query.pageNum || 1}
                                            pageSize={query.pageSize || 12}
                                            total={total}
                                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                                            showQuickJumper={false}
                                            showSizeChanger
                                            showTotal={(count) => `共 ${count} 个商品`}
                                            onChange={(page, pageSize) =>
                                                updateQuery({ pageNum: page, pageSize })
                                            }
                                        />
                                    </div>
                                </>
                            ) : (
                                <Empty description="暂无符合条件的商品" />
                            )}
                        </Space>
                    </CommonCard>
                </div>
            </div>
        </PageContainer>
    );
}

export default MarketplaceHomePage;
