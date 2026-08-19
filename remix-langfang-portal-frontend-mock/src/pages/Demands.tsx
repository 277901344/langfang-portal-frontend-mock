import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Plus,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  Building2,
  AlertCircle,
  FileText,
  Tag,
  Check,
  ShieldCheck,
  ArrowLeft,
  CalendarDays,
  Filter,
  Sparkles,
  Layers,
  Send,
  SlidersHorizontal,
  ChevronDown,
  MinusCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DemandItem,
  mockDemands,
  DEMAND_TYPES,
  DEMAND_STATUSES,
  DEMAND_TOPICS,
  DemandResponseItem,
} from '../data/mockDemands';
import {
  DemandExtendedItem,
  getStoredDemands,
  addDemand,
  submitDemandResponse,
  acceptDemandResponse,
  rejectDemandResponse,
} from '../lib/demandStore';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { PageBanner } from '../components/PageBanner';

export function Demands() {
  const { displayName } = useAuth();
  const [demands, setDemands] = useState<DemandExtendedItem[]>([]);

  React.useEffect(() => {
    const list = getStoredDemands();
    setDemands(list);
  }, []);

  // View mode: 'list' | 'publish' | 'detail'
  const [viewMode, setViewMode] = useState<'list' | 'publish' | 'detail'>('list');
  const [activeDemand, setActiveDemand] = useState<DemandExtendedItem | null>(null);

  // Role Perspective in Demand Detail: 'provider' (数据提供方) vs 'publisher' (数据需求方)
  const [perspectiveRole, setPerspectiveRole] = useState<'provider' | 'publisher'>('provider');

  // Search and Filter States for Demand List
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [selectedType, setSelectedType] = useState('不限');
  const [selectedStatus, setSelectedStatus] = useState('不限');
  const [selectedTopic, setSelectedTopic] = useState('不限');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Publish Form State
  const [publishTitle, setPublishTitle] = useState('');
  const [publishTopic, setPublishTopic] = useState('');
  const [publishScene, setPublishScene] = useState('');
  const [publishProductType, setPublishProductType] = useState('');
  const [publishUpdateFreq, setPublishUpdateFreq] = useState('');
  const [publishDeadline, setPublishDeadline] = useState('2026-08-29');
  const [publishPurpose, setPublishPurpose] = useState('');
  const [publishDesc, setPublishDesc] = useState('');
  const [expectedFieldsList, setExpectedFieldsList] = useState<string[]>(['']);
  const [publishBudgetType, setPublishBudgetType] = useState('');
  const [publishBudgetAmount, setPublishBudgetAmount] = useState('');

  // Respond Form Modal State
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [responseSolutionDesc, setResponseSolutionDesc] = useState('测试方案说明');
  const [responsePricingType, setResponsePricingType] = useState('免费');
  const [responseQuoteAmount, setResponseQuoteAmount] = useState('');
  const [responseDeliveryType, setResponseDeliveryType] = useState('数据集');
  const [responseRelatedProduct, setResponseRelatedProduct] = useState('691131000MA0GJFCJ8N6550PHFTSCZTV / v2');

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Execute Search
  const handleSearch = () => {
    setActiveQuery(searchInput.trim());
    setCurrentPage(1);
  };

  // Filtered Demands
  const filteredDemands = useMemo(() => {
    return demands.filter((item) => {
      const query = activeQuery.toLowerCase();
      const matchQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.publisher.toLowerCase().includes(query) ||
        item.topicCategory.toLowerCase().includes(query);

      const matchType = selectedType === '不限' || item.type === selectedType;
      const matchStatus = selectedStatus === '不限' || item.status === selectedStatus;
      const matchTopic =
        selectedTopic === '不限' ||
        item.topicCategory.includes(selectedTopic) ||
        (selectedTopic === '未设置主题' && (item.topicCategory === '-' || item.topicCategory.includes('未设置')));

      return matchQuery && matchType && matchStatus && matchTopic;
    });
  }, [demands, activeQuery, selectedType, selectedStatus, selectedTopic]);

  // Paginated Results
  const totalPages = Math.ceil(filteredDemands.length / pageSize) || 1;
  const paginatedDemands = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDemands.slice(start, start + pageSize);
  }, [filteredDemands, currentPage, pageSize]);

  // Handle expected field item actions
  const handleAddExpectedFieldRow = () => {
    setExpectedFieldsList([...expectedFieldsList, '']);
  };

  const handleExpectedFieldChange = (idx: number, val: string) => {
    const next = [...expectedFieldsList];
    next[idx] = val;
    setExpectedFieldsList(next);
  };

  const handleRemoveExpectedFieldRow = (idx: number) => {
    if (expectedFieldsList.length <= 1) {
      setExpectedFieldsList(['']);
    } else {
      setExpectedFieldsList(expectedFieldsList.filter((_, i) => i !== idx));
    }
  };

  // Handle Publish Submit
  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTitle.trim()) {
      showToast('请填写需求标题');
      return;
    }

    const validFields = expectedFieldsList.map((f) => f.trim()).filter((f) => f.length > 0);

    const newDemand = addDemand({
      title: publishTitle.trim(),
      type: '我发布的',
      publisher: displayName || 'lfssjj_admin',
      publisherOrg: '廊坊市数据局',
      description: publishDesc.trim() || '暂无详细说明',
      topicCategory: publishTopic || '政务服务',
      applicationScene: publishScene || '跨部门协同',
      productType: publishProductType || '数据集',
      updateFrequency: publishUpdateFreq || '每周',
      usePurpose: publishPurpose || '业务协同与监管分析',
      budgetType: publishBudgetType || '免费',
      budgetAmount: publishBudgetAmount || '-',
      datasetRequirement: publishDesc.trim() || '通用数据集需求',
      expectedFields: validFields.length > 0 ? validFields : ['统一社会信用代码', '企业名称', '法定代表人'],
      deadline: publishDeadline || '2026-08-29',
      contactPerson: displayName || 'lfssjj_admin',
      contactPhone: '173****2231',
    });

    const refreshed = getStoredDemands();
    setDemands(refreshed);
    setActiveDemand(newDemand);
    setViewMode('detail');
    setPerspectiveRole('publisher');

    // Reset Form
    setPublishTitle('');
    setPublishTopic('');
    setPublishScene('');
    setPublishProductType('');
    setPublishUpdateFreq('');
    setPublishPurpose('');
    setPublishDesc('');
    setExpectedFieldsList(['']);
    setPublishBudgetType('');
    setPublishBudgetAmount('');

    showToast('需求发布成功！');
  };

  // Handle Response Submit
  const handleResponseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDemand) return;
    if (!responseSolutionDesc.trim()) {
      showToast('请输入方案说明');
      return;
    }

    const updated = submitDemandResponse(activeDemand.id, {
      responder: displayName || 'Ifsc_admin',
      responderOrg: '廊坊市数城科技集团有限公司',
      solutionDesc: responseSolutionDesc.trim(),
      pricingType: responsePricingType,
      quoteAmount: responseQuoteAmount || undefined,
      deliveryType: responseDeliveryType,
      relatedProduct: responseRelatedProduct || '691131000MA0GJFCJ8N6550PHFTSCZTV / v2',
    });

    setDemands(updated);
    const refreshedDemand = updated.find((d) => d.id === activeDemand.id);
    if (refreshedDemand) setActiveDemand(refreshedDemand);
    setIsRespondModalOpen(false);

    showToast('响应方案已成功提交！需求方将收到比选通知。');
  };

  // Handle Accept Response
  const handleAcceptResponse = (respId: string) => {
    if (!activeDemand) return;

    const updatedResponses = activeDemand.responses.map((r) =>
      r.id === respId ? { ...r, status: '已接受' as const } : r
    );

    const updatedDemand = {
      ...activeDemand,
      status: '已匹配' as const,
      responses: updatedResponses,
    };

    setDemands(demands.map((d) => (d.id === activeDemand.id ? updatedDemand : d)));
    setActiveDemand(updatedDemand);
    showToast('已接受该响应方案！');
  };

  // Handle Reject Response
  const handleRejectResponse = (respId: string) => {
    if (!activeDemand) return;

    const updatedResponses = activeDemand.responses.map((r) =>
      r.id === respId ? { ...r, status: '已拒绝' as const } : r
    );

    const updatedDemand = {
      ...activeDemand,
      responses: updatedResponses,
    };

    setDemands(demands.map((d) => (d.id === activeDemand.id ? updatedDemand : d)));
    setActiveDemand(updatedDemand);
    showToast('已拒绝该响应方案');
  };

  // Handle Close Demand
  const handleCloseDemand = () => {
    if (!activeDemand) return;
    const updatedDemand = {
      ...activeDemand,
      status: '已关闭' as const,
    };
    setDemands(demands.map((d) => (d.id === activeDemand.id ? updatedDemand : d)));
    setActiveDemand(updatedDemand);
    showToast('需求已关闭');
  };

  // Status Badge Helper
  const renderStatusBadge = (status: DemandItem['status']) => {
    switch (status) {
      case '已发布':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
            已发布
          </span>
        );
      case '已有响应':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            已有响应
          </span>
        );
      case '已匹配':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            已匹配
          </span>
        );
      case '已关闭':
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
            已关闭
          </span>
        );
      case '未发布':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
            未发布
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans selection:bg-blue-500/20">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-blue-400 bg-blue-600 text-white px-5 py-2.5 shadow-xl text-xs font-semibold flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-blue-100" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 1: DEMAND LIST VIEW */}
      {viewMode === 'list' && (
        <>
          {/* 统一 3D 玻璃质感 Banner */}
          <PageBanner
            title="数据需求大厅"
            subtitle="发布与响应全市公共数据、社会数据应用需求，打通供需堵点，推动跨行业、跨层级高效数据应用合作。"
            tag="数据要素供需精准对接"
            variant="需求大厅"
            stats={[
              { label: '需求总量', value: demands.length, unit: '项' },
              { label: '已响应', value: demands.filter(d => d.status === '已有响应' || d.status === '已匹配').length, unit: '项' },
              { label: '达成匹配', value: demands.filter(d => d.status === '已匹配').length, unit: '项' }
            ]}
          />

          {/* Page Container: Left Sidebar + Right List (与数据产品页风格一致) */}
          <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 mt-8 sm:mt-10">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

              {/* Sidebar Filters */}
              <div className="w-full lg:w-72 shrink-0 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-blue-600" />
                    需求筛选
                  </h3>

                  {/* 需求类型 */}
                  <div className="mb-5">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2">需求类型</p>
                    <div className="flex flex-col gap-1">
                      {DEMAND_TYPES.map((type) => {
                        const isSelected = selectedType === type;
                        return (
                          <button
                            key={type}
                            onClick={() => {
                              setSelectedType(type);
                              setCurrentPage(1);
                            }}
                            className={cn(
                              "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                            )}
                          >
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 状态 */}
                  <div className="mb-5 border-t border-slate-200 pt-4">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2">需求状态</p>
                    <div className="flex flex-col gap-1">
                      {DEMAND_STATUSES.map((status) => {
                        const isSelected = selectedStatus === status;
                        return (
                          <button
                            key={status}
                            onClick={() => {
                              setSelectedStatus(status);
                              setCurrentPage(1);
                            }}
                            className={cn(
                              "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                            )}
                          >
                            <span>{status}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 主题分类 */}
                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2">主题分类</p>
                    <div className="flex flex-col gap-1">
                      {DEMAND_TOPICS.map((topic) => {
                        const isSelected = selectedTopic === topic;
                        return (
                          <button
                            key={topic}
                            onClick={() => {
                              setSelectedTopic(topic);
                              setCurrentPage(1);
                            }}
                            className={cn(
                              "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                              isSelected
                                ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                            )}
                          >
                            <span className="truncate">{topic}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1">
                {/* 搜索框与发布按钮（移出 Banner 区域） */}
                <div className="mb-6 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="输入关键字检索需求（如：医疗挂号、不动产、公积金、供水等）"
                      className="w-full h-11 pl-11 pr-4 bg-white rounded-xl text-slate-900 placeholder-slate-400 text-xs sm:text-sm border border-slate-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={handleSearch}
                      className="flex-1 sm:flex-initial h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
                    >
                      查 询
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('publish')}
                      className="flex-1 sm:flex-initial h-11 px-5 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-blue-600" />
                      <span>发布数据需求</span>
                    </button>
                  </div>
                </div>

                {/* Status Bar / Total Info */}
                <div className="mb-6 flex items-center justify-between gap-4 bg-white px-5 py-3.5 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span>找到 <strong className="text-blue-600 font-bold">{filteredDemands.length}</strong> 项数据需求</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {(activeQuery || selectedType !== '不限' || selectedStatus !== '不限' || selectedTopic !== '不限') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchInput('');
                          setActiveQuery('');
                          setSelectedType('不限');
                          setSelectedStatus('不限');
                          setSelectedTopic('不限');
                          setCurrentPage(1);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-bold cursor-pointer"
                      >
                        重置筛选
                      </button>
                    )}
                  </div>
                </div>

                {/* Demands Grid (与数据产品卡片完全一致精致风格) */}
                {paginatedDemands.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {paginatedDemands.map((item, idx) => (
                      <motion.article
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03, duration: 0.25 }}
                        onClick={() => {
                          setActiveDemand(item);
                          if (item.publisher === 'lfssjj_admin' || item.status === '未发布') {
                            setPerspectiveRole('publisher');
                          } else {
                            setPerspectiveRole('provider');
                          }
                          setViewMode('detail');
                        }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_30px_rgba(15,118,110,0.08)] cursor-pointer"
                      >
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-blue-400 to-transparent opacity-80" />

                        <div>
                          {/* Header Tags */}
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                              {item.topicCategory || '未设置主题'}
                            </span>
                            {renderStatusBadge(item.status)}
                          </div>

                          {/* Title */}
                          <h3 className="mt-3 line-clamp-1 text-base font-bold leading-6 text-slate-900 group-hover:text-blue-700 transition-colors">
                            {item.title}
                          </h3>

                          {/* Description */}
                          <p className="mt-2 line-clamp-2 text-xs font-normal leading-5 text-slate-500">
                            {item.description}
                          </p>
                        </div>

                        {/* Card Bottom Meta */}
                        <div className="mt-4 flex items-center justify-between gap-4 pt-1">
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                            <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg font-bold text-[11px]">
                              <MessageSquare className="w-3 h-3 text-blue-600" />
                              <span>{item.responses.length} 个响应</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>{item.createdAt.slice(0, 10)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition-colors">
                            <span>查看详情</span>
                            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700 mb-1">暂无匹配的数据需求</h3>
                    <p className="text-xs text-slate-400">请尝试调整搜索关键词或侧边栏过滤条件。</p>
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setActiveQuery('');
                        setSelectedType('不限');
                        setSelectedStatus('不限');
                        setSelectedTopic('不限');
                        setCurrentPage(1);
                      }}
                      className="mt-6 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200 cursor-pointer"
                    >
                      重置筛选条件
                    </button>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      上一页
                    </button>
                    <span className="text-xs text-slate-500 px-3">
                      第 {currentPage} / {totalPages} 页
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      下一页
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW 2: PUBLISH DEMAND PAGE */}
      {viewMode === 'publish' && (
        <div className="min-h-screen bg-slate-50 pb-24">
          {/* Sub Header / Back Bar */}
          <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-10 sticky top-0 z-30 shadow-2xs">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 text-slate-800 hover:text-blue-600 font-bold text-sm transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>发布需求</span>
              </button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
              <form onSubmit={handlePublishSubmit} className="space-y-6">

                {/* Section 1: 基础信息 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                    <h2 className="text-sm font-bold text-slate-800">基础信息</h2>
                  </div>

                  <div className="space-y-4 text-xs text-slate-700">
                    <div className="space-y-1.5">
                      <label className="font-medium text-slate-800 flex items-center gap-1">
                        <span className="text-rose-500">*</span>
                        <span>需求标题</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={publishTitle}
                        onChange={(e) => setPublishTitle(e.target.value)}
                        placeholder="请填写简明扼要的需求标题"
                        className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-medium text-slate-800">主题分类</label>
                        <select
                          value={publishTopic}
                          onChange={(e) => setPublishTopic(e.target.value)}
                          className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">请选择主题分类</option>
                          {DEMAND_TOPICS.filter((t) => t !== '不限').map((topic) => (
                            <option key={topic} value={topic}>{topic}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-medium text-slate-800">应用场景</label>
                        <input
                          type="text"
                          value={publishScene}
                          onChange={(e) => setPublishScene(e.target.value)}
                          placeholder="请输入应用场景，如：跨境多式联运物流调度与碳足迹核算"
                          className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-medium text-slate-800">产品类型</label>
                        <select
                          value={publishProductType}
                          onChange={(e) => setPublishProductType(e.target.value)}
                          className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">请选择产品类型</option>
                          <option value="数据集">数据集</option>
                          <option value="API产品">API产品</option>
                          <option value="数据应用">数据应用</option>
                          <option value="数据报告">数据报告</option>
                          <option value="数字对象">数字对象</option>
                          <option value="其他">其他</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="font-medium text-slate-800">更新频次</label>
                        <select
                          value={publishUpdateFreq}
                          onChange={(e) => setPublishUpdateFreq(e.target.value)}
                          className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                        >
                          <option value="">请选择更新频次</option>
                          <option value="实时">实时</option>
                          <option value="每日">每日</option>
                          <option value="每周">每周</option>
                          <option value="每月">每月</option>
                          <option value="每季度">每季度</option>
                          <option value="每半年">每半年</option>
                          <option value="每年">每年</option>
                          <option value="不定期">不定期</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="font-medium text-slate-800">截止日期</label>
                        <div className="relative">
                          <input
                            type="date"
                            value={publishDeadline}
                            onChange={(e) => setPublishDeadline(e.target.value)}
                            className="w-full h-9 border border-slate-200 rounded-lg px-3 pr-9 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                          />
                          <CalendarDays className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: 详细说明 */}
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                    <h2 className="text-sm font-bold text-slate-800">详细说明</h2>
                  </div>

                  <div className="space-y-4 text-xs text-slate-700">
                    <div className="space-y-1.5">
                      <label className="font-medium text-slate-800">使用目的</label>
                      <div className="relative">
                        <textarea
                          rows={3}
                          maxLength={200}
                          value={publishPurpose}
                          onChange={(e) => setPublishPurpose(e.target.value)}
                          placeholder="简单描述需求方采购数据的用途"
                          className="w-full border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white resize-none"
                        />
                        <div className="absolute right-3 bottom-2 text-[11px] text-slate-400 font-mono">
                          {publishPurpose.length} / 200
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-medium text-slate-800">需求描述</label>
                      <div className="relative">
                        <textarea
                          rows={4}
                          maxLength={500}
                          value={publishDesc}
                          onChange={(e) => setPublishDesc(e.target.value)}
                          placeholder="详细描述所需的字段或要求"
                          className="w-full border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white resize-none"
                        />
                        <div className="absolute right-3 bottom-2 text-[11px] text-slate-400 font-mono">
                          {publishDesc.length} / 500
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <label className="font-medium text-slate-800">期望字段（可选）</label>
                      
                      {/* 字段输入列表 */}
                      <div className="space-y-2">
                        {expectedFieldsList.map((fieldVal, idx) => (
                          <div key={idx} className="flex items-center gap-2.5">
                            <input
                              type="text"
                              value={fieldVal}
                              onChange={(e) => handleExpectedFieldChange(idx, e.target.value)}
                              placeholder="字段名称（例如：user_id）"
                              className="flex-1 h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExpectedFieldRow(idx)}
                              className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
                              title="删除字段"
                            >
                              <MinusCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* 添加期望字段 按钮 */}
                      <button
                        type="button"
                        onClick={handleAddExpectedFieldRow}
                        className="w-full py-2.5 border border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/20 rounded-lg text-xs text-slate-600 hover:text-blue-600 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>添加期望字段</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Section 3: 商务与交付要求 */}
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                    <h2 className="text-sm font-bold text-slate-800">商务与交付要求</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
                    <div className="space-y-1.5">
                      <label className="font-medium text-slate-800 flex items-center gap-1">
                        <span className="text-rose-500">*</span>
                        <span>预算类型</span>
                      </label>
                      <select
                        value={publishBudgetType}
                        onChange={(e) => setPublishBudgetType(e.target.value)}
                        className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      >
                        <option value="">请选择</option>
                        <option value="免费">免费</option>
                        <option value="按次计费">按次计费</option>
                        <option value="包月">包月</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-medium text-slate-800">预算金额</label>
                      <input
                        type="text"
                        value={publishBudgetAmount}
                        onChange={(e) => setPublishBudgetAmount(e.target.value)}
                        placeholder="若为免费可不填"
                        className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
                  >
                    创建需求
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DEMAND DETAIL PAGE */}
      {viewMode === 'detail' && activeDemand && (
        <div className="min-h-screen bg-slate-50 pb-24">
          {/* Sub Header / Back Bar */}
          <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-10 sticky top-0 z-30 shadow-2xs">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-2 text-slate-800 hover:text-blue-600 font-bold text-sm transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 text-slate-600" />
                <span>需求详情</span>
              </button>

              {/* Perspective Role Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
                <span className="text-slate-400 font-medium px-2 text-[11px]">切换角色视角：</span>
                <button
                  type="button"
                  onClick={() => setPerspectiveRole('publisher')}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                    perspectiveRole === 'publisher'
                      ? "bg-white text-blue-600 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  数据需求方 (lfssjj_admin)
                </button>
                <button
                  type="button"
                  onClick={() => setPerspectiveRole('provider')}
                  className={cn(
                    "px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer",
                    perspectiveRole === 'provider'
                      ? "bg-white text-blue-600 font-bold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  数据提供方 (lfsc_admin)
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto px-4 mt-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 md:p-8 space-y-6">
              
              {/* Section 1: 需求概览 */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                    <h2 className="text-sm font-bold text-slate-800">需求概览</h2>
                  </div>
                  <div>
                    {activeDemand.responses.length > 0 ? (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200">
                        已有响应
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-sky-50 text-sky-600 border border-sky-200">
                        已发布
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-xl font-bold text-slate-900">
                    {activeDemand.title}
                  </h1>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2.5 gap-x-6 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">需求编号:</span>
                      <span className="text-slate-800 font-mono">{activeDemand.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">发布方:</span>
                      <span className="text-slate-800">{activeDemand.publisher || 'lfssjj_admin'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">发布时间:</span>
                      <span className="text-slate-800 font-mono">{activeDemand.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">主题分类:</span>
                      <span className="text-slate-800">{activeDemand.topicCategory || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">应用场景:</span>
                      <span className="text-slate-800">{activeDemand.applicationScene || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">截止日期:</span>
                      <span className="text-slate-800 font-mono">{activeDemand.deadline}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">更新频次:</span>
                      <span className="text-slate-800">{activeDemand.updateFrequency || '每周'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: 详细说明 */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                  <h2 className="text-sm font-bold text-slate-800">详细说明</h2>
                </div>

                <div className="text-xs text-slate-700 space-y-1.5">
                  <div className="text-slate-500 font-medium">需求描述</div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {activeDemand.description || '暂无详细描述'}
                  </p>
                </div>
              </div>

              {/* Section 3: 商务与交付要求 */}
              <div className="space-y-3 border-t border-slate-100 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                  <h2 className="text-sm font-bold text-slate-800">商务与交付要求</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2.5 gap-x-6 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">预算类型:</span>
                    <span className="text-slate-800">{activeDemand.budgetType || '免费'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">预算金额:</span>
                    <span className="text-slate-800">{activeDemand.budgetAmount || '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">使用目的:</span>
                    <span className="text-slate-800">{activeDemand.usePurpose || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Section 4: Perspectives Logic */}
              {/* Case A: Data Provider (未响应 -> 可以响应) */}
              {perspectiveRole === 'provider' && activeDemand.responses.length === 0 && (
                <div className="flex items-center justify-end pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRespondModalOpen(true)}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-xs"
                  >
                    响应需求
                  </button>
                </div>
              )}

              {/* Case B: Data Provider (已响应 -> 显示我的响应) */}
              {perspectiveRole === 'provider' && activeDemand.responses.length > 0 && (
                <div className="space-y-4 border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                    <h2 className="text-sm font-bold text-slate-800">
                      我的响应 ({activeDemand.responses.length})
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {activeDemand.responses.map((resp) => (
                      <div
                        key={resp.id}
                        className="border border-slate-200 bg-white rounded-lg p-4 space-y-2 text-xs text-slate-700 shadow-2xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">我的响应</span>
                          <span className="bg-sky-50 text-sky-600 border border-sky-200 text-[11px] font-medium px-2 py-0.5 rounded">
                            {resp.status || '待处理'}
                          </span>
                        </div>

                        <div className="text-slate-600">
                          方案说明：{resp.solutionDesc || resp.solutionName || resp.message || '测试方案说明'}
                        </div>

                        <div className="text-slate-600">
                          报价：{resp.pricingType || '免费'} | 交付：{resp.deliveryType || '数据集'}
                        </div>

                        <div className="text-slate-600">
                          关联商品：{resp.relatedProduct || '691131000MA0GJFCJ8N6550PHFTSCZTV / v2'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Case C: Demand Publisher (显示收到的响应与关闭需求按钮) */}
              {perspectiveRole === 'publisher' && (
                <div className="space-y-6 border-t border-slate-100 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-3.5 bg-blue-600 rounded-xs" />
                      <h2 className="text-sm font-bold text-slate-800">
                        收到的响应 ({activeDemand.responses.length})
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {activeDemand.responses.length > 0 ? (
                        activeDemand.responses.map((resp) => (
                          <div
                            key={resp.id}
                            className="border border-slate-200 bg-white rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-700 shadow-2xs"
                          >
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900">{resp.responder || 'lfsc_admin'}</span>
                                <span className="bg-sky-50 text-sky-600 border border-sky-200 text-[11px] font-medium px-2 py-0.5 rounded">
                                  {resp.status || '待处理'}
                                </span>
                              </div>

                              <div className="text-slate-600">
                                方案说明：{resp.solutionDesc || resp.solutionName || resp.message || '测试方案说明'}
                              </div>

                              <div className="text-slate-600">
                                报价：{resp.pricingType || '免费'} | 交付：{resp.deliveryType || '数据集'}
                              </div>

                              <div className="text-slate-600">
                                关联商品：{resp.relatedProduct || '691131000MA0GJFCJ8N6550PHFTSCZTV / v2'}
                              </div>
                            </div>

                            {resp.status === '待处理' && (
                              <div className="flex items-center gap-2 shrink-0 self-start md:self-center">
                                <button
                                  type="button"
                                  onClick={() => handleAcceptResponse(resp.id)}
                                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  接受
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectResponse(resp.id)}
                                  className="px-4 py-1.5 bg-white border border-rose-500 text-rose-500 hover:bg-rose-50 rounded text-xs font-medium cursor-pointer transition-colors"
                                >
                                  拒绝
                                </button>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="bg-slate-50/70 rounded-xl p-10 flex flex-col items-center justify-center space-y-2.5 border border-slate-200/80">
                          <AlertCircle className="w-8 h-8 text-slate-300" />
                          <span className="text-xs text-slate-400 font-normal">暂无收到的响应方案</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCloseDemand}
                      disabled={activeDemand.status === '已关闭'}
                      className="px-4 py-1.5 border border-rose-500 text-rose-500 hover:bg-rose-50 disabled:opacity-50 rounded text-xs font-medium transition-colors cursor-pointer"
                    >
                      关闭需求
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESPOND DEMAND */}
      <AnimatePresence>
        {isRespondModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <h3 className="text-sm font-bold text-slate-900">响应需求</h3>
                <button
                  type="button"
                  onClick={() => setIsRespondModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleResponseSubmit} className="p-6 space-y-4 text-xs text-slate-700">
                <div className="space-y-1.5">
                  <label className="font-medium text-slate-800 flex items-center gap-1">
                    <span className="text-rose-500">*</span>
                    <span>方案说明</span>
                  </label>
                  <div className="relative">
                    <textarea
                      rows={4}
                      maxLength={500}
                      required
                      value={responseSolutionDesc}
                      onChange={(e) => setResponseSolutionDesc(e.target.value)}
                      placeholder="请填写方案说明"
                      className="w-full border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 bg-white resize-none"
                    />
                    <div className="absolute right-3 bottom-2 text-[11px] text-slate-400 font-mono">
                      {responseSolutionDesc.length} / 500
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-800 flex items-center gap-1">
                      <span className="text-rose-500">*</span>
                      <span>定价方式</span>
                    </label>
                    <select
                      value={responsePricingType}
                      onChange={(e) => setResponsePricingType(e.target.value)}
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    >
                      <option value="免费">免费</option>
                      <option value="按次付费">按次付费</option>
                      <option value="按量付费">按量付费</option>
                      <option value="固定价格">固定价格</option>
                      <option value="面议">面议</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-800">报价金额</label>
                    <input
                      type="text"
                      value={responseQuoteAmount}
                      onChange={(e) => setResponseQuoteAmount(e.target.value)}
                      placeholder="若免费可不填"
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-800 flex items-center gap-1">
                      <span className="text-rose-500">*</span>
                      <span>交付方式</span>
                    </label>
                    <select
                      value={responseDeliveryType}
                      onChange={(e) => setResponseDeliveryType(e.target.value)}
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    >
                      <option value="数据集">数据集</option>
                      <option value="API">API</option>
                      <option value="数据报告">数据报告</option>
                      <option value="密态算力">密态算力</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-medium text-slate-800">关联产品</label>
                    <select
                      value={responseRelatedProduct}
                      onChange={(e) => setResponseRelatedProduct(e.target.value)}
                      className="w-full h-9 border border-slate-200 rounded-lg px-3 bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    >
                      <option value="691131000MA0GJFCJ8N6550PHFTSCZTV / v2">691131000MA0GJFCJ8N6550PHFTSCZTV / v2</option>
                      <option value="智慧足迹位置人口洞察API (v2)">智慧足迹位置人口洞察API (v2)</option>
                      <option value="廊坊企业发票流向风险评估 API">廊坊企业发票流向风险评估 API</option>
                      <option value="廊坊市公共交通客流分析数据集">廊坊市公共交通客流分析数据集</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsRespondModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
                  >
                    提交响应
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
