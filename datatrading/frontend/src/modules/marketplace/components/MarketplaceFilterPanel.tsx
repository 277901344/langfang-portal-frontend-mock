import React from 'react';
import { Button, Popover, Space, Tag, Typography } from 'antd';

import { CommonCard } from '@/shared/components/CommonCard';
import type { MarketplaceCategoriesResponse, MarketplaceCommodityQuery } from '../types';

const { Text } = Typography;

const COLLAPSED_ROW_HEIGHT = 76;

interface MarketplaceFilterPanelProps {
    categories?: MarketplaceCategoriesResponse;
    value: MarketplaceCommodityQuery;
    onChange: (patch: Partial<MarketplaceCommodityQuery>) => void;
}

interface FilterRowProps {
    label: string;
    selectedValue?: string;
    options: { label: string; value: string }[];
    onSelect: (nextValue: string) => void;
}

interface FilterTagsProps {
    selectedValue?: string;
    options: { label: string; value: string }[];
    onSelect: (nextValue: string) => void;
}

function getTagClass(checked: boolean): string {
    return checked
        ? '!m-0 !rounded-sm !border !border-[#1677ff] !bg-[#1677ff] !px-3 !py-1 !text-sm !text-white'
        : '!m-0 !rounded-sm !border !border-transparent !bg-transparent !px-3 !py-1 !text-sm !text-slate-700 hover:!text-[#1677ff]';
}

function FilterTags({ selectedValue, options, onSelect }: FilterTagsProps) {
    return (
        <>
            <Tag.CheckableTag
                checked={!selectedValue}
                className={getTagClass(!selectedValue)}
                onChange={() => onSelect('')}
            >
                不限
            </Tag.CheckableTag>
            {options.map((option) => {
                const checked = selectedValue === option.value;
                return (
                    <Tag.CheckableTag
                        key={option.value}
                        checked={checked}
                        className={getTagClass(checked)}
                        onChange={() => onSelect(option.value)}
                    >
                        {option.label}
                    </Tag.CheckableTag>
                );
            })}
        </>
    );
}

function FilterRow({ label, selectedValue, options, onSelect }: FilterRowProps) {
    const listRef = React.useRef<HTMLDivElement>(null);
    const [canToggle, setCanToggle] = React.useState(false);
    const [popoverOpen, setPopoverOpen] = React.useState(false);

    React.useLayoutEffect(() => {
        const list = listRef.current;

        if (!list) {
            return;
        }

        setCanToggle(list.scrollHeight > COLLAPSED_ROW_HEIGHT + 2);
    }, [options, selectedValue]);

    React.useEffect(() => {
        if (!canToggle && popoverOpen) {
            setPopoverOpen(false);
        }
    }, [canToggle, popoverOpen]);

    const handleSelect = (nextValue: string) => {
        onSelect(nextValue);
        setPopoverOpen(false);
    };

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-start">
            <Text className="w-[88px] shrink-0 !text-sm !font-semibold !text-slate-700">{label}</Text>
            <div className="flex min-w-0 flex-1 items-start gap-2">
                <div
                    ref={listRef}
                    className="flex min-w-0 flex-1 flex-wrap gap-x-2 gap-y-3 max-h-[76px] overflow-hidden"
                >
                    <FilterTags selectedValue={selectedValue} options={options} onSelect={handleSelect} />
                </div>
                {canToggle ? (
                    <Popover
                        trigger="click"
                        placement="bottomRight"
                        open={popoverOpen}
                        onOpenChange={setPopoverOpen}
                        overlayInnerStyle={{ padding: 16 }}
                        content={
                            <div className="flex max-h-[240px] w-[520px] max-w-[min(520px,calc(100vw-80px))] flex-wrap gap-x-2 gap-y-3 overflow-y-auto pr-1">
                                <FilterTags selectedValue={selectedValue} options={options} onSelect={handleSelect} />
                            </div>
                        }
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

export function MarketplaceFilterPanel({
    categories,
    value,
    onChange,
}: MarketplaceFilterPanelProps) {
    return (
        <CommonCard
            variant="standard"
            padding={24}
            className="rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.10)]"
        >
            <Space direction="vertical" size={22} className="!flex">
                <FilterRow
                    label="商品类型:"
                    selectedValue={value.commodityType}
                    options={categories?.productTypes || []}
                    onSelect={(next) => onChange({ commodityType: next, pageNum: 1 })}
                />
                <FilterRow
                    label="主题分类:"
                    selectedValue={value.topicCategory}
                    options={categories?.topicCategories || []}
                    onSelect={(next) => onChange({ topicCategory: next, pageNum: 1 })}
                />
                <FilterRow
                    label="应用场景:"
                    selectedValue={value.applicationCategory}
                    options={categories?.applicationCategories || []}
                    onSelect={(next) => onChange({ applicationCategory: next, pageNum: 1 })}
                />
            </Space>
        </CommonCard>
    );
}
