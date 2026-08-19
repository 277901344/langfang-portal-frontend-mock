import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { 
  ArrowRight, ShieldCheck, Share2, Database, FileText,
  Shield, CheckCircle2, ExternalLink, Sparkles, Layers, ArrowUpRight, Cpu, Package,
  Workflow, TrendingUp, Activity, Building2, Server, Lock, Image as ImageIcon, Search, ChevronRight, ChevronLeft,
  Eye, Check, Users, Award, HelpCircle, HeartPulse, Home as HomeIcon, Coins,
  BookOpen, Compass, Building, Car, HardDrive, Network, Scale, ChevronUp, X, ZoomIn
} from 'lucide-react';
import { platformStats, dataProducts, keyScenarios } from '../data/mockData';
import { useAccessWizard } from '../context/AccessWizardContext';
import chinaUnicomLogo from '../logo/中国联通logo.png';
import huaweiLogo from '../logo/华为.png';
import ennLogo from '../logo/新奥燃气.svg';
import weatherLogo from '../logo/廊坊气象局.svg';
import busLogo from '../logo/廊坊公交集团.jpg';
import pipelineLogo from '../logo/北方管道.jpg';
import langfangYibaiLogo from '../logo/廊坊壹佰.jpg';
import hebeiYindanLogo from '../logo/河北银丹.jpg';

// 首页架构图引用路径：public/assets/architecture
const BIZ_ARCH_IMAGE = '/assets/architecture/business-architecture-final.png';
const TECH_ARCH_IMAGE = '/assets/architecture/technical-architecture-final.png';

const HERO_VIDEO = '/assets/banner/banner.mp4';
const HERO_POSTER = '/assets/banner/重要场景.png';

const ecosystemPartners = [
  { name: '中国联通', logo: chinaUnicomLogo },
  { name: '华为', logo: huaweiLogo },
  { name: '新奥燃气', logo: ennLogo },
  { name: '廊坊市气象局', logo: weatherLogo },
  { name: '廊坊公交集团', logo: busLogo },
  { name: '国家管网北方管道', logo: pipelineLogo },
  { name: '廊坊壹佰', logo: langfangYibaiLogo },
  { name: '河北银丹', logo: hebeiYindanLogo },
];

interface HomeSectionHeadingProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

function HomeSectionHeading({
  title,
  description,
  action,
}: HomeSectionHeadingProps) {
  return (
    <div className="mx-auto mb-8 flex max-w-4xl flex-col items-center text-center sm:mb-9">
      <h2 className="text-balance text-3xl font-bold tracking-[-0.025em] text-slate-950 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-pretty text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
        {description}
      </p>
      {action && <div className="mt-4 flex flex-wrap items-center justify-center gap-3">{action}</div>}
    </div>
  );
}

