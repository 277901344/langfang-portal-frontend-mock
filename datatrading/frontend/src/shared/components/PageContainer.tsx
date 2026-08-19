import React from 'react';
import { Spin, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { UI_CONFIG } from '@/shared/constants/ui';

interface PageContainerProps {
    /**
     * @description 页面的宏观布局模式 (UI Consistency V3)
     * - `fluid` (默认): 流式全屏布局，内容完全填满可用宽度，左右保留标准的系统安全留白。适用于列表页、台账页、卡片网格页等数据密集型页面。
     * - `narrow`: 限宽布局，强制内容居中对齐并限制最大宽度 (1024px)，确保超宽显示器下阅读体验舒适。适用于表单输入页、向导式分步页、详情页等重阅读与填写的页面。
     */
    layout?: 'fluid' | 'narrow';
    /** 页面大标题。注：若为 narrow 布局且内部有实体头部卡片，应隐藏外层 title 以防冲突 */
    title?: React.ReactNode;
    subtitle?: React.ReactNode;
    subtitlePlacement?: 'below' | 'inline';
    /** 右侧外挂操作区，强烈建议将全局动作（如 + 新增）上提至此处 */
    extra?: React.ReactNode;
    onBack?: () => void;
    children: React.ReactNode;
    loading?: boolean;
    className?: string;
    contentClassName?: string;
    /** 是否开启 flex 布局以撑满高度，并允许子组件内部自行接管滚动 (固定头核心配置) */
    flexLayout?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
    layout = 'fluid',
    title,
    subtitle,
    subtitlePlacement = 'below',
    extra,
    onBack,
    children,
    loading = false,
    className = '',
    contentClassName = '',
    flexLayout = false
}) => {
    const isNarrow = layout === 'narrow';
    const innerWrapperClass = isNarrow
        ? `w-full ${UI_CONFIG.layout.narrowMaxWidth} mx-auto`
        : "w-full";
    const outerPaddingInline = isNarrow?UI_CONFIG.layout.pagePaddingInline50px:UI_CONFIG.layout.pagePaddingInline;

    return (
        <div className={`flex flex-col h-full w-full ${UI_CONFIG.layout.pagePaddingY} box-border ${className}`}>

            {/* Header Section - Padded horizontally to match content */}
            {(title || extra || onBack) && (
                <div className={`flex justify-between items-center min-h-9 mb-5 shrink-0 w-full ${outerPaddingInline}`}>
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <Button
                                type="text"
                                icon={<ArrowLeftOutlined style={{ fontSize: '16px' }} />}
                                onClick={onBack}
                                className="!flex !items-center !justify-center !bg-slate-200/50 hover:!bg-slate-200 !border-none !rounded-lg"
                                style={{ width: 28, height: 28, padding: 0 }}
                            />
                        )}
                        <div>
                            {(title || (subtitle && subtitlePlacement === 'inline')) && (
                                <div className="flex items-center gap-2">
                                    {title && (
                                        <h1 className="text-[18px] font-bold text-slate-800 !m-0 !mb-0 leading-tight tracking-tight">
                                            {title}
                                        </h1>
                                    )}
                                    {subtitle && subtitlePlacement === 'inline' && (
                                        <div className="text-s text-slate-400 leading-tight">
                                            {subtitle}
                                        </div>
                                    )}
                                </div>
                            )}
                            {subtitle && subtitlePlacement === 'below' && (
                                <div className="text-xs text-slate-400 mt-0.5">
                                    {subtitle}
                                </div>
                            )}
                        </div>
                    </div>

                    {extra && (
                        <div className="flex items-center gap-3">
                            {extra}
                        </div>
                    )}
                </div>
            )}

            {/* Content Section */}
            <div className={classNames(
                `flex-1 min-h-0 relative overflow-x-hidden custom-scrollbar ${outerPaddingInline} ${contentClassName}`,
                flexLayout ? "!overflow-y-hidden flex flex-col" : "overflow-y-auto"
            )}>
                <div className={classNames(innerWrapperClass, flexLayout && "h-full flex flex-col flex-1")}>
                    <Spin 
                        spinning={loading} 
                        wrapperClassName={classNames(
                            isNarrow ? "w-full" : "", 
                            flexLayout && "h-full flex flex-col flex-1"
                        )}
                    >
                        {children}
                    </Spin>
                </div>
            </div>
        </div>
    );
};
