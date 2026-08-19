import { useEffect, type ReactNode } from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  ClipboardCheck,
  Database,
  ExternalLink,
  FileCheck2,
  FileSearch,
  Fingerprint,
  Gauge,
  KeyRound,
  Landmark,
  LockKeyhole,
  Network,
  PackageSearch,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  UsersRound,
  Workflow,
} from 'lucide-react';
import { platformLinks } from '../lib/platformLinks';
import { PageBanner } from '../components/PageBanner';

type Action = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type Capability = {
  icon: LucideIcon;
  title: string;
  description: string;
};

type PlatformIntroProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  actions: Action[];
  diagramIcons: LucideIcon[];
  capabilityLead: string;
  capabilities: Capability[];
  steps: Array<{ index: string; title: string; description: string }>;
  governanceTitle: string;
  governanceDescription: string;
  governanceItems: Array<{ icon: LucideIcon; title: string; description: string }>;
  accent: 'cyan' | 'blue';
  variant?: 1 | 2 | 3 | 4 | 5 | 6;
};

function ExternalAction({ action }: { action: Action; accent?: 'cyan' | 'blue' }) {
  const isPrimary = action.variant !== 'secondary';

  if (!isPrimary) {
    return (
      <a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative h-[54px] sm:h-[58px] px-8 sm:px-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-[#1459EB] hover:text-[#1459EB] font-bold text-[15px] sm:text-[16px] shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all inline-flex items-center gap-3 cursor-pointer"
        aria-label={`${action.label}，新窗口打开`}
      >
        <span>{action.label}</span>
        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#1459EB] group-hover:translate-x-0.5 transition-all" />
      </a>
    );
  }

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden h-[54px] sm:h-[58px] px-9 sm:px-12 rounded-2xl bg-gradient-to-r from-[#1459EB] via-[#246BFD] to-[#0A4BD6] text-white font-extrabold text-[16px] sm:text-[17px] tracking-wide shadow-[0_12px_28px_-4px_rgba(20,89,235,0.5)] hover:shadow-[0_16px_36px_-4px_rgba(20,89,235,0.7)] hover:scale-[1.03] active:scale-[0.97] transition-all inline-flex items-center gap-3 cursor-pointer ring-4 ring-blue-500/20"
      aria-label={`${action.label}，新窗口打开`}
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
      <span className="relative z-10">{action.label}</span>
      <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-200" />
    </a>
  );
}

function SectionHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center space-y-2">
      <div className="relative inline-block">
        <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">{title}</h2>
        <div className="mt-2.5 mx-auto w-12 h-1 bg-gradient-to-r from-blue-600 to-sky-400 rounded-full" />
      </div>
      <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-500 max-w-2xl mx-auto">{children}</p>
    </div>
  );
}

