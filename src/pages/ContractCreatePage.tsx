import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  FileText,
  FileCheck2,
  Clock,
  Calendar,
  MapPin,
  UserCheck,
  Globe,
  Send,
  Lock,
  Boxes,
  Database,
  Cpu,
  Layers,
  Sparkles,
  Users,
  Settings,
  HelpCircle,
  X,
  ExternalLink,
  Info,
  Check
} from 'lucide-react';
import { getPortalProductDetail, type PortalProductDetail } from '../lib/products';
import { motion, AnimatePresence } from 'motion/react';

// Strategy Dimension Types
type DimensionKey =
  | 'time'
  | 'location'
  | 'subject'
  | 'environment'
  | 'delivery'
  | 'permissions'
  | 'period'
  | 'extended';

export function ContractCreatePage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const productId = code || searchParams.get('code') || 'LF-DP-001';
  const [product, setProduct] = useState<PortalProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Wizard Step: 1 = 交易标的, 2 = 策略编排, 3 = 使用说明, 4 = 合约信息
  const [currentStep, setCurrentStep] = useState<number>(2);

  // Active Dimension in Step 2
  const [activeDimension, setActiveDimension] = useState<DimensionKey>('time');

  // Form State for Time Dimension
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [startTime, setStartTime] = useState('09:00:00');
  const [endTime, setEndTime] = useState('18:00:00');
  const [maxCount, setMaxCount] = useState('100000');
  const [frequencyCount, setFrequencyCount] = useState('1000');
  const [frequencyUnit, setFrequencyUnit] = useState('天');

  // Form State for Location
  const [allowedRegions, setAllowedRegions] = useState('京津冀地区、廊坊市行政区域内');
  const [ipWhitelist, setIpWhitelist] = useState('10.120.44.0/24, 192.168.10.0/24');

  // Form State for Subject
  const [subjectTypes, setSubjectTypes] = useState('政务部门、持牌金融机构、国有企事业单位');

  // Form State for Environment
  const [sandboxEnv, setSandboxEnv] = useState('廊坊市可信数据空间沙箱 (TEE密态计算环境)');

  // Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState('标准政企数据服务访问约束模板 v2.1');

  // Usage Description (Step 3)
  const [usagePurpose, setUsagePurpose] = useState('用于公共服务核验与金融联动风险控制分析，严禁用于商业营销或二次转售。');
  const [dataRetention, setDataRetention] = useState('单次核验实时比对，内存计算不落地存盘');

  // Success Modal
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [createdContractId, setCreatedContractId] = useState('');

  // Image Preview Modal
  const [showImageComparison, setShowImageComparison] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const detail = await getPortalProductDetail(productId);
        if (!cancelled && detail) {
          setProduct(detail);
        }
      } catch {
        // Fallback handled nicely
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
  }, [productId]);

  const handleSubmit = () => {
    const contractNo = `CT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCreatedContractId(contractNo);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 font-sans flex flex-col selection:bg-blue-500/20">
      {/* Top Banner Notice */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
            <Cpu className="w-3.5 h-3.5" /> 接入连接器控制台
          </span>
          <span className="text-slate-300 font-medium">
            正在提交数据产品使用合约申请
          </span>
          {product && (
            <span className="hidden sm:inline-block text-blue-300 font-bold bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60">
              【{product.productName}】({product.productId})
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/products/${productId}`}
            className="inline-flex items-center gap-1 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> 返回产品详情
          </Link>
          <span className="text-slate-700">|</span>
          <Link
            to="/products"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors font-semibold"
          >
            数据产品中心
          </Link>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Dark Sidebar (Matching connector interface in image) */}
        <aside className="w-60 bg-[#0d182e] text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
          <div className="p-4 border-b border-slate-800/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-600/30">
              TD
            </div>
            <div>
              <div className="text-sm font-bold text-white tracking-wide">接入连接器</div>
              <div className="text-[10px] text-slate-400">数据节点交互服务</div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 text-xs font-medium">
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              系统控制台
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-400" /> 身份管理
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-slate-400" /> 数据资源
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            {/* Expanded Group: 数据产品 */}
            <div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 text-slate-200 cursor-pointer">
                <span className="flex items-center gap-2.5 font-semibold">
                  <Boxes className="w-4 h-4 text-blue-400" /> 数据产品
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 rotate-180" />
              </div>
              <div className="ml-7 pl-2 border-l border-slate-800 my-1 space-y-1 text-slate-400">
                <div className="py-1 px-2 rounded hover:text-white cursor-pointer">产品目录</div>
                <div className="py-1 px-2 rounded hover:text-white cursor-pointer">沙箱运行审核</div>
              </div>
            </div>

            {/* Active Expanded Group: 数字合约 */}
            <div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-950/60 text-blue-300 font-bold border border-blue-800/40 cursor-pointer">
                <span className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-blue-400" /> 数字合约
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-blue-400 rotate-180" />
              </div>
              <div className="ml-7 pl-2 border-l border-blue-900/60 my-1 space-y-1 text-slate-300">
                <div className="py-1.5 px-2.5 rounded-lg bg-blue-600 text-white font-bold shadow-sm flex items-center justify-between">
                  <span>合约管理</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                </div>
                <div className="py-1 px-2 rounded hover:text-white cursor-pointer">策略管理</div>
              </div>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-slate-400" /> 数据交付
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-slate-400" /> 使用控制
              </span>
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-slate-400" /> 数据沙箱
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/60 text-slate-300 cursor-pointer">
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4 text-slate-400" /> 用户与权限
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </nav>

          <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-[#0a1222]">
            <span>空间节点: LF-NODE-01</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">已连通</span>
          </div>
        </aside>

        {/* Right Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#f4f7fb]">
          {/* Main Top Header */}
          <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-xs">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/products/${productId}`)}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors text-sm font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>创建数据合约</span>
              </button>

              <div className="h-4 w-px bg-slate-200" />

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>当前空间：</span>
                <span className="font-semibold text-slate-900">默认空间</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 运行正常
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700 bg-slate-100 px-3 py-1.5 rounded-full">
                <div className="w-6 h-6 rounded-full bg-slate-400 text-white flex items-center justify-center font-bold text-xs">
                  lf
                </div>
                <span className="font-semibold">lfssjj_admin</span>
              </div>
            </div>
          </header>

          {/* Main Body */}
          <div className="p-6 max-w-6xl w-full mx-auto space-y-5">

            {/* Step Wizard Card (Matching image) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between max-w-3xl mx-auto relative">
                {/* Connecting Line */}
                <div className="absolute top-4 left-10 right-10 h-0.5 bg-slate-200 -z-0" />

                {/* Step 1 */}
                <div
                  onClick={() => setCurrentStep(1)}
                  className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${currentStep >= 1 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {currentStep > 1 ? <Check className="w-5 h-5 stroke-[3]" /> : <Boxes className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-bold ${currentStep === 1 ? 'text-blue-600' : 'text-slate-600'}`}>
                    交易标的
                  </span>
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => setCurrentStep(2)}
                  className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${currentStep >= 2 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-100' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {currentStep > 2 ? <Check className="w-5 h-5 stroke-[3]" /> : <ShieldCheck className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-bold ${currentStep === 2 ? 'text-blue-600' : 'text-slate-600'}`}>
                    策略编排
                  </span>
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => setCurrentStep(3)}
                  className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${currentStep >= 3 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    {currentStep > 3 ? <Check className="w-5 h-5 stroke-[3]" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-bold ${currentStep === 3 ? 'text-blue-600' : 'text-slate-600'}`}>
                    使用说明
                  </span>
                </div>

                {/* Step 4 */}
                <div
                  onClick={() => setCurrentStep(4)}
                  className="flex flex-col items-center gap-2 relative z-10 cursor-pointer group"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${currentStep >= 4 ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-100 text-slate-400 border border-slate-200'}`}>
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <span className={`text-xs font-bold ${currentStep === 4 ? 'text-blue-600' : 'text-slate-600'}`}>
                    合约信息
                  </span>
                </div>
              </div>
            </div>

            {/* STEP 1: 交易标的 */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs"
              >
                <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                      确认交易标的与申请主体
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 pl-4">
                      请核对当前要申请使用的数据产品要素及提供方信息。
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                    第一步 / 共四步
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">产品名称</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">{product?.productName || '数据产品'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">产品标识码</div>
                    <div className="text-sm font-mono font-bold text-slate-800 mt-0.5">{product?.productId || 'LF-DP-001'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">数源/提供机构</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{product?.organizationName || product?.connectorName || '廊坊市数据管理中心'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-semibold">交付方式</div>
                    <div className="text-sm font-bold text-slate-800 mt-0.5">{product?.deliveryTypeName || 'API接口服务'}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => navigate(`/products/${productId}`)}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                  >
                    下一步：策略编排 ↗
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: 策略编排 (Matching screenshot image directly) */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs"
              >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 border-l-4 border-blue-600 pl-3 leading-tight">
                      配置使用策略
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 pl-4">
                      基于数据产品预设的访问约束进行具体的执行参数配置。
                    </p>
                  </div>

                  <div className="w-72">
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="标准政企数据服务访问约束模板 v2.1">请选择合约模板（支持名称搜索）</option>
                      <option value="标准政企数据服务访问约束模板 v2.1">标准政企数据服务访问约束模板 v2.1</option>
                      <option value="金融联办密态计算高频核验策略">金融联办密态计算高频核验策略</option>
                      <option value="公共卫生应急数据沙箱调取策略">公共卫生应急数据沙箱调取策略</option>
                    </select>
                  </div>
                </div>

                {/* Grid Container for Left Menu & Right Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left Column: 策略配置维度 */}
                  <div className="md:col-span-4 bg-slate-50/80 rounded-xl border border-slate-200 p-4 space-y-4">
                    <div className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2.5">
                      策略配置维度
                    </div>

                    {/* Group A.1 */}
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1 py-1">
                        <span className="text-[10px]">▾</span> 约束类策略（A.1）
                      </div>

                      <div className="space-y-1 pl-2">
                        <button
                          type="button"
                          onClick={() => setActiveDimension('time')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'time'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${activeDimension === 'time' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>时间维度</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveDimension('location')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'location'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <MapPin className={`w-3.5 h-3.5 ${activeDimension === 'location' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>地点维度</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveDimension('subject')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'subject'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <UserCheck className={`w-3.5 h-3.5 ${activeDimension === 'subject' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>主体维度</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveDimension('environment')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'environment'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <Globe className={`w-3.5 h-3.5 ${activeDimension === 'environment' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>环境维度</span>
                        </button>
                      </div>
                    </div>

                    {/* Group A.2 */}
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1 py-1">
                        <span className="text-[10px]">▾</span> 行为类策略（A.2）
                      </div>

                      <div className="space-y-1 pl-2">
                        <button
                          type="button"
                          onClick={() => setActiveDimension('delivery')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'delivery'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <Send className={`w-3.5 h-3.5 ${activeDimension === 'delivery' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>交付行为</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveDimension('permissions')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'permissions'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <ShieldCheck className={`w-3.5 h-3.5 ${activeDimension === 'permissions' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>操作权限与义务</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveDimension('period')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'period'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${activeDimension === 'period' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>周期配置</span>
                        </button>
                      </div>
                    </div>

                    {/* Group Extension */}
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1 py-1">
                        <span className="text-[10px]">▾</span> 可扩展信息
                      </div>

                      <div className="space-y-1 pl-2">
                        <button
                          type="button"
                          onClick={() => setActiveDimension('extended')}
                          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all cursor-pointer ${
                            activeDimension === 'extended'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200/80 font-bold shadow-xs'
                              : 'text-slate-600 hover:bg-slate-200/60'
                          }`}
                        >
                          <Boxes className={`w-3.5 h-3.5 ${activeDimension === 'extended' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span>扩展信息</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Form Panel */}
                  <div className="md:col-span-8 border border-slate-200 rounded-xl p-5 space-y-5 bg-white">
                    {/* Time Dimension */}
                    {activeDimension === 'time' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                          时间维度配置
                        </h3>

                        <div className="space-y-4 pt-1">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              限定时间范围
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                              <div className="relative">
                                <input
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-semibold">→</span>
                                <input
                                  type="date"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              限定时间窗口
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
                              <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-slate-400 font-semibold">→</span>
                                <input
                                  type="time"
                                  value={endTime}
                                  onChange={(e) => setEndTime(e.target.value)}
                                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              限定使用次数
                            </label>
                            <input
                              type="number"
                              value={maxCount}
                              onChange={(e) => setMaxCount(e.target.value)}
                              placeholder="最大允许次数"
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              限定使用频率
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={frequencyCount}
                                onChange={(e) => setFrequencyCount(e.target.value)}
                                placeholder="次数"
                                className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <select
                                value={frequencyUnit}
                                onChange={(e) => setFrequencyUnit(e.target.value)}
                                className="w-1/2 text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="秒">/ 秒</option>
                                <option value="分钟">/ 分钟</option>
                                <option value="小时">/ 小时</option>
                                <option value="天">/ 天</option>
                                <option value="月">/ 月</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Location Dimension */}
                    {activeDimension === 'location' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                          地点维度配置
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">允许调用地域范围</label>
                            <input
                              type="text"
                              value={allowedRegions}
                              onChange={(e) => setAllowedRegions(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">访问节点 IP 白名单 CIDR</label>
                            <input
                              type="text"
                              value={ipWhitelist}
                              onChange={(e) => setIpWhitelist(e.target.value)}
                              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700 font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Subject Dimension */}
                    {activeDimension === 'subject' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                          主体维度配置
                        </h3>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">允许申请主体类型</label>
                          <input
                            type="text"
                            value={subjectTypes}
                            onChange={(e) => setSubjectTypes(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700"
                          />
                        </div>
                      </div>
                    )}

                    {/* Environment Dimension */}
                    {activeDimension === 'environment' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                          环境维度配置
                        </h3>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">指定计算沙箱环境</label>
                          <input
                            type="text"
                            value={sandboxEnv}
                            onChange={(e) => setSandboxEnv(e.target.value)}
                            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700"
                          />
                        </div>
                      </div>
                    )}

                    {/* Other Dimensions (Fallback) */}
                    {['delivery', 'permissions', 'period', 'extended'].includes(activeDimension) && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                          {activeDimension === 'delivery' && '交付行为配置'}
                          {activeDimension === 'permissions' && '操作权限与义务'}
                          {activeDimension === 'period' && '周期配置'}
                          {activeDimension === 'extended' && '扩展策略信息'}
                        </h3>
                        <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 text-xs text-slate-600 space-y-2">
                          <p className="font-semibold text-blue-950">已默认加载《标准政企数据服务访问约束模板 v2.1》的内置预设规则。</p>
                          <ul className="list-disc pl-4 space-y-1 text-slate-600">
                            <li>传输加密：采用 SM4 国密算法加密传输通道</li>
                            <li>数据水印：输出流自动注入动态隐形数字水印与审计标识</li>
                            <li>日志留痕：所有调用行为全量上链，防篡改留痕</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Navigation Buttons (Matching screenshot) */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => navigate(`/products/${productId}`)}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    ‹ 上一步
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                  >
                    下一步 ›
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: 使用说明 */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                    填写申请使用说明与用途说明
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 pl-4">
                    说明具体使用场景与合规承诺，以便提供方快速审批。
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      拟使用业务场景说明 <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={usagePurpose}
                      onChange={(e) => setUsagePurpose(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      数据存储与落地方案说明
                    </label>
                    <input
                      type="text"
                      value={dataRetention}
                      onChange={(e) => setDataRetention(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-slate-700"
                    />
                  </div>

                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>使用申请审批通过后，系统将自动分配节点密钥与密态沙箱访问通道，有效期内可按授权频率自由调取。</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    ‹ 上一步
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
                  >
                    下一步：确认合约 ›
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: 合约信息确认 */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs"
              >
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-base font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
                    确认数字数据合约信息
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 pl-4">
                    核对并签署数字数据合约，提交节点存证与审批。
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="font-bold text-slate-900 text-sm">拟签订合约概要</span>
                    <span className="text-blue-600 font-bold bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                      待节点签署
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div><span className="text-slate-400 font-semibold">标的产品：</span> <span className="font-bold text-slate-800">{product?.productName}</span></div>
                    <div><span className="text-slate-400 font-semibold">提供节点：</span> <span className="font-bold text-slate-800">{product?.connectorName || '廊坊数据中心'}</span></div>
                    <div><span className="text-slate-400 font-semibold">限定时间：</span> <span className="font-bold text-slate-800">{startDate} 至 {endDate}</span></div>
                    <div><span className="text-slate-400 font-semibold">限定频率：</span> <span className="font-bold text-slate-800">{frequencyCount}次/{frequencyUnit}</span></div>
                    <div className="col-span-2"><span className="text-slate-400 font-semibold">约束模板：</span> <span className="font-bold text-slate-800">{selectedTemplate}</span></div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <input type="checkbox" id="agree" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                  <label htmlFor="agree" className="font-semibold cursor-pointer">
                    我已阅读并同意《数据要素合规交易与安全使用服务协议》及《密态沙箱计算合规承诺》
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                  >
                    ‹ 上一步
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-7 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>正式提交申请</span>
                  </button>
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">数据合约申请提交成功！</h3>
                <p className="text-xs text-slate-500 mt-1">
                  合约编排已完成，并自动提交至区块链节点存证校验。
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-left space-y-1 font-mono">
                <div className="text-slate-400">数字合约编号:</div>
                <div className="font-bold text-blue-700">{createdContractId}</div>
                <div className="text-slate-500 text-[11px]">校验状态: <span className="text-emerald-600 font-bold">● 已存证，等待提供方极速响应</span></div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setIsSuccessModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  继续编排
                </button>
                <button
                  onClick={() => navigate(`/products/${productId}`)}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20"
                >
                  返回产品详情
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
