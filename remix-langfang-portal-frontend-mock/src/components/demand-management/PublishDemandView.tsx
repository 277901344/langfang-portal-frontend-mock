import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ChevronDown,
  Plus,
  ArrowLeft,
  Calendar as CalendarIcon,
  X,
  FileText,
  Clock,
  CheckCircle2,
  Layers,
  Coins,
  Package,
  MinusCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  TradingPublishDemand,
  DemandProductType,
  DemandBudgetType,
  DemandPublishStatus,
  ReceivedResponseSolution,
  getStoredPublishDemands,
  savePublishDemands,
} from '../../data/tradingDemandData';

interface PublishDemandViewProps {
  onShowToast: (msg: string) => void;
}

export function PublishDemandView({ onShowToast }: PublishDemandViewProps) {
  const [demands, setDemands] = useState<TradingPublishDemand[]>(() => getStoredPublishDemands());
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedDemand, setSelectedDemand] = useState<TradingPublishDemand | null>(null);

  // Filter States
  const [demandName, setDemandName] = useState<string>('');
  const [status, setStatus] = useState<string>('请选择');
  const [budgetType, setBudgetType] = useState<string>('请选择');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPage, setJumpPage] = useState<string>('1');

  // Delete modal state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Local Toast notification
  const [localToast, setLocalToast] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setLocalToast(msg);
    if (onShowToast) {
      onShowToast(msg);
    }
    setTimeout(() => {
      setLocalToast(null);
    }, 2500);
  };

  // Claim Detail & Confirm modal states (Matching Image 1 and Image 2)
  const [claimDetailTarget, setClaimDetailTarget] = useState<TradingPublishDemand | null>(null);
  const [claimConfirmTarget, setClaimConfirmTarget] = useState<TradingPublishDemand | null>(null);

  // Form Editing State
  const [editingDemandId, setEditingDemandId] = useState<string | null>(null);

  // Create/Edit Demand Form State (Strictly matches the updated enum & field specifications)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('请选择');
  const [formScene, setFormScene] = useState('');
  const [formProductType, setFormProductType] = useState<DemandProductType | '请选择'>('请选择');
  const [formFrequency, setFormFrequency] = useState('请选择');
  const [formDeadline, setFormDeadline] = useState('2026-08-29');
  const [formPurpose, setFormPurpose] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formFields, setFormFields] = useState<string[]>(['']); // Starts with one field row by default or can add more
  const [formBudgetType, setFormBudgetType] = useState<DemandBudgetType | '请选择'>('请选择');
  const [formBudgetAmount, setFormBudgetAmount] = useState('');

  const handleResetFilters = () => {
    setDemandName('');
    setStatus('请选择');
    setBudgetType('请选择');
    setCurrentPage(1);
    onShowToast('筛选条件已重置');
  };

  const handleSearch = () => {
    setCurrentPage(1);
    onShowToast('已按条件查询我发布的需求');
  };

  // Filtered List (Current user's published demands only)
  const filteredData = useMemo(() => {
    return demands.filter((item) => {
      if (demandName.trim() && !item.name.toLowerCase().includes(demandName.trim().toLowerCase())) {
        return false;
      }
      const itemStatus = item.status || item.publishStatus || '已发布';
      if (status !== '请选择' && status !== '全部' && itemStatus !== status) {
        return false;
      }
      if (budgetType !== '请选择' && budgetType !== '全部' && item.budgetType !== budgetType) {
        return false;
      }
      return true;
    });
  }, [demands, demandName, status, budgetType]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Handle direct status changes from table operations
  const handleDirectClose = (demandId: string) => {
    const updated = demands.map((d) =>
      d.id === demandId ? { ...d, status: '已关闭' as const, publishStatus: '已关闭' as const } : d
    );
    setDemands(updated);
    savePublishDemands(updated);
    if (selectedDemand?.id === demandId) {
      setSelectedDemand((prev) => prev ? { ...prev, status: '已关闭' as const, publishStatus: '已关闭' as const } : null);
    }
    onShowToast('需求已关闭');
  };

  const handleDirectPublish = (demandId: string) => {
    const today = new Date();
    const futureDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const updated = demands.map((d) =>
      d.id === demandId ? {
        ...d,
        status: '已发布' as const,
        publishStatus: '已发布' as const,
        publishTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        deadline: d.status === '已过期' ? futureDate : d.deadline,
      } : d
    );
    setDemands(updated);
    savePublishDemands(updated);
    if (selectedDemand?.id === demandId) {
      setSelectedDemand((prev) => prev ? { ...prev, status: '已发布' as const, publishStatus: '已发布' as const } : null);
    }
    onShowToast('需求已发布');
  };

  const handleEditDemand = (item: TradingPublishDemand) => {
    setEditingDemandId(item.id);
    setFormTitle(item.name || '');
    setFormCategory(item.industry || '请选择');
    setFormScene(item.applicationScene && item.applicationScene !== '-' ? item.applicationScene : '');
    setFormProductType((item.productType || item.demandType || '数据集') as DemandProductType);
    setFormFrequency(item.updateFrequency || '每周');
    setFormDeadline(item.deadline || '2026-09-30');
    setFormPurpose(item.usePurpose && item.usePurpose !== '-' ? item.usePurpose : '');
    setFormDesc(item.description && item.description !== '暂无详细描述' ? item.description : '');
    setFormFields(item.expectedFields && item.expectedFields.length > 0 ? item.expectedFields : ['']);
    setFormBudgetType(item.budgetType || '免费');
    setFormBudgetAmount(item.budget && item.budget !== '-' && item.budget !== '面议' ? item.budget : '');
    setViewMode('create');
  };

  const handleStartCreate = () => {
    setEditingDemandId(null);
    setFormTitle('');
    setFormCategory('请选择');
    setFormScene('');
    setFormProductType('请选择');
    setFormFrequency('请选择');
    setFormDeadline('2026-08-29');
    setFormPurpose('');
    setFormDesc('');
    setFormFields(['']);
    setFormBudgetType('请选择');
    setFormBudgetAmount('');
    setViewMode('create');
  };

  // Handle Create/Edit Demand Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onShowToast('请填写需求标题');
      return;
    }

    const validFields = formFields.map((f) => f.trim()).filter((f) => f.length > 0);
    const chosenProductType: DemandProductType = formProductType !== '请选择' ? formProductType : '数据集';
    const chosenBudgetType: DemandBudgetType = formBudgetType !== '请选择' ? formBudgetType : '免费';

    if (editingDemandId) {
      const updated = demands.map((d) => {
        if (d.id === editingDemandId) {
          return {
            ...d,
            name: formTitle.trim(),
            demandType: chosenProductType,
            productType: chosenProductType,
            deliveryFormat: chosenProductType,
            industry: formCategory !== '请选择' ? formCategory : '-',
            deadline: formDeadline || '2026-09-30',
            budget: formBudgetAmount || (chosenBudgetType === '免费' ? '-' : '面议'),
            budgetType: chosenBudgetType,
            description: formDesc || '暂无详细描述',
            applicationScene: formScene.trim() || '-',
            updateFrequency: formFrequency !== '请选择' ? formFrequency : '每周',
            usePurpose: formPurpose || '-',
            expectedFields: validFields,
            status: '已发布' as const,
            publishStatus: '已发布' as const,
          };
        }
        return d;
      });
      setDemands(updated);
      savePublishDemands(updated);
      setEditingDemandId(null);
      setViewMode('list');
      onShowToast(`已更新并发布需求：${formTitle.trim()}`);
      return;
    }

    const newDemandItem: TradingPublishDemand = {
      id: `DM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      demandType: chosenProductType,
      name: formTitle.trim(),
      publisher: 'lfssjj_admin',
      publisherOrg: '廊坊市数据局',
      productType: chosenProductType,
      deliveryFormat: chosenProductType,
      industry: formCategory !== '请选择' ? formCategory : '-',
      deadline: formDeadline || '2026-09-30',
      status: '已发布',
      publishStatus: '已发布',
      responseStatus: '待认领',
      responseCount: 0,
      publishTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
      budget: formBudgetAmount || (chosenBudgetType === '免费' ? '-' : '面议'),
      budgetType: chosenBudgetType,
      description: formDesc || '暂无详细描述',
      applicationScene: formScene.trim() || '-',
      updateFrequency: formFrequency !== '请选择' ? formFrequency : '每周',
      usePurpose: formPurpose || '-',
      expectedFields: validFields,
      contactPerson: '管理员',
      contactPhone: '173****2231',
      receivedResponses: [],
    };

    const updated = [newDemandItem, ...demands];
    setDemands(updated);
    savePublishDemands(updated);
    setViewMode('list');
    onShowToast(`已成功创建并发布需求：${newDemandItem.name}`);
  };

  const handleAddFieldRow = () => {
    setFormFields([...formFields, '']);
  };

  const handleFieldChange = (index: number, val: string) => {
    const next = [...formFields];
    next[index] = val;
    setFormFields(next);
  };

  const handleRemoveFieldRow = (index: number) => {
    if (formFields.length <= 1) {
      setFormFields(['']);
    } else {
      setFormFields(formFields.filter((_, i) => i !== index));
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const updated = demands.filter((d) => d.id !== deleteTargetId);
    setDemands(updated);
    savePublishDemands(updated);
    setDeleteTargetId(null);
    onShowToast('需求记录已删除');
  };

  const handleAcceptResponse = (responseId: string) => {
    if (!selectedDemand) return;
    const updatedDemands = demands.map((d) => {
      if (d.id === selectedDemand.id) {
        const updatedResponses = d.receivedResponses?.map((r) =>
          r.id === responseId ? { ...r, status: '已达成' as const } : r
        );
        return { ...d, responseStatus: '已达成' as const, receivedResponses: updatedResponses };
      }
      return d;
    });
    setDemands(updatedDemands);
    savePublishDemands(updatedDemands);
    const refreshed = updatedDemands.find((d) => d.id === selectedDemand.id) || null;
    setSelectedDemand(refreshed);
    onShowToast('已接受该方案');
  };

  const handleRejectResponse = (responseId: string) => {
    if (!selectedDemand) return;
    const updatedDemands = demands.map((d) => {
      if (d.id === selectedDemand.id) {
        const updatedResponses = d.receivedResponses?.map((r) =>
          r.id === responseId ? { ...r, status: '已终止' as const } : r
        );
        return { ...d, receivedResponses: updatedResponses };
      }
      return d;
    });
    setDemands(updatedDemands);
    savePublishDemands(updatedDemands);
    const refreshed = updatedDemands.find((d) => d.id === selectedDemand.id) || null;
    setSelectedDemand(refreshed);
    onShowToast('已拒绝该方案');
  };

  const handleAcceptClaimConfirm = (demandId: string, responseId?: string) => {
    const updatedDemands = demands.map((d) => {
      if (d.id === demandId) {
        const updatedResponses = d.receivedResponses && d.receivedResponses.length > 0
          ? d.receivedResponses.map((r) =>
              !responseId || r.id === responseId ? { ...r, status: '对接中' as const } : r
            )
          : [
              {
                id: 'SOL-001',
                responder: 'lfssjj_admin',
                responderOrg: '廊坊市数城科技集团有限公司',
                solutionDesc: '11',
                pricingType: '免费',
                quoteAmount: '免费',
                deliveryType: '数据集',
                relatedProduct: '691131000MA0GJFCJ8N6550PHFTSCZTV / v2',
                date: new Date().toISOString().slice(0, 16).replace('T', ' '),
                status: '对接中' as const,
              },
            ];
        return {
          ...d,
          status: '已匹配' as const,
          publishStatus: '已匹配' as const,
          responseStatus: '已达成' as const,
          receivedResponses: updatedResponses,
        };
      }
      return d;
    });
    setDemands(updatedDemands);
    savePublishDemands(updatedDemands);
    setClaimConfirmTarget(null);
    if (selectedDemand?.id === demandId) {
      const refreshed = updatedDemands.find((d) => d.id === demandId) || null;
      setSelectedDemand(refreshed);
    }
    triggerToast('已接受响应');
  };

  const handleRejectClaimConfirm = (demandId: string, responseId?: string) => {
    const updatedDemands = demands.map((d) => {
      if (d.id === demandId) {
        const updatedResponses = d.receivedResponses?.map((r) =>
          !responseId || r.id === responseId ? { ...r, status: '已终止' as const } : r
        );
        return {
          ...d,
          status: '已发布' as const,
          publishStatus: '已发布' as const,
          responseStatus: '待认领' as const,
          receivedResponses: updatedResponses,
        };
      }
      return d;
    });
    setDemands(updatedDemands);
    savePublishDemands(updatedDemands);
    setClaimConfirmTarget(null);
    if (selectedDemand?.id === demandId) {
      const refreshed = updatedDemands.find((d) => d.id === demandId) || null;
      setSelectedDemand(refreshed);
    }
    triggerToast('已拒绝响应');
  };

  const handleCloseDemand = () => {
    if (!selectedDemand) return;
    const updatedDemands = demands.map((d) => {
      if (d.id === selectedDemand.id) {
        return { ...d, status: '已关闭' as const, publishStatus: '已关闭' as const };
      }
      return d;
    });
    setDemands(updatedDemands);
    savePublishDemands(updatedDemands);
    const refreshed = updatedDemands.find((d) => d.id === selectedDemand.id) || null;
    setSelectedDemand(refreshed);
    onShowToast('需求已关闭');
  };

  // ====================== 视图 1: 发布需求表单 (Strictly matches 发布需求.png & new enum specs) ======================
  if (viewMode === 'create') {
    return (
      <div className="space-y-4 max-w-5xl mx-auto pb-10">
        {/* Top Back Header */}
        <div className="flex items-center gap-2 text-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">{editingDemandId ? '编辑需求' : '发布需求'}</span>
          </button>
        </div>

        <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs text-slate-700">
          {/* Card 1: 基础信息 */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <span>基础信息</span>
            </div>

            {/* 需求标题 */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs">
                <span className="text-rose-500 mr-0.5">*</span> 需求标题
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="请填写简明扼要的需求标题"
                className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Row 1: 主题分类 & 应用场景 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-700 text-xs">主题分类</label>
                <div className="relative">
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="请选择">请选择主题分类</option>
                    <option value="工业制造">工业制造</option>
                    <option value="金融服务">金融服务</option>
                    <option value="智慧城市">智慧城市</option>
                    <option value="交通物流">交通物流</option>
                    <option value="医疗健康">医疗健康</option>
                    <option value="科技创新">科技创新</option>
                    <option value="现代农业">现代农业</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-700 text-xs">应用场景</label>
                <input
                  type="text"
                  value={formScene}
                  onChange={(e) => setFormScene(e.target.value)}
                  placeholder="请输入应用场景，如：跨境多式联运物流调度与碳足迹核算"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Row 2: 产品类型 (图 1) & 更新频次 (图 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-700 text-xs">产品类型</label>
                <div className="relative">
                  <select
                    value={formProductType}
                    onChange={(e) => setFormProductType(e.target.value as DemandProductType | '请选择')}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="请选择">请选择产品类型</option>
                    <option value="数据集">数据集</option>
                    <option value="API产品">API产品</option>
                    <option value="数据应用">数据应用</option>
                    <option value="数据报告">数据报告</option>
                    <option value="数字对象">数字对象</option>
                    <option value="其他">其他</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-700 text-xs">更新频次</label>
                <div className="relative">
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="请选择">请选择更新频次</option>
                    <option value="实时">实时</option>
                    <option value="每日">每日</option>
                    <option value="每周">每周</option>
                    <option value="每月">每月</option>
                    <option value="每季度">每季度</option>
                    <option value="每半年">每半年</option>
                    <option value="每年">每年</option>
                    <option value="不定期">不定期</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Row 3: 截止日期 */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs">截止日期</label>
              <div className="relative">
                <input
                  type="date"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                  placeholder="请选择需求有效期"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Card 2: 详细说明 */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <span>详细说明</span>
            </div>

            {/* 使用目的 */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs">使用目的</label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={200}
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="简单描述需求方采购数据的用途"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
                <span className="absolute right-3 top-2 text-[10px] text-slate-400 pointer-events-none">
                  {formPurpose.length} / 200
                </span>
              </div>
            </div>

            {/* 需求描述 */}
            <div className="space-y-1.5">
              <label className="block text-slate-700 text-xs">需求描述</label>
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={500}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="详细描述所需字段或要求"
                  className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none pb-6"
                />
                <span className="absolute right-3 bottom-2.5 text-[10px] text-slate-400 pointer-events-none">
                  {formDesc.length} / 500
                </span>
              </div>
            </div>

            {/* 期望字段（可选） (图 3 完整样式) */}
            <div className="space-y-2.5">
              <label className="block text-slate-700 text-xs">期望字段（可选）</label>

              {/* 字段输入列表 */}
              <div className="space-y-2">
                {formFields.map((fieldVal, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <input
                      type="text"
                      value={fieldVal}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                      placeholder="字段名称（例如：user_id）"
                      className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFieldRow(idx)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                      title="删除字段"
                    >
                      <MinusCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* 添加期望字段 按钮 (图 3 虚线框) */}
              <button
                type="button"
                onClick={handleAddFieldRow}
                className="w-full py-2.5 border border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 rounded-lg text-xs text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>添加期望字段</span>
              </button>
            </div>
          </div>

          {/* Card 3: 商务与交付要求 (图 4 完整枚举) */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <span>商务与交付要求</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-slate-700 text-xs">
                  <span className="text-rose-500 mr-0.5">*</span> 预算类型
                </label>
                <div className="relative">
                  <select
                    value={formBudgetType}
                    onChange={(e) => setFormBudgetType(e.target.value as DemandBudgetType | '请选择')}
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="请选择">请选择</option>
                    <option value="免费">免费</option>
                    <option value="按次计费">按次计费</option>
                    <option value="包月">包月</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-slate-700 text-xs">预算金额</label>
                <input
                  type="text"
                  value={formBudgetAmount}
                  onChange={(e) => setFormBudgetAmount(e.target.value)}
                  placeholder="若为免费可不填"
                  className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Actions (Right aligned) */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors"
            >
              取 消
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
            >
              {editingDemandId ? '保存并发布' : '创建需求'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ====================== 视图 2: 需求详情 (Strictly matches 数据需求方发布的需求被响应后的需求详情.png) ======================
  if (viewMode === 'detail' && selectedDemand) {
    const hasResponses = (selectedDemand.receivedResponses?.length || 0) > 0;
    const isResponded = selectedDemand.responseStatus === '已被认领' || hasResponses;

    return (
      <div className="space-y-4 max-w-5xl mx-auto pb-12">
        {/* Top Back Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">需求详情</span>
          </button>
        </div>

        {/* Card 1: 需求概览 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4 relative">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
            <span>需求概览</span>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">{selectedDemand.name}</h2>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
              <div>
                <span className="text-slate-400">需求编号：</span>
                <span className="text-slate-800 font-mono">{selectedDemand.id}</span>
              </div>
              <div>
                <span className="text-slate-400">发布方：</span>
                <span className="text-slate-800">{selectedDemand.publisher}</span>
              </div>
              <div>
                <span className="text-slate-400">发布时间：</span>
                <span className="text-slate-800 font-mono">{selectedDemand.publishTime}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
              <div>
                <span className="text-slate-400">产品类型：</span>
                <span className="text-slate-800 font-medium">{selectedDemand.productType || selectedDemand.deliveryFormat || selectedDemand.demandType || '数据集'}</span>
              </div>
              <div>
                <span className="text-slate-400">行业领域：</span>
                <span className="text-slate-800">{selectedDemand.industry || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400">截止日期：</span>
                <span className="text-slate-800 font-mono">{selectedDemand.deadline}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
              <div>
                <span className="text-slate-400">应用场景：</span>
                <span className="text-slate-800">{selectedDemand.applicationScene || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400">更新频次：</span>
                <span className="text-slate-800">{selectedDemand.updateFrequency || '每周'}</span>
              </div>
              <div>
                <span className="text-slate-400">认领状态：</span>
                <span className="text-slate-800">{selectedDemand.responseStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: 详细说明 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
            <span>详细说明</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-slate-700 font-medium">需求描述</div>
            <div className="text-slate-500 leading-relaxed pt-0.5">
              {selectedDemand.description || '暂无详细描述'}
            </div>
          </div>
        </div>

        {/* Card 3: 商务与交付要求 */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
            <span>商务与交付要求</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2 text-xs">
            <div>
              <span className="text-slate-400">预算类型：</span>
              <span className="text-slate-800">{selectedDemand.budgetType || '免费'}</span>
            </div>
            <div>
              <span className="text-slate-400">预算金额：</span>
              <span className="text-slate-800">{selectedDemand.budget || '-'}</span>
            </div>
            <div>
              <span className="text-slate-400">使用目的：</span>
              <span className="text-slate-800">{selectedDemand.usePurpose || '-'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================== 视图 3: 表格列表模式 ======================
  return (
    <div className="space-y-4">
      {/* 筛选过滤区域 (直接全部展示筛选条件，不再通过展开显示) */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 筛选表单输入项 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 flex-1">
            {/* 需求名称 */}
            <div className="flex items-center gap-2.5">
              <label className="text-xs text-slate-700 whitespace-nowrap font-medium">需求名称</label>
              <input
                type="text"
                value={demandName}
                onChange={(e) => setDemandName(e.target.value)}
                placeholder="请输入需求名称搜索..."
                className="h-8 w-52 sm:w-64 px-3 bg-white border border-slate-300 rounded text-xs text-slate-700 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
              />
            </div>

            {/* 状态 */}
            <div className="flex items-center gap-2.5">
              <label className="text-xs text-slate-700 whitespace-nowrap font-medium">状态</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="h-8 min-w-[130px] px-3 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:border-blue-400 focus:outline-none focus:border-[#1890FF] cursor-pointer"
              >
                <option value="请选择">请选择</option>
                <option value="全部">全部状态</option>
                <option value="已发布">已发布</option>
                <option value="已有响应">已有响应</option>
                <option value="已匹配">已匹配</option>
                <option value="已关闭">已关闭</option>
                <option value="已过期">已过期</option>
                <option value="未发布">未发布</option>
              </select>
            </div>

            {/* 预算类型 */}
            <div className="flex items-center gap-2.5">
              <label className="text-xs text-slate-700 whitespace-nowrap font-medium">预算类型</label>
              <select
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
                className="h-8 min-w-[130px] px-3 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:border-blue-400 focus:outline-none focus:border-[#1890FF] cursor-pointer"
              >
                <option value="请选择">请选择</option>
                <option value="全部">全部预算类型</option>
                <option value="免费">免费</option>
                <option value="按次计费">按次计费</option>
                <option value="包月">包月</option>
              </select>
            </div>
          </div>

          {/* 筛选操作按钮区 */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:text-[#1890FF] hover:border-[#1890FF] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重置</span>
            </button>

            <button
              type="button"
              onClick={handleSearch}
              className="inline-flex items-center gap-1.5 h-8 px-4 bg-[#1890FF] hover:bg-[#096dd9] text-white rounded text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>查询</span>
            </button>
          </div>
        </div>
      </div>

      {/* 数据表格区域 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col">
        {/* 表格顶栏快捷操作 */}
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Layers className="w-4 h-4 text-[#1890FF]" />
            <span>我发布的需求列表</span>
            <span className="text-slate-400 font-normal">（共 {totalItems} 条由我发起的定制需求）</span>
          </div>

          <button
            type="button"
            onClick={handleStartCreate}
            className="inline-flex items-center gap-1.5 h-7 px-3 bg-[#1890FF] hover:bg-[#096dd9] text-white rounded text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>发布需求</span>
          </button>
        </div>

        {/* 响应式数据表格 */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-slate-200 text-slate-700 text-xs font-semibold select-none">
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[200px]">需求名称</th>
                <th className="py-3 px-3.5 whitespace-nowrap">产品类型</th>
                <th className="py-3 px-3.5 whitespace-nowrap">行业领域</th>
                <th className="py-3 px-3.5 whitespace-nowrap">预算类型</th>
                <th className="py-3 px-3.5 whitespace-nowrap">截止日期</th>
                <th className="py-3 px-3.5 whitespace-nowrap">状态</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">收到响应</th>
                <th className="py-3 px-3.5 whitespace-nowrap">发布时间</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <FileText className="w-8 h-8 stroke-1 text-slate-300" />
                      <p className="text-xs">暂无符合条件的需求记录</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => {
                  const hasResponses = (item.receivedResponses?.length || 0) > 0;
                  const responseCount = item.receivedResponses?.length || 0;
                  const currentStatus = item.status || item.publishStatus || '已发布';
                  const currentProductType = item.productType || item.deliveryFormat || item.demandType || '数据集';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* 需求名称 (蓝色显示) */}
                      <td className="py-3 px-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDemand(item);
                            setViewMode('detail');
                          }}
                          className="font-medium text-[#1890FF] hover:text-[#096dd9] hover:underline text-left transition-colors line-clamp-2 max-w-sm cursor-pointer"
                          title={item.name}
                        >
                          {item.name}
                        </button>
                      </td>

                      {/* 产品类型 (原期望交付形式/需求类型) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {currentProductType}
                        </span>
                      </td>

                      {/* 行业领域 */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                        {item.industry || '-'}
                      </td>

                      {/* 预算类型 */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-slate-700">
                        <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                          {item.budgetType || '免费'}
                        </span>
                      </td>

                      {/* 截止日期 */}
                      <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                        {item.deadline}
                      </td>

                      {/* 状态 (原发布状态: 已发布、已有响应、已匹配、已关闭、已过期、未发布) */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border',
                            currentStatus === '已发布' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            currentStatus === '已有响应' && 'bg-amber-50 text-amber-700 border-amber-200',
                            currentStatus === '已匹配' && 'bg-blue-50 text-blue-700 border-blue-200',
                            currentStatus === '已关闭' && 'bg-slate-100 text-slate-600 border-slate-200',
                            currentStatus === '已过期' && 'bg-rose-50 text-rose-700 border-rose-200',
                            currentStatus === '未发布' && 'bg-zinc-100 text-zinc-600 border-zinc-300'
                          )}
                        >
                          <span
                            className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              currentStatus === '已发布' && 'bg-emerald-500',
                              currentStatus === '已有响应' && 'bg-amber-500',
                              currentStatus === '已匹配' && 'bg-blue-500',
                              currentStatus === '已关闭' && 'bg-slate-400',
                              currentStatus === '已过期' && 'bg-rose-500',
                              currentStatus === '未发布' && 'bg-zinc-400'
                            )}
                          />
                          <span>{currentStatus}</span>
                        </span>
                      </td>

                      {/* 收到响应数 ("方案" 改为 "响应") */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        {hasResponses ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDemand(item);
                              setViewMode('detail');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 hover:bg-blue-100 text-[#1890FF] border border-blue-200 rounded-full font-bold text-xs cursor-pointer transition-all hover:scale-105"
                          >
                            <Package className="w-3 h-3 text-[#1890FF]" />
                            <span>{responseCount} 个响应</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">0</span>
                        )}
                      </td>

                      {/* 发布时间 */}
                      <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {item.publishTime}
                      </td>

                      {/* 操作 */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {currentStatus === '已关闭' && null}

                          {currentStatus === '已匹配' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setClaimDetailTarget(item)}
                                className="text-[#1890FF] hover:text-[#096dd9] text-xs font-medium cursor-pointer"
                              >
                                认领详情
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectClose(item.id)}
                                className="text-slate-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
                              >
                                关闭
                              </button>
                            </>
                          )}

                          {currentStatus === '已发布' && (
                            <button
                              type="button"
                              onClick={() => handleDirectClose(item.id)}
                              className="text-slate-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
                            >
                              关闭
                            </button>
                          )}

                          {currentStatus === '未发布' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEditDemand(item)}
                                className="text-[#1890FF] hover:text-[#096dd9] text-xs font-medium cursor-pointer"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectPublish(item.id)}
                                className="text-emerald-600 hover:text-emerald-700 text-xs font-medium cursor-pointer"
                              >
                                发布
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectClose(item.id)}
                                className="text-slate-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
                              >
                                关闭
                              </button>
                            </>
                          )}

                          {currentStatus === '已有响应' && (
                            <>
                              <button
                                type="button"
                                onClick={() => setClaimConfirmTarget(item)}
                                className="text-[#1890FF] hover:text-[#096dd9] text-xs font-medium cursor-pointer"
                              >
                                认领确认
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectClose(item.id)}
                                className="text-slate-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
                              >
                                关闭
                              </button>
                            </>
                          )}

                          {currentStatus === '已过期' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEditDemand(item)}
                                className="text-[#1890FF] hover:text-[#096dd9] text-xs font-medium cursor-pointer"
                              >
                                编辑
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectPublish(item.id)}
                                className="text-emerald-600 hover:text-emerald-700 text-xs font-medium cursor-pointer"
                              >
                                发布
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDirectClose(item.id)}
                                className="text-slate-600 hover:text-rose-600 text-xs font-medium cursor-pointer"
                              >
                                关闭
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 分页组件 */}
        <div className="p-3 border-t border-slate-200/80 bg-white flex flex-wrap items-center justify-end gap-3 sm:gap-4 text-xs text-slate-600 select-none">
          <div>共 {totalItems} 条</div>

          <div className="flex items-center gap-1">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-7 px-2 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:border-blue-400 cursor-pointer"
            >
              <option value={10}>10条/页</option>
              <option value={20}>20条/页</option>
              <option value={50}>50条/页</option>
            </select>
          </div>

          {/* 页码按钮 */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded border border-slate-300 transition-colors',
                currentPage === 1 ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'hover:border-[#1890FF] hover:text-[#1890FF] cursor-pointer'
              )}
            >
              &lt;
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={cn(
                  'w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors cursor-pointer',
                  currentPage === pageNum
                    ? 'bg-[#1890FF] text-white border border-[#1890FF]'
                    : 'border border-slate-300 hover:border-[#1890FF] hover:text-[#1890FF]'
                )}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={cn(
                'w-7 h-7 flex items-center justify-center rounded border border-slate-300 transition-colors',
                currentPage === totalPages || totalPages === 0 ? 'text-slate-300 bg-slate-50 cursor-not-allowed' : 'hover:border-[#1890FF] hover:text-[#1890FF] cursor-pointer'
              )}
            >
              &gt;
            </button>
          </div>

          {/* 前往页 */}
          <div className="flex items-center gap-1.5">
            <span>前往</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const target = parseInt(jumpPage, 10);
                  if (target >= 1 && target <= totalPages) {
                    setCurrentPage(target);
                  }
                }
              }}
              className="w-10 h-7 text-center border border-slate-300 rounded text-xs"
            />
            <span>页</span>
          </div>
        </div>
      </div>

      {/* 确认删除对话框 */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">确认删除草稿</h3>
            <p className="text-xs text-slate-600">删除后将无法恢复该草稿需求记录，确认继续？</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="px-4 py-2 border rounded text-xs font-bold text-slate-600 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 text-white rounded text-xs font-bold cursor-pointer"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 认领详情 弹窗 (严格还原第一张图片) */}
      {claimDetailTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                <h3 className="text-sm font-bold text-slate-900">认领详情 - {claimDetailTarget.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setClaimDetailTarget(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 第一张图片中的原版卡片 */}
            {(() => {
              const matchedSol = claimDetailTarget.receivedResponses?.[0] || {
                solutionDesc: '临空区域气象雷达 API 联调方案',
                quoteAmount: '免费',
                deliveryType: '数据集',
                relatedProduct: '691131000MA0GJFCJ8N6550PHFTSCZTV / v2',
                status: '对接中',
              };

              return (
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">我的响应</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-normal bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
                      {matchedSol.status === '已达成' || matchedSol.status === '对接中' ? '对接中' : matchedSol.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed">
                    <span>方案说明：</span>
                    <span>{matchedSol.solutionDesc || '临空区域气象雷达 API 联调方案'}</span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <span>报价：</span>
                    <span>{matchedSol.quoteAmount || '免费'}</span>
                    <span className="text-slate-400 mx-1.5">|</span>
                    <span>交付：</span>
                    <span>{matchedSol.deliveryType || '数据集'}</span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <span>关联商品：</span>
                    <span className="font-mono">{matchedSol.relatedProduct || '691131000MA0GJFCJ8N6550PHFTSCZTV / v2'}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setClaimDetailTarget(null)}
                className="px-5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 认领确认 弹窗 (严格还原第二张图片) */}
      {claimConfirmTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
                <h3 className="text-sm font-bold text-slate-900">认领确认 - {claimConfirmTarget.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setClaimConfirmTarget(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 第二张图片中的原版卡片 */}
            {(() => {
              const pendingSol = claimConfirmTarget.receivedResponses?.[0] || {
                id: 'SOL-001',
                responder: 'lfssjj_admin',
                solutionDesc: '11',
                quoteAmount: '免费',
                deliveryType: '数据集',
                status: '待确认',
              };

              return (
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{pendingSol.responder || 'lfssjj_admin'}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-normal bg-[#E6F7FF] text-[#1890FF] border border-[#91D5FF]">
                        待处理
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptClaimConfirm(claimConfirmTarget.id, pendingSol.id)}
                        className="px-4 py-1 rounded bg-[#1890FF] hover:bg-[#096dd9] text-white text-xs font-normal transition-colors cursor-pointer shadow-xs"
                      >
                        接受
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectClaimConfirm(claimConfirmTarget.id, pendingSol.id)}
                        className="px-4 py-1 rounded border border-rose-500 text-rose-500 hover:bg-rose-50 text-xs font-normal transition-colors cursor-pointer"
                      >
                        拒绝
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 leading-relaxed">
                    <span>方案说明：</span>
                    <span>{pendingSol.solutionDesc || '11'}</span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <span>报价：</span>
                    <span>{pendingSol.quoteAmount || '免费'}</span>
                    <span className="text-slate-400 mx-1.5">|</span>
                    <span>交付：</span>
                    <span>{pendingSol.deliveryType || '数据集'}</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setClaimConfirmTarget(null)}
                className="px-5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification (Matching exact style from image) */}
      {localToast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4 py-2 bg-white text-slate-800 rounded-lg shadow-lg border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-150 pointer-events-none">
          <div className="w-4 h-4 rounded-full bg-[#52c41a] text-white flex items-center justify-center shrink-0">
            <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-sm font-normal text-slate-800 tracking-wide">{localToast}</span>
        </div>
      )}
    </div>
  );
}
