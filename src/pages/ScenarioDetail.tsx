import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  Database,
  FileText,
  KeyRound,
  Shield,
  Workflow,
} from 'lucide-react';
import { keyScenarios } from '../data/mockData';

const scenarioPlans = {
  'sc-001': {
    object: '面向异地缴存、贷款额度核验、组合贷初筛等高频事项，减少纸质证明和人工往返。',
    boundary: '仅输出缴存状态、额度区间、核验结果等必要结论，不暴露个人明细账户和完整流水。',
    metrics: ['异地材料减免', '秒级核验', '人工复核减少', '全程留痕'],
    steps: ['申请人授权', '公积金数据碰撞', '银行端结果接收', '业务窗口复核归档'],
  },
  'sc-002': {
    object: '面向公共卫生趋势研判、补充医疗保障核保核赔等场景，提升健康数据协同效率。',
    boundary: '以脱敏统计指标、联邦学习特征和模型结果为主，不输出个人病历明细。',
    metrics: ['趋势研判提速', '模型联合训练', '隐私信息不出域', '理赔协同优化'],
    steps: ['场景用途登记', '指标脱敏汇聚', '联邦模型计算', '应用方获取结论'],
  },
  'sc-003': {
    object: '面向企业授信、资质核验、风险排查等场景，降低重复提交材料和多部门人工核验成本。',
    boundary: '围绕法人登记、经营状态、异常风险等结论型数据授权，避免过度调取原始材料。',
    metrics: ['免材料授信', '风险交叉校验', '审批链路压缩', '异常命中预警'],
    steps: ['企业线上授权', '法人信息交叉校验', '风险规则计算', '授信结果回传'],
  },
  'sc-004': {
    object: '面向抵押贷款、权属核验、查封状态监测等场景，提升涉房金融风险识别能力。',
    boundary: '输出一致性、状态变更、风险提示等结果，不直接开放完整不动产登记明细。',
    metrics: ['权属秒级核验', '查封变更提醒', '重复抵押防控', '线上联审支撑'],
    steps: ['权属核验申请', '可信空间比对', '状态结果返回', '风险事件订阅'],
  },
};

export function ScenarioDetail() {
  const { id } = useParams<{ id: string }>();
  const scenario = keyScenarios.find((item) => item.id === id);
  const plan = scenarioPlans[id as keyof typeof scenarioPlans];

  if (!scenario || !plan) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
        <FileText className="w-14 h-14 text-slate-300 mb-5" />
        <h1 className="text-2xl font-bold text-slate-900">场景方案不存在</h1>
        <p className="mt-2 text-sm text-slate-500">该场景可能已调整或下线。</p>
        <Link to="/scenarios" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500">
          <ArrowLeft className="w-4 h-4" />
          返回场景方案
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <section className="bg-white border-b border-slate-200 py-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link to="/scenarios" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            返回场景方案列表
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold text-cyan-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                运行成效显著
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{scenario.name}</h1>
              <p className="mt-4 text-sm leading-7 text-slate-500 md:text-[15px]">{scenario.description}</p>
              <p className="mt-4 text-sm leading-7 text-slate-600 md:text-[15px]">{plan.object}</p>
            </div>

            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-sm aspect-[16/10]">
                <img
                  src={scenario.image}
                  alt={scenario.name}
                  className="h-full w-full object-cover opacity-75"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/15 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs font-semibold text-cyan-200">可信数据空间场景方案</p>
                  <p className="mt-1 text-lg font-bold text-white">{scenario.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-6xl mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Workflow className="w-4.5 h-4.5 text-cyan-600" />
              场景核心价值与成效
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">{scenario.value}</p>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
              {plan.metrics.map((metric) => (
                <div key={metric} className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-3 text-center">
                  <BarChart3 className="mx-auto h-4 w-4 text-cyan-600" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">{metric}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Database className="w-4.5 h-4.5 text-cyan-600" />
              支撑关键数据及算法
            </h2>
            <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
              {scenario.dataSupport}
            </p>
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-xs font-bold text-slate-800">授权边界</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{plan.boundary}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <ClipboardCheck className="w-4.5 h-4.5 text-cyan-600" />
              实施链路
            </h2>
            <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
              {plan.steps.map((step, index) => (
                <div key={step} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="text-[11px] font-bold text-cyan-600">0{index + 1}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-800">{step}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">协同参与类型</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {scenario.departments.map((dept) => (
                <span key={dept} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                  {dept}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-900">治理规则</h2>
            <div className="mt-4 space-y-3">
              {[
                { label: '授权前置', icon: KeyRound },
                { label: '可用不可见', icon: Shield },
                { label: '结果可追溯', icon: FileText },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                  <item.icon className="h-4 w-4 text-cyan-600" />
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-300">可信保障</h2>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              场景方案在授权、调用、计算、交付和审计环节保留完整过程记录，满足数据可用不可见和最小必要使用要求。
            </p>
            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-cyan-300">
              <Shield className="w-4 h-4" />
              全流程审计留痕
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
