import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Database,
  Server,
  Layers,
  ShoppingBag,
  Cpu,
  Lock,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  FileCheck,
  Workflow,
  Share2,
  Info,
  ChevronRight
} from 'lucide-react';

interface SpaceNode {
  id: string;
  role: string;
  type: string;
  badge: string;
  positionLabel: string;
  features: string[];
  icon: React.ElementType;
  flowText: string;
  x: number; // Center X in 1000px viewBox
  y: number; // Center Y in 680px viewBox
  color: {
    border: string;
    shadow: string;
    tagBg: string;
    tagText: string;
    iconBg: string;
    stroke: string;
  };
  steps: { title: string; desc: string }[];
}

const SUBJECT_PERSPECTIVES = [
  { id: 'all', name: '🌐 全景架构图', desc: '展示可信数据空间全域 6 大主体的协同关系与数据/控制流向' },
  { id: 'data_bureau', name: '🏛️ 数据局 (监管方)', desc: '聚焦合规监管、公共数据授权审批与规则制定流程' },
  { id: 'source', name: '🗄️ 数源方 (供给方)', desc: '聚焦数据目录挂牌、使用策略 (Usage Policy) 定义与源头授权' },
  { id: 'operator', name: '⚙️ 运营机构 (运维方)', desc: '聚焦连接器 (Connector) 部署、算力调度与节点运维' },
  { id: 'trader', name: '🔬 二级数商 (加工方)', desc: '聚焦数据清洗、密态建模与衍生 API 产品开发' },
  { id: 'demander', name: '🛒 市场主体 (需求方)', desc: '聚焦场景应用申请、密态数据调用与交付凭证确认' },
];

