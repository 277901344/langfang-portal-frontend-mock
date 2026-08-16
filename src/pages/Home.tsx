import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Globe, Share2, Database, FileText,
  Shield, CheckCircle2, ExternalLink, Sparkles, Layers, ArrowUpRight, Cpu, Package,
  Workflow, TrendingUp, Activity, Building2, Server, Lock, Zap, Image as ImageIcon, Search, ChevronRight, ChevronLeft,
  Eye, Check, Users, Award, HelpCircle, FileCheck2, HeartPulse, Home as HomeIcon, Coins, Landmark,
  BookOpen, Compass, Building, Car, UserCheck, HardDrive, Network, FileSpreadsheet, Scale, ChevronUp, X, ZoomIn
} from 'lucide-react';
import { platformStats, dataProducts, keyScenarios } from '../data/mockData';
import { useAccessWizard } from '../context/AccessWizardContext';
import { SectionTitle } from '../components/SectionTitle';
import { applyImageFallback, publicAssetUrl } from '../lib/publicAssets';

// 首页架构图引用路径：public/assets/architecture
const BIZ_ARCH_IMAGE = publicAssetUrl('assets/architecture/yewujiagou.png');
const TECH_ARCH_IMAGE = publicAssetUrl('assets/architecture/jishujiagou.png');

const HERO_VIDEO = publicAssetUrl('assets/banner/banner.mp4');
const HERO_POSTER = publicAssetUrl('assets/banner/重要场景.png');
const CONTENT_IMAGE_FALLBACK = HERO_POSTER;
const HERO_IMAGE_FALLBACK = publicAssetUrl('auth-trusted-data-space-bg.webp');

