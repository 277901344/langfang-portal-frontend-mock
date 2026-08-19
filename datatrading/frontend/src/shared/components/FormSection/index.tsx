import React from 'react';
import classNames from 'classnames';
import './index.scss';

interface FormSectionProps {
    title?: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    variant?: 'plain' | 'shaded' | 'outlined';
    className?: string;
    headerExtra?: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
    title,
    description,
    children,
    variant = 'plain',
    className,
    headerExtra
}) => {
    return (
        <div className={classNames('form-section', `variant-${variant}`, className)}>
            {(title || description || headerExtra) && (
                <div className="form-section-header">
                    <div className="header-left">
                        {title && <h4 className="form-section-title">{title}</h4>}
                        {description && <div className="form-section-description">{description}</div>}
                    </div>
                    {headerExtra && <div className="header-extra">{headerExtra}</div>}
                </div>
            )}
            {children !== undefined && children !== null && (
                <div className="form-section-content">
                    {children}
                </div>
            )}
        </div>
    );
};
