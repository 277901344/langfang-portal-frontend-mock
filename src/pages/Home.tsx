import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Globe, Share2, Database, FileText,
  LayoutIcon, Shield, CheckCircle2, ExternalLink,
} from 'lucide-react';
import { platformStats, dataProducts, keyScenarios } from '../data/mockData';
import { platformLinks } from '../lib/platformLinks';

export function Home() {
  const systemEntries = [
    {
      title: '可信数据空间服务平台',
      description: '统一服务与协作主入口，支撑空间资源、业务流程与角色协同管理。',
      href: platformLinks.service,
      icon: ShieldCheck,
      tag: '服务主入口',
    },
    {
      title: '授权运营平台',
      description: '负责授权策略、运营管控、访问留痕与全流程审计。',
      href: '#/platform/authorization',
      icon: CheckCircle2,
      tag: '授权与审计',
    },
    {
      title: '数据交易平台',
      description: '承接数据产品发布、供需撮合、交易流通与价值转化。',
      href: '#/platform/trading',
      icon: Share2,
      tag: '交易流通',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 selection:bg-cyan-500/20">
      
      {/* 4.1 第一段：首屏汇报封面 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 pt-20 pb-36 text-white">
        {/* Soft elegant particles layout */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1600" 
            alt="Langfang Digital City Network" 
            className="w-full h-full object-cover opacity-20 mix-blend-screen"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-950" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-400/15 border border-cyan-400/20 rounded-full text-[11px] md:text-xs font-semibold tracking-wide text-cyan-300">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
              廊坊市数据要素配置关键底座基础设施
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-white leading-tight">
              京畿数港-廊坊城市可信数据空间
            </h1>

            <p className="mx-auto max-w-3xl pt-2 text-sm leading-7 text-slate-300 md:text-[15px]">
              作为廊坊市数据要素市场化配置的关键基础设施，旨在保障政、企、民生多方跨域数据安全高效流通，连接公共治理痛点，赋能数字廊坊整体建设。
            </p>
            
            <div className="flex items-center justify-center gap-3 text-xs text-slate-400 font-medium pt-6">
              <span>快速导航：</span>
              <Link to="/scenarios" className="hover:text-cyan-300 transition-colors border-b border-slate-700 hover:border-cyan-300 pb-0.5">公积金专题</Link>
              <span className="text-slate-700">•</span>
              <Link to="/scenarios" className="hover:text-cyan-300 transition-colors border-b border-slate-700 hover:border-cyan-300 pb-0.5">卫健数据共享</Link>
              <span className="text-slate-700">•</span>
              <Link to="/products" className="hover:text-cyan-300 transition-colors border-b border-slate-700 hover:border-cyan-300 pb-0.5">法人数据产品</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4.1 第一段 - 4个混合指标：横向吸附于首屏底层 */}
      <section className="relative z-20 -mt-16 mb-16 max-w-6xl mx-auto w-full px-4">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(13,148,136,0.06)] border border-slate-200 p-6 md:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 lg:divide-x divide-slate-200">
            {platformStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={stat.id} className="flex flex-col items-center text-center p-4 lg:p-2">
                  <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-cyan-600" />
                  </div>
                  <span className="text-[10px] text-cyan-600 font-bold tracking-widest uppercase mb-1">{stat.category}指标</span>
                  <div className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-1 font-mono tracking-tight">
                    {stat.value}
                    <span className="text-sm font-sans font-semibold text-slate-500 ml-0.5">{stat.suffix}</span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4.2 第二段：建设成果总览 */}
      <section className="py-12 bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">建设及合规成果总览</h2>
            <p className="text-xs text-slate-500 mt-1">支撑跨域数据合作、法规合规自律与业务落地的快速成果盘点</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "建设进展",
                conclusion: "完成核心技术安全自研，取得多方安全计算、联邦学习测评双证书",
                metric: "高级算法双认证",
                color: "cyan"
              },
              {
                title: "制度成果",
                conclusion: "发布《廊坊数据可信空间共享管理程序》并落地5项重要地方规范",
                metric: "5 项国家标准级规范",
                color: "teal"
              },
              {
                title: "专题落地",
                conclusion: "成功上线公积金、卫健、法人等多重跨部门、跨地域数据验证场景",
                metric: "4 大重点民生保障",
                color: "sky"
              },
              {
                title: "协同成效",
                conclusion: "汇集廊坊社会生产服务、20+主流金融保险及政府审批协同链条",
                metric: "85 家多边协同机构",
                color: "emerald"
              }
            ].map((out, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full" />
                    <h3 className="text-sm font-bold text-slate-800">{out.title}</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">{out.conclusion}</p>
                </div>
                
                <div className="mt-4 pt-3 border-t border-slate-200">
                  <span className="text-[11px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">
                    {out.metric}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4.3 第三段：总体架构图 */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">可信空间系统架构图</h2>
            <p className="text-xs text-slate-500 mt-1">
              基于廊坊数据要素的实际业务链路拓扑设计，全面支撑公共要素流动与跨多域密态协同
            </p>
          </div>

          <div
            role="img"
            aria-label="廊坊城市可信数据空间五层上升式系统架构"
            className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white px-4 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] md:px-8 md:py-8"
          >
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-100/50 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-blue-100/50 blur-3xl" />

            <div className="relative flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-cyan-700">总体架构</span>
                <h3 className="mt-1.5 text-lg font-extrabold tracking-tight text-slate-900 md:text-xl">
                  五层可信能力体系
                </h3>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                <span>数据筑基</span>
                <span className="h-px w-8 bg-gradient-to-r from-slate-300 to-cyan-500" />
                <span>可信流通</span>
                <span className="h-px w-8 bg-gradient-to-r from-cyan-500 to-teal-500" />
                <span className="font-semibold text-teal-700">价值释放</span>
              </div>
            </div>

            <div className="relative mt-6 md:px-5">
              <div className="pointer-events-none absolute bottom-5 left-1/2 top-5 hidden w-px -translate-x-1/2 bg-gradient-to-t from-slate-700 via-cyan-400 to-teal-400 md:block">
                <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 border-l border-t border-teal-500" />
              </div>

              <div className="relative z-10 flex flex-col items-center gap-3">
                {[
                  {
                    index: '05',
                    title: '生态应用层',
                    description: '面向城市治理与产业发展，释放可信数据应用价值。',
                    icon: Globe,
                    items: ['政务协同', '金融服务', '医疗健康', '社会治理', '科研创新'],
                    width: 'md:w-[84%]',
                    shell: 'border-teal-500/70 bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-700 text-white shadow-[0_14px_30px_rgba(8,145,178,0.2)]',
                    iconStyle: 'border-white/25 bg-white/15 text-white',
                    indexStyle: 'text-cyan-100',
                    descriptionStyle: 'text-cyan-50/80',
                    chipStyle: 'border-white/20 bg-white/10 text-white',
                  },
                  {
                    index: '04',
                    title: '可信服务层',
                    description: '承载数据发布、加工、计算、授权与交付服务。',
                    icon: Share2,
                    items: ['数据发布', '数据加工', '联邦查询', '隐私计算', '授权交付', '模型服务'],
                    width: 'md:w-[88%]',
                    shell: 'border-cyan-200 bg-cyan-50/90 text-slate-900 shadow-[0_8px_22px_rgba(8,145,178,0.08)]',
                    iconStyle: 'border-cyan-200 bg-white text-cyan-700',
                    indexStyle: 'text-cyan-700',
                    descriptionStyle: 'text-slate-500',
                    chipStyle: 'border-cyan-100 bg-white text-slate-600',
                  },
                  {
                    index: '03',
                    title: '规则治理层',
                    description: '将准入、授权、访问和审计要求转化为统一规则。',
                    icon: ShieldCheck,
                    items: ['主体认证', '场景审核', '访问控制', '使用策略', '风险预警', '审计留痕'],
                    width: 'md:w-[92%]',
                    shell: 'border-blue-200 bg-blue-50/80 text-slate-900 shadow-[0_8px_22px_rgba(59,130,246,0.07)]',
                    iconStyle: 'border-blue-200 bg-white text-blue-700',
                    indexStyle: 'text-blue-700',
                    descriptionStyle: 'text-slate-500',
                    chipStyle: 'border-blue-100 bg-white text-slate-600',
                  },
                  {
                    index: '02',
                    title: '安全支撑层',
                    description: '以身份、密码技术、存证与运维能力提供底层保障。',
                    icon: LayoutIcon,
                    items: ['可信身份', '数据标准', '隐私保护', '区块链存证', '安全传输', '监控运维'],
                    width: 'md:w-[96%]',
                    shell: 'border-slate-300 bg-slate-100/90 text-slate-900 shadow-[0_8px_22px_rgba(51,65,85,0.07)]',
                    iconStyle: 'border-slate-200 bg-white text-slate-700',
                    indexStyle: 'text-slate-600',
                    descriptionStyle: 'text-slate-500',
                    chipStyle: 'border-slate-200 bg-white text-slate-600',
                  },
                  {
                    index: '01',
                    title: '数据接入层',
                    description: '通过标准连接器汇聚城市重点数据资源，形成可信数据基座。',
                    icon: Database,
                    items: ['公积金数据', '卫生健康数据', '法人数据', '不动产数据', '其他政务数据'],
                    width: 'md:w-full',
                    shell: 'border-slate-800 bg-slate-900 text-white shadow-[0_14px_28px_rgba(15,23,42,0.18)]',
                    iconStyle: 'border-white/15 bg-white/10 text-cyan-300',
                    indexStyle: 'text-cyan-300',
                    descriptionStyle: 'text-slate-300',
                    chipStyle: 'border-white/15 bg-white/[0.07] text-slate-100',
                  },
                ].map((layer, layerIndex) => {
                  const LayerIcon = layer.icon;
                  return (
                    <motion.div
                      key={layer.index}
                      initial={{ opacity: 0, y: 18 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.25 }}
                      transition={{ duration: 0.42, delay: layerIndex * 0.06 }}
                      className={`grid w-full gap-4 rounded-2xl border px-4 py-3.5 md:grid-cols-[46px_245px_minmax(0,1fr)] md:items-center md:gap-4 ${layer.width} ${layer.shell}`}
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl border backdrop-blur-sm ${layer.iconStyle}`}>
                        <LayerIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono text-[10px] font-bold ${layer.indexStyle}`}>{layer.index}</span>
                          <h4 className="text-sm font-bold">{layer.title}</h4>
                        </div>
                        <p className={`mt-1 text-[11px] leading-5 ${layer.descriptionStyle}`}>{layer.description}</p>
                      </div>
                      <div className="flex flex-wrap gap-1.5 md:justify-end">
                        {layer.items.map((item) => (
                          <span
                            key={item}
                            className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold backdrop-blur-sm ${layer.chipStyle}`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mx-auto mt-3 flex w-full items-center justify-between px-3 text-[10px] font-semibold tracking-[0.16em] text-slate-400 md:w-[96%]">
                <span>多源数据汇聚</span>
                <span>安全可信流通</span>
                <span className="text-teal-600">多场景价值共创</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.4 第四段：四大重点场景 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">四大重点民生应用专题</h2>
              <p className="text-xs text-slate-500 mt-1">深度解决多主体互不相授、高度敏感资产无法流通的死结</p>
            </div>
            
            <Link 
              to="/scenarios" 
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs text-cyan-600 font-semibold hover:text-cyan-700"
            >
              进入场景专题中心 
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {keyScenarios.map((scene, idx) => (
              <motion.article
                key={scene.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)] md:p-6"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-transparent opacity-70" />

                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-[0.14em] text-cyan-700">民生应用专题</span>
                      <p className="mt-0.5 font-mono text-[10px] text-slate-400">SCENARIO {String(idx + 1).padStart(2, '0')}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] font-medium text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    已上线
                  </span>
                </div>

                <h3 className="mt-5 text-base font-bold leading-6 text-slate-900 transition-colors group-hover:text-cyan-700">
                  {scene.name}
                </h3>
                <p className="mt-2 border-l-2 border-cyan-400 pl-3 text-xs font-medium leading-6 text-slate-600">
                  {scene.value}
                </p>

                <dl className="mt-5 divide-y divide-slate-100 border-y border-slate-100 text-xs">
                  <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 py-3">
                    <dt className="font-semibold text-slate-700">协同部门</dt>
                    <dd className="line-clamp-2 leading-5 text-slate-500">{scene.departments.join('、')}</dd>
                  </div>
                  <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 py-3">
                    <dt className="font-semibold text-slate-700">数据支撑</dt>
                    <dd className="line-clamp-2 leading-5 text-slate-500">{scene.dataSupport}</dd>
                  </div>
                </dl>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
                    全流程可信保障
                  </span>
                  <Link 
                    to="/scenarios" 
                    className="flex items-center gap-1 text-xs font-semibold text-cyan-700 transition-colors hover:text-cyan-800"
                  >
                    查看专题
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 4.5 第五段：重点数据产品 */}
      <section className="py-16 bg-slate-50 border-t border-b border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">高价值数据产品</h2>
              <p className="text-xs text-slate-500 mt-1">展示廊坊各级部门发布的安全合规高价值数据产品</p>
            </div>

            <Link 
              to="/products"
              className="mt-4 md:mt-0 inline-flex items-center gap-1 text-xs text-cyan-600 font-semibold hover:text-cyan-700"
            >
              检索全部成果产品 
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {dataProducts.slice(0, 3).map((product, idx) => (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-transparent opacity-70" />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                      <Database className="h-5 w-5" />
                    </div>
                    <span className="rounded-md bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700">
                      {product.category}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] font-medium text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    合规发布
                  </span>
                </div>

                <h3 className="mt-5 line-clamp-2 min-h-12 text-[15px] font-bold leading-6 text-slate-900 transition-colors group-hover:text-cyan-700">
                  {product.title}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-6 text-slate-500">
                  {product.description}
                </p>

                <dl className="mt-4 divide-y divide-slate-100 border-y border-slate-100 text-xs">
                  <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2.5 py-3">
                    <dt className="font-semibold text-slate-700">服务场景</dt>
                    <dd className="line-clamp-2 leading-5 text-slate-500">{product.serviceScene}</dd>
                  </div>
                  <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2.5 py-3">
                    <dt className="font-semibold text-slate-700">提供单位</dt>
                    <dd className="line-clamp-2 leading-5 text-slate-500">{product.provider}</dd>
                  </div>
                </dl>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="font-mono text-[10px] text-slate-400">NO. {product.id.toUpperCase()}</span>
                  <Link 
                    to={`/products/${product.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-cyan-700 transition-colors hover:text-cyan-800"
                  >
                    查看详情
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* 4.6 第六段：生态合作与辅助信息 */}
      <section className="py-16 bg-white overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">生态安全协同保障关系</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                京畿数港-廊坊城市可信数据空间不只是一个软硬件底座，更是多方共识的数字社会安全保障网络。平台以准入审核、授权运营、过程审计和风险闭环为主线，让数据供给、场景应用、技术支撑和运营治理在同一规则体系下协作。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: '准入审核', desc: '核验主体身份、业务资质、安全能力和责任承诺，明确可参与的场景边界。', icon: CheckCircle2 },
                { title: '授权运营', desc: '按角色、用途、期限和数据范围配置授权策略，控制最小必要使用。', icon: ShieldCheck },
                { title: '流通协同', desc: '联通数据源、服务商、应用方和运营方，支撑产品发布、调用与交付。', icon: Share2 },
                { title: '审计闭环', desc: '沉淀调用日志、授权记录、异常处置和运营复盘，保证全过程可追溯。', icon: FileText },
              ].map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* 4.7 系统入口 */}
      <section className="py-16 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-10">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">系统入口</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-3xl leading-relaxed">
                可信数据空间服务平台作为统一服务与协作主入口，授权运营平台承接授权策略、运营管控与审计闭环，数据交易平台面向数据产品发布、撮合和交易流通，三类系统共同支撑数据从接入、授权到价值转化的完整业务链路。
              </p>
            </div>
            <Link
              to="/docs"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
            >
              查看操作手册
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {systemEntries.map((entry) => {
              const Icon = entry.icon;
              const isPortalPage = entry.href.startsWith('#/');

              return (
                <a
                  key={entry.title}
                  href={entry.href}
                  target={isPortalPage ? undefined : '_blank'}
                  rel={isPortalPage ? undefined : 'noopener noreferrer'}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 transition-colors group-hover:bg-cyan-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    {isPortalPage
                      ? <ArrowRight className="h-4 w-4 text-slate-300 transition-colors group-hover:translate-x-0.5 group-hover:text-cyan-600" />
                      : <ExternalLink className="h-4 w-4 text-slate-300 transition-colors group-hover:text-cyan-600" />}
                  </div>
                  <div className="mt-5">
                    <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded">
                      {entry.tag}
                    </span>
                    <h3 className="mt-3 text-base font-bold text-slate-900">{entry.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{entry.description}</p>
                  </div>
                  <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-cyan-600">
                    {isPortalPage ? '了解平台服务' : '新窗口打开'}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