export function Home() {
  const navigate = useNavigate();
  const { checkAndApply } = useAccessWizard();
  const prefersReducedMotion = useReducedMotion();
  const [isArchImageModalOpen, setIsArchImageModalOpen] = useState(false);
  const [archActiveIndex, setArchActiveIndex] = useState(0);
  const [archIsPaused, setArchIsPaused] = useState(false);

  // 核心架构 2 张大图自动轮播：停留时间 4.5秒，鼠标悬停暂停
  useEffect(() => {
    if (archIsPaused || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setArchActiveIndex((prev) => (prev === 0 ? 1 : 0));
    }, 4500);
    return () => clearInterval(interval);
  }, [archIsPaused, prefersReducedMotion]);

  const [productPage, setProductPage] = useState(0);
  const [productDirection, setProductDirection] = useState<1 | -1>(1);
  const [productsPerPage, setProductsPerPage] = useState(() => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth >= 1280) return 4;
    if (window.innerWidth >= 768) return 2;
    return 1;
  });

  const highFreqProducts = [
    {
      id: 'dp-001',
      code: 'NO. DP-001',
      tag: '公积金专题',
      subTags: ['跨域协同', '隐私计算'],
      name: '公积金缴存人跨域核验信息服务',
      shortName: '住房公积金跨域核验',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop',
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
    const handleResize = () => {
      const nextPerPage = window.innerWidth >= 1280 ? 4 : window.innerWidth >= 768 ? 2 : 1;
      setProductsPerPage((current) => (current === nextPerPage ? current : nextPerPage));
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const productPageCount = Math.ceil(highFreqProducts.length / productsPerPage);
  const visibleProducts = highFreqProducts.slice(
    productPage * productsPerPage,
    productPage * productsPerPage + productsPerPage,
  );

  useEffect(() => {
    setProductPage((current) => Math.min(current, Math.max(productPageCount - 1, 0)));
  }, [productPageCount]);

  const handleProductPageChange = (direction: 'left' | 'right') => {
    const directionValue = direction === 'right' ? 1 : -1;
    setProductDirection(directionValue);
    setProductPage((current) => (current + directionValue + productPageCount) % productPageCount);
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
    if (isPaused || prefersReducedMotion) return;

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
  }, [isPaused, featuredScenarios.length, prefersReducedMotion]);

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
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F0F4F9] font-sans text-slate-800 selection:bg-blue-500/20">
      <section className="relative flex min-h-[700px] w-full items-center overflow-hidden bg-[#051126] pb-16 pt-16 text-white sm:min-h-[740px] lg:min-h-[780px] lg:pb-20 lg:pt-20">
        <img src={HERO_POSTER} alt="廊坊城市可信数据空间夜景" className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={HERO_POSTER}
          src={HERO_VIDEO}
          className="home-hero-video absolute inset-0 h-full w-full object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,12,31,0.96)_0%,rgba(5,17,38,0.72)_48%,rgba(5,17,38,0.2)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#051126] via-transparent to-[#051126]/20" />

        <div className="relative z-10 mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0.7, y: 20, filter: 'blur(5px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <div className="mb-5 inline-flex items-center gap-3 text-sm font-medium text-blue-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-50 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
              </span>
              城市可信数据基础设施持续运行
            </div>
            <h1 className="max-w-4xl text-balance text-[clamp(2.7rem,5.6vw,5.6rem)] font-black leading-[1.08] tracking-[-0.03em] text-white [text-shadow:0_10px_28px_rgba(0,0,0,0.48)]">
              让数据可信流通
              <span className="mt-2 block text-cyan-200">让城市价值持续生长</span>
            </h1>
            <p className="mt-7 max-w-3xl text-pretty text-base font-medium leading-8 text-slate-100 sm:text-lg lg:text-xl">
              以可信连接、合规治理和场景应用，构建面向城市治理、产业发展与民生服务的可信数据基础设施。
            </p>
          </motion.div>

          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0.72, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: prefersReducedMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 overflow-hidden rounded-xl border-y border-white/15 bg-[#061633]/72 backdrop-blur-md lg:mt-14"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-100">
                <Activity className="h-4 w-4 text-cyan-300" />
                核心运行指标
              </div>
              <span className="text-xs text-blue-200/70">可信节点实时汇聚</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4">
              {[
                { value: '32', unit: '家', label: '接入政府部门', icon: Database },
                { value: '18.5', unit: 'TB', label: '累计数据量', icon: HardDrive },
                { value: '24', unit: '个', label: '数据产品数', icon: Package },
                { value: '1.25', unit: '亿次', label: '累计交换量', icon: Share2 },
              ].map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <div key={stat.label} className={`group relative px-4 py-5 sm:px-6 lg:py-6 ${idx % 2 ? 'border-l border-white/10' : ''} ${idx > 1 ? 'border-t border-white/10 md:border-t-0' : ''} ${idx > 0 ? 'md:border-l md:border-white/10' : ''}`}>
                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-blue-100/80">
                      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-500/18 text-cyan-300">
                        <StatIcon className="h-4 w-4" />
                      </span>
                      {stat.label}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-number text-3xl font-bold tracking-[-0.025em] text-white sm:text-4xl">{stat.value}</span>
                      <span className="text-sm font-semibold text-cyan-300">{stat.unit}</span>
                    </div>
                    <span className="absolute bottom-0 left-4 right-4 h-px origin-left scale-x-0 bg-cyan-300 transition-transform duration-500 group-hover:scale-x-100" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#EAF0F7] py-12 text-slate-900 sm:py-14 lg:py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-[#C8D5E5]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12">
          <HomeSectionHeading
            title="核心架构"
            description="从业务协同与可信技术两个视角呈现数据接入、授权运营、交易流通与生态应用的完整链路。"
            action={(
              <div className="inline-flex items-center rounded-lg border border-[#C7D4E6] bg-white p-1 shadow-[0_4px_8px_rgba(31,41,55,0.06)]">
              {[
                { label: '业务架构', idx: 0, icon: Workflow },
                { label: '技术架构', idx: 1, icon: Layers },
              ].map((item) => {
                const TabIcon = item.icon;
                return (
                  <button
                    key={item.idx}
                    type="button"
                    onClick={() => setArchActiveIndex(item.idx)}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors ${archActiveIndex === item.idx ? 'bg-[#1459EB] text-white' : 'text-slate-600 hover:bg-[#EDF4FF] hover:text-[#1459EB]'}`}
                    aria-pressed={archActiveIndex === item.idx}
                  >
                    <TabIcon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
              </div>
            )}
          />

          <div className="mx-auto max-w-[1160px] overflow-hidden rounded-2xl border border-[#C8D6E8]/80 bg-[radial-gradient(circle_at_50%_42%,#FFFFFF_0%,#F1F6FC_58%,#E7EEF7_100%)] p-2 shadow-[0_10px_26px_rgba(38,66,105,0.09)] sm:p-3" onMouseEnter={() => setArchIsPaused(true)} onMouseLeave={() => setArchIsPaused(false)}>
            <div onClick={() => setIsArchImageModalOpen(true)} className="group relative block aspect-[16/9] w-full cursor-zoom-in overflow-hidden rounded-xl bg-[#EDF3FA] text-left">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`arch-${archActiveIndex}`}
                  src={archActiveIndex === 0 ? BIZ_ARCH_IMAGE : TECH_ARCH_IMAGE}
                  alt={archActiveIndex === 0 ? '廊坊城市可信数据空间业务架构图' : '廊坊城市可信数据空间技术架构图'}
                  initial={prefersReducedMotion ? false : { opacity: 0.58, scale: 1.01 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.25 }}
                  transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 h-full w-full object-contain mix-blend-multiply"
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 rounded-xl shadow-[inset_0_0_30px_rgba(232,239,248,0.7)]" />
              <div className="absolute bottom-4 right-4 flex items-center justify-end sm:bottom-5 sm:right-5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setArchActiveIndex((prev) => (prev === 0 ? 1 : 0));
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-md bg-[#123B70] text-white shadow-[0_4px_8px_rgba(18,59,112,0.18)] transition-colors hover:bg-[#1459EB]"
                  aria-label="切换架构图"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 sm:py-14 lg:py-16" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12">
          <HomeSectionHeading
            title="重点场景"
            description="以授权可控的协同方式，让敏感数据在不出域的前提下服务民生、金融与城市治理。"
            action={(
              <Link to="/scenarios" className="group inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                进入场景专题中心
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          />

          <div className="flex h-[720px] w-full flex-col items-stretch gap-3 sm:h-[700px] lg:h-[560px] lg:flex-row">
          {featuredScenarios.map((sc, index) => {
            const isActive = index === activeScenarioIndex;
            const ScIcon = sc.icon;
            return (
              <article
                key={sc.id}
                onClick={() => handleSelectScenario(index)}
                onMouseEnter={() => handleSelectScenario(index)}
                style={{ flex: isActive ? '6.5 1 0%' : '1.15 1 0%', transition: 'flex 480ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                className="group relative h-full cursor-pointer overflow-hidden rounded-xl bg-[#071937] shadow-[0_8px_24px_rgba(6,22,51,0.14)]"
              >
                <img src={sc.image} alt="" className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${isActive ? 'scale-100 opacity-75 group-hover:scale-[1.025]' : 'scale-105 opacity-55 group-hover:scale-100'}`} referrerPolicy="no-referrer" />
                <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'bg-[linear-gradient(90deg,rgba(3,13,33,0.98)_0%,rgba(4,17,42,0.86)_47%,rgba(4,17,42,0.2)_100%)]' : 'bg-gradient-to-b from-[#071937]/45 to-[#041128]/95'}`} />
                <div className={`absolute left-0 top-0 z-20 h-1 bg-cyan-300 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} style={{ width: `${Math.min(progress, 100)}%` }} />

                <div className={`absolute inset-0 z-10 flex flex-col justify-between p-6 transition-opacity duration-300 sm:p-8 lg:p-9 ${isActive ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
                  <div className="max-w-3xl">
                    <div className="mb-5 flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 text-cyan-200 backdrop-blur-sm"><ScIcon className="h-5 w-5" /></span>
                      <span className="rounded-md bg-white/10 px-2.5 py-1 text-xs font-semibold text-blue-100 backdrop-blur-sm">{sc.category}</span>
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />{sc.status}</span>
                    </div>
                    <h3 className="max-w-2xl text-balance text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">{sc.title}</h3>
                    <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-blue-50/82 sm:text-base">{sc.quote}</p>
                  </div>

                  <div>
                    <div className="mb-6 hidden max-w-3xl grid-cols-3 gap-px overflow-hidden rounded-lg bg-white/12 sm:grid">
                      {sc.metrics.map((metric) => (
                        <div key={metric.label} className="bg-[#071937]/72 px-4 py-3 backdrop-blur-sm">
                          <div className="font-number text-lg font-bold text-white lg:text-xl">{metric.value}</div>
                          <div className="mt-1 text-xs text-blue-100/60">{metric.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <Link to={`/scenarios/${sc.scenarioId}`} className="inline-flex items-center gap-2 rounded-md bg-[#1459EB] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2A6AF1]">查看方案<ChevronRight className="h-4 w-4" /></Link>
                      <Link to={`/products?scenario=${sc.scenarioId}`} className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/18"><Package className="h-4 w-4" />关联产品</Link>
                    </div>
                  </div>
                </div>

                <div className={`absolute inset-0 z-10 flex flex-row items-center justify-between gap-4 p-5 transition-opacity duration-300 lg:flex-col lg:items-center lg:justify-end lg:py-7 ${isActive ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white/10 text-cyan-200 backdrop-blur-sm"><ScIcon className="h-4.5 w-4.5" /></span>
                  <div className="min-w-0 text-right lg:text-center">
                    <div className="text-xs font-medium text-blue-100/55">{sc.id.replace('SCENARIO ', '0')}</div>
                    <div className="mt-1 text-sm font-bold leading-5 text-white lg:[writing-mode:vertical-rl] lg:tracking-[0.16em]">{sc.shortTitle}</div>
                  </div>
                </div>
              </article>
            );
          })}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-[#F8FAFD] py-12 sm:py-14 lg:py-16">
        <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12">
          <HomeSectionHeading
            title="高频数据产品"
            description="聚焦跨域核验、金融风控、医疗协同等高价值需求，让数据能力成为可直接使用的城市服务。"
            action={(
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800">
                进入产品大厅
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            )}
          />

          <div className="relative px-9 sm:px-12 lg:px-14">
            <button
              type="button"
              onClick={() => handleProductPageChange('left')}
              className="absolute left-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D5E5] bg-white text-slate-700 shadow-[0_6px_18px_rgba(31,41,55,0.12)] transition-all hover:border-[#1459EB] hover:bg-[#1459EB] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1459EB]"
              aria-label="查看上一组数据产品"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={`product-page-${productPage}-${productsPerPage}`}
                initial={prefersReducedMotion ? false : { opacity: 0, x: productDirection * 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: productDirection * -18 }}
                transition={{ duration: prefersReducedMotion ? 0.1 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
              >
                {visibleProducts.map((prod) => (
                  <article
                    key={prod.id}
                    onClick={() => navigate(`/products/${prod.id}`)}
                    className="group flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border border-[#DDE3EC] bg-white shadow-[0_4px_12px_rgba(31,41,55,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#B9C9DC] hover:shadow-[0_10px_24px_rgba(20,89,235,0.10)]"
                  >
                    <div className="relative h-40 overflow-hidden bg-[#0C1D38]">
                      <img src={prod.image} alt={prod.name} className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.035]" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0C1D38]/90 via-[#0C1D38]/20 to-transparent" />
                      <div className="absolute left-4 top-4 flex items-center gap-2">
                        <span className="rounded-md bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#1459EB]">{prod.tag}</span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="line-clamp-1 text-xs font-medium text-blue-50/78">{prod.provider}</span>
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-lg font-bold tracking-tight text-slate-950 transition-colors group-hover:text-blue-600"><Link to={`/products/${prod.id}`} onClick={(event) => event.stopPropagation()}>{prod.shortName}</Link></h3>
                      <p className="mt-3 line-clamp-2 min-h-[44px] text-sm leading-[22px] text-slate-600">{prod.desc}</p>
                      <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-4">
                        <button type="button" onClick={(event) => { event.stopPropagation(); checkAndApply({ productId: prod.id, productName: prod.name, provider: prod.provider, hasAuthMgmt: true }); }} className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-600 hover:text-white">申请使用<ChevronRight className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </motion.div>
            </AnimatePresence>

            <button
              type="button"
              onClick={() => handleProductPageChange('right')}
              className="absolute right-0 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#C9D5E5] bg-white text-slate-700 shadow-[0_6px_18px_rgba(31,41,55,0.12)] transition-all hover:border-[#1459EB] hover:bg-[#1459EB] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1459EB]"
              aria-label="查看下一组数据产品"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3" aria-label={`数据产品第 ${productPage + 1} 组，共 ${productPageCount} 组`}>
            {productPageCount <= 6 && Array.from({ length: productPageCount }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setProductDirection(index >= productPage ? 1 : -1);
                  setProductPage(index);
                }}
                className={`h-2 rounded-full transition-all ${index === productPage ? 'w-6 bg-[#1459EB]' : 'w-2 bg-[#C7D4E6] hover:bg-[#8FA8C7]'}`}
                aria-label={`切换到第 ${index + 1} 组产品`}
                aria-current={index === productPage ? 'true' : undefined}
              />
            ))}
            <span className="font-number text-xs font-semibold tabular-nums text-slate-500">
              {String(productPage + 1).padStart(2, '0')} / {String(productPageCount).padStart(2, '0')}
            </span>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#EEF3F9] py-12 text-slate-900 sm:py-14 lg:py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-[#D3DEEB]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#D3DEEB]" />
        <div className="relative mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-12">
          <HomeSectionHeading
            title="生态合作伙伴"
            description="面向数据源方、数据商、算法服务商和场景方开放协作能力，以统一规则、可信连接和运营服务共同培育数据要素生态。"
            action={(
              <Link to="/ecology" className="inline-flex items-center gap-2 rounded-md bg-[#1459EB] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F49C8]">成为合作伙伴<ArrowUpRight className="h-4 w-4" /></Link>
            )}
          />

          <div className="relative mx-auto max-w-6xl">
            <div className="mb-4 flex items-center justify-between text-xs font-medium text-slate-500"><span>代表性生态节点</span><span>持续接入中</span></div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {ecosystemPartners.map((partner, index) => (
                <motion.div
                  key={partner.name}
                  initial={prefersReducedMotion ? false : { opacity: 0.72, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : index * 0.045, ease: [0.16, 1, 0.3, 1] }}
                  className="group flex min-h-28 flex-col items-center justify-center rounded-xl border border-[#D7E0EC] bg-white p-4 shadow-[0_4px_12px_rgba(38,66,105,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-[#AFC2D9] hover:shadow-[0_10px_22px_rgba(38,66,105,0.10)]"
                >
                  <img src={partner.logo} alt={`${partner.name}标志`} className="h-11 max-w-[118px] object-contain transition-transform duration-300 group-hover:scale-105" />
                  <span className="mt-3 text-center text-xs font-medium text-slate-600">{partner.name}</span>
                </motion.div>
              ))}
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
              className="relative flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-[#081B3B] text-white shadow-[0_30px_80px_rgba(0,0,0,0.42)]"
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
              <div className="flex max-h-[calc(92vh-85px)] items-center justify-center overflow-auto bg-[#041128] p-3 sm:p-5">
                <div className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#05142F]">
                  <img
                    src={archActiveIndex === 0 ? BIZ_ARCH_IMAGE : TECH_ARCH_IMAGE}
                    alt={archActiveIndex === 0 ? '业务架构' : '技术架构'}
                    className="max-h-[76vh] h-auto w-full object-contain"
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
