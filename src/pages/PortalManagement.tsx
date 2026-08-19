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
  Phone,
  Briefcase,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Plus,
  X,
  Mail,
  Key,
  Bell,
  Layers,
  FileCheck2,
  UserCheck,
  Building,
  Calendar,
  Check,
  ShieldCheck,
  AlertCircle,
  Sliders,
  LogOut,
  FolderTree,
  Send,
  Sparkles,
  ArrowUpRight,
  Home,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { PageBanner } from '../components/PageBanner';
import { ServicePlatformIdentity } from './ServicePlatformIdentity';
import { DemandAuditManagement } from '../components/demand-management/DemandAuditManagement';
import {
  BusinessConsultation,
  ConsultationStatus,
  getStoredConsultations,
  addConsultation,
  updateConsultationStatus,
  deleteConsultation,
} from '../lib/consultationStore';

export function PortalManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // Active Main Menu / Sub Menu state
  const rawTab = searchParams.get('tab');
  const initialTab = (rawTab === 'consultation') ? 'consultation' : 'institution';
  const [activeMenu, setActiveMenu] = useState<string>(initialTab);

  // Left sidebar collapse states
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
  const [isDataOpenMonthOpen, setIsDataOpenMonthOpen] = useState(false);

  // Opened tabs at the top (bread-crumb like tags)
  const [openedTabs, setOpenedTabs] = useState<Array<{ id: string; title: string }>>([
    { id: 'institution', title: '我的身份' },
    { id: 'consultation', title: '商务咨询管理' },
  ]);

  // Personal Info Form State (Mock according to Image 2)
  const [personalForm, setPersonalForm] = useState({
    username: user?.displayName || 'wangui',
    account: 'wangui',
    email: 'wangui@jingjisugang.cn',
    phone: '17316192331',
    orgName: '智慧足迹数据科技有限公司',
    authStatus: '已认证',
  });
  const [activePersonalSubTab, setActivePersonalSubTab] = useState<'info' | 'password'>('info');

  // Consultation Data State
  const [consultations, setConsultations] = useState<BusinessConsultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [typeFilter, setTypeFilter] = useState<string>('全部');

  // User menu dropdown
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Modals
  const [selectedItem, setSelectedItem] = useState<BusinessConsultation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Editing state for status update
  const [editingStatus, setEditingStatus] = useState<ConsultationStatus>('待处理');
  const [editingAssignee, setEditingAssignee] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // New consultation state
  const [newForm, setNewForm] = useState({
    name: '',
    phone: '',
    orgName: '',
    position: '',
    coopType: '合作伙伴申请',
    description: '',
  });

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = () => {
    const list = getStoredConsultations();
    setConsultations(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (tabParam === 'identity' || tabParam === 'identity-auth' || tabParam === 'auth' || tabParam === 'institution') {
        setActiveMenu('institution');
      } else {
        setActiveMenu(tabParam);
      }
    }
  }, [searchParams]);

  const handleMenuClick = (id: string, title: string) => {
    setActiveMenu(id);
    if (!openedTabs.some((t) => t.id === id)) {
      setOpenedTabs([...openedTabs, { id, title }]);
    }
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = openedTabs.filter((t) => t.id !== id);
    setOpenedTabs(updated);
    if (activeMenu === id) {
      if (updated.length > 0) {
        setActiveMenu(updated[updated.length - 1].id);
      } else {
        setActiveMenu('institution');
      }
    }
  };

  // Filtered consultations
  const filteredConsultations = useMemo(() => {
    return consultations.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === '全部' || item.status === statusFilter;
      const matchType = typeFilter === '全部' || item.coopType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [consultations, searchTerm, statusFilter, typeFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = consultations.length;
    const pending = consultations.filter((c) => c.status === '待处理').length;
    const inProgress = consultations.filter((c) => c.status === '跟进中').length;
    const completed = consultations.filter((c) => c.status === '已完成').length;
    const ignored = consultations.filter((c) => c.status === '已忽略').length;
    return { total, pending, inProgress, completed, ignored };
  }, [consultations]);

  // Actions
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

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.name || !newForm.phone || !newForm.orgName || !newForm.position || !newForm.description) {
      showToast('请填写所有必填字段');
      return;
    }
    addConsultation(newForm);
    loadData();
    setIsAddModalOpen(false);
    setNewForm({
      name: '',
      phone: '',
      orgName: '',
      position: '',
      coopType: '合作伙伴申请',
      description: '',
    });
    showToast('录入商务咨询信息成功！');
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
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Main Portal Banner Header (Dark Tech Style aligned with platform) */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-sky-900 text-white h-14 px-6 flex items-center justify-between shadow-md border-b border-blue-800/40 shrink-0">
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
          title="点击返回数据空间首页"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center font-bold text-blue-300 shadow-xs group-hover:bg-blue-500/30 transition-all">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <span className="font-extrabold text-base tracking-tight text-white drop-shadow-xs group-hover:text-blue-200 transition-colors">
            门户管理
          </span>
        </div>

        <div ref={userMenuRef} className="relative flex items-center gap-3 text-xs">
          {/* 数据空间首页 Link */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition-all cursor-pointer font-medium"
            title="返回数据空间首页"
          >
            <Home className="w-3.5 h-3.5 text-blue-400" />
            <span>数据空间首页</span>
          </button>

          <span className="text-slate-600">|</span>

          {/* User Profile Chip */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 text-slate-200 px-3 py-1.5 rounded-xl border border-blue-500/30 transition-all cursor-pointer group focus:outline-none"
            title="用户操作菜单"
          >
            <User className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-blue-200">{personalForm.username || 'demo1'}</span>
            <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
          </button>

          {/* User Dropdown */}
          {isUserMenuOpen && (
            <div className="absolute right-0 top-10 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/service-platform');
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                <span>进入服务平台</span>
              </button>

              <div className="border-t border-slate-100 my-1" />

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/auth/login');
                }}
                className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>退出登录</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Portal Main Body Layout (Sidebar + Content) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-xs select-none">
          <div className="p-3 space-y-4 overflow-y-auto flex-1 text-xs">
            {/* Group 1: 身份与账户 */}
            <div className="space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                身份与账户
              </div>
              <button
                onClick={() => handleMenuClick('institution', '我的身份')}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-between cursor-pointer',
                  activeMenu === 'institution'
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>我的身份</span>
                </div>
              </button>
            </div>

            {/* Group 2: 运营协同 */}
            <div className="space-y-1 pt-1 border-t border-slate-100">
              <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                运营协同
              </div>
              <button
                onClick={() => handleMenuClick('consultation', '商务咨询管理')}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-xl font-semibold transition-all flex items-center justify-between cursor-pointer',
                  activeMenu === 'consultation'
                    ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  <span>商务咨询管理</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
          {/* Top Opened Tabs Breadcrumb Strip */}
          <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto shrink-0 select-none shadow-2xs">
            {openedTabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveMenu(tab.id)}
                className={cn(
                  'group flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap border',
                  activeMenu === tab.id
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                )}
              >
                <span>{tab.title}</span>
                {openedTabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="p-0.5 rounded-full hover:bg-slate-300/60 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Main Display Container */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* TAB: 发布需求审核 (Demand Audit Management) */}
            {activeMenu === 'demand-audit' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                      需求合规审查
                    </span>
                    <h2 className="text-base font-bold text-slate-900">发布需求审核与合规监管</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/demands')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                    >
                      前往公开需求大厅 🔍
                    </button>
                  </div>
                </div>
                <DemandAuditManagement showToast={showToast} />
              </div>
            )}
            {/* TAB 1: 个人信息 (Exact replica of Image 2) */}
            {activeMenu === 'personal' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 max-w-4xl space-y-6">
                {/* User Header Profile */}
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center text-slate-400 border border-slate-300">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-slate-900">{personalForm.username}</h2>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded">
                        已认证
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      账号: <span className="font-mono">{personalForm.account}</span> &nbsp;|&nbsp; 所属机构:{' '}
                      <span className="text-blue-700 font-medium">{personalForm.orgName}</span>
                    </p>
                  </div>
                </div>

                {/* Sub Tab: 用户管理 vs 修改密码 */}
                <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold">
                  <button
                    onClick={() => setActivePersonalSubTab('info')}
                    className={cn(
                      'pb-2 transition-all cursor-pointer',
                      activePersonalSubTab === 'info'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    用户管理
                  </button>
                  <button
                    onClick={() => setActivePersonalSubTab('password')}
                    className={cn(
                      'pb-2 transition-all cursor-pointer',
                      activePersonalSubTab === 'password'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-slate-500 hover:text-slate-800'
                    )}
                  >
                    修改密码
                  </button>
                </div>

                {activePersonalSubTab === 'info' ? (
                  <div className="space-y-4 max-w-lg pt-2">
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">账号：</label>
                      <input
                        type="text"
                        disabled
                        value={personalForm.account}
                        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">用户姓名：</label>
                      <input
                        type="text"
                        disabled
                        value={personalForm.username}
                        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">
                        <span className="text-rose-500 mr-1">*</span>邮箱地址：
                      </label>
                      <input
                        type="text"
                        value={personalForm.email}
                        onChange={(e) => setPersonalForm({ ...personalForm, email: e.target.value })}
                        placeholder="请输入邮箱地址"
                        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">手机号码：</label>
                      <input
                        type="text"
                        disabled
                        value={personalForm.phone}
                        className="flex-1 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-600 font-mono"
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">机构认证状态：</label>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-md">
                        已认证
                      </span>
                    </div>

                    <div className="pt-4 pl-28 flex items-center gap-3">
                      <button
                        onClick={() => showToast('个人信息修改已更新！')}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => showToast('已提交账号注销申请，专员将在 1 个工作日内处理')}
                        className="px-5 py-2.5 bg-slate-400 hover:bg-slate-500 text-white rounded-xl text-xs font-bold transition-all"
                      >
                        申请注销
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 max-w-lg pt-2">
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">原密码：</label>
                      <input
                        type="password"
                        placeholder="请输入当前密码"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">新密码：</label>
                      <input
                        type="password"
                        placeholder="请输入新密码（8-16位）"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="w-24 text-right text-xs text-slate-500 shrink-0">确认新密码：</label>
                      <input
                        type="password"
                        placeholder="再次输入新密码"
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div className="pt-4 pl-28">
                      <button
                        onClick={() => showToast('密码修改成功！')}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
                      >
                        保存修改
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: 我的身份 */}
            {activeMenu === 'institution' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 md:p-6">
                <ServicePlatformIdentity />
              </div>
            )}

            {/* TAB 3: 商务咨询管理 */}
            {activeMenu === 'consultation' && (
              <div className="space-y-6">
                {/* Filter and Action Bar */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="搜索姓名、电话、机构名称、职位或需求描述..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* Filter and Export Bar */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
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
                              'px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5',
                              statusFilter === st.val
                                ? 'bg-white text-blue-700 font-bold shadow-2xs'
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
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
                      >
                        <option value="全部">全部合作类型</option>
                        <option value="合作伙伴申请">合作伙伴申请</option>
                        <option value="合作咨询">合作咨询</option>
                      </select>

                      <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs border border-slate-200 transition-all cursor-pointer shadow-2xs"
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
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                    title="设置详细状态、负责人及跟进日志"
                                  >
                                    <Edit3 className="w-3 h-3 text-blue-600" />
                                    <span>跟进</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedItem(item);
                                      setIsDetailModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-200 text-[11px] transition-all cursor-pointer flex items-center gap-1"
                                    title="查看全量登记内容"
                                  >
                                    <Eye className="w-3 h-3 text-slate-500" />
                                    <span>详情</span>
                                  </button>
                                  <button
                                    onClick={() => setDeleteTargetId(item.id)}
                                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-all cursor-pointer"
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
        </div>
      </div>

      {/* Detail Modal */}
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

      {/* Edit Status Modal */}
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
                        editingStatus === st ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200'
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
              <button onClick={handleSaveStatus} className="px-5 py-2 bg-blue-600 text-white rounded text-xs font-bold">
                确定更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
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
    </div>
  );
}
