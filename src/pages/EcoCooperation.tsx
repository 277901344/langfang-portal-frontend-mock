import { motion } from 'motion/react';
import { Activity, ClipboardCheck, FileCheck2, KeyRound, Network, ShieldAlert, Users2 } from 'lucide-react';

const cooperationSteps = [
  {
    title: '合作意向登记',
    description: '由潜在参与方提交合作方向、业务场景、数据需求或服务能力，形成可评估的合作申请。',
    icon: Users2,
  },
  {
    title: '主体资质核验',
    description: '围绕主体身份、业务资质、数据安全能力和合规承诺开展准入核验，明确参与边界。',
    icon: ClipboardCheck,
  },
  {
    title: '场景与数据评审',
    description: '对数据用途、最小必要范围、流通方式、算法模型和交付结果进行联合评审。',
    icon: FileCheck2,
  },
  {
    title: '授权与策略配置',
    description: '按角色、场景、期限和访问范围配置授权策略，实现可用不可见、可控可追溯。',
    icon: KeyRound,
  },
  {
    title: '安全测评接入',
    description: '完成接口、连接器、密态计算、日志留痕与风险监测等接入检查后进入试运行。',
    icon: ShieldAlert,
  },
  {
    title: '运营审计闭环',
    description: '对调用、授权、交易、收益和异常行为持续审计，形成可复盘的运营闭环。',
    icon: Activity,
  },
];

const roleFlows = [
  {
    title: '数据供给侧',
    description: '负责数据目录、资源描述、授权确认和质量维护，在规则约束下参与安全流通。',
  },
  {
    title: '运营治理侧',
    description: '负责准入审核、策略配置、过程监管、风险处置和审计留痕。',
  },
  {
    title: '服务应用侧',
    description: '围绕明确业务场景提出数据需求，按授权结果开展产品应用和价值转化。',
  },
  {
    title: '技术支撑侧',
    description: '提供连接器、隐私计算、存证审计、安全测评和平台运维能力。',
  },
];

export function EcoCooperation() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Top minimal banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-800 to-cyan-950 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-80 h-80 bg-teal-400 rounded-full blur-2xl -top-10 -right-10"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-teal-400 font-semibold tracking-wider text-xs uppercase bg-teal-400/10 px-3 py-1 rounded-full">构建多方协同生态</span>
            <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4 tracking-tighter">生态合作交流大厅</h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
              围绕可信数据空间的准入、授权、流通、应用和审计流程，建立多角色协同机制，推动公共数据资产在安全合规前提下有序流通。
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <span className="text-xs font-semibold text-cyan-600 bg-cyan-100/60 px-2.5 py-1 rounded">可信协同机制</span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">可信数据空间准入与合规机制</h2>
            <p className="text-slate-500 text-sm mt-1">以流程规则代替主体背书，保障合作可审、可控、可持续</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldAlert,
                title: '多维主体合规准入',
                description: '围绕主体资质、授权边界、安全能力与责任承诺开展准入审核，筑牢信任第一防线。',
              },
              {
                icon: Network,
                title: '全链路协同流通',
                description: '贯通数据供给、运营治理、服务应用与技术支撑流程，形成可追溯的协作网络。',
              },
              {
                icon: Activity,
                title: '持续审计与风险闭环',
                description: '对授权、调用、交付、交易和异常行为进行持续监测，保障合作过程全程留痕。',
              },
            ].map((mech, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-50 border border-slate-200 relative">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center mb-4">
                  <mech.icon className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{mech.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{mech.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">合作流程</h2>
            <p className="text-sm text-slate-500 mt-2">以“申请-审核-授权-接入-运营-审计”闭环推进生态合作</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cooperationSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-300">0{index + 1}</span>
                  </div>
                  <h3 className="text-base font-bold tracking-tight text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mt-14 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4">
              <span className="text-xs font-semibold text-cyan-600 bg-cyan-100/60 px-2.5 py-1 rounded">角色边界</span>
              <h2 className="text-2xl font-bold text-slate-900 mt-3">打通“政-产-学-研-用”全生命周期链条</h2>
              <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                页面仅描述合作机制和角色分工，不展示真实单位名称。各方在统一规则下完成数据供给、治理运营、技术支撑和场景应用协同。
              </p>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {roleFlows.map((role) => (
                <div key={role.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-sm font-bold text-slate-900">{role.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-2">{role.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
