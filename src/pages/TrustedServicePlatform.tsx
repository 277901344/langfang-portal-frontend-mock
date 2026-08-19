import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  ChevronDown,
  ChevronRight,
  Edit,
  Link2,
  TableProperties,
  FileText,
  Users,
  Menu,
  CheckCircle2,
  ArrowLeft,
  ExternalLink,
  Layers,
  Sparkles,
  Building2,
  LogOut,
  Home as HomeIcon,
  Search,
  Upload,
  AlertCircle,
  Database,
  Lock,
  Share2,
  Clock,
  ChevronUp,
  X,
  Info,
  HelpCircle,
  Check,
  FileCheck2,
  Cpu,
  Loader2,
  Radio,
  Sliders,
  Settings,
  FolderTree,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useAccessWizard } from '../context/AccessWizardContext';

export function TrustedServicePlatform() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, displayName, logout } = useAuth();
  const { deployConnector } = useAccessWizard();

  const tabParam = searchParams.get('tab') || searchParams.get('view');
  const targetProductId = searchParams.get('productId') || '';
  const targetProductName = searchParams.get('name') || '';

  // Sidebar navigation state
  const [collapsed, setCollapsed] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string>(() => {
    if (tabParam === 'connector_register' || tabParam === 'connector-register') {
      return 'connector-register';
    }
    if (tabParam === 'connectors' || tabParam === 'connector-mgmt') {
      return 'connector-mgmt';
    }
    return 'my-identity';
  });

  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    identity: true,
    connector: tabParam === 'connector_register' || tabParam === 'connector-register' || tabParam === 'connectors',
    catalog: false,
    contract: false,
    audit: false,
    space: false,
    auth: false,
  });

  // Active subtab inside connector registration (基础信息, 扩展信息, 合规与资质附件)
  const [activeConnectorSubTab, setActiveConnectorSubTab] = useState<'basic' | 'extended' | 'attachments'>('basic');

  // Connector registration form state
  const [connectorForm, setConnectorForm] = useState({
    name: targetProductName ? `${targetProductName}数据空间连接器` : 'Primary Gateway Node 01',
    ipList: '10.20.4.100',
    internetUrl: '',
    snNumber: '',
    dedicatedLineUrl: 'https://private-gw.example:18443/connector/c1',
    forceDedicatedLine: true,
    productVersion: '',
    macAddress: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // User menu dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (tabParam === 'connector_register' || tabParam === 'connector-register') {
      setActiveMenu('connector-register');
      setOpenMenus((prev) => ({ ...prev, connector: true }));
    }
  }, [tabParam]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const toggleGroup = (key: string) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveAndSubmitConnector = async () => {
    setIsSubmitting(true);
    try {
      if (targetProductId) {
        await deployConnector(targetProductId);
      }
      // Simulate quick registration API
      await new Promise((resolve) => setTimeout(resolve, 800));
      setIsSubmitting(false);
      setSubmitSuccess(true);
    } catch {
      setIsSubmitting(false);
      showToast('连接器信息已保存');
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f0f2f5] text-slate-800 font-sans antialiased select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Submission Success Modal */}
      {submitSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">连接器注册与部署申请已提交</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                基础信息已通过准入核验，连接器状态已就绪。您可直接返回继续数据产品申请或进入连接器管理控制台。
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(false);
                  if (targetProductId) {
                    navigate(`/products/${targetProductId}/apply`);
                  } else {
                    navigate('/products');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-[#1459EB] hover:bg-[#0E43B5] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs"
              >
                继续申请数据产品
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmitSuccess(false);
                  setActiveMenu('connector-mgmt');
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                查看连接器管理
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP HEADER (Exact match with Image 2) */}
      <header className="h-[52px] bg-white border-b border-[#E5E7EB] px-4 flex items-center justify-between shadow-2xs shrink-0 z-20">
        {/* Left: Brand / Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1459EB] flex items-center justify-center text-white shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-[14px] font-bold tracking-tight text-[#1F2937]">
              可信数据空间服务平台
            </span>
          </div>
        </div>

        {/* Center: Space Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs">
          <span className="text-slate-500">当前空间：</span>
          <span className="font-semibold text-slate-800">默认空间</span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>运行正常</span>
          </div>
        </div>

        {/* Right: User Menu */}
        <div ref={userMenuRef} className="relative flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100/80 transition-colors cursor-pointer text-left focus:outline-none"
          >
            <div className="text-right hidden sm:block leading-tight">
              <div className="text-xs font-bold text-slate-800">
                {displayName || user?.username || 'feng123'}
              </div>
              <div className="text-[10px] text-slate-400">
                个人用户
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300/80 flex items-center justify-center text-slate-500 shadow-2xs">
              <User className="w-4 h-4 text-slate-500" />
            </div>
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800">{displayName || user?.displayName || 'feng123'}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">账号状态：已认证</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/portal-management?tab=institution');
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>返回门户管理</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/');
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <HomeIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>数据空间首页</span>
              </button>
              <div className="border-t border-slate-100 my-0.5" />
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  navigate('/');
                }}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* BODY (SIDEBAR + MAIN CONTENT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (Dark navy background #001529) */}
        <aside
          className={cn(
            'bg-[#001529] text-slate-300 flex flex-col justify-between shrink-0 transition-all duration-200 select-none z-10',
            collapsed ? 'w-16' : 'w-[210px]'
          )}
        >
          {/* Menu Items */}
          <div className="p-2 space-y-1 overflow-y-auto flex-1 text-xs">
            {/* GROUP 1: 身份管理 */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('identity')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-slate-300" />
                  {!collapsed && <span className="font-medium">身份管理</span>}
                </div>
                {!collapsed && (
                  openMenus.identity ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {(!collapsed && openMenus.identity) && (
                <div className="mt-1 pl-4 space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveMenu('my-identity')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'my-identity'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>我的身份</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('join-audit')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'join-audit'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>加入主体审核</span>
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 2: 连接器 (Expanded in Image 2) */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('connector')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Link2 className="w-4 h-4 text-slate-300" />
                  {!collapsed && <span className="font-medium">连接器</span>}
                </div>
                {!collapsed && (
                  openMenus.connector ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {(!collapsed && openMenus.connector) && (
                <div className="mt-1 pl-4 space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveMenu('connector-register')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'connector-register' || activeMenu === 'connector-mgmt'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>连接器管理</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu('connector-audit');
                      showToast('连接器审核列表');
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'connector-audit'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>连接器审核</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMenu('connector-test');
                      showToast('连接器连通性测试平台');
                    }}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'connector-test'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>连接器测试</span>
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 3: 目录管理 */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('catalog')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <TableProperties className="w-4 h-4 text-slate-300" />
                  {!collapsed && <span className="font-medium">目录管理</span>}
                </div>
                {!collapsed && (
                  openMenus.catalog ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {(!collapsed && openMenus.catalog) && (
                <div className="mt-1 pl-4 space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveMenu('catalogs')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'catalogs'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>数据资源目录</span>
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 4: 数字合约 */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('contract')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-300" />
                  {!collapsed && <span className="font-medium">数字合约</span>}
                </div>
                {!collapsed && (
                  openMenus.contract ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {(!collapsed && openMenus.contract) && (
                <div className="mt-1 pl-4 space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveMenu('contracts')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'contracts'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>合约记录</span>
                  </button>
                </div>
              )}
            </div>

            {/* GROUP 5: 审核管理 */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('audit')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-slate-300" />
                  {!collapsed && <span className="font-medium">审核管理</span>}
                </div>
                {!collapsed && (
                  openMenus.audit ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            {/* GROUP 6: 空间管理 */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('space')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4 text-slate-300" />
                  {!collapsed && <span className="font-medium">空间管理</span>}
                </div>
                {!collapsed && (
                  openMenus.space ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>
            </div>

            {/* GROUP 7: 用户与权限 */}
            <div>
              <button
                type="button"
                onClick={() => toggleGroup('auth')}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-slate-300" />
                  {!collapsed && <span className="font-medium">用户与权限</span>}
                </div>
                {!collapsed && (
                  openMenus.auth ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {(!collapsed && openMenus.auth) && (
                <div className="mt-1 pl-4 space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveMenu('permissions')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-2',
                      activeMenu === 'permissions'
                        ? 'bg-[#1459EB] text-white font-medium shadow-xs'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <span>权限分配</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Sidebar Collapse Toggle */}
          <div className="p-3 border-t border-slate-800/80 flex items-center justify-start">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer flex items-center gap-2"
              title={collapsed ? '展开侧边栏' : '折叠侧边栏'}
            >
              <div className="w-4 flex flex-col gap-1 items-center justify-center">
                <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
                <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
              </div>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT CANVAS */}
        <main className="flex-1 overflow-y-auto bg-[#f8fafc] relative">
          {/* VIEW: 注册连接器 (Exact Match with Image 2) */}
          {(activeMenu === 'connector-register' || activeMenu === 'connector-mgmt') && (
            <div className="min-h-full flex flex-col bg-white">
              {/* Header Title with Back Arrow */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (targetProductId) {
                        navigate(-1);
                      } else {
                        navigate('/portal-management');
                      }
                    }}
                    className="p-1 -ml-1 text-slate-600 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer flex items-center gap-1.5 text-sm font-semibold"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>注册连接器</span>
                  </button>
                </div>
              </div>

              {/* Horizontal Stepper (1 to 5) */}
              <div className="px-8 py-5 border-b border-slate-100 bg-white">
                <div className="max-w-4xl mx-auto flex items-center justify-between relative text-xs">
                  {/* Step 1: 基础信息 (Active) */}
                  <div className="flex items-center gap-2 z-10 bg-white pr-2">
                    <span className="w-5 h-5 rounded-full bg-[#1677ff] text-white flex items-center justify-center text-[11px] font-semibold">
                      1
                    </span>
                    <span className="font-semibold text-[#1677ff]">基础信息</span>
                  </div>

                  <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

                  {/* Step 2: 提交审核 */}
                  <div className="flex items-center gap-2 z-10 bg-white px-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-medium">
                      2
                    </span>
                    <span className="text-slate-500">提交审核</span>
                  </div>

                  <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

                  {/* Step 3: 提交 CSR */}
                  <div className="flex items-center gap-2 z-10 bg-white px-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-medium">
                      3
                    </span>
                    <span className="text-slate-500">提交 CSR</span>
                  </div>

                  <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

                  {/* Step 4: 下载证书等待激活 */}
                  <div className="flex items-center gap-2 z-10 bg-white px-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-medium">
                      4
                    </span>
                    <span className="text-slate-500">下载证书等待激活</span>
                  </div>

                  <div className="flex-1 h-[1px] bg-slate-200 mx-2" />

                  {/* Step 5: 完成 */}
                  <div className="flex items-center gap-2 z-10 bg-white pl-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[11px] font-medium">
                      5
                    </span>
                    <span className="text-slate-500">完成</span>
                  </div>
                </div>
              </div>

              {/* Form Body Area */}
              <div className="p-6 md:p-8 w-full max-w-[1680px] mx-auto flex-1 flex flex-col space-y-6">
                {/* Info Notice Banner */}
                <div className="rounded-lg bg-[#e6f4ff] border border-[#91caff] p-4 flex items-start gap-3 text-xs text-[#003eb3]">
                  <Info className="w-4 h-4 text-[#1677ff] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900">当前任务：填写基础信息并提交部署申请</p>
                    <p className="text-slate-600">
                      请先完善连接器信息。提交成功后，需要经过管理员审核，审核通过后才会进入提交 CSR 阶段。
                    </p>
                  </div>
                </div>

                {/* Sub Tabs */}
                <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setActiveConnectorSubTab('basic')}
                    className={cn(
                      'pb-2.5 transition-colors cursor-pointer relative',
                      activeConnectorSubTab === 'basic'
                        ? 'text-[#1677ff] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1677ff]'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    基础信息(Basic)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveConnectorSubTab('extended')}
                    className={cn(
                      'pb-2.5 transition-colors cursor-pointer relative',
                      activeConnectorSubTab === 'extended'
                        ? 'text-[#1677ff] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1677ff]'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    扩展信息
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveConnectorSubTab('attachments')}
                    className={cn(
                      'pb-2.5 transition-colors cursor-pointer relative',
                      activeConnectorSubTab === 'attachments'
                        ? 'text-[#1677ff] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#1677ff]'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                  >
                    合规与资质附件(Attachments)
                  </button>
                </div>

                {/* Tab 1: 基础信息 (Exact layout match with Image 2) */}
                {activeConnectorSubTab === 'basic' && (
                  <div className="space-y-5 flex-1 text-xs">
                    {/* Field 1: 接入连接器名称 */}
                    <div className="space-y-1.5">
                      <label className="block text-slate-700 font-medium">
                        <span className="text-red-500 mr-1">*</span>接入连接器名称
                      </label>
                      <input
                        type="text"
                        value={connectorForm.name}
                        onChange={(e) => setConnectorForm({ ...connectorForm, name: e.target.value })}
                        placeholder="e.g. Primary Gateway Node 01"
                        className="w-full h-9 px-3 rounded-md border border-slate-300 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] text-slate-800 text-xs transition-all outline-none"
                      />
                    </div>

                    {/* 2-Column Grid Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                      {/* Left: IP 地址列表 */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">IP 地址列表</label>
                        <input
                          type="text"
                          value={connectorForm.ipList}
                          onChange={(e) => setConnectorForm({ ...connectorForm, ipList: e.target.value })}
                          className="w-full h-9 px-3 rounded-md border border-slate-300 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] text-slate-800 text-xs transition-all outline-none font-mono"
                        />
                        <p className="text-[11px] text-slate-400">IPv4 / IPv6 (Comma separated)</p>
                      </div>

                      {/* Right: 互联网访问地址 */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">互联网访问地址</label>
                        <input
                          type="text"
                          value={connectorForm.internetUrl}
                          onChange={(e) => setConnectorForm({ ...connectorForm, internetUrl: e.target.value })}
                          placeholder="example.com, api.example.com"
                          className="w-full h-9 px-3 rounded-md border border-slate-300 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] text-slate-800 text-xs transition-all outline-none"
                        />
                      </div>

                      {/* Left: 产品 SN 号 */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">产品 SN 号</label>
                        <input
                          type="text"
                          value={connectorForm.snNumber}
                          onChange={(e) => setConnectorForm({ ...connectorForm, snNumber: e.target.value })}
                          placeholder=""
                          className="w-full h-9 px-3 rounded-md border border-slate-300 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] text-slate-800 text-xs transition-all outline-none font-mono"
                        />
                      </div>

                      {/* Right: 专线访问地址 */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">专线访问地址</label>
                        <input
                          type="text"
                          value={connectorForm.dedicatedLineUrl}
                          onChange={(e) => setConnectorForm({ ...connectorForm, dedicatedLineUrl: e.target.value })}
                          className="w-full h-9 px-3 rounded-md border border-slate-300 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] text-slate-800 text-xs transition-all outline-none font-mono"
                        />
                      </div>

                      {/* Left: 强制专线 (Toggle Switch) */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <span>强制专线</span>
                          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => setConnectorForm({ ...connectorForm, forceDedicatedLine: !connectorForm.forceDedicatedLine })}
                            className={cn(
                              'w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer focus:outline-none',
                              connectorForm.forceDedicatedLine ? 'bg-[#1677ff]' : 'bg-slate-300'
                            )}
                          >
                            <div
                              className={cn(
                                'bg-white w-4 h-4 rounded-full shadow-md transform transition-transform',
                                connectorForm.forceDedicatedLine ? 'translate-x-5' : 'translate-x-0'
                              )}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Right: 产品版本号 */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">产品版本号</label>
                        <input
                          type="text"
                          value={connectorForm.productVersion}
                          onChange={(e) => setConnectorForm({ ...connectorForm, productVersion: e.target.value })}
                          placeholder=""
                          className="w-full h-9 px-3 rounded-md border border-slate-300 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] text-slate-800 text-xs transition-all outline-none font-mono"
                        />
                      </div>

                      {/* Left: 设备 MAC 地址 */}
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">设备 MAC 地址</label>
                        <input
                          type="text"
                          value={connectorForm.macAddress}
                          onChange={(e) => setConnectorForm({ ...connectorForm, macAddress: e.target.value })}
                          placeholder=""
                          className="w-full h-9 px-3 rounded-md border border-slate-300 focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff] text-slate-800 text-xs transition-all outline-none font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: 扩展信息 */}
                {activeConnectorSubTab === 'extended' && (
                  <div className="space-y-4 py-4 text-xs text-slate-600">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">所属机构统一社会信用代码</label>
                        <input
                          type="text"
                          defaultValue="91131000MA0GJFCJ8N"
                          readOnly
                          className="w-full h-9 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-700 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-slate-700 font-medium">部署环境类型</label>
                        <select className="w-full h-9 px-3 rounded-md border border-slate-300 text-slate-800 text-xs outline-none bg-white">
                          <option>边缘轻量级连接器 (Edge Node)</option>
                          <option>中心汇聚级连接器 (Hub Node)</option>
                          <option>TEE 密态计算连接器 (TEE Sandbox)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: 合规与资质附件 */}
                {activeConnectorSubTab === 'attachments' && (
                  <div className="space-y-4 py-4 text-xs text-slate-600">
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center space-y-2">
                      <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                      <p className="font-medium text-slate-700">点击或拖拽上传网络安全等级保护与合规承诺书</p>
                      <p className="text-[11px] text-slate-400">支持 PDF, JPG, PNG 格式，单个文件不超过 10MB</p>
                    </div>
                  </div>
                )}

                {/* Bottom Actions Bar (Exact match with Image 2) */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (targetProductId) {
                        navigate(-1);
                      } else {
                        navigate('/portal-management');
                      }
                    }}
                    className="px-4 h-8 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSaveAndSubmitConnector}
                    className="px-4 h-8 rounded bg-[#1677ff] hover:bg-[#0958d9] text-white text-xs font-medium transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>正在保存提交...</span>
                      </>
                    ) : (
                      <span>保存并提交</span>
                    )}
                  </button>
                </div>
              </div>

              {/* Floating Customer Service/Assistant Icon */}
              <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => showToast('智能助手已在线，正在为您准备连接器部署向导...')}
                  className="w-10 h-10 rounded-full bg-[#722ed1] hover:bg-[#531dab] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  title="空间技术客服"
                >
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* VIEW: 我的身份 (Existing View) */}
          {activeMenu === 'my-identity' && (
            <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1680px] mx-auto space-y-4">
              {/* Breadcrumb / Title */}
              <div className="text-slate-900 font-bold text-sm md:text-base">
                我的身份
              </div>

              {/* Exact Card matching Identity */}
              <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6 md:p-8 space-y-6">
                {/* 1. Header Profile Box */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4">
                  <div className="flex items-start gap-4">
                    {/* Square Avatar Box */}
                    <div className="w-16 h-16 rounded-xl bg-[#c5c9d1] flex items-center justify-center text-white shrink-0 shadow-2xs">
                      <User className="w-9 h-9 text-slate-50" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-base md:text-lg font-bold text-slate-900">
                          廊坊市数城科技集团有限公司
                        </h2>
                        <span className="text-[11px] font-bold text-[#52c41a] border border-[#b7eb8f] bg-[#f6ffed] px-2 py-0.5 rounded tracking-wide">
                          ORGANIZATION VERIFIED
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        ID: 91131000MA0GJFCJ8N
                      </div>
                      <div className="text-[11px] text-slate-400">
                        上次更新时间: 2026-07-05
                      </div>
                    </div>
                  </div>

                  {/* Re-auth / Edit button */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/portal-management?tab=institution');
                    }}
                    className="self-start sm:self-auto px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs hover:border-slate-300"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-500" />
                    <span>变更信息 / 重新认证</span>
                  </button>
                </div>

                {/* 2. 法人或其他组织用户基础信息 */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-3.5 bg-[#1459EB] rounded-full inline-block" />
                    <h3 className="text-xs font-bold text-slate-900">法人或其他组织用户基础信息</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-xs">
                    <div>
                      <div className="text-slate-400 mb-1">法人或其他组织名称</div>
                      <div className="font-bold text-slate-800">廊坊市数城科技集团有限公司</div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">法人或其他组织类型</div>
                      <div className="font-bold text-slate-800">企事业单位法人</div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">统一社会信用代码</div>
                      <div className="font-bold text-slate-800 font-mono">91131000MA0GJFCJ8N</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">法定代表人或负责人姓名</div>
                      <div className="font-bold text-slate-800">王大为</div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">经营期限起始</div>
                      <div className="font-bold text-slate-800 font-mono">2021-06-30</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">经营期限截止</div>
                      <div className="font-bold text-slate-800 font-mono">2051-06-29</div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">实名认证方式</div>
                      <div className="font-bold text-slate-800">未填写</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">法定代表人或负责人实名等级</div>
                      <div className="font-bold text-slate-800">未填写</div>
                    </div>

                    <div>
                      <div className="text-slate-400 mb-1">法定代表人或负责人证件号</div>
                      <div className="font-bold text-slate-800 font-mono">131***********0114</div>
                    </div>
                    <div>
                      <div className="text-slate-400 mb-1">法定代表人或负责人实名认证方式</div>
                      <div className="font-bold text-slate-800">未填写</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: 加入主体审核 */}
          {activeMenu === 'join-audit' && (
            <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1680px] mx-auto space-y-4">
              <div className="text-slate-900 font-bold text-sm md:text-base">
                加入主体审核
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">主体审核记录正常</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  当前主体（廊坊市数城科技集团有限公司）已通过空间主节点准入审核，无需重复提交申请。
                </p>
              </div>
            </div>
          )}

          {/* VIEW: 目录管理 */}
          {activeMenu === 'catalogs' && (
            <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1680px] mx-auto space-y-4">
              <div className="text-slate-900 font-bold text-sm md:text-base">
                数据资源目录
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-600">
                已同步空间目录 24 项，支持密态计算与合规合约调用。
              </div>
            </div>
          )}

          {/* VIEW: 数字合约 */}
          {activeMenu === 'contracts' && (
            <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1680px] mx-auto space-y-4">
              <div className="text-slate-900 font-bold text-sm md:text-base">
                数字合约管理
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-600">
                当前运行中数字合约 3 项，已存证至国家可信空间区块链网关。
              </div>
            </div>
          )}

          {/* VIEW: 权限分配 */}
          {activeMenu === 'permissions' && (
            <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1680px] mx-auto space-y-4">
              <div className="text-slate-900 font-bold text-sm md:text-base">
                权限与角色分配
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-6 text-xs text-slate-600">
                当前用户角色：空间管理员（超级权限）
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
