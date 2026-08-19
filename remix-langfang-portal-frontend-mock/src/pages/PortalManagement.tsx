import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Building2,
  MessageSquare,
  Search,
  Download,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  User,
  ChevronDown,
  RefreshCw,
  X,
  ShieldCheck,
  LogOut,
  ArrowUpRight,
  Home,
  Layers,
  Send,
  CheckSquare,
  PackageSearch,
  ClipboardList,
  WalletCards,
  ReceiptText,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { ServicePlatformIdentity } from './ServicePlatformIdentity';
import { PublishDemandView } from '../components/demand-management/PublishDemandView';
import { RespondDemandView } from '../components/demand-management/RespondDemandView';
import { TradingAdminView, type TradingAdminViewId } from '../components/trading-management/TradingAdminView';
import { clearTradingStorage } from '../data/tradingDemandData';
import {
  BusinessConsultation,
  ConsultationStatus,
  getStoredConsultations,
  updateConsultationStatus,
  deleteConsultation,
} from '../lib/consultationStore';

export function PortalManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { logout, displayName } = useAuth();

  // Top level navigation state: 'platform' (平台管理) or 'trading' (数据交易中心)
  const initialNav = searchParams.get('nav') === 'trading' ? 'trading' : 'platform';
  const [activeTopNav, setActiveTopNav] = useState<'platform' | 'trading'>(initialNav);

  // Active Main Menu / Sub Menu state inside 平台管理 ('institution' | 'consultation')
  const rawTab = searchParams.get('tab');
  const initialPlatformTab = rawTab === 'consultation' ? 'consultation' : 'institution';
  const [activePlatformMenu, setActivePlatformMenu] = useState<string>(initialPlatformTab);

  // Active Main Menu / Sub Menu state inside 数据交易中心 ('publish_demand' | 'respond_demand' | 'dev_project' | 'dev_task' | 'vis_dev')
  const tradingAdminTabs: TradingAdminViewId[] = ['commodity_management', 'trade_order', 'fund_management', 'billing_management'];
  const initialTradingTab = rawTab === 'respond_demand' || tradingAdminTabs.includes(rawTab as TradingAdminViewId) ? rawTab! : 'publish_demand';
  const [activeTradingMenu, setActiveTradingMenu] = useState<string>(initialTradingTab);

  // Left sidebar collapse states
  const [isPlatformGroupOpen, setIsPlatformGroupOpen] = useState(true);
  const [isDemandGroupOpen, setIsDemandGroupOpen] = useState(true);

  // Opened tabs at the top (multi-tab system for 平台管理)
  const [platformOpenedTabs, setPlatformOpenedTabs] = useState<Array<{ id: string; title: string }>>([
    { id: 'institution', title: '身份认证' },
    { id: 'consultation', title: '商务咨询管理' },
  ]);

  // Opened tabs at the top (multi-tab system for 数据交易中心)
  const [tradingOpenedTabs, setTradingOpenedTabs] = useState<Array<{ id: string; title: string }>>([
    { id: 'publish_demand', title: '发布需求' },
    { id: 'respond_demand', title: '认领需求' },
  ]);

  // Consultation Data State (for 平台管理 -> 商务咨询管理)
  const [consultations, setConsultations] = useState<BusinessConsultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [typeFilter, setTypeFilter] = useState<string>('全部');

  // User menu dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
    setConsultations(getStoredConsultations());
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (rawTab === 'consultation') {
      setActiveTopNav('platform');
      setActivePlatformMenu('consultation');
    } else if (rawTab === 'institution') {
      setActiveTopNav('platform');
      setActivePlatformMenu('institution');
    } else if (rawTab === 'publish_demand') {
      setActiveTopNav('trading');
      setActiveTradingMenu('publish_demand');
    } else if (rawTab === 'respond_demand') {
      setActiveTopNav('trading');
      setActiveTradingMenu('respond_demand');
    } else if (tradingAdminTabs.includes(rawTab as TradingAdminViewId)) {
      setActiveTopNav('trading');
      setActiveTradingMenu(rawTab!);
    }
  }, [rawTab]);

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

  // Modals for Consultation
  const [selectedItem, setSelectedItem] = useState<BusinessConsultation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Editing state for status update
  const [editingStatus, setEditingStatus] = useState<ConsultationStatus>('待处理');
  const [editingAssignee, setEditingAssignee] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // Tab Handlers for 平台管理
  const handleClearAllCache = () => {
    try {
      clearTradingStorage();
      localStorage.removeItem('jingji_business_consultations_v1');
      setConsultations(getStoredConsultations());
      setIsUserMenuOpen(false);
      showToast('缓存与模拟数据已重置为初始状态');
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (e) {
      console.error(e);
      showToast('缓存清理完成');
    }
  };

  const handlePlatformMenuClick = (menuId: string, title: string) => {
    setActivePlatformMenu(menuId);
    if (!platformOpenedTabs.some((t) => t.id === menuId)) {
      setPlatformOpenedTabs((prev) => [...prev, { id: menuId, title }]);
    }
  };

  const handleClosePlatformTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (platformOpenedTabs.length <= 1) return;
    const remaining = platformOpenedTabs.filter((t) => t.id !== tabId);
    setPlatformOpenedTabs(remaining);
    if (activePlatformMenu === tabId) {
      setActivePlatformMenu(remaining[remaining.length - 1].id);
    }
  };

  // Tab Handlers for 数据交易中心
  const handleTradingMenuClick = (menuId: string, title: string) => {
    setActiveTradingMenu(menuId);
    if (!tradingOpenedTabs.some((t) => t.id === menuId)) {
      setTradingOpenedTabs((prev) => [...prev, { id: menuId, title }]);
    }
  };

  const handleCloseTradingTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tradingOpenedTabs.length <= 1) return;
    const remaining = tradingOpenedTabs.filter((t) => t.id !== tabId);
    setTradingOpenedTabs(remaining);
    if (activeTradingMenu === tabId) {
      setActiveTradingMenu(remaining[remaining.length - 1].id);
    }
  };

  // Filtered consultations
  const filteredConsultations = useMemo(() => {
    return consultations.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.includes(searchTerm) ||
        item.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '全部' || item.status === statusFilter;
      const matchesType = typeFilter === '全部' || item.coopType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [consultations, searchTerm, statusFilter, typeFilter]);

  // Statistics for Consultation
  const stats = useMemo(() => {
    const total = consultations.length;
    const pending = consultations.filter((c) => c.status === '待处理').length;
    const inProgress = consultations.filter((c) => c.status === '跟进中').length;
    const completed = consultations.filter((c) => c.status === '已完成').length;
    const ignored = consultations.filter((c) => c.status === '已忽略').length;
    return { total, pending, inProgress, completed, ignored };
  }, [consultations]);

  // Actions for Consultation
  const handleOpenStatusModal = (item: BusinessConsultation) => {
    setSelectedItem(item);
    setEditingStatus(item.status);
    setEditingAssignee(item.assignee || '');
    setEditingNotes(item.notes || '');
    setIsStatusModalOpen(true);
  };

  const handleSaveStatus = () => {
    if (!selectedItem) return;
    const updated = updateConsultationStatus(
      selectedItem.id,
      editingStatus,
      editingNotes,
      editingAssignee
    );
    setConsultations(updated);
    setIsStatusModalOpen(false);
    showToast(`已更新编号 [${selectedItem.id}] 的跟进状态`);
    if (isDetailModalOpen && selectedItem.id === selectedItem.id) {
      const refreshed = updated.find((x) => x.id === selectedItem.id);
      if (refreshed) setSelectedItem(refreshed);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const updated = deleteConsultation(deleteTargetId);
    setConsultations(updated);
    setDeleteTargetId(null);
    if (selectedItem?.id === deleteTargetId) {
      setIsDetailModalOpen(false);
    }
    showToast('删除记录成功');
  };

  const handleExportCSV = () => {
    if (consultations.length === 0) {
      showToast('暂无咨询数据可供导出');
      return;
    }
    const headers = ['咨询编号', '姓名', '联系电话', '机构名称', '职位', '合作类型', '提交时间', '状态', '跟进人', '跟进备注', '合作需求描述'];
    const rows = filteredConsultations.map((c) => [
      c.id,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.orgName}"`,
      `"${c.position}"`,
      `"${c.coopType}"`,
      `"${c.createdAt}"`,
      `"${c.status}"`,
      `"${c.assignee || ''}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `商务咨询管理数据_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('导出 CSV 表格文件成功');
  };

  const renderStatusBadge = (item: BusinessConsultation) => {
    let badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100/80';
    let icon = <Clock className="w-3.5 h-3.5 text-amber-600" />;
    
    if (item.status === '跟进中') {
      badgeStyle = 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100/80';
      icon = <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" style={{ animationDuration: '6s' }} />;
    } else if (item.status === '已完成') {
      badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/80';
      icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
    } else if (item.status === '已忽略') {
      badgeStyle = 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200/80';
      icon = <XCircle className="w-3.5 h-3.5 text-slate-400" />;
    }

    return (
      <div className="relative inline-flex items-center group">
        <span className="absolute left-2.5 z-10 pointer-events-none flex items-center">
          {icon}
        </span>
        <select
          value={item.status}
          onChange={(e) => {
            const newStatus = e.target.value as ConsultationStatus;
            const updated = updateConsultationStatus(item.id, newStatus);
            setConsultations(updated);
            showToast(`已成功将编号 [${item.id}] 的状态设为「${newStatus}」`);
          }}
          className={cn(
            'inline-flex items-center pl-7 pr-6 py-1 text-xs font-bold rounded-full border appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 shadow-2xs',
            badgeStyle
          )}
          title="点击即可直接切换和设置状态"
        >
          <option value="待处理" className="bg-white text-amber-800 font-bold py-1">⏱ 待处理</option>
          <option value="跟进中" className="bg-white text-blue-800 font-bold py-1">🔄 跟进中</option>
          <option value="已完成" className="bg-white text-emerald-800 font-bold py-1">✓ 已完成</option>
          <option value="已忽略" className="bg-white text-slate-600 font-bold py-1">✕ 已忽略</option>
        </select>
        <ChevronDown className="w-3 h-3 absolute right-2 z-10 pointer-events-none text-slate-500 group-hover:text-slate-800 transition-colors" />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar: Vivid Blue Style */}
      <header className="bg-[#1890FF] text-white h-14 px-4 sm:px-6 flex items-center justify-between shadow-md shrink-0 select-none z-30">
        {/* Left: Brand Logo & Primary Nav Tabs */}
        <div className="flex items-center gap-6 sm:gap-10">
          <div
            onClick={() => navigate('/')}
            className="flex items-center cursor-pointer group"
            title="点击返回数据空间首页"
          >
            <span className="font-bold text-[16px] tracking-tight text-white drop-shadow-xs">
              廊坊城市可信数据空间
            </span>
          </div>

          {/* 一级导航栏: 平台管理 / 数据交易中心 */}
          <nav className="flex items-center h-14">
            <button
              type="button"
              onClick={() => setActiveTopNav('platform')}
              className={cn(
                'relative h-14 px-4 sm:px-6 text-[14px] font-semibold transition-all cursor-pointer flex items-center justify-center',
                activeTopNav === 'platform'
                  ? 'text-white font-bold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              <span>平台管理</span>
              {activeTopNav === 'platform' && (
                <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-white rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTopNav('trading')}
              className={cn(
                'relative h-14 px-4 sm:px-6 text-[14px] font-semibold transition-all cursor-pointer flex items-center justify-center',
                activeTopNav === 'trading'
                  ? 'text-white font-bold'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              )}
            >
              <span>数据交易中心</span>
              {activeTopNav === 'trading' && (
                <span className="absolute bottom-0 left-4 right-4 h-[3px] bg-white rounded-full" />
              )}
            </button>
          </nav>
        </div>

        {/* Right: Actions, Portal Link & User Info */}
        <div ref={userMenuRef} className="relative flex items-center gap-3 sm:gap-4 text-xs">
          {/* 空间门户 Link */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-white/90 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/10 transition-all cursor-pointer font-medium"
            title="返回数据空间门户首页"
          >
            <Home className="w-3.5 h-3.5" />
            <span>空间门户</span>
          </button>

          <span className="text-white/40">|</span>

          {/* User Profile Chip */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 text-white hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer group focus:outline-none"
            title="用户操作菜单"
          >
            <div className="w-6 h-6 rounded-full bg-white text-[#1890FF] flex items-center justify-center font-bold text-xs shadow-xs">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-white">{displayName || 'wangui'}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-white/80 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-800 truncate">{displayName || 'wangui'}</p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">173****2231</p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/service-platform');
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 cursor-pointer font-medium"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                <span>进入服务平台</span>
              </button>

              <button
                type="button"
                onClick={handleClearAllCache}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2 cursor-pointer font-medium"
                title="清空所有测试记录并恢复初始数据"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600" />
                <span>清除本地缓存</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                  navigate('/auth/login');
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

      {/* Main Body */}
      {activeTopNav === 'platform' ? (
        /* ================= 平台管理 视图 ================= */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-56 bg-white border-r border-[#E8EEF5] flex flex-col shrink-0 shadow-xs select-none">
            <div className="p-2.5 space-y-1 overflow-y-auto flex-1 text-xs">
              {/* Group Title */}
              <div
                onClick={() => setIsPlatformGroupOpen(!isPlatformGroupOpen)}
                className="flex items-center justify-between px-3 py-2.5 text-slate-800 font-bold hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1890FF]" />
                  <span className="text-[13px]">平台管理</span>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", !isPlatformGroupOpen && "-rotate-90")} />
              </div>

              {/* Submenu items */}
              {isPlatformGroupOpen && (
                <div className="pl-2 space-y-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handlePlatformMenuClick('institution', '身份认证')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer text-xs',
                      activePlatformMenu === 'institution'
                        ? 'bg-[#E6F7FF] text-[#1890FF] font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>身份认证</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlatformMenuClick('consultation', '商务咨询管理')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer text-xs',
                      activePlatformMenu === 'consultation'
                        ? 'bg-[#E6F7FF] text-[#1890FF] font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>商务咨询管理</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </aside>

          {/* Right Content Container */}
          <main className="flex-1 flex flex-col bg-[#F0F2F5] overflow-hidden">
            {/* Top Multi-tab Breadcrumb Strip */}
            <div className="bg-white border-b border-[#E8EEF5] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none shadow-2xs">
              {platformOpenedTabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActivePlatformMenu(tab.id)}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-1 rounded text-xs transition-all cursor-pointer whitespace-nowrap border',
                    activePlatformMenu === tab.id
                      ? 'bg-white border-[#91D5FF] text-[#1890FF] font-bold shadow-2xs'
                      : 'bg-[#FAFAFA] border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {activePlatformMenu === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-[#1890FF]" />}
                  <span>{tab.title}</span>
                  {platformOpenedTabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleClosePlatformTab(tab.id, e)}
                      className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                      title="关闭标签"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Display Content Area */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
              {/* TAB 1: 身份认证 */}
              {activePlatformMenu === 'institution' && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-6 min-h-[560px]">
                  <ServicePlatformIdentity />
                </div>
              )}

              {/* TAB 2: 商务咨询管理 */}
              {activePlatformMenu === 'consultation' && (
                <div className="space-y-4">
                  {/* Filter and Action Bar */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Search */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="搜索姓名、电话、机构名称、职位或需求描述..."
                          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#1890FF] focus:ring-2 focus:ring-[#1890FF]/20"
                        />
                      </div>

                      {/* Filter and Export Bar */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                          {[
                            { label: '全部', val: '全部', count: stats.total },
                            { label: '待处理', val: '待处理', count: stats.pending, color: 'text-amber-700' },
                            { label: '跟进中', val: '跟进中', count: stats.inProgress, color: 'text-blue-700' },
                            { label: '已完成', val: '已完成', count: stats.completed, color: 'text-emerald-700' },
                            { label: '已忽略', val: '已忽略', count: stats.ignored, color: 'text-slate-500' },
                          ].map((st) => (
                            <button
                              key={st.val}
                              onClick={() => setStatusFilter(st.val)}
                              className={cn(
                                'px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1.5',
                                statusFilter === st.val
                                  ? 'bg-white text-[#1890FF] font-bold shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              )}
                            >
                              <span>{st.label}</span>
                              <span className={cn('text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-slate-200/80', st.color)}>
                                {st.count}
                              </span>
                            </button>
                          ))}
                        </div>

                        <select
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1890FF]"
                        >
                          <option value="全部">全部合作类型</option>
                          <option value="合作伙伴申请">合作伙伴申请</option>
                          <option value="合作咨询">合作咨询</option>
                        </select>

                        <button
                          onClick={handleExportCSV}
                          className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-lg text-xs border border-slate-200 transition-all cursor-pointer shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>导出表格</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase">
                            <th className="py-3 px-4">咨询编号</th>
                            <th className="py-3 px-4">姓名 / 电话</th>
                            <th className="py-3 px-4">机构名称与职位</th>
                            <th className="py-3 px-4">合作类型</th>
                            <th className="py-3 px-4">需求描述</th>
                            <th className="py-3 px-4">提交时间</th>
                            <th className="py-3 px-4">状态（直接设置）</th>
                            <th className="py-3 px-4 text-center">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {filteredConsultations.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-10 text-center text-slate-400">
                                暂无符合条件的商务咨询记录
                              </td>
                            </tr>
                          ) : (
                            filteredConsultations.map((item) => (
                              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-mono font-bold text-slate-900">{item.id}</td>
                                <td className="py-3 px-4">
                                  <p className="font-bold text-slate-900">{item.name}</p>
                                  <p className="text-[11px] font-mono text-slate-500">{item.phone}</p>
                                </td>
                                <td className="py-3 px-4 max-w-[160px]">
                                  <p className="font-semibold text-slate-800 truncate">{item.orgName}</p>
                                  <p className="text-[11px] text-slate-500 truncate">{item.position}</p>
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  <span className={cn(
                                    'px-2 py-0.5 rounded text-[11px] font-semibold border',
                                    item.coopType === '合作伙伴申请'
                                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                                      : 'bg-purple-50 text-purple-800 border-purple-200'
                                  )}>
                                    {item.coopType}
                                  </span>
                                </td>
                                <td className="py-3 px-4 max-w-[200px]">
                                  <p className="text-slate-600 line-clamp-2" title={item.description}>
                                    {item.description}
                                  </p>
                                </td>
                                <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                                  {item.createdAt}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap">
                                  {renderStatusBadge(item)}
                                </td>
                                <td className="py-3 px-4 whitespace-nowrap text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleOpenStatusModal(item)}
                                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#1890FF] font-bold rounded border border-blue-200 text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                      title="设置详细状态、负责人及跟进日志"
                                    >
                                      <Edit3 className="w-3 h-3 text-[#1890FF]" />
                                      <span>跟进</span>
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedItem(item);
                                        setIsDetailModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded border border-slate-200 text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                      title="查看全量登记内容"
                                    >
                                      <Eye className="w-3 h-3 text-slate-500" />
                                      <span>详情</span>
                                    </button>
                                    <button
                                      onClick={() => setDeleteTargetId(item.id)}
                                      className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition-all cursor-pointer"
                                      title="删除此记录"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      ) : (
        /* ================= 数据交易中心 视图 (严格对照截图 1 & 2) ================= */
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar (数据交易中心侧边栏，菜单项包含 需求管理/业务需求管理 -> 发布需求, 响应需求 及 开发项目管理等) */}
          <aside className="w-56 bg-white border-r border-[#E8EEF5] flex flex-col shrink-0 shadow-xs select-none">
            <div className="p-2.5 space-y-1 overflow-y-auto flex-1 text-xs">
              {/* 需求管理 分组 */}
              <div
                onClick={() => setIsDemandGroupOpen(!isDemandGroupOpen)}
                className="flex items-center justify-between px-3 py-2.5 text-slate-800 font-bold hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#1890FF]" />
                  <span className="text-[13px]">需求管理</span>
                </div>
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", !isDemandGroupOpen && "-rotate-90")} />
              </div>

              {/* 二级菜单: 发布需求 & 响应需求 */}
              {isDemandGroupOpen && (
                <div className="pl-2 space-y-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleTradingMenuClick('publish_demand', '发布需求')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer text-xs',
                      activeTradingMenu === 'publish_demand'
                        ? 'bg-[#E6F7FF] text-[#1890FF] font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Send className="w-3.5 h-3.5" />
                      <span>发布需求</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTradingMenuClick('respond_demand', '认领需求')}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-lg font-medium transition-all flex items-center justify-between cursor-pointer text-xs',
                      activeTradingMenu === 'respond_demand'
                        ? 'bg-[#E6F7FF] text-[#1890FF] font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>认领需求</span>
                    </div>
                  </button>
                </div>
              )}

              <div className="my-2 border-t border-slate-100" />
              <div className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase text-slate-400">交易运营</div>
              {[
                { id: 'commodity_management', title: '商品管理', icon: PackageSearch },
                { id: 'trade_order', title: '交易订单', icon: ClipboardList },
                { id: 'fund_management', title: '资金管理', icon: WalletCards },
                { id: 'billing_management', title: '计费管理', icon: ReceiptText },
              ].map(({ id, title, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleTradingMenuClick(id, title)}
                  className={cn(
                    'w-full rounded-lg px-3 py-2 text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer',
                    activeTradingMenu === id
                      ? 'bg-[#E6F7FF] text-[#1890FF] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{title}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Right Content Container */}
          <main className="flex-1 flex flex-col bg-[#F0F2F5] overflow-hidden">
            {/* Top Multi-tab Breadcrumb Strip */}
            <div className="bg-white border-b border-[#E8EEF5] px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none shadow-2xs">
              {tradingOpenedTabs.map((tab) => (
                <div
                  key={tab.id}
                  onClick={() => setActiveTradingMenu(tab.id)}
                  className={cn(
                    'group flex items-center gap-2 px-3 py-1 rounded text-xs transition-all cursor-pointer whitespace-nowrap border',
                    activeTradingMenu === tab.id
                      ? 'bg-white border-[#91D5FF] text-[#1890FF] font-bold shadow-2xs'
                      : 'bg-[#FAFAFA] border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  {activeTradingMenu === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-[#1890FF]" />}
                  <span>{tab.title}</span>
                  {tradingOpenedTabs.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleCloseTradingTab(tab.id, e)}
                      className="p-0.5 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
                      title="关闭标签"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Display Content Area */}
            <div className="flex-1 p-4 sm:p-5 overflow-y-auto">
              {/* 二级菜单 1: 发布需求 (截图 1) */}
              {activeTradingMenu === 'publish_demand' && (
                <PublishDemandView onShowToast={showToast} />
              )}

              {/* 二级菜单 2: 认领需求 */}
              {activeTradingMenu === 'respond_demand' && (
                <RespondDemandView onShowToast={showToast} />
              )}

              {tradingAdminTabs.includes(activeTradingMenu as TradingAdminViewId) && (
                <TradingAdminView
                  view={activeTradingMenu as TradingAdminViewId}
                  onShowToast={showToast}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Detail Modal for Consultation */}
      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">咨询详情 [{selectedItem.id}]</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="grid grid-cols-2 gap-4">
                <div>姓名：<strong>{selectedItem.name}</strong></div>
                <div>电话：<strong className="font-mono">{selectedItem.phone}</strong></div>
                <div>机构：<strong>{selectedItem.orgName}</strong></div>
                <div>职位：<strong>{selectedItem.position}</strong></div>
              </div>
              <div>合作类型：<strong>{selectedItem.coopType}</strong></div>
              <div>提交时间：<span className="font-mono">{selectedItem.createdAt}</span></div>
              <div>
                <span className="text-slate-500 font-bold block mb-1">合作需求描述：</span>
                <div className="p-3 bg-slate-50 rounded border border-slate-200 whitespace-pre-wrap">
                  {selectedItem.description}
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded text-xs font-bold"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal for Consultation */}
      {isStatusModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">处理更新商务咨询</h3>
              <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">跟进状态</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['待处理', '跟进中', '已完成', '已忽略'] as ConsultationStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingStatus(st)}
                      className={cn(
                        'p-2 rounded border font-bold text-left cursor-pointer',
                        editingStatus === st ? 'bg-blue-50 border-[#1890FF] text-[#1890FF]' : 'bg-white border-slate-200'
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">跟进负责人</label>
                <input
                  type="text"
                  value={editingAssignee}
                  onChange={(e) => setEditingAssignee(e.target.value)}
                  placeholder="如：王生态顾问"
                  className="w-full px-3 py-2 bg-slate-50 border rounded"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-1">跟进备注</label>
                <textarea
                  rows={3}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="录入沟通日志..."
                  className="w-full px-3 py-2 bg-slate-50 border rounded resize-none"
                />
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
              <button onClick={() => setIsStatusModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded text-xs font-bold">
                取消
              </button>
              <button onClick={handleSaveStatus} className="px-5 py-2 bg-[#1890FF] text-white rounded text-xs font-bold">
                确定更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog for Consultation */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">确认删除</h3>
            <p className="text-xs text-slate-600">删除后将无法恢复该条商务咨询记录，确认继续删除？</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 border rounded text-xs font-bold text-slate-600"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 text-white rounded text-xs font-bold"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-2 bg-white text-slate-800 rounded-lg shadow-lg border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-[#52c41a] text-white flex items-center justify-center shrink-0">
            <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-normal text-slate-800 tracking-wide">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
