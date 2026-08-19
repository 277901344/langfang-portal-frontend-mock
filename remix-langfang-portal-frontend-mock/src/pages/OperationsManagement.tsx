import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  MessageSquare,
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Briefcase,
  Calendar,
  FileText,
  ChevronRight,
  RefreshCw,
  UserCheck,
  Tag,
  MessageCircle,
  ShieldCheck,
  Send,
  X,
  Sliders,
  Users2,
  Check,
  Layers,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { PageBanner } from '../components/PageBanner';
import {
  BusinessConsultation,
  ConsultationStatus,
  getStoredConsultations,
  addConsultation,
  updateConsultationStatus,
  deleteConsultation,
} from '../lib/consultationStore';

export function OperationsManagement() {
  // Sub-menu state
  const [activeTab, setActiveTab] = useState<'consultations' | 'partners' | 'demands'>('consultations');

  // Consultation Data State
  const [consultations, setConsultations] = useState<BusinessConsultation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('全部');
  const [typeFilter, setTypeFilter] = useState<string>('全部');

  // Selection & Modal States
  const [selectedItem, setSelectedItem] = useState<BusinessConsultation | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Editing state for status update modal
  const [editingStatus, setEditingStatus] = useState<ConsultationStatus>('待处理');
  const [editingAssignee, setEditingAssignee] = useState('');
  const [editingNotes, setEditingNotes] = useState('');

  // Add new consultation state
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
    showToast('删除成功');
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

  // Helper for Status Badge styling
  const renderStatusBadge = (status: ConsultationStatus) => {
    switch (status) {
      case '待处理':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>待处理</span>
          </span>
        );
      case '跟进中':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded-full">
            <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>跟进中</span>
          </span>
        );
      case '已完成':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>已完成</span>
          </span>
        );
      case '已忽略':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>已忽略</span>
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 统一 3D 玻璃质感 Banner */}
      <PageBanner
        title="运营管理中心"
        subtitle="统一管理生态合作伙伴入驻资质、商务合作咨询及数据资源需求对接，实现运营可追溯、跨部门高效响应与全流程合规审计。"
        tag="运营管理控制台"
        variant={6}
        stats={[
          { label: '待处理咨询', value: stats.pending, unit: '条' },
          { label: '生态伙伴', value: stats.total, unit: '家' }
        ]}
      >
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F7F9FC] text-[#1F2937] font-medium h-[36px] px-4 rounded-[6px] text-[13px] border border-[#DDE3EC] hover:border-[#1459EB] transition-all cursor-pointer shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#1459EB]" />
            <span>刷新数据</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-[#1459EB] hover:bg-[#0E43B5] text-white font-medium h-[36px] px-4 rounded-[6px] text-[13px] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>录入咨询</span>
          </button>
        </div>
      </PageBanner>

      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 space-y-6">
        {/* Navigation Sub-Menu Tabs */}
        <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('consultations')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'consultations'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>商务咨询管理</span>
            {stats.pending > 0 && (
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-extrabold",
                activeTab === 'consultations' ? "bg-white text-blue-700" : "bg-amber-500 text-white"
              )}>
                {stats.pending} 待处理
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('partners')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'partners'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            )}
          >
            <Users2 className="w-4 h-4" />
            <span>生态伙伴审核</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              8 家在线
            </span>
          </button>

          <button
            onClick={() => setActiveTab('demands')}
            className={cn(
              'px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'demands'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            )}
          >
            <Layers className="w-4 h-4" />
            <span>需求对接审核</span>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              4 项对接
            </span>
          </button>
        </div>

        {/* Tab 1: 商务咨询管理 */}
        {activeTab === 'consultations' && (
          <div className="space-y-6">
            {/* Overview Metric Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-medium">咨询记录总数</span>
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-900">{stats.total}</span>
                  <span className="text-[10px] text-slate-400 font-mono">条全量记录</span>
                </div>
              </div>

              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-amber-700">
                  <span className="text-xs font-bold">待处理</span>
                  <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-amber-900">{stats.pending}</span>
                  <span className="text-[10px] text-amber-700/80 font-bold">需要及时跟进</span>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-blue-700">
                  <span className="text-xs font-bold">跟进中</span>
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-blue-900">{stats.inProgress}</span>
                  <span className="text-[10px] text-blue-700/80 font-bold">方案对接中</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-xs font-bold">已完成合作</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-emerald-900">{stats.completed}</span>
                  <span className="text-[10px] text-emerald-700/80 font-bold">协议已落地</span>
                </div>
              </div>

              <div className="bg-slate-100/80 p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-xs font-medium">已忽略/非相关</span>
                  <XCircle className="w-4 h-4 text-slate-400" />
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-slate-700">{stats.ignored}</span>
                  <span className="text-[10px] text-slate-400">无效/误填</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-lg">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="搜索姓名、电话、机构名称、职位或需求描述..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Pills */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                    {['全部', '待处理', '跟进中', '已完成', '已忽略'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                          statusFilter === st
                            ? 'bg-white text-blue-600 shadow-2xs font-bold'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {/* Type Dropdown */}
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
                  >
                    <option value="全部">全部合作类型</option>
                    <option value="合作伙伴申请">合作伙伴申请</option>
                    <option value="合作咨询">合作咨询</option>
                  </select>

                  {/* Export CSV Button */}
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold px-3.5 py-2 rounded-xl text-xs border border-slate-200 shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>导出 CSV</span>
                  </button>
                </div>
              </div>

              {/* Table Records Count Summary */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>
                  共筛选出 <strong className="text-slate-900 font-bold">{filteredConsultations.length}</strong> 条商务咨询记录
                </span>
                {(searchTerm || statusFilter !== '全部' || typeFilter !== '全部') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('全部');
                      setTypeFilter('全部');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>重置所有筛选条件</span>
                  </button>
                )}
              </div>
            </div>

            {/* Consultations Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 pl-6">咨询编号</th>
                      <th className="py-3.5 px-4">联系人 / 电话</th>
                      <th className="py-3.5 px-4">机构名称与职位</th>
                      <th className="py-3.5 px-4">合作类型</th>
                      <th className="py-3.5 px-4">需求简述</th>
                      <th className="py-3.5 px-4">提交时间</th>
                      <th className="py-3.5 px-4">当前状态</th>
                      <th className="py-3.5 px-4 text-right pr-6">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredConsultations.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-400 space-y-2">
                          <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                          <p className="font-semibold text-slate-500">未找到匹配的商务咨询记录</p>
                          <p className="text-[11px]">可尝试更换搜索关键词或筛选条件</p>
                        </td>
                      </tr>
                    ) : (
                      filteredConsultations.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* 编号 */}
                          <td className="py-4 px-4 pl-6 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.id}
                          </td>

                          {/* 姓名 / 电话 */}
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <p className="font-bold text-slate-900">{item.name}</p>
                              <p className="text-[11px] font-mono text-slate-500">{item.phone}</p>
                            </div>
                          </td>

                          {/* 机构与职位 */}
                          <td className="py-4 px-4 max-w-[180px]">
                            <div className="space-y-0.5">
                              <p className="font-semibold text-slate-800 truncate" title={item.orgName}>
                                {item.orgName}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate" title={item.position}>
                                {item.position}
                              </p>
                            </div>
                          </td>

                          {/* 合作类型 */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className={cn(
                              "px-2.5 py-1 rounded-md text-[11px] font-semibold border",
                              item.coopType === '合作伙伴申请'
                                ? "bg-blue-50 text-blue-800 border-blue-200"
                                : "bg-purple-50 text-purple-800 border-purple-200"
                            )}>
                              {item.coopType}
                            </span>
                          </td>

                          {/* 需求描述 */}
                          <td className="py-4 px-4 max-w-[220px]">
                            <p className="text-slate-600 line-clamp-2 leading-relaxed" title={item.description}>
                              {item.description}
                            </p>
                          </td>

                          {/* 时间 */}
                          <td className="py-4 px-4 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                            {item.createdAt}
                          </td>

                          {/* 状态 */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            {renderStatusBadge(item.status)}
                          </td>

                          {/* 操作 */}
                          <td className="py-4 px-4 text-right pr-6 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 查看详情 */}
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setIsDetailModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                title="查看全量详情"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* 更新跟进状态 */}
                              <button
                                onClick={() => handleOpenStatusModal(item)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                                title="更新跟进状态及备注"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* 删除 */}
                              <button
                                onClick={() => setDeleteTargetId(item.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="删除记录"
                              >
                                <Trash2 className="w-4 h-4" />
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

        {/* Tab 2: 生态伙伴审核 (Placeholder tab) */}
        {activeTab === 'partners' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">城市数据空间合作伙伴管理</h3>
                <p className="text-xs text-slate-500">查看及评估全域 8 家接入节点的机构实名资质与数据权属声明</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                已认证 8 家节点
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: '廊坊市***科技有限公司', type: '核心需求方', node: '廊坊主节点', status: '正常运行' },
                { name: '河北***数据集团有限公司', type: '公共数据要素供给源', node: '省市级专区节点', status: '正常运行' },
                { name: '北京***信息技术有限公司', type: '可信基础设施节点', node: '海淀TEE飞地', status: '正常运行' },
                { name: '天津***数字科技股份有限公司', type: '港口物流数据源', node: '天津港密态节点', status: '正常运行' },
              ].map((p, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-slate-900">{p.name}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">{p.type}</span>
                      <span>· {p.node}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: 需求对接审核 (Placeholder tab) */}
        {activeTab === 'demands' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">数据应用场景与需求审核</h3>
                <p className="text-xs text-slate-500">对伙伴发布的场景需求进行合规审查与数据安全评估</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { id: 'ECO-DEM-01', title: '中小企业信用风险跨域联合建模需求', org: '廊坊市***科技有限公司', status: '对接中' },
                { id: 'ECO-DEM-02', title: '京津冀物流车联网时空轨迹密态计算场景需求', org: '天津***数字科技股份有限公司', status: '可响应' },
              ].map((d, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-600 mr-2">{d.id}</span>
                    <span className="font-bold text-sm text-slate-900">{d.title}</span>
                    <p className="text-xs text-slate-500 mt-1">发布主体：{d.org}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {isDetailModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden space-y-0">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    {selectedItem.id}
                  </span>
                  <span className="text-xs text-slate-400">{selectedItem.createdAt} 提交</span>
                </div>
                <h3 className="text-xl font-bold">商务合作咨询详情</h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Status Header Bar */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs text-slate-500">当前跟进状态</span>
                  <div>{renderStatusBadge(selectedItem.status)}</div>
                </div>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenStatusModal(selectedItem);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>更新状态 / 跟进记录</span>
                </button>
              </div>

              {/* Grid Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">咨询人姓名</span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>{selectedItem.name}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">联系电话</span>
                  <p className="text-sm font-bold font-mono text-slate-900 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>{selectedItem.phone}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">机构名称</span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span>{selectedItem.orgName}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">职务职位</span>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                    <span>{selectedItem.position}</span>
                  </p>
                </div>
              </div>

              {/* 合作类型 */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500">合作类型</span>
                <p className="text-sm font-semibold text-slate-800 bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 inline-block">
                  {selectedItem.coopType}
                </p>
              </div>

              {/* 需求描述 */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500">合作需求描述</span>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedItem.description}
                </div>
              </div>

              {/* 跟进备注与负责人 */}
              {(selectedItem.assignee || selectedItem.notes) && (
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      跟进人与处理记录
                    </span>
                    {selectedItem.assignee && (
                      <span className="text-xs font-semibold text-blue-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                        负责人: {selectedItem.assignee}
                      </span>
                    )}
                  </div>
                  {selectedItem.notes && (
                    <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-blue-100">
                      {selectedItem.notes}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setDeleteTargetId(selectedItem.id)}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除此记录</span>
              </button>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status / Notes Modal */}
      {isStatusModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden space-y-0">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">更新跟进状态及处理意见</h3>
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-xs text-slate-500 pb-2 border-b border-slate-100">
                记录编号：<strong className="text-slate-900 font-mono">{selectedItem.id}</strong> ({selectedItem.name} - {selectedItem.orgName})
              </div>

              {/* Status Radio Choices */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">跟进状态变更</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {(['待处理', '跟进中', '已完成', '已忽略'] as ConsultationStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditingStatus(st)}
                      className={cn(
                        'p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer',
                        editingStatus === st
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      )}
                    >
                      <span>{st}</span>
                      {editingStatus === st && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">跟进负责人</label>
                <input
                  type="text"
                  value={editingAssignee}
                  onChange={(e) => setEditingAssignee(e.target.value)}
                  placeholder="请输入负责人姓名（如：王生态顾问）"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">跟进备注 / 处理意见</label>
                <textarea
                  rows={4}
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="请输入最新的电话沟通结论、对接进展、邮件答复等处理记录..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleSaveStatus}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
              >
                确认更新
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Add Consultation Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden space-y-0">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-lg font-bold">手动录入商务合作咨询</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    <span className="text-red-500 mr-1">*</span>姓名
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.name}
                    onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                    placeholder="请输入姓名"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    <span className="text-red-500 mr-1">*</span>电话
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    placeholder="请输入联系电话"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    <span className="text-red-500 mr-1">*</span>机构名称
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.orgName}
                    onChange={(e) => setNewForm({ ...newForm, orgName: e.target.value })}
                    placeholder="请输入机构名称"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    <span className="text-red-500 mr-1">*</span>职位
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.position}
                    onChange={(e) => setNewForm({ ...newForm, position: e.target.value })}
                    placeholder="请输入职位"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>合作类型
                </label>
                <select
                  value={newForm.coopType}
                  onChange={(e) => setNewForm({ ...newForm, coopType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="合作伙伴申请">合作伙伴申请</option>
                  <option value="合作咨询">合作咨询</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  <span className="text-red-500 mr-1">*</span>合作需求描述
                </label>
                <textarea
                  rows={3}
                  required
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  placeholder="请输入合作需求描述..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  提交流存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">确认删除该咨询记录？</h3>
              <p className="text-xs text-slate-500">
                编号 [<span className="font-mono font-bold text-slate-800">{deleteTargetId}</span>] 删除后不可恢复。
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
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
