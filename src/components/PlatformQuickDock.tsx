import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, Share2, ExternalLink, ArrowRight, X, ChevronUp, Layers, Cpu } from 'lucide-react';
import { platformLinks } from '../lib/platformLinks';
import { getSpSsoLaunchUrl } from '../lib/auth';
import { useAuth } from '../context/AuthContext';
import { useAccessWizard } from '../context/AccessWizardContext';

export function PlatformQuickDock() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkAndApply } = useAccessWizard();
  const [isOpen, setIsOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleServicePlatformLaunch = () => {
    checkAndApply({
      productId: 'connector-node-main',
      productName: '可信数据空间连接器节点',
      connectorName: '廊坊数据源节点（主节点）',
      mode: 'launch_connector',
      hasAuthMgmt: false,
    });
  };

  const platforms = [
    {
      id: 'service',
      name: '可信数据空间服务平台',
      tag: '服务与协同',
      desc: '资源配置、密态计算、业务流程与角色协同主阵地',
      icon: ShieldCheck,
      color: 'from-blue-500 to-blue-600',
      actionText: '进入服务平台',
      btnStyle: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-blue-600/20',
      onLaunch: handleServicePlatformLaunch,
    },
    {
      id: 'authorization',
      name: '授权运营平台',
      tag: '管理与审计',
      desc: '数据授权管理控制台，提供策略配置、风险监测与存证审计',
      icon: CheckCircle2,
      color: 'from-blue-600 to-indigo-600',
      actionText: '进入授权运营',
      btnStyle: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold border-cyan-300/30 shadow-lg',
      onLaunch: () => {
        window.open(platformLinks.authorization, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'trading',
      name: '数据交易平台',
      tag: '交易与流通',
      desc: '数据产品发布、供需撮合、合规交易与价值转化操作平台',
      icon: Share2,
      color: 'from-blue-600 to-indigo-600',
      actionText: '进入数据交易',
      btnStyle: 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold border-cyan-300/30 shadow-lg',
      onLaunch: () => {
        window.open(platformLinks.trading, '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'connector',
      name: '可信数据空间连接器',
      tag: '数据流转实体',
      desc: '节点接入控制台，实现数据接入、产品发布与合约交易拉通',
      icon: Cpu,
      color: 'from-indigo-600 to-sky-600',
      actionText: '进入连接器',
      btnStyle: 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500 shadow-indigo-600/20',
      onLaunch: handleServicePlatformLaunch,
    },
  ];

  return (
    <div ref={dockRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-3 w-80 sm:w-96 rounded-2xl border border-blue-100 bg-white p-4 shadow-2xl backdrop-blur-xl ring-1 ring-black/5"
          >
            {/* 顶栏 */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">京畿数港 • 核心平台直达通道</h3>
                  <p className="text-[10px] text-slate-400">统一门户认证 / 多子系统快速跳转</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 平台列表 */}
            <div className="mt-3 space-y-2.5">
              {platforms.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      p.onLaunch();
                      setIsOpen(false);
                    }}
                    className="group relative cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 transition-all hover:border-blue-400 hover:bg-white hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${p.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{p.name}</h4>
                          </div>
                          <p className="mt-0.5 text-[10px] text-slate-500 line-clamp-1">{p.desc}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-semibold text-blue-800 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-full">
                        {p.tag}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          p.onLaunch();
                          setIsOpen(false);
                        }}
                        className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-lg border transition-all cursor-pointer shadow-xs active:scale-95 ${p.btnStyle}`}
                      >
                        {p.actionText}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 rounded-lg bg-slate-50 border border-slate-200/60 p-2.5 text-center">
              <p className="text-[10px] font-medium text-slate-500">
                京畿数港基础设施与业务多平台快速跳转通道
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 浮动触达按钮 */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        className="group flex items-center gap-2 rounded-full border border-blue-200 bg-slate-900 px-4 py-3 text-white shadow-[0_10px_30px_rgba(8,145,178,0.3)] backdrop-blur-md transition-all hover:bg-blue-950 hover:border-blue-300 cursor-pointer"
      >
        <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-slate-950 font-extrabold text-xs">
          <Layers className="h-3.5 w-3.5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping" />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-xs font-extrabold tracking-tight text-white flex items-center gap-1">
            平台直达
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />}
          </span>
        </div>
      </motion.button>
    </div>
  );
}