export function Home() {
  const navigate = useNavigate();
  const { checkAndApply } = useAccessWizard();
  const [isArchImageModalOpen, setIsArchImageModalOpen] = useState(false);
  const [archActiveIndex, setArchActiveIndex] = useState(0);
  const [archIsPaused, setArchIsPaused] = useState(false);

  // 核心架构 2 张大图自动轮播：停留时间 4.5秒，鼠标悬停暂停
  useEffect(() => {
    if (archIsPaused) return;
    const interval = setInterval(() => {
      setArchActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, [archIsPaused]);

  const [isProductHovered, setIsProductHovered] = useState(false);
  const productScrollRef = React.useRef<HTMLDivElement>(null);

  const highFreqProducts = [
    {
      id: 'dp-001',
      code: 'NO. DP-001',
      tag: '公积金专题',
      subTags: ['跨域协同', '隐私计算'],
      name: '公积金缴存人跨域核验信息服务',
      shortName: '住房公积金跨域核验',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
      avatarIcon: Shield,
      avatarBg: 'bg-blue-600',
      desc: '提供廊坊市住房公积金缴存人的基本账号、缴存状态、月缴对账及累计余额，支撑异地贷款秒级测算。',
      metrics: [
        { value: '6800万+', label: '累计调用' },
        { value: '< 2.5秒', label: '响应速度' },
        { value: '0次', label: '跑腿证明' },
      ],
      scenario: '职工异地购房提取公积金',
      provider: '廊坊市住房公积金管理中心',
    },
    {
      id: 'dp-002',
      code: 'NO. DP-002',
      tag: '金融风控',
      subTags: ['联合授信', '多方算力'],
      name: '公积金联名贷款商业银行联合授信评估数据',
      shortName: '商业银行联合授信',
      image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop',
      avatarIcon: Landmark,
      avatarBg: 'bg-indigo-600',
      desc: '基于脱敏后的住房公积金还款记录与企业连续缴存指标，提供安全多方隐私计算评估结果。',
      metrics: [
        { value: '12.5亿+', label: '授信金额' },
        { value: '85%', label: '审查提速' },
        { value: '32家', label: '合作银行' },
      ],
      scenario: '公积金与商业组合贷联合审批',
      provider: '廊坊市住房公积金管理中心',
    },
    {
      id: 'dp-003',
      code: 'NO. DP-003',
      tag: '卫健医疗',
      subTags: ['商保直连', '网格化脱敏'],
      name: '区域公共卫生应急趋势多维数据产品',
      shortName: '卫健医疗理赔直连',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800&auto=format&fit=crop',
      avatarIcon: HeartPulse,
      avatarBg: 'bg-emerald-600',
      desc: '汇集廊坊市医疗机构发热门诊、急诊床位占用及流行病种变化等网格化脱敏统计数据集。',
      metrics: [
        { value: '420万+', label: '诊疗数据' },
        { value: '100%', label: '合规脱敏' },
        { value: '15分钟', label: '预警感知' },
      ],
      scenario: '疾控调度与商业保险快批',
      provider: '廊坊市卫生健康委员会',
    },
    {
      id: 'dp-004',
      code: 'NO. DP-004',
      tag: '不动产专题',
      subTags: ['权属校验', '司法防伪'],
      name: '不动产登记产权状态实时校验数据产品',
      shortName: '不动产权属实时校验',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop',
      avatarIcon: HomeIcon,
      avatarBg: 'bg-sky-600',
      desc: '基于不动产登记库与法院查封动态数据，提供房产权属、抵押状态实时校验，规避重复抵押。',
      metrics: [
        { value: '95万+', label: '校验次数' },
        { value: '100%', label: '产权真伪' },
        { value: '0漏报', label: '风险拦截' },
      ],
      scenario: '商业银行房产抵押贷款及风控',
      provider: '廊坊市自然资源和规划局',
    },
    {
      id: 'dp-005',
      code: 'NO. DP-005',
      tag: '企业信用',
      subTags: ['普惠金融', '法人画像'],
      name: '企业法人多维政务数据核查与信贷评估',
      shortName: '企业法人信用画像',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop',
      avatarIcon: Building2,
      avatarBg: 'bg-purple-600',
      desc: '融合工商、税务、社保、知识产权等多维公共数据，生成企业可信信用分与风控画像。',
      metrics: [
        { value: '18.2万家', label: '企业画像' },
        { value: '350+', label: '评估维度' },
        { value: '99.8%', label: '风控准确率' },
      ],
      scenario: '中小微企业普惠信贷核查',
      provider: '廊坊市行政审批局',
    },
    {
      id: 'dp-006',
      code: 'NO. DP-006',
      tag: '数字政府',
      subTags: ['电子证照', '密码验签'],
      name: '电子证照可信跨区域秒级互认核验数据服务',
      shortName: '电子证照可信互认',
      image: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop',
      avatarIcon: FileCheck2,
      avatarBg: 'bg-amber-600',
      desc: '支撑身份证明、营业执照、不动产权证等电子证照的跨部门、跨区域免提交核验。',
      metrics: [
        { value: '520种', label: '证照类型' },
        { value: '2600万+', label: '调取次数' },
        { value: '100%', label: '密码验签' },
      ],
      scenario: '减证便民与政务跨省通办',
      provider: '廊坊市大数据管理中心',
    },
    {
      id: 'dp-007',
      code: 'NO. DP-007',
      tag: '交通物流',
      subTags: ['京津冀运力', '实时运速'],
      name: '京津冀协同交通货运安检合规与运力评估',
      shortName: '京津冀货运安检核验',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      avatarIcon: Network,
      avatarBg: 'bg-teal-600',
      desc: '融合廊坊及周边主要交通枢纽通行轨迹、货运许可及道路安检数据，赋能供应链快速通关。',
      metrics: [
        { value: '350万辆', label: '运力核验' },
        { value: '99.9%', label: '通关效率' },
        { value: '0人工', label: '自动化率' },
      ],
      scenario: '跨境与跨区域物流绿色通道',
      provider: '廊坊市交通运输局',
    },
    {
      id: 'dp-008',
      code: 'NO. DP-008',
      tag: '临空经济',
      subTags: ['保税物流', '跨境结算'],
      name: '廊坊临空经济区进出口贸易可信风控数据',
      shortName: '临空贸易保税风控',
      image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800&auto=format&fit=crop',
      avatarIcon: Globe,
      avatarBg: 'bg-cyan-600',
      desc: '依托北京大兴国际机场临空经济区（廊坊）保税仓与海关申报数据，提供贸易真实性秒级验证。',
      metrics: [
        { value: '$8.5亿', label: '核验贸易额' },
        { value: '1.2万笔', label: '日均报关' },
        { value: '秒级', label: '核查响应' },
      ],
      scenario: '跨境电商融通与供应链金融',
      provider: '廊坊临空经济区管委会',
    },
    {
      id: 'dp-009',
      code: 'NO. DP-009',
      tag: '绿色低碳',
      subTags: ['双碳监测', '能耗画像'],
      name: '重点耗能企业碳排放与绿色能源用能评估',
      shortName: '企业双碳能耗监测',
      image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800&auto=format&fit=crop',
      avatarIcon: Zap,
      avatarBg: 'bg-green-600',
      desc: '整合规上工业企业用电、用气及排放感知节点数据，构建可信碳核算与绿色金融评估模型。',
      metrics: [
        { value: '1200家', label: '重点企业' },
        { value: '实时', label: '监测频次' },
        { value: '15.4万吨', label: '碳减排量' },
      ],
      scenario: '绿色金融贷款与碳交易合规',
      provider: '廊坊市生态环境局',
    },
    {
      id: 'dp-010',
      code: 'NO. DP-010',
      tag: '社保民生',
      subTags: ['待遇资格', '年审核验'],
      name: '企业职工社会保险参保缴费与待遇资格校验',
      shortName: '社保参保资格核验',
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=800&auto=format&fit=crop',
      avatarIcon: UserCheck,
      avatarBg: 'bg-rose-600',
      desc: '提供社保连续缴费时长、单位参保状态及养老金资格验证，全流程加密防篡改。',
      metrics: [
        { value: '1800万+', label: '核验次数' },
        { value: '99.99%', label: '系统可用率' },
        { value: '0风险', label: '合规安全' },
      ],
      scenario: '人才引进补贴与购房资格审查',
      provider: '廊坊市人力资源和社会保障局',
    },
    {
      id: 'dp-011',
      code: 'NO. DP-011',
      tag: '乡村振兴',
      subTags: ['地标农产品', '全程溯源'],
      name: '廊坊特色农产品可信供应链与品质溯源',
      shortName: '特色农产品品质溯源',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop',
      avatarIcon: Package,
      avatarBg: 'bg-orange-600',
      desc: '链接固安蔬菜、香河肉饼等特色农业基地生产记录与检测报告，生成可信品质画像。',
      metrics: [
        { value: '450家', label: '合作基地' },
        { value: '100%', label: '一码通溯源' },
        { value: '3.2亿', label: '溯源产值' },
      ],
      scenario: '高端商超直采与农业保险理赔',
      provider: '廊坊市农业农村局',
    },
    {
      id: 'dp-012',
      code: 'NO. DP-012',
      tag: '公用事业',
      subTags: ['水电气热', '信用评级'],
      name: '公共事业水电气热缴费诚信指标分析',
      shortName: '水电气热公共诚信指标',
      image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=800&auto=format&fit=crop',
      avatarIcon: FileSpreadsheet,
      avatarBg: 'bg-violet-600',
      desc: '融合供水、供电、供气、供热等公共事业连贯缴费数据，计算生成居民与商户履约信用度。',
      metrics: [
        { value: '120万户', label: '覆盖户数' },
        { value: '按月', label: '更新频率' },
        { value: '98.5%', label: '预测准确率' },
      ],
      scenario: '租房信用免押金与微额贷款',
      provider: '廊坊市城市管理综合行政执法局',
    },
  ];

  useEffect(() => {
    if (isProductHovered) return;
    const container = productScrollRef.current;
    if (!container) return;

    let animationFrameId: number;
    const speed = 0.8; // smooth continuous marquee speed

    const step = () => {
      // 拼接了 3 份相同数组，当滚动距离达到容器总宽度的 1/3 时重置 scrollLeft 为 0，实现完美的无缝无感循环
      if (container.scrollLeft >= container.scrollWidth / 3) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += speed;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isProductHovered]);

  const handleScrollProducts = (direction: 'left' | 'right') => {
    if (productScrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      productScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
  const featuredScenarios = [
    {
      id: 'SCENARIO 01',
      scenarioId: 'sc-001',
      category: '民生应用专题',
      status: '已上线',
      title: '公积金专题数据方案',
      image: keyScenarios.find((s) => s.id === 'sc-001')?.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800',
      quote: '打通跨省跨域公积金核验，职工公积金异地贷款额度测算提质 300%，贷款全生命安全验证“零跑腿”。',
      dept: '市住房公积金管理中心、商业银行、市政务服务中心',
      support: '跨域异地缴存明细、公积金状态真伪、安全双因子碰撞。',
      icon: Shield,
      badge: 'TEE 密态算力',
      gradient: 'from-blue-600 via-blue-600/95 to-indigo-700',
      shortTitle: '公积金核验',
      subLabel: '跨省异地秒级测算',
      metrics: [
        { label: '核验测算效率', value: '+300%' },
        { label: '安全验证跑腿', value: '0 次' },
        { label: '密态对齐响应', value: '< 2.5 秒' },
      ],
      previewSubTitle: '跨省跨域公积金数据安全多方核验与算力调度平台',
      diagramNodes: ['市公积金中心节点', '密态沙盒/TEE环境', '商业银行贷款审批端'],
    },
    {
      id: 'SCENARIO 02',
      scenarioId: 'sc-002',
      category: '民生应用专题',
      status: '已上线',
      title: '卫健医疗数据可信方案',
      image: keyScenarios.find((s) => s.id === 'sc-002')?.image || 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800',
      quote: '解决医疗信息“数据孤岛”难题，推动商业补充健康险“瞬时核算与直连快批”，守护个人重大健康档案。',
      dept: '市卫生健康委员会、各大二级及以上机构、中外合资保险商',
      support: '电子病历分级多方安全对齐，医疗多维脱敏指标联邦算法。',
      icon: HeartPulse,
      badge: 'MPC 联邦算法',
      gradient: 'from-indigo-600 via-indigo-600/95 to-blue-800',
      shortTitle: '卫健医疗可信',
      subLabel: '商保直连快批直办',
      metrics: [
        { label: '商保理赔核算', value: '瞬时直连' },
        { label: '脱敏算法对齐', value: '100%' },
        { label: '联通医疗机构', value: '45+ 家' },
      ],
      previewSubTitle: '多源医疗健康电子病历脱敏碰撞与商保快批节点',
      diagramNodes: ['市卫健委数据中心', '多方安全计算MPC节点', '商业健康险直连核赔端'],
    },
    {
      id: 'SCENARIO 03',
      scenarioId: 'sc-003',
      category: '民生应用专题',
      status: '已上线',
      title: '法人信息跨域多维联控方案',
      image: keyScenarios.find((s) => s.id === 'sc-003')?.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      quote: '形成多维立体企业画像，普惠贷款材料精减 85%，防范企业财务欺诈和空壳诈骗，助力中小企业低息纾困。',
      dept: '市行政审批局、市市场监督管理局、市税务局、各大信贷机构',
      support: '法人库基础登记一致性核算、社保欠费及严重失信一票否决算法。',
      icon: Building2,
      badge: '多维画像算法',
      gradient: 'from-blue-700 via-blue-800 to-indigo-900',
      shortTitle: '法人多维联控',
      subLabel: '普惠金融风控画像',
      metrics: [
        { label: '普惠贷款材料精减', value: '85%' },
        { label: '空壳诈骗风控拦截', value: '99.9%' },
        { label: '纾困中小微企业', value: '12,000+ 家' },
      ],
      previewSubTitle: '企业法人多维政务数据核查与信贷合规评估系统',
      diagramNodes: ['市行政审批与监管库', '税务/社保可信数据流', '普惠信贷风控大脑'],
    },
    {
      id: 'SCENARIO 04',
      scenarioId: 'sc-004',
      category: '民生应用专题',
      status: '已上线',
      title: '不动产确权金融联办可信方案',
      image: keyScenarios.find((s) => s.id === 'sc-004')?.image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
      quote: '破除产权查封脱网监控空窗期，商业银行抵押房产权属可信校验急速秒结，规避重复抵押。',
      dept: '市自然资源和规划局、市中级人民法院、签约商业银行集团',
      support: '不公开房源差分比对报警、房产权真伪急速判定及司法查封实时拦截流。',
      icon: HomeIcon,
      badge: '司法实时比对',
      gradient: 'from-sky-600 via-blue-700 to-indigo-900',
      shortTitle: '不动产确权联办',
      subLabel: '产权真伪急速判定',
      metrics: [
        { label: '查封脱网空窗', value: '彻底破除' },
        { label: '抵押权属校验', value: '急速秒结' },
        { label: '司法实时拦截流', value: '100% 自动' },
      ],
      previewSubTitle: '不动产登记与法院司法查封动态差分比对拦截平台',
      diagramNodes: ['自然资源和规划局库', '中级法院司法查封流', '商业银行抵押风控端'],
    },
  ];

  const [activeScenarioIndex, setActiveScenarioIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const AUTOPLAY_DURATION = 6000;

  useEffect(() => {
    if (isPaused) return;

    const intervalMs = 50;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveScenarioIndex((idx) => (idx + 1) % featuredScenarios.length);
          return 0;
        }
        return prev + (intervalMs / AUTOPLAY_DURATION) * 100;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, featuredScenarios.length]);

  const handleSelectScenario = (index: number) => {
    setActiveScenarioIndex(index);
    setProgress(0);
  };

  const currentScenario = featuredScenarios[activeScenarioIndex] || featuredScenarios[0];
  const CurrentIcon = currentScenario.icon;

  const handleLaunchSp = () => {
    checkAndApply({
      productId: 'connector-node-main',
      productName: '可信数据空间连接器节点',
      connectorName: '廊坊数据源节点（主节点）',
      mode: 'launch_connector',
      hasAuthMgmt: false,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F0F4F9] text-slate-800 selection:bg-blue-500/20 overflow-x-hidden font-sans">
      
      {/* 1. HERO SECTION - 动态视频 Banner (高度大幅提升 + 融入毛玻璃指标卡) */}
      <section className="relative w-full bg-[#051126] text-white pt-20 pb-24 lg:pt-28 lg:pb-36 overflow-hidden min-h-[680px] lg:min-h-[780px] flex items-center">
        {/* 背景大图海报底图 (保证视频未加载或环境不自动播放时背景依然炫酷) */}
        <img
          src={HERO_POSTER}
          alt="廊坊可信数据空间"
          onError={(event) => applyImageFallback(event.currentTarget, HERO_IMAGE_FALLBACK)}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 filter saturate-125"
        />

        {/* 背景视频 (直接读取 public 资源) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={HERO_POSTER}
          src={HERO_VIDEO}
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
        />

        {/* 极客暗黑与发光渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#051126] via-[#051126]/50 to-transparent z-1 pointer-events-none" />

        <div className="w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-10 lg:space-y-14">
          
          {/* 标题与描述 */}
          <div className="max-w-4xl space-y-5 text-left pt-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.15] tracking-tight drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]">
              让数据可信流通<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-white font-black drop-shadow-md">
                让城市价值持续生长
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-100 leading-relaxed font-medium max-w-3xl drop-shadow-md">
              以可信连接，合规治理和场景应用，构建面向城市治理、产业发展与民生服务的可信数据基础设施。
            </p>
          </div>

          {/* 毛玻璃核心指标卡 (Glassmorphism Stats Cards: 32家/18.5TB/24个/1.25亿次) */}
          <div className="rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/20 p-5 sm:p-6 shadow-2xl shadow-black/50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-white/10">
              {[
                {
                  value: '32',
                  unit: '家',
                  label: '接入政府部门',
                  icon: Database,
                },
                {
                  value: '18.5',
                  unit: 'TB',
                  label: '累计数据量',
                  icon: HardDrive,
                },
                {
                  value: '24',
                  unit: '个',
                  label: '数据产品数',
                  icon: Package,
                },
                {
                  value: '1.25',
                  unit: '亿次',
                  label: '累计交换量',
                  icon: Share2,
                },
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center justify-center p-2 group cursor-default ${
                      idx !== 0 ? 'pt-4 sm:pt-0' : ''
                    }`}
                  >
                    {/* 1. 圆形毛玻璃图标 */}
                    <div className="w-11 h-11 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 flex items-center justify-center mb-2.5 shadow-inner group-hover:scale-110 group-hover:bg-blue-500/30 transition-all">
                      <StatIcon className="w-5 h-5" />
                    </div>

                    {/* 2. 数值与单位 */}
                    <div className="flex items-baseline justify-center">
                      <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-mono">
                        {stat.value}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-cyan-300 ml-1">
                        {stat.unit}
                      </span>
                    </div>

                    {/* 3. 标签说明 */}
                    <div className="text-xs font-medium text-slate-300 mt-1.5">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE ARCHITECTURE SECTION - 核心架构 (业务架构与技术架构 展示) */}
      <section className="py-10 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 核心架构标题居中 */}
        <SectionTitle
          title="核心架构"
          subtitle="全方位展现廊坊城市可信数据空间业务架构与技术架构全景"
        />

        {/* 架构图快速切换选项卡居中 */}
        <div className="flex justify-center -mt-2">
          <div className="inline-flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {[
              { label: '业务架构', idx: 0 },
              { label: '技术架构', idx: 1 },
            ].map((item) => (
              <button
                key={item.idx}
                type="button"
                onClick={() => setArchActiveIndex(item.idx)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                  archActiveIndex === item.idx
                    ? 'bg-[#1459EB] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 架构图展示容器：与重点场景、高频数据产品左右边距保持一致，横向撑满，高度自适应 */}
        <div 
          className="relative w-full rounded-2xl overflow-hidden bg-white group cursor-pointer border border-slate-200/90 shadow-md hover:shadow-xl transition-shadow"
          onMouseEnter={() => setArchIsPaused(true)}
          onMouseLeave={() => setArchIsPaused(false)}
          onClick={() => setIsArchImageModalOpen(true)}
        >
          {/* 左侧切换按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setArchActiveIndex((prev) => (prev === 0 ? 1 : 0));
            }}
            className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/60 hover:bg-[#1459EB] text-white backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl transition-all cursor-pointer group/btn hover:scale-105 opacity-0 group-hover:opacity-100"
            aria-label="切换上一张架构图"
            title="切换架构图"
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>

          {/* 右侧切换按钮 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setArchActiveIndex((prev) => (prev === 0 ? 1 : 0));
            }}
            className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-slate-900/60 hover:bg-[#1459EB] text-white backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xl transition-all cursor-pointer group/btn hover:scale-105 opacity-0 group-hover:opacity-100"
            aria-label="切换下一张架构图"
            title="切换架构图"
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </button>

          {/* 架构图平滑切换：横向撑满容器，高度自适应 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`arch-${archActiveIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full flex items-center justify-center bg-white"
            >
              <img
                src={archActiveIndex === 0 ? BIZ_ARCH_IMAGE : TECH_ARCH_IMAGE}
                alt={archActiveIndex === 0 ? '廊坊城市可信数据空间业务架构' : '廊坊城市可信数据空间技术架构'}
                onError={(event) => applyImageFallback(event.currentTarget, CONTENT_IMAGE_FALLBACK)}
                className="w-full h-auto block object-contain"
              />
            </motion.div>
          </AnimatePresence>

          {/* 底部浮动指示器 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 bg-slate-900/50 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
            {[
              { label: '业务架构', idx: 0 },
              { label: '技术架构', idx: 1 },
            ].map((item) => (
              <button
                key={item.idx}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setArchActiveIndex(item.idx);
                }}
                className={`transition-all duration-300 cursor-pointer ${
                  archActiveIndex === item.idx
                    ? 'w-8 h-2.5 rounded-full bg-white shadow-xs'
                    : 'w-2.5 h-2.5 rounded-full bg-white/50 hover:bg-white/80'
                }`}
                title={item.label}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. FEATURED SCENARIOS SECTION - 重点场景 (平铺手风琴水平轮播 Horizontal Accordion Expansion Slider) */}
      <section
        className="py-10 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <SectionTitle
          title="重点场景"
          subtitle="深度解决多主体互不相授、高度敏感资产无法流通的死结"
          action={
            <Link
              to="/scenarios"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
            >
              <span>进入场景专题中心</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          }
        />

        {/* 4卡片水平平铺手风琴展开轮播容器 */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch h-[580px] w-full">
          {featuredScenarios.map((sc, index) => {
            const isActive = index === activeScenarioIndex;
            const ScIcon = sc.icon;

            return (
              <div
                key={sc.id}
                onClick={() => handleSelectScenario(index)}
                onMouseEnter={() => handleSelectScenario(index)}
                style={{
                  flex: isActive ? '6.5 1 0%' : '1.15 1 0%',
                  transition: 'flex 450ms cubic-bezier(0.25, 1, 0.5, 1), background-color 300ms, border-color 300ms, box-shadow 300ms',
                }}
                className={`relative rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between h-full ${
                  isActive
                    ? 'bg-white border border-slate-200/90 shadow-xl ring-1 ring-blue-500/20'
                    : 'border border-blue-500/30 shadow-md group hover:shadow-lg'
                }`}
              >
                {/* 顶部微型倒计时进度条 */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-slate-100 overflow-hidden rounded-t-2xl z-20 transition-opacity duration-300 ${
                    isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 transition-all duration-75 ease-linear"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>

                {/* ==================== 1. 当前激活卡片 (展开: ~65% 宽度, 浅色/白色背景内嵌深蓝科技) ==================== */}
                <div
                  className={`absolute inset-0 p-6 sm:p-7 flex flex-col justify-between space-y-4 pt-7 bg-white transition-opacity duration-300 ease-in-out z-10 ${
                    isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Header: Icon + Category + Title */}
                  <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs shrink-0">
                        <ScIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                            {sc.category}
                          </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
                          {sc.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* 重点场景同源封面大图展示 (纯净大图展示，与重点场景页保持一致) */}
                  <div className="relative h-48 sm:h-52 w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200 group/img shrink-0">
                    <img
                      src={sc.image}
                      alt={sc.title}
                      loading="lazy"
                      onError={(event) => applyImageFallback(event.currentTarget, CONTENT_IMAGE_FALLBACK)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* 描述引言 */}
                  <div className="border-l-4 border-blue-600 bg-slate-50/90 p-3 rounded-r-xl text-xs sm:text-sm text-slate-700 font-medium leading-relaxed line-clamp-2">
                    {sc.quote}
                  </div>

                  {/* 协同部门 & 数据支撑 */}
                  <div className="space-y-1 text-xs">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-slate-500 shrink-0 w-16">协同部门</span>
                      <span className="text-slate-800 font-semibold leading-normal line-clamp-1">{sc.dept}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-slate-500 shrink-0 w-16">数据支撑</span>
                      <span className="text-slate-800 font-semibold leading-normal line-clamp-1">{sc.support}</span>
                    </div>
                  </div>

                  {/* 底部按钮 */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                    <div className="flex items-center gap-2.5">
                      <Link
                        to={`/products?scenario=${sc.scenarioId}`}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-blue-600 text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Package className="w-3.5 h-3.5 text-slate-500" />
                        <span>关联产品</span>
                      </Link>
                      <Link
                        to={`/scenarios/${sc.scenarioId}`}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                      >
                        <span>查看方案</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* ==================== 2. 未激活卡片 (同源重点场景页真实图片展示) ==================== */}
                <div
                  className={`absolute inset-0 p-4 flex flex-col justify-between items-center text-center py-8 transition-opacity duration-300 ease-in-out z-0 ${
                    !isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* 背景：同源重点场景封面底图 + 质感渐变蒙层 */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl">
                    <img
                      src={sc.image}
                      alt={sc.title}
                      loading="lazy"
                      onError={(event) => applyImageFallback(event.currentTarget, CONTENT_IMAGE_FALLBACK)}
                      className="absolute inset-0 w-full h-full object-cover opacity-65 transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {/* 顶层：深色通透科技渐变蒙层 */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/75 via-slate-900/45 to-slate-950/90 group-hover:opacity-85 transition-opacity" />
                  </div>

                  {/* Top Icon Badge */}
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 text-white flex items-center justify-center font-bold shadow-md backdrop-blur-md group-hover:scale-105 transition-transform">
                      <ScIcon className="w-5.5 h-5.5 text-white" />
                    </div>
                  </div>

                  {/* Middle Vertical / Stacked Title */}
                  <div className="relative z-10 my-auto py-6 flex flex-col items-center justify-center">
                    <div className="hidden lg:block text-white font-black text-base tracking-widest [writing-mode:vertical-rl] drop-shadow-sm group-hover:text-sky-200 transition-colors">
                      {sc.shortTitle}
                    </div>
                    <div className="block lg:hidden text-white font-black text-base drop-shadow-sm group-hover:text-sky-200 transition-colors">
                      {sc.shortTitle}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. HIGH-FREQUENCY PRODUCTS SECTION - 高频数据产品 */}
      <section className="py-10 w-full max-w-[1560px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 标题与操作链接（与重点场景模块保持完全一致） */}
        <SectionTitle
          title="高频数据产品"
          subtitle="展示廊坊各级部门发布的安全合规高价值数据产品"
          action={
            <Link
              to="/products"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 group"
            >
              <span>进入产品大厅</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          }
        />

        {/* 轮播容器：边缘有半露裁切感，自动匀速走马灯，鼠标悬停上浮微动并暂停 */}
        <div className="relative w-full overflow-hidden rounded-2xl py-2">
          {/* 左右两侧渐变遮罩饰条 (强化半露/裁切感暗示) */}
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-slate-50 via-slate-50/60 to-transparent z-10" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-slate-50 via-slate-50/60 to-transparent z-10" />

          {/* 走马灯滚动轨道 */}
          <div
            ref={productScrollRef}
            onMouseEnter={() => setIsProductHovered(true)}
            onMouseLeave={() => setIsProductHovered(false)}
            className="flex gap-5 overflow-x-auto scrollbar-none py-4 px-2 w-full cursor-grab active:cursor-grabbing"
            style={{ scrollBehavior: 'auto' }}
          >
            {[...highFreqProducts, ...highFreqProducts, ...highFreqProducts].map((prod, index) => {
              const AvatarIcon = prod.avatarIcon;
              return (
                <div
                  key={`${prod.id}-${index}`}
                  onClick={() => navigate(`/products/${prod.id}`)}
                  className="w-[270px] sm:w-[290px] md:w-[310px] shrink-0 rounded-2xl bg-white border border-slate-200/90 shadow-md hover:shadow-2xl hover:border-blue-400 hover:-translate-y-2.5 transition-all duration-300 ease-out flex flex-col justify-between overflow-hidden group relative cursor-pointer"
                >
                  {/* Card Header Cover Image */}
                  <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      loading="lazy"
                      onError={(event) => applyImageFallback(event.currentTarget, CONTENT_IMAGE_FALLBACK)}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    {/* Department / Provider Badge */}
                    <div className="absolute bottom-2 left-3 right-3 z-10 text-[10px] font-medium text-slate-200 truncate">
                      {prod.provider}
                    </div>
                  </div>

                  {/* Overlapping Round Logo / Icon Badge */}
                  <div className="relative z-20 -mt-6 mx-auto shrink-0">
                    <div className={`w-12 h-12 rounded-full border-2 border-white shadow-md ${prod.avatarBg} text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform duration-300`}>
                      <AvatarIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Card Main Info Body */}
                  <div className="px-4 pt-2 pb-3 text-center flex-grow flex flex-col justify-between space-y-3">
                    {/* Title */}
                    <div>
                      <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight group-hover:text-blue-600 transition-colors line-clamp-1">
                        {prod.shortName}
                      </h3>
                    </div>

                    {/* Brief Description */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 text-left bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/80 min-h-[56px]">
                      {prod.desc}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-end shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        checkAndApply({
                          productId: prod.id,
                          productName: prod.name,
                          provider: prod.provider,
                          hasAuthMgmt: true,
                        });
                      }}
                      className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center"
                    >
                      申请使用
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. ECOLOGY COOPERATION SECTION - 生态合作伙伴 (直接与 Footer 无缝相连) */}
      <section className="pt-16 pb-16 w-full bg-[#091122] border-t border-slate-800/80 relative overflow-hidden mt-12 mb-0">
        {/* 背景光效与 3D 方块阵列艺术视觉 (横向贯穿 100% 画面) */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 左侧深色渐变保护遮罩 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/95 to-transparent z-10 w-full lg:w-3/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/40 z-10" />

          {/* 右侧 3D 科技方块矩阵图像背景 */}
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"
            alt="生态合作伙伴 3D 数据方块矩阵"
            loading="lazy"
            onError={(event) => applyImageFallback(event.currentTarget, CONTENT_IMAGE_FALLBACK)}
            className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-full lg:w-3/5 object-cover object-right opacity-90 mix-blend-screen scale-105"
          />

          {/* 装饰发光光斑 */}
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* 居中对齐内容区 */}
        <div className="w-full max-w-[1720px] mx-auto px-6 sm:px-12 lg:px-20 relative z-10 flex items-center min-h-[360px] lg:min-h-[420px]">
          <div className="max-w-2xl space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              生态合作伙伴
            </h2>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed font-normal">
              廊坊可信数据空间秉承“平台+生态”战略，着力推进与数据源方、数据商、第三方算法服务商及场景方的合作深度与广度，携手生态伙伴，共创数据要素价值新纪元。
            </p>

            <div className="pt-2">
              <Link
                to="/ecology"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
              >
                <span>成为合作伙伴</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 架构图放大预览 Modal */}
      <AnimatePresence>
        {isArchImageModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md"
            onClick={() => setIsArchImageModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-[#081B3B] text-white border border-blue-400/30 shadow-2xl overflow-hidden"
            >
              {/* Modal 头部 */}
              <div className="flex flex-wrap items-center justify-between border-b border-blue-400/20 px-6 py-4 gap-3 bg-[#061633]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-cyan-300 flex items-center justify-center font-bold border border-blue-400/30">
                    {archActiveIndex === 0 ? <Workflow className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {archActiveIndex === 0 ? '廊坊城市可信数据空间 · 业务架构图' : '廊坊城市可信数据空间 · 技术架构图'}
                    </h3>
                    <p className="text-xs text-blue-200/70">
                      {archActiveIndex === 0 ? '业务架构全景（顺序 1/2）' : '技术架构全景（顺序 2/2）'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* 弹窗内选项卡切换 */}
                  <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700">
                    <button
                      type="button"
                      onClick={() => setArchActiveIndex(0)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        archActiveIndex === 0 ? 'bg-[#1459EB] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      业务架构
                    </button>
                    <button
                      type="button"
                      onClick={() => setArchActiveIndex(1)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                        archActiveIndex === 1 ? 'bg-[#1459EB] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      技术架构
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsArchImageModalOpen(false)}
                    className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-600 cursor-pointer"
                    title="关闭"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal 大图内容区 */}
              <div className="p-4 sm:p-6 overflow-auto max-h-[calc(92vh-85px)] bg-slate-900/90 flex items-center justify-center">
                <div className="w-full bg-white rounded-xl p-3 sm:p-5 shadow-2xl border border-white/10 flex items-center justify-center">
                  <img
                    src={archActiveIndex === 0 ? BIZ_ARCH_IMAGE : TECH_ARCH_IMAGE}
                    alt={archActiveIndex === 0 ? '业务架构' : '技术架构'}
                    onError={(event) => applyImageFallback(event.currentTarget, CONTENT_IMAGE_FALLBACK)}
                    className="w-full h-auto max-h-[72vh] object-contain rounded-lg"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
