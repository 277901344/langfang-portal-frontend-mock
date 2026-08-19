import React from 'react';
import { Card, type CardProps } from 'antd'; // Import type CardProps
import classNames from 'classnames';
import './index.scss';

export type CardVariant = 'standard' | 'flat' | 'pure';
export type CardPadding = 'none' | 'small' | 'medium' | 'large' | number;

// Omit 'variant' as well since CardProps has its own variant prop which conflicts
interface CommonCardProps extends Omit<CardProps, 'title' | 'extra' | 'className' | 'variant'> {
    title?: React.ReactNode;
    status?: React.ReactNode; // New prop for status badge
    footer?: React.ReactNode; // New prop for custom footer
    extra?: React.ReactNode;
    variant?: CardVariant;
    padding?: CardPadding;
    className?: string;
    // loading, hoverable, actions, children, onClick are covered by CardProps
}

export const CommonCard: React.FC<CommonCardProps> = ({
    title,
    status,
    footer,
    extra,
    variant = 'standard',
    padding = 16,
    className,
    loading,
    hoverable = false,
    actions,
    children,
    onClick,
    style,
    ...rest
}) => {
    // Check if padding is a preset string or a number
    const isPreset = typeof padding === 'string';

    const cardCls = classNames(
        'common-card',
        `variant-${variant}`,
        // Only apply padding class if it's a preset
        { [`padding-${padding}`]: isPreset },
        { 'is-clickable': !!onClick },
        { 'has-footer': !!footer },
        className
    );

    // If padding is a number, apply it via styles
    const customStyles = !isPreset ? {
        body: { padding: padding },
        header: { padding: `0 ${padding}px` }
    } : undefined;

    // Custom title render to include status
    const renderTitle = () => {
        if (!title && !status) return undefined;
        return (
            <div className="flex items-center justify-between w-full">
                <div className="flex-1 overflow-hidden">
                    {title}
                </div>
                {status && <div className="shrink-0 ml-4">{status}</div>}
            </div>
        );
    };

    return (
        <Card
            title={renderTitle()}
            extra={extra}
            variant={variant === 'flat' ? 'outlined' : 'borderless'}
            loading={loading}
            hoverable={hoverable}
            actions={actions}
            className={cardCls}
            styles={customStyles}
            onClick={onClick}
            style={style}
            {...rest}
        >
            <div className="common-card-content">
                {children}
            </div>
            {footer && (
                <div className="common-card-footer">
                    {footer}
                </div>
            )}
        </Card>
    );
};
