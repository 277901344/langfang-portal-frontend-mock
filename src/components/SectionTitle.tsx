import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  action?: React.ReactNode;
}

export function SectionTitle({ title, subtitle, badge, className = '', action }: SectionTitleProps) {
  return (
    <div className={`text-center space-y-2 mb-8 ${className}`}>
      {badge && (
        <div className="inline-flex items-center h-[24px] px-2 rounded-[6px] text-[12px] leading-[18px] font-medium bg-[#E0E8F8] text-[#1459EB] mb-1">
          <span>{badge}</span>
        </div>
      )}
      
      <div className="relative inline-block">
        <h2 className="text-[24px] sm:text-[30px] font-semibold text-[#1F2937] tracking-tight text-center leading-[32px] sm:leading-[40px]">
          {title}
        </h2>
        {/* 精致下划线条 */}
        <div className="mt-2 mx-auto w-10 h-[2px] bg-[#1459EB] rounded-full" />
      </div>

      {subtitle && (
        <p className="text-[14px] leading-[22px] text-[#5B6472] font-normal max-w-2xl mx-auto pt-1 line-clamp-2">
          {subtitle}
        </p>
      )}

      {action && (
        <div className="pt-2 flex justify-center">{action}</div>
      )}
    </div>
  );
}
