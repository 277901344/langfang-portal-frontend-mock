import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Building2,
  Users2,
  Cpu,
  Handshake,
  ArrowRight,
  CheckCircle2,
  Send,
  Sparkles,
  UserCheck,
  FileSearch,
  Key,
  MessageSquare,
  FileSignature,
  Rocket,
  Image as ImageIcon,
  ChevronRight,
  ChevronDown,
  Zap,
  Lock,
  TrendingUp,
  Award,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { addConsultation } from '../lib/consultationStore';
import { PageBanner } from '../components/PageBanner';
import { SectionTitle } from '../components/SectionTitle';

import beifangLogo from '../logo/北方管道.png';
import yindanLogo from '../logo/河北银丹.png';
import huaweiLogo from '../logo/华为.png';
import huaxinLogo from '../logo/华信泳道.png';
import busLogo from '../logo/廊坊公交集团.png';
import qixiangLogo from '../logo/廊坊气象局.svg';
import yibaiLogo from '../logo/廊坊壹佰.png';
import xinaoLogo from '../logo/新奥燃气.svg';
import liantongLogo from '../logo/中国联通logo.png';
import coopTypeImage from '../Ecosystem/合作类型.png';

export function EcoCooperation() {
  // Active Path Tab for Pathway Details (Path A vs Path B)
  const [activePath, setActivePath] = useState<'A' | 'B'>('A');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Contact Form State
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    orgName: '',
    position: '',
    coopType: '',
    description: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!formState.name.trim()) errors.name = '请输入您的姓名';
    if (!formState.phone.trim()) errors.phone = '请输入您的联系电话';
    if (!formState.orgName.trim()) errors.orgName = '请输入您的机构名称';
    if (!formState.position.trim()) errors.position = '请输入您的职位';
    if (!formState.coopType) errors.coopType = '请选择合作类型';
    if (!formState.description.trim()) errors.description = '请输入您的合作需求描述';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('请按要求填写所有必需的咨询信息');
      return;
    }

    addConsultation({
      name: formState.name,
      phone: formState.phone,
      orgName: formState.orgName,
      position: formState.position,
      coopType: formState.coopType,
      description: formState.description,
    });

    setFormErrors({});
    showToast(`提交成功！我们的生态顾问将尽快与 [${formState.name}] 取得联系。`);
    setFormState({
      name: '',
      phone: '',
      orgName: '',
      position: '',
      coopType: '',
      description: '',
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700/80"
          >
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 统一 3D 玻璃质感 Banner */}
      <PageBanner
        title="开放生态建设"
        subtitle="连接数据提供方、需求方与专业服务商，打造安全、可信、合规的数据流通与价值共创基础设施。"
        tag="可信数据空间生态合作计划"
        variant="生态合作"
        stats={[
          { label: '生态成员', value: '32', unit: '家' },
          { label: '覆盖类型', value: '3类', unit: '数据源/服务商/应用方' }
        ]}
      >
        <div className="flex flex-wrap items-center gap-4 pt-3">
          <button
            onClick={() => scrollToSection('join-pathways-and-consult')}
            className="group relative overflow-hidden h-[54px] sm:h-[58px] px-9 sm:px-12 rounded-2xl bg-gradient-to-r from-[#1459EB] via-[#246BFD] to-[#0A4BD6] text-white font-extrabold text-[16px] sm:text-[17px] tracking-wide shadow-[0_12px_28px_-4px_rgba(20,89,235,0.5)] hover:shadow-[0_16px_36px_-4px_rgba(20,89,235,0.7)] hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 inline-flex items-center gap-3 cursor-pointer ring-4 ring-blue-500/20"
          >
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
            <span className="relative z-10">申请加入生态</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-200" />
          </button>
          <button
            onClick={() => scrollToSection('contact-form')}
            className="group relative h-[54px] sm:h-[58px] px-8 sm:px-10 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-300 hover:border-[#1459EB] hover:text-[#1459EB] font-bold text-[15px] sm:text-[16px] shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.97] transition-all inline-flex items-center gap-3 cursor-pointer"
          >
            <Handshake className="w-5 h-5 text-slate-500 group-hover:text-[#1459EB] group-hover:scale-110 transition-all" />
            <span>商务合作咨询</span>
          </button>
        </div>
      </PageBanner>

      {/* 2. 为什么要加入我们 - 移至合作伙伴类型上面 */}
      <section className="py-16 bg-white">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
          <SectionTitle
            title="为什么要加入我们"
            subtitle="可信技术赋能、场景精准匹配、利益共享机制，全方位支撑数据要素市场化落地"
          />

          {/* 3 特性卡片 (3列并排极简卡片，去除了占位边框与多余衬底) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: '可信技术安全保障',
                badge: '安全合规',
                desc: '基于数据连接器、TEE密态计算与区块链存证能力，保障数据“可用不可见、全程可追溯”，防范泄露与二次越权流通风险。',
                points: ['数据可用不可见', '全链路日志留痕与审计', '标准化连接器快速接入'],
              },
              {
                title: '真实业务场景赋能',
                badge: '价值变现',
                desc: '平台已沉淀金融风控、医疗健康等高价值落地场景，帮助数据供给方快速实现场景化变现与商业合作。',
                points: ['对接跨行业核心场景需求', '降低撮合对接成本', '加速数据要素资产化'],
              },
              {
                title: '权益共享与生态共建',
                badge: '生态红利',
                desc: '享受官方合规认证背书，优先参与数据要素收益分配与规则制定，共享高价值数商资源网络与政策扶持。',
                points: ['公平合理的收益分配机制', '官方生态合作伙伴认证', '多方共建共治治理网络'],
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs hover:border-blue-200 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md">
                    <Award className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.badge}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-slate-900">{item.title}</h3>

                  <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                </div>

                <ul className="space-y-2 pt-3 border-t border-slate-100">
                  {item.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2 text-xs font-medium text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 合作伙伴类型 */}
      <section id="partner-types" className="py-16 w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
        <SectionTitle
          title="合作伙伴类型"
          subtitle="多角色协同，构建涵盖“数据源-场景应用-技术支撑-合规运营”的闭环生态"
        />

        {/* 直接展示合作类型架构大图 */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-[#DDE3EC] overflow-hidden">
          <div className="rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
            <img
              src={coopTypeImage}
              alt="合作伙伴类型与可信数据空间生态图谱"
              className="w-full h-auto object-contain rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* 3.5. 合作伙伴展示模块 (生态合作伙伴) */}
      <section className="py-16 bg-gradient-to-b from-slate-50/60 via-blue-50/20 to-slate-50/40 border-y border-[#DDE3EC]/50 overflow-hidden">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10 text-center">
          <div className="space-y-2">
            <h2 className="text-[26px] sm:text-[30px] font-semibold text-[#1F2937] tracking-tight">
              携手生态伙伴 共同构建数据流通未来
            </h2>
            <p className="text-[14px] text-[#5B6472] max-w-2xl mx-auto leading-relaxed">
              汇聚政府部门、央国企龙头与行业领军数商，共建廊坊城市可信数据空间价值生态
            </p>
          </div>

          {/* 合作伙伴 Logo 两行展示 */}
          <div className="w-full space-y-3 sm:space-y-4">
            {/* 第一行：5家机构 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                { name: '华为技术有限公司', logo: huaweiLogo, imgClass: 'max-h-[38px] max-w-[130px]' },
                { name: '中国联通', logo: liantongLogo, imgClass: 'max-h-[38px] max-w-[130px]' },
                { name: '新奥燃气', logo: xinaoLogo, imgClass: 'max-h-[38px] max-w-[130px]' },
                { name: '国家管网集团北方管道', logo: beifangLogo, imgClass: 'max-h-[46px] max-w-[145px]' },
                { name: '廊坊市气象局', logo: qixiangLogo, imgClass: 'max-h-[46px] max-w-[160px]' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  title={item.name}
                  className="bg-white border border-[#DDE3EC] rounded-xl px-4 py-2.5 h-[72px] sm:h-[76px] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#1459EB]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
                >
                  <img
                    src={item.logo}
                    alt={item.name}
                    className={`${item.imgClass} object-contain transition-transform group-hover:scale-105 duration-200`}
                  />
                </div>
              ))}
            </div>

            {/* 第二行：4家机构居中对齐 */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {[
                { 
                  name: '廊坊公交集团', 
                  logo: busLogo, 
                  imgClass: 'max-h-[48px] max-w-[145px]' 
                },
                { 
                  name: '廊坊壹佰文化', 
                  logo: yibaiLogo, 
                  imgClass: 'max-h-[44px] max-w-[130px]' 
                },
                { 
                  name: '河北银丹', 
                  logo: yindanLogo, 
                  imgClass: 'max-h-[48px] max-w-[145px]' 
                },
                { 
                  name: '华信泳道', 
                  logo: huaxinLogo, 
                  imgClass: 'max-h-[44px] max-w-[155px]' 
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  title={item.name}
                  className="bg-white border border-[#DDE3EC] rounded-xl px-4 py-2.5 h-[72px] sm:h-[76px] w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] lg:w-[calc((100%-4*1rem)/5)] flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-md hover:border-[#1459EB]/40 hover:-translate-y-0.5 transition-all duration-200 cursor-default group"
                >
                  <img
                    src={item.logo}
                    alt={item.name}
                    className={`${item.imgClass} object-contain transition-transform group-hover:scale-105 duration-200`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. 合并模块：平台入驻注册与商务合作咨询 */}
      <section id="join-pathways-and-consult" className="py-16 bg-slate-50/30">
        <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 space-y-10">
          {/* 模块头部标题区 */}
          <SectionTitle
            title="平台入驻注册"
            subtitle="成为可信数据空间的一员，共享数据资源，共创数据生态，实现数据价值最大化。我们提供灵活的合作模式与全方位的支持服务。"
          />

          {/* 模块一：路径 A 标准化平台注册入驻流程 (图1结合形式) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* 左侧：1-2-3-4 垂直连接时间轴 */}
              <div className="lg:col-span-6 space-y-8 pl-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900">标准化平台注册入驻流程</h3>
                </div>

                <div className="relative border-l-2 border-blue-500 pl-8 space-y-7 ml-3">
                  {[
                    {
                      step: '1',
                      title: '申请入驻',
                      desc: '提交机构基本信息与合作意向，完成初步账号注册与验证',
                    },
                    {
                      step: '2',
                      title: '资质认证',
                      desc: '提供相关资质文件，完成实名认证与企业主体资格审核',
                    },
                    {
                      step: '3',
                      title: '资源对接',
                      desc: '配置数据接口与安全连接器，完成数据资源上架或服务接入',
                    },
                    {
                      step: '4',
                      title: '正式运营',
                      desc: '开始在平台开展业务，获得节点访问权限并共享数据生态支持',
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-[45px] top-0.5 w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md ring-4 ring-white">
                        {item.step}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 pl-3">
                  <a
                    href="#/register"
                    className="group relative overflow-hidden inline-flex items-center gap-3 bg-gradient-to-r from-[#1459EB] via-[#246BFD] to-[#0A4BD6] text-white font-extrabold px-9 py-4 rounded-2xl text-[16px] shadow-[0_10px_25px_-3px_rgba(20,89,235,0.45)] hover:shadow-[0_14px_32px_-4px_rgba(20,89,235,0.65)] transition-all hover:scale-[1.03] active:scale-[0.97] ring-4 ring-blue-500/15 cursor-pointer"
                  >
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                    <UserCheck className="w-5 h-5 relative z-10" />
                    <span className="relative z-10">立即注册入驻</span>
                    <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-200" />
                  </a>
                </div>
              </div>

              {/* 右侧：团队手拉手与科技光圈图片卡片 */}
              <div className="lg:col-span-6">
                <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 group bg-slate-900 min-h-[360px] flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                    alt="数据生态团队合作"
                    className="w-full h-[380px] object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-blue-950/40 to-sky-500/20"></div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 rounded-full border-2 border-blue-400/40 animate-spin-slow flex items-center justify-center">
                      <div className="w-48 h-48 rounded-full border border-dashed border-blue-400/60 flex items-center justify-center">
                        <div className="w-32 h-32 rounded-full bg-blue-500/10 backdrop-blur-xs border border-white/30"></div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white space-y-1">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>可信数据空间 · 价值共创网络</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      通过安全、合规与开放的信任机制，连接要素供给与应用端，释放数据乘数效应。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 模块二：商务意向沟通流程 (横向放置在中间位置) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900">商务意向沟通流程</h3>
                <p className="text-xs text-slate-500">
                  适用于初期对接、需求不明确或复杂定制化合作的用户
                </p>
              </div>
            </div>

            {/* 横向 4 步骤流程卡片 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { step: '01', title: '提交咨询表单', icon: MessageSquare, desc: '填写意向需求与联系方式，生态顾问将在 1 个工作日内响应' },
                { step: '02', title: '需求研讨初审', icon: Users2, desc: '专属顾问跟进，梳理场景业务逻辑、合规及节点接入要求' },
                { step: '03', title: '定制合作方案', icon: FileSignature, desc: '联合研讨定制化部署方案、收益分配模式与技术对接路径' },
                { step: '04', title: '签署协议与合作', icon: Rocket, desc: '完成合作协议签署，正式开启生态合作与节点协同建设' },
              ].map((s, i) => {
                const Icon = s.icon;
                return (
                  <div
                    key={i}
                    className="bg-slate-50/50 border border-slate-100 p-5 rounded-2xl space-y-3 relative hover:border-blue-200 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-extrabold text-slate-400">
                        STEP {s.step}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 商务意向沟通流程与咨询表单之间的引导卡片 */}
          <div className="bg-blue-50/30 border border-blue-100/60 rounded-2xl p-6 text-center space-y-3 my-2">
            <div className="inline-flex items-center gap-2 bg-blue-600 text-white font-extrabold text-xs px-3.5 py-1 rounded-full shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>专属合作指引</span>
            </div>
            <h4 className="text-base sm:text-lg font-extrabold text-slate-900">
              了解上述沟通流程后，请在下方填写您的合作意向与联系方式
            </h4>
            <div className="pt-1 flex justify-center">
              <ChevronDown className="w-5 h-5 text-blue-600 animate-bounce" />
            </div>
          </div>

          {/* 模块三：商务合作咨询表单区 (Contact Form) */}
          <div id="contact-form" className="bg-white border border-slate-100 rounded-3xl p-6 md:p-10 space-y-6">
            <div className="text-center space-y-1 mb-6">
              <h3 className="text-2xl font-bold text-slate-900">商务合作咨询</h3>
              <p className="text-xs md:text-sm text-slate-500">
                填写咨询表单，我们的生态顾问将尽快与您联系，为您提供专业的合作建议
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 max-w-2xl mx-auto">
              {/* Row 1: 姓名 & 电话 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>姓名
                  </label>
                  <input
                    type="text"
                    value={formState.name}
                    onChange={(e) => {
                      setFormState({ ...formState, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }}
                    placeholder="请输入您的姓名"
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                      formErrors.name ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                    )}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>电话
                  </label>
                  <input
                    type="tel"
                    value={formState.phone}
                    onChange={(e) => {
                      setFormState({ ...formState, phone: e.target.value });
                      if (formErrors.phone) setFormErrors({ ...formErrors, phone: '' });
                    }}
                    placeholder="请输入您的联系电话"
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                      formErrors.phone ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                    )}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Row 2: 机构名称 & 职位 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>机构名称
                  </label>
                  <input
                    type="text"
                    value={formState.orgName}
                    onChange={(e) => {
                      setFormState({ ...formState, orgName: e.target.value });
                      if (formErrors.orgName) setFormErrors({ ...formErrors, orgName: '' });
                    }}
                    placeholder="请输入您的机构名称"
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                      formErrors.orgName ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                    )}
                  />
                  {formErrors.orgName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.orgName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">
                    <span className="text-red-500 mr-1">*</span>职位
                  </label>
                  <input
                    type="text"
                    value={formState.position}
                    onChange={(e) => {
                      setFormState({ ...formState, position: e.target.value });
                      if (formErrors.position) setFormErrors({ ...formErrors, position: '' });
                    }}
                    placeholder="请输入您的职位"
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all",
                      formErrors.position ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                    )}
                  />
                  {formErrors.position && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.position}</p>
                  )}
                </div>
              </div>

              {/* Row 3: 合作类型 */}
              <div>
                <label className="block text-sm font-normal text-slate-700 mb-2">
                  <span className="text-red-500 mr-1">*</span>合作类型
                </label>
                <div className="relative">
                  <select
                    value={formState.coopType}
                    onChange={(e) => {
                      setFormState({ ...formState, coopType: e.target.value });
                      if (formErrors.coopType) setFormErrors({ ...formErrors, coopType: '' });
                    }}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer",
                      !formState.coopType ? "text-slate-400" : "text-slate-800",
                      formErrors.coopType ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                    )}
                  >
                    <option value="" disabled hidden>请选择合作类型</option>
                    <option value="合作伙伴申请" className="text-slate-800">合作伙伴申请</option>
                    <option value="合作咨询" className="text-slate-800">合作咨询</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                {formErrors.coopType && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.coopType}</p>
                )}
              </div>

              {/* Row 4: 合作需求描述 */}
              <div>
                <label className="block text-sm font-normal text-slate-700 mb-2">
                  <span className="text-red-500 mr-1">*</span>合作需求描述
                </label>
                <textarea
                  rows={4}
                  value={formState.description}
                  onChange={(e) => {
                    setFormState({ ...formState, description: e.target.value });
                    if (formErrors.description) setFormErrors({ ...formErrors, description: '' });
                  }}
                  placeholder="请输入您的合作需求描述"
                  className={cn(
                    "w-full px-4 py-3 bg-white border rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none",
                    formErrors.description ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200"
                  )}
                />
                {formErrors.description && (
                  <p className="text-xs text-red-500 mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="group relative overflow-hidden w-full py-4 sm:py-4.5 bg-gradient-to-r from-[#1459EB] via-[#246BFD] to-[#0A4BD6] hover:from-[#0E43B5] hover:to-[#08389E] text-white font-extrabold rounded-2xl shadow-[0_10px_25px_-3px_rgba(20,89,235,0.45)] hover:shadow-[0_14px_32px_-4px_rgba(20,89,235,0.65)] hover:scale-[1.01] active:scale-[0.98] transition-all text-base sm:text-lg flex items-center justify-center gap-3 cursor-pointer ring-4 ring-blue-500/15"
                >
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                  <span className="relative z-10">提交合作咨询</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform duration-200" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 高清大图预览弹窗 (Lightbox) */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-5xl w-full bg-white rounded-2xl p-4 sm:p-6 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">
                  可信数据空间生态图谱与角色协同网络
                </h3>
                <button
                  onClick={() => setIsImageModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[80vh] overflow-auto rounded-xl bg-slate-50 p-2 flex items-center justify-center">
                <img
                  src={coopTypeImage}
                  alt="可信数据空间生态图谱与角色协同网络"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