function PlatformIntroPage(props: PlatformIntroProps) {
  const PlatformIcon = props.icon;
  const accentGlow = props.accent === 'blue' ? 'bg-blue-500/15' : 'bg-blue-400/15';
  const diagramPositions = [
    'left-[8%] top-[15%]',
    'right-[8%] top-[15%]',
    'bottom-[15%] left-[8%]',
    'bottom-[15%] right-[8%]',
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f8fb] text-slate-900 selection:bg-blue-400/25">
      {/* 统一 3D 玻璃质感 Banner */}
      <PageBanner
        title={props.title}
        subtitle={props.description}
        tag="核心平台能力"
        variant={props.variant || 1}
      >
        <div className="flex flex-wrap items-center gap-3 pt-2">
          {props.actions.map((action) => (
            <ExternalAction key={action.label} action={action} accent={props.accent} />
          ))}
        </div>
      </PageBanner>

      <section className="border-b border-slate-200 bg-white py-12 md:py-14">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading title="平台核心能力">
            {props.capabilityLead}
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {props.capabilities.map((capability, index) => {
              const Icon = capability.icon;
              return (
                <motion.article
                  key={capability.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-slate-900">{capability.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{capability.description}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-14">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
          <SectionHeading title="清晰、可控的服务流程">
            从业务发起到过程监管与结果留痕，以标准化节点降低跨主体协作成本。
          </SectionHeading>
          <div className="relative grid gap-4 md:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent md:block" />
            {props.steps.map((step) => (
              <div key={step.index} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:border-0 md:bg-transparent md:p-3 md:text-center md:shadow-none">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#f4f8fb] bg-slate-950 font-mono text-xs font-bold text-blue-300 shadow-md md:mx-auto">
                  {step.index}
                </div>
                <h3 className="mt-4 text-sm font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-16 text-slate-900 md:py-20">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="text-[11px] font-bold tracking-[0.22em] text-blue-700">可信治理</div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{props.governanceTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{props.governanceDescription}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {props.governanceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-blue-700" />
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="mt-2 pl-8 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 底部醒目操作指引区 */}
      <section className="py-14 sm:py-16 bg-gradient-to-b from-[#f4f8fb] to-slate-100">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900 via-[#0E3D9E] to-blue-950 text-white shadow-xl relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight relative z-10 mb-3">
              立即开启高效、合规的数据流通与交易
            </h3>
            <p className="text-xs sm:text-sm text-blue-100/85 max-w-2xl mx-auto leading-relaxed relative z-10 mb-8">
              连接京畿数港·廊坊城市可信数据空间，汇聚优质数据产品，实现要素市场化配置。
            </p>
            <div className="flex justify-center relative z-10">
              {props.actions.map((action) => (
                <ExternalAction key={action.label} action={action} accent={props.accent} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function AuthorizationPlatform() {
  return (
    <PlatformIntroPage
      accent="cyan"
      variant={1}
      icon={ShieldCheck}
      title="让每一次数据使用，都经过授权并可追溯"
      description="面向公共数据授权运营全生命周期，统一承接运营主体准入、数据申请、合规审核、授权策略、过程监管与审计留痕，让数据在明确边界内安全合规使用。"
      actions={[
        {
          label: '进入授权运营',
          href: platformLinks.authorization,
        },
      ]}
      diagramIcons={[UsersRound, FileCheck2, KeyRound, FileSearch]}
      capabilityLead="围绕“谁能用、用什么、为何用、用多久、如何审计”建立统一运营与监管闭环。"
      capabilities={[
        { icon: UsersRound, title: '运营主体管理', description: '统一管理运营机构、数据提供方与使用方身份，形成权责清晰的主体档案。' },
        { icon: FileCheck2, title: '授权申请与审核', description: '按场景提交数据使用申请，支撑材料校验、多级审核与审批意见留痕。' },
        { icon: KeyRound, title: '精细授权策略', description: '按主体、用途、数据范围、期限及使用方式配置最小必要权限。' },
        { icon: Workflow, title: '运营流程管控', description: '将申请、审核、授权、变更、撤销纳入标准流程，避免线下操作失控。' },
        { icon: Gauge, title: '风险监测预警', description: '持续感知异常访问、越权使用与策略到期风险，支撑及时处置。' },
        { icon: FileSearch, title: '全链路审计', description: '记录授权依据、数据调用与处置结果，为监督检查和责任追溯提供证据。' },
      ]}
      steps={[
        { index: '01', title: '主体准入', description: '核验运营资质与责任边界' },
        { index: '02', title: '场景申请', description: '明确用途、范围与期限' },
        { index: '03', title: '合规审核', description: '完成材料与必要性审查' },
        { index: '04', title: '策略授权', description: '下发可执行访问策略' },
        { index: '05', title: '监管审计', description: '持续监测并闭环处置' },
      ]}
      governanceTitle="以制度规则约束技术权限，以过程证据支撑责任认定"
      governanceDescription="授权运营不是简单开通账户，而是把公共数据使用的制度要求转化为可执行、可检查、可追责的线上规则。"
      governanceItems={[
        { icon: Scale, title: '合规依据在线化', description: '关联授权文件、审批意见和使用约束。' },
        { icon: LockKeyhole, title: '权限边界可执行', description: '将用途、期限和数据范围落实为访问策略。' },
        { icon: Fingerprint, title: '操作身份可确认', description: '主体与账号关联，关键操作责任到人。' },
        { icon: ClipboardCheck, title: '审计结果可核验', description: '形成完整证据链，支持监督检查与复盘。' },
      ]}
    />
  );
}

export function TradingPlatform() {
  return (
    <PlatformIntroPage
      accent="blue"
      variant={2}
      icon={Store}
      title="让数据产品找得到、需求接得住、交易有保障"
      description="汇聚合规可用的数据产品与真实业务需求，提供市场浏览、需求对接、交易撮合及履约支撑服务，连接供需双方，推动数据要素安全高效流通与价值转化。"
      actions={[
        {
          label: '进入数据交易',
          href: platformLinks.trading,
        },
      ]}
      diagramIcons={[Database, Search, Network, BadgeCheck]}
      capabilityLead="围绕数据产品发现、需求对接、交易撮合与履约服务，为供需双方提供一站式交易入口。"
      capabilities={[
        { icon: Store, title: '数据市场', description: '集中展示数据产品、服务能力和应用方向，帮助需求方快速发现可用资源。' },
        { icon: Search, title: '分类检索', description: '按主题、行业、应用场景与更新频率筛选，提高产品查找效率。' },
        { icon: PackageSearch, title: '需求中心', description: '公开汇集真实数据需求，帮助供给方理解市场方向并开展精准响应。' },
        { icon: Network, title: '供需撮合', description: '连接数据提供方、需求方与服务机构，缩短沟通与方案确认链路。' },
        { icon: Boxes, title: '产品服务管理', description: '支撑数据产品信息、交付方式、使用条件和服务说明规范呈现。' },
        { icon: BarChart3, title: '交易运营分析', description: '沉淀市场供需和交易服务数据，为产品优化与运营决策提供依据。' },
      ]}
      steps={[
        { index: '01', title: '发现资源', description: '浏览市场或检索数据产品' },
        { index: '02', title: '提出需求', description: '发布需求并明确使用场景' },
        { index: '03', title: '供需对接', description: '匹配产品、主体与服务方案' },
        { index: '04', title: '交易确认', description: '确认条件并形成交易约定' },
        { index: '05', title: '履约服务', description: '交付使用并留存过程记录' },
      ]}
      governanceTitle="市场服务与可信数据空间能力协同，保障数据可流通、可使用、可监管"
      governanceDescription="平台通过统一产品信息、主体服务、流程规则与可信交付能力，降低交易信息差与协作成本。"
      governanceItems={[
        { icon: Landmark, title: '主体服务规范', description: '明确供需双方与服务机构的角色和责任。' },
        { icon: Database, title: '产品信息规范', description: '统一描述数据内容、来源、用途与交付条件。' },
        { icon: ShieldCheck, title: '可信交付支撑', description: '依托可信空间实现受控使用与过程留痕。' },
        { icon: BadgeCheck, title: '交易过程保障', description: '关键节点有记录，异常问题可跟踪、可处置。' },
      ]}
    />
  );
}
