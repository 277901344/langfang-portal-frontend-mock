import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const BANNER_MAP: Record<string | number, string> = {
  1: '/assets/banner/重要场景.png',
  2: '/assets/banner/政委数据.png',
  3: '/assets/banner/数据资源.png',
  4: '/assets/banner/数据产品.png',
  5: '/assets/banner/需求大厅.png',
  6: '/assets/banner/生态合作.png',
  '重要场景': '/assets/banner/重要场景.png',
  '重点场景': '/assets/banner/重要场景.png',
  '政务数据': '/assets/banner/政委数据.png',
  '政委数据': '/assets/banner/政委数据.png',
  '部门数据': '/assets/banner/政委数据.png',
  '数据资源': '/assets/banner/数据资源.png',
  '数据资源目录': '/assets/banner/政委数据.png',
  '文档中心': '/assets/banner/文档中心.png',
  '数据产品': '/assets/banner/数据产品.png',
  '需求大厅': '/assets/banner/需求大厅.png',
  '生态合作': '/assets/banner/生态合作.png',
  '开放生态': '/assets/banner/生态合作.png',
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
    // 处理传入路径，如 "public/assets/banner/重要场景.png" 或 "/assets/banner/重要场景.png"
    const cleaned = bgImage.replace(/^public\//, '/').replace(/^\/?/, '/');
    currentBannerImg = cleaned;
  }

  return (
    <div className="relative w-full bg-gradient-to-r from-[#edf3fd] via-[#f4f7fc] to-[#eef4fd] text-[#1F2937] overflow-hidden py-20 sm:py-28 lg:py-36 min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] flex items-center justify-center border-b border-slate-200/60">
      {/* 1. 装饰性高科技背景光晕与网格 */}
      <div className="absolute inset-0 bg-[radial-gradient(#1459eb0f_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Banner 背景 PNG 图片 (带错误兜底) */}
      <img
        src={currentBannerImg}
        alt=""
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
        className="absolute inset-0 w-full h-full object-cover object-center z-0 opacity-80 select-none pointer-events-none"
      />

      {/* 3. 前景内容区 */}
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 my-auto">
        <div className="max-w-4xl space-y-4 text-left">
          
          {/* 面包屑导航 */}
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="flex items-center gap-2 text-[13px] text-[#5B6472] font-normal mb-1">
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
            className="text-[30px] sm:text-[36px] lg:text-[42px] font-bold text-[#1F2937] tracking-tight leading-[40px] sm:leading-[48px] lg:leading-[52px]"
          >
            {title}
          </motion.h1>

          {/* 价值说明 */}
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[14px] sm:text-[16px] leading-[24px] sm:leading-[28px] text-[#4B5563] font-normal max-w-3xl"
          >
            {subtitle}
          </motion.p>

          {/* 自定义操作组件 */}
          {children && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-3"
            >
              {children}
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
