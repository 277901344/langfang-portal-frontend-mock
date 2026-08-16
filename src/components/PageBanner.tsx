import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { applyImageFallback, publicAssetUrl } from '../lib/publicAssets';

const bannerAsset = (fileName: string) => publicAssetUrl(`assets/banner/${fileName}`);
const BANNER_FALLBACK = publicAssetUrl('auth-trusted-data-space-bg.webp');

const BANNER_MAP: Record<string | number, string> = {
  1: bannerAsset('重要场景.png'),
  2: bannerAsset('政委数据.png'),
  3: bannerAsset('数据资源.png'),
  4: bannerAsset('数据产品.png'),
  5: bannerAsset('需求大厅.png'),
  6: bannerAsset('生态合作.png'),
  '重要场景': bannerAsset('重要场景.png'),
  '重点场景': bannerAsset('重要场景.png'),
  '政务数据': bannerAsset('政委数据.png'),
  '政委数据': bannerAsset('政委数据.png'),
  '部门数据': bannerAsset('政委数据.png'),
  '数据资源': bannerAsset('数据资源.png'),
  '数据资源目录': bannerAsset('政委数据.png'),
  '文档中心': bannerAsset('文档中心.png'),
  '数据产品': bannerAsset('数据产品.png'),
  '需求大厅': bannerAsset('需求大厅.png'),
  '生态合作': bannerAsset('生态合作.png'),
  '开放生态': bannerAsset('生态合作.png'),
};

export interface PageBannerProps {
  title: string;
  subtitle: string;
  tag?: string;
  breadcrumb?: { name: string; path?: string }[];
  stats?: { label: string; value: string | number; unit?: string }[];
  variant?: 1 | 2 | 3 | 4 | 5 | 6 | '重要场景' | '重点场景' | '政务数据' | '政委数据' | '部门数据' | '数据资源' | '数据资源目录' | '文档中心' | '数据产品' | '需求大厅' | '生态合作' | '开放生态';
  bgImage?: string;
  children?: React.ReactNode;
}

export function PageBanner({
  title,
  subtitle,
  breadcrumb,
  variant = 1,
  bgImage,
  children,
}: PageBannerProps) {
  let currentBannerImg = BANNER_MAP[variant] || BANNER_MAP[1];
  if (bgImage) {
    currentBannerImg = publicAssetUrl(bgImage);
  }

  return (
    <div className="relative w-full bg-[#F4F7FB] text-[#1F2937] overflow-hidden py-20 sm:py-28 min-h-[480px] sm:min-h-[520px] flex items-center justify-center">
      {/* 1. 全屏 Banner 背景 PNG 图片 (通过 Vite 静态资源导入，绝对稳定保证加载) */}
      <img
        src={currentBannerImg}
        alt={`Banner Background ${variant}`}
        onError={(event) => applyImageFallback(event.currentTarget, BANNER_FALLBACK)}
        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-100 select-none pointer-events-none"
      />

      {/* 2. 前景内容区 */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto">
        <div className="max-w-4xl space-y-4 text-left">
          
          {/* 面包屑导航 */}
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-[13px] text-[#5B6472] font-normal">
              <Link to="/" className="hover:text-[#1459EB] transition-colors">首页</Link>
              {breadcrumb.map((item, idx) => (
                <React.Fragment key={idx}>
                  <ChevronRight className="w-3.5 h-3.5 text-[#8A94A6]" />
                  {item.path ? (
                    <Link to={item.path} className="hover:text-[#1459EB] transition-colors">{item.name}</Link>
                  ) : (
                    <span className="text-[#1F2937] font-medium">{item.name}</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* 主标题 */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[28px] sm:text-[36px] lg:text-[40px] font-semibold text-[#1F2937] tracking-tight leading-[38px] sm:leading-[46px] lg:leading-[50px]"
          >
            {title}
          </motion.h1>

          {/* 价值说明 */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[15px] sm:text-[16px] leading-[26px] sm:leading-[28px] text-[#374151] font-normal max-w-3xl line-clamp-3"
          >
            {subtitle}
          </motion.p>

          {/* 自定义操作组件 */}
          {children && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-2"
            >
              {children}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