const NODES: SpaceNode[] = [
  {
    id: 'data_bureau',
    role: '数据局',
    type: '合规监管与治理主体',
    badge: '监管授权',
    positionLabel: '【正上方】',
    features: ['合规监管审查', '公共数据授权审批', '数据空间规则制定'],
    icon: Building2,
    flowText: '合规监管 & 规则发布',
    x: 500,
    y: 100,
    color: {
      border: 'border-amber-400 group-hover:border-amber-500',
      shadow: 'shadow-sm',
      tagBg: 'bg-amber-50 border-amber-200 text-amber-800',
      tagText: 'text-amber-700',
      iconBg: 'from-amber-500 to-amber-600 text-white',
      stroke: '#f59e0b',
    },
    steps: [
      { title: '1. 规则制定', desc: '颁布数据空间准入规范、使用策略（Usage Policy）标准及合规红线。' },
      { title: '2. 公共数据授权', desc: '受理并审批公共数据授权运营申请，核发数据凭证。' },
      { title: '3. 动态合规审计', desc: '实时监控中心平台全生命周期存证日志，保障跨域数据依法合规使用。' },
    ],
  },
  {
    id: 'source',
    role: '数源方',
    type: '数据资源供给主体',
    badge: '数据提供',
    positionLabel: '【左侧】',
    features: ['目录治理与挂牌', '使用策略（Usage Policy）定义', '源头授权与断开'],
    icon: Database,
    flowText: '目录挂牌 & 策略定义',
    x: 180,
    y: 280,
    color: {
      border: 'border-blue-500 group-hover:border-blue-600',
      shadow: 'shadow-sm',
      tagBg: 'bg-blue-50 border-blue-200 text-blue-800',
      tagText: 'text-blue-700',
      iconBg: 'from-blue-500 to-blue-600 text-white',
      stroke: '#06b6d4',
    },
    steps: [
      { title: '1. 资产盘点挂牌', desc: '对卫健、住建、公积金等部门数据资产脱敏目录化，挂牌至交易大厅。' },
      { title: '2. 策略精细配置', desc: '设置数据的访问次数上限、有效期、允许算法模式及禁止导出规则。' },
      { title: '3. 本地连接器管控', desc: '在局域网节点实时监控数据读取请求，确保未经授权数据永不出域。' },
    ],
  },
  {
    id: 'operator',
    role: '运营机构',
    type: '基础设施运维主体',
    badge: '平台运维',
    positionLabel: '【左下方】',
    features: ['连接器 (Connector) 部署', 'TEE 算力路由与调度', '节点运维与监控'],
    icon: Server,
    flowText: '节点连接 & 算力调度',
    x: 280,
    y: 520,
    color: {
      border: 'border-blue-500 group-hover:border-blue-600',
      shadow: 'shadow-sm',
      tagBg: 'bg-blue-50 border-blue-200 text-blue-800',
      tagText: 'text-blue-700',
      iconBg: 'from-blue-600 to-indigo-600 text-white',
      stroke: '#2563eb',
    },
    steps: [
      { title: '1. Connector节点开通', desc: '协助数源方与需求方部署轻量化可信连接器（Connector）。' },
      { title: '2. 密态环境路由', desc: '调度 TEE 硬件安全机密容器与多方安全计算（MPC）算力。' },
      { title: '3. 7x24运维监测', desc: '实时保障数据空间网络连通性、密钥管理与算力负载均衡。' },
    ],
  },
  {
    id: 'trader',
    role: '二级数商',
    type: '数据加工与模型服务商',
    badge: '加工孵化',
    positionLabel: '【右下方】',
    features: ['数据清洗与特征工程', '密态沙盒模型训练', '衍生 API 产品开发'],
    icon: Cpu,
    flowText: '模型训练 & 衍生开发',
    x: 720,
    y: 520,
    color: {
      border: 'border-emerald-500 group-hover:border-emerald-600',
      shadow: 'shadow-sm',
      tagBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      tagText: 'text-emerald-700',
      iconBg: 'from-emerald-500 to-blue-600 text-white',
      stroke: '#10b981',
    },
    steps: [
      { title: '1. 沙盒环境申请', desc: '申请进入 TEE 隔离沙盒，加载原始脱敏数据与算法代码。' },
      { title: '2. 联合建模与训练', desc: '在数据“可用不可见”前提下提取特征，训练行业风控或AI模型。' },
      { title: '3. 封装衍生产品', desc: '将模型输出为标准高价值 API 或数据分析报告，上架至产品大厅。' },
    ],
  },
  {
    id: 'demander',
    role: '市场主体',
    type: '数据消费与场景应用方',
    badge: '场景应用',
    positionLabel: '【右侧】',
    features: ['场景应用申请', '密态数据计算调用', '交付凭证与审计确认'],
    icon: ShoppingBag,
    flowText: '场景申请 & 密态调用',
    x: 820,
    y: 280,
    color: {
      border: 'border-purple-500 group-hover:border-purple-600',
      shadow: 'shadow-sm',
      tagBg: 'bg-purple-50 border-purple-200 text-purple-800',
      tagText: 'text-purple-700',
      iconBg: 'from-purple-500 to-indigo-600 text-white',
      stroke: '#a855f7',
    },
    steps: [
      { title: '1. 场景合规申请', desc: '提交具体业务场景（如信贷预授信、商保控费），签署可信使用协议。' },
      { title: '2. 密态结果获取', desc: '发起 API 密态计算请求，秒级接收合规脱敏后的计算或模型比对结果。' },
      { title: '3. 结果存证确认', desc: '生成区块链交易存证哈希，作为合规用数与结算依据。' },
    ],
  },
];

const CENTER_HUB = {
  x: 500,
  y: 330,
  title: '可信数据空间中心平台',
  subtitle: '核心控制与安全枢纽',
  features: [
    { name: 'DID 身份认证', desc: '分布式身份解耦与鉴权' },
    { name: '密态计算调度', desc: 'TEE/MPC/FL 算力路由' },
    { name: '全生命周期存证', desc: '区块链不可篡改审计' },
  ],
};

