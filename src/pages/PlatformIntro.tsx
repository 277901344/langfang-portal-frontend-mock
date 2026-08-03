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
  Store,
  UsersRound,
  Workflow,
} from 'lucide-react';
import { platformLinks } from '../lib/platformLinks';

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
};

function ExternalAction({ action }: { action: Action }) {
  const isPrimary = action.variant !== 'secondary';

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        isPrimary
          ? 'group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_12px_30px_rgba(6,182,212,0.22)] transition-all hover:-translate-y-0.5 hover:bg-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
          : 'group inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950'
      }
      aria-label={`${action.label}，新窗口打开`}
    >
      {action.label}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </a>
  );
}

function SectionHeading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-500">{children}</p>
    </div>
  );
}

function PlatformIntroPage(props: PlatformIntroProps) {
  const PlatformIcon = props.icon;
  const accentGlow = props.accent === 'blue' ? 'bg-blue-500/15' : 'bg-cyan-400/15';
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
    <div className="min-h-screen bg-[#f4f8fb] text-slate-900 selection:bg-cyan-400/25">
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_15%_15%,rgba(8,145,178,0.22),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(14,116,144,0.22),transparent_34%)]" />
        <div className="absolute inset-0 -z-10 opacity-[0.13] [background-image:linear-gradient(rgba(255,255,255,.17)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.17)_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className={`absolute -right-32 top-10 -z-10 h-96 w-96 rounded-full blur-3xl ${accentGlow}`} />

        <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-10 md:py-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <h1 className="max-w-3xl text-3xl font-black leading-[1.2] tracking-tight md:text-4xl lg:text-[2.7rem]">
              {props.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">{props.description}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {props.actions.map((action) => (
                <ExternalAction key={action.label} action={action} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.12 }}
            className="relative mx-auto w-full max-w-xs"
          >
            <div className="absolute -inset-5 rounded-[2.5rem] border border-cyan-300/10" />
            <div
              role="img"
              aria-label="可信数据业务流转示意图"
              className="relative h-52 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl md:h-60"
            >
              <div className="absolute inset-[12%] rounded-full border border-cyan-300/10" />
              <div className="absolute inset-[26%] rounded-full border border-cyan-300/15" />
              <div className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 -translate-y-1/2 rotate-[28deg] bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
              <div className="absolute left-1/2 top-1/2 h-px w-[70%] -translate-x-1/2 -translate-y-1/2 -rotate-[28deg] bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent" />
              <div className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.6rem] border border-cyan-200/30 bg-cyan-400 text-slate-950 shadow-[0_0_42px_rgba(34,211,238,0.28)]">
                <PlatformIcon className="h-9 w-9" />
              </div>
              {props.diagramIcons.map((DiagramIcon, index) => (
                  <div
                    key={index}
                    className={`absolute flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-slate-900/90 text-cyan-300 shadow-lg ${diagramPositions[index]}`}
                  >
                    <DiagramIcon className="h-5 w-5" />
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
                  </div>
              ))}
              <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-[72px] animate-pulse rounded-full bg-cyan-200 shadow-[0_0_16px_rgba(165,243,252,0.9)] md:-translate-y-[82px]" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-12 md:py-14">
        <div className="container mx-auto max-w-6xl px-4">
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
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-cyan-200 hover:shadow-[0_18px_45px_rgba(15,118,110,0.08)]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
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
        <div className="container mx-auto max-w-6xl px-4">
          <SectionHeading title="清晰、可控的服务流程">
            从业务发起到过程监管与结果留痕，以标准化节点降低跨主体协作成本。
          </SectionHeading>
          <div className="relative grid gap-4 md:grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent md:block" />
            {props.steps.map((step) => (
              <div key={step.index} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:border-0 md:bg-transparent md:p-3 md:text-center md:shadow-none">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-[#f4f8fb] bg-slate-950 font-mono text-xs font-bold text-cyan-300 shadow-md md:mx-auto">
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
        <div className="container mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <div className="text-[11px] font-bold tracking-[0.22em] text-cyan-700">可信治理</div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">{props.governanceTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">{props.governanceDescription}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {props.governanceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition-colors hover:border-cyan-200 hover:bg-cyan-50/40">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-cyan-700" />
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  </div>
                  <p className="mt-2 pl-8 text-xs leading-5 text-slate-500">{item.description}</p>
                </div>
              );
            })}
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
      icon={ShieldCheck}
      title="让每一次数据使用，都经过授权并可追溯"
      description="面向公共数据授权运营全生命周期，统一承接运营主体准入、数据申请、合规审核、授权策略、过程监管与审计留痕，让数据在明确边界内安全合规使用。"
      actions={[
        {
          label: '登录授权运营平台',
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
      icon={Store}
      title="让数据产品找得到、需求接得住、交易有保障"
      description="汇聚合规可用的数据产品与真实业务需求，提供市场浏览、需求对接、交易撮合及履约支撑服务，连接供需双方，推动数据要素安全高效流通与价值转化。"
      actions={[
        {
          label: '进入数据交易平台',
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
