import React from 'react';
import { Database, HardDrive, Package, Share2, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export const statsData = [
  {
    id: '1',
    label: '接入数源部门',
    value: '32',
    suffix: '家',
    subtext: '涵盖卫健/住建/公积金等',
    icon: Database,
  },
  {
    id: '2',
    label: '累计接入数据量',
    value: '18.5',
    suffix: 'TB',
    subtext: '密态沙盒数据隔离',
    icon: HardDrive,
  },
  {
    id: '3',
    label: '已发布数据产品',
    value: '24',
    suffix: '个',
    subtext: 'API/数据集/衍生报告',
    icon: Package,
  },
  {
    id: '4',
    label: '安全授权调用',
    value: '1.25',
    suffix: '亿次',
    subtext: '全链路存证审计',
    icon: Share2,
  },
  {
    id: '5',
    label: '合规节点算力',
    value: '99.98',
    suffix: '%',
    subtext: 'TEE/MPC双擎保障',
    icon: ShieldCheck,
  },
  {
    id: '6',
    label: '需求响应撮合率',
    value: '98.6',
    suffix: '%',
    subtext: '高效跨域要素撮合',
    icon: TrendingUp,
  },
];

export const SolutionOne: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 text-slate-900"
    >
      <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <h3 className="text-xs font-extrabold tracking-wider text-slate-700 uppercase">
            廊坊可信数据空间 · 实时运行数据大盘 (REALTIME METRICS)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500 font-medium">
          更新于 2026-08-12
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {statsData.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="flex flex-col items-center justify-between text-center pt-3 md:pt-0 px-2 group cursor-default"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 text-blue-600 flex items-center justify-center mb-2.5 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex items-baseline justify-center mb-0.5">
                <span className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight font-sans group-hover:text-blue-600 transition-colors">
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-slate-500 ml-1">
                  {stat.suffix}
                </span>
              </div>

              <div className="text-xs font-bold text-slate-800">
                {stat.label}
              </div>
              <p className="text-[11px] text-slate-400 font-normal mt-1 truncate w-full">
                {stat.subtext}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