export const TrustedDataSpaceBusinessArchitecture: React.FC = () => {
  const [activeSubjectId, setActiveSubjectId] = useState<string>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const activeNode = NODES.find((n) => n.id === activeSubjectId) || null;

  return (
    <section className="relative my-8 w-full overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 text-slate-800 shadow-2xs md:p-8">
      {/* 1. Header Banner */}
      <div className="relative z-10 mb-6 rounded-xl bg-gradient-to-r from-[#0A2540] via-[#0052D9] to-[#0040B8] p-6 text-white shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-blue-200" />
              <span>ISOMETRIC ARCHITECTURE DESIGN</span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight md:text-3xl">
              可信数据空间业务架构图
            </h2>
            <p className="mt-1 text-xs text-blue-100 max-w-2xl leading-relaxed">
              基于“数据可用不可见、全程可追溯”原则，构建由数据局、数源方、运营机构、二级数商及需求方共同参与的可信协同网络。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/20">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-200 rounded-lg text-xs font-bold border border-emerald-400/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
              <span>密态数据安全传输中</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 text-white rounded-lg text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-blue-300" />
              <span>多方安全计算 TEE</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Subject Perspective Switcher */}
      <div className="relative z-10 mb-6 rounded-xl bg-slate-50 p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Workflow className="h-4 w-4 text-blue-600" />
            <span>切换主体视角（不同主体对应独立业务视图与操作流程）：</span>
          </div>
          {activeSubjectId !== 'all' && (
            <button
              onClick={() => setActiveSubjectId('all')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>返回全景视图</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {SUBJECT_PERSPECTIVES.map((tab) => {
            const isSelected = activeSubjectId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubjectId(tab.id)}
                className={`relative px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 text-left flex flex-col justify-between border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-[1.02]'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200/80'
                }`}
              >
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-2.5 px-2 py-1.5 bg-blue-50/60 rounded-lg text-[11px] text-blue-800 flex items-center gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-blue-600" />
          <span>
            {SUBJECT_PERSPECTIVES.find((p) => p.id === activeSubjectId)?.desc}
          </span>
        </div>
      </div>

      {/* 3. 3D Isometric Pedestal Canvas */}
      <div className="relative min-h-[640px] w-full overflow-x-auto overflow-y-hidden rounded-2xl bg-[#F8FAFC] p-2">
        <div 
          className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:36px_36px]"
          style={{
            transform: 'perspective(1000px) rotateX(55deg) scale(1.5) translateY(-80px)',
            transformOrigin: 'top center',
          }}
        />

        <div className="relative mx-auto min-w-[960px] max-w-[1000px] h-[630px]">
          
          <svg
            className="absolute inset-0 h-full w-full pointer-events-none z-10"
            viewBox="0 0 1000 630"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <marker
                id="arrow-blue"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#0066FF" />
              </marker>

              <radialGradient id="center-light-glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0066FF" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle
              cx={CENTER_HUB.x}
              cy={CENTER_HUB.y}
              r="150"
              fill="url(#center-light-glow)"
              className="animate-pulse"
            />

            {NODES.map((node) => {
              const isSelected = activeSubjectId === 'all' || activeSubjectId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isHighlighted = isSelected || isHovered;

              const dx = CENTER_HUB.x - node.x;
              const dy = CENTER_HUB.y - node.y;

              const cx1 = node.x + dx * 0.5;
              const cy1 = node.y + dy * 0.1;
              const cx2 = node.x + dx * 0.5;
              const cy2 = CENTER_HUB.y - dy * 0.1;

              const pathD = `M ${node.x} ${node.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${CENTER_HUB.x} ${CENTER_HUB.y}`;

              const midX = (node.x + CENTER_HUB.x) / 2;
              const midY = (node.y + CENTER_HUB.y) / 2 - (node.y < CENTER_HUB.y ? 12 : -12);

              return (
                <g key={`pipe-${node.id}`} className="transition-all duration-300">
                  <path
                    d={pathD}
                    stroke={node.color.stroke}
                    strokeWidth={isHighlighted ? '3' : '1.5'}
                    strokeDasharray="8 12"
                    fill="none"
                    markerEnd="url(#arrow-blue)"
                    className={`transition-all duration-300 ${
                      isHighlighted ? 'animate-[dash_1.5s_linear_infinite]' : 'animate-[dash_3s_linear_infinite]'
                    }`}
                  />

                  <foreignObject
                    x={midX - 75}
                    y={midY - 14}
                    width="150"
                    height="28"
                    className="overflow-visible pointer-events-none"
                  >
                    <div className="flex justify-center items-center h-full">
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-md transition-all duration-300 whitespace-nowrap ${
                          isHighlighted
                            ? 'bg-blue-600 text-white shadow-xs scale-105'
                            : 'bg-white/90 text-slate-600 opacity-80'
                        }`}
                      >
                        {node.flowText}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>

          {/* 中央核心枢纽 */}
          <div
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
            style={{ left: `${CENTER_HUB.x}px`, top: `${CENTER_HUB.y}px` }}
            onClick={() => setActiveSubjectId('all')}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.03 }}
              className="relative group rounded-2xl bg-white border border-blue-200 p-5 shadow-sm w-[310px] text-center"
            >
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3.5 py-0.5 text-[11px] font-bold text-white shadow-xs flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-300" />
                <span>核心服务平台</span>
              </div>

              <div className="mt-2 flex items-center justify-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xs">
                  <Cpu className="h-8 w-8 text-blue-200" />
                  <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white border-2 border-white">
                    ✓
                  </span>
                </div>
              </div>

              <h3 className="mt-2.5 text-base font-black tracking-wide text-slate-900">
                {CENTER_HUB.title}
              </h3>
              <p className="text-[11px] font-medium text-blue-600">
                {CENTER_HUB.subtitle}
              </p>

              <div className="mt-3 grid grid-cols-1 gap-1.5">
                {CENTER_HUB.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-1.5 text-left text-[11px] text-slate-800"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span className="font-bold text-slate-900">{feat.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{feat.desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* 5大主体卫星节点 */}
          {NODES.map((node) => {
            const Icon = node.icon;
            const isSelected = activeSubjectId === 'all' || activeSubjectId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isHighlighted = isSelected || isHovered;

            return (
              <div
                key={node.id}
                className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                  isHighlighted ? 'opacity-100 scale-100 z-30' : 'opacity-40 scale-95'
                }`}
                style={{ left: `${node.x}px`, top: `${node.y}px` }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={() => setActiveSubjectId(node.id)}
              >
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className={`group relative rounded-2xl bg-white p-4 cursor-pointer transition-all duration-300 w-[240px] shadow-2xs ${
                    isHighlighted
                      ? 'border border-blue-400 shadow-md'
                      : 'border border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${node.color.tagBg}`}>
                      {node.badge}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                      {node.positionLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold`}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                        {node.role}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate font-medium">
                        {node.type}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-1">
                    {node.features.map((ft, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                        <span className="truncate">{ft}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold text-blue-600 group-hover:text-blue-800 transition-colors pt-1 border-t border-dashed border-slate-100">
                    <span>点击查看{node.role}流程</span>
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Subject Workflow & Action Steps Card */}
      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeNode ? (
            <motion.div
              key={activeNode.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-xl bg-slate-50 p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/80 pb-3 mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl bg-blue-600 text-white`}>
                    <activeNode.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>【{activeNode.role}】核心业务流程与权责划分</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${activeNode.color.tagBg}`}>
                        {activeNode.badge}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">{activeNode.type}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveSubjectId('all')}
                  className="text-xs font-bold text-blue-600 hover:bg-white px-3 py-1.5 rounded-lg border border-slate-200 transition-colors self-start md:self-auto"
                >
                  切换回全景架构图
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {activeNode.steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl bg-white p-4 shadow-2xs"
                  >
                    <div className="text-xs font-bold text-blue-600 mb-1">{step.title}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="all_summary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl bg-slate-50 p-5"
            >
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <span>可信数据空间多主体协同权责体系说明：</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
                {NODES.map((node) => (
                  <button
                    key={node.id}
                    onClick={() => setActiveSubjectId(node.id)}
                    className="p-3 rounded-xl bg-white hover:shadow-xs transition-all text-left flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center justify-between mb-1">
                        <span>{node.role}</span>
                        <span className="text-[10px] text-blue-600 font-semibold">{node.badge}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{node.features.join(' / ')}</p>
                    </div>
                    <div className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1">
                      <span>查看主体架构图</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -40;
          }
        }
      `}</style>
    </section>
  );
};
