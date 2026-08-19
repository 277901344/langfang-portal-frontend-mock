import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  Plus,
  Filter,
  FileText,
  Radio,
  Server,
  Cloud,
  Layers,
  CheckCircle2,
  X,
  ChevronRight,
  Clock,
  Building2,
  Table,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Shield,
  Lock,
  UserCheck,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  DataResourceItem,
  mockDataResources,
  INDUSTRY_CATEGORIES,
  RESOURCE_TYPES,
} from '../data/mockResources';
import { cn } from '../lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { PageBanner } from '../components/PageBanner';

const SECURITY_LEVEL_OPTIONS = ['全部等级', '1级（公开）', '2级（受控）', '3级（敏感）', '4级（核心）'];

export function DataResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<DataResourceItem[]>(mockDataResources);
  
  // Active Filter States
  const [selectedIndustry, setSelectedIndustry] = useState<string>('全部行业');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('全部类型');
  const [selectedSecurityLevel, setSelectedSecurityLevel] = useState<string>('全部等级');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [industryExpanded, setIndustryExpanded] = useState<boolean>(false);

  // Selected resource for Detail View
  const [activeResource, setActiveResource] = useState<DataResourceItem | null>(null);

  // Modal for Registering Data Resource
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Form State for New Resource Registration
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<DataResourceItem['type']>('数据库');
  const [formDesc, setFormDesc] = useState('');
  const [formIndustry, setFormIndustry] = useState('卫生和社会工作');
  const [formFormat, setFormFormat] = useState('MySQL 8.0 / 关系型库表');
  const [formSource, setFormSource] = useState('廊坊市卫生健康委员会');
  const [formPersonalInfo, setFormPersonalInfo] = useState<DataResourceItem['hasPersonalInfo']>('否');
  const [formSecurityLevel, setFormSecurityLevel] = useState<DataResourceItem['securityLevel']>('2级（受控）');
  const [formFreqCount, setFormFreqCount] = useState('1');
  const [formFreqUnit, setFormFreqUnit] = useState('次/天');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formContactPhone, setFormContactPhone] = useState('');
  const [formDataScaleVal, setFormDataScaleVal] = useState('');
  const [formDataScaleUnit, setFormDataScaleUnit] = useState('GB');
  const [formScenario, setFormScenario] = useState('');
  const [formExtraInfo, setFormExtraInfo] = useState('');
  const [formFieldName, setFormFieldName] = useState('');
  const [formFieldType, setFormFieldType] = useState('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Industry options counts
  const industryCategoryCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部行业': resources.length };
    resources.forEach((item) => {
      counts[item.industryCategory] = (counts[item.industryCategory] || 0) + 1;
    });
    return counts;
  }, [resources]);

  // Resource type counts
  const resourceTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部类型': resources.length };
    resources.forEach((item) => {
      counts[item.type] = (counts[item.type] || 0) + 1;
    });
    return counts;
  }, [resources]);

  // Security level counts
  const securityLevelCounts = useMemo(() => {
    const counts: Record<string, number> = { '全部等级': resources.length };
    resources.forEach((item) => {
      counts[item.securityLevel] = (counts[item.securityLevel] || 0) + 1;
    });
    return counts;
  }, [resources]);

  // Visible Industry Categories (Top 5 + expand)
  const visibleIndustryCategories = useMemo(() => {
    if (industryExpanded) return INDUSTRY_CATEGORIES;
    const defaults = INDUSTRY_CATEGORIES.slice(0, 6);
    if (selectedIndustry !== '全部行业' && !defaults.includes(selectedIndustry)) {
      return [...defaults.slice(0, 5), selectedIndustry];
    }
    return defaults;
  }, [industryExpanded, selectedIndustry]);

  // Filtered Results
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchIndustry =
        selectedIndustry === '全部行业' || item.industryCategory === selectedIndustry;
      const matchType =
        selectedResourceType === '全部类型' || item.type === selectedResourceType;
      const matchSecurity =
        selectedSecurityLevel === '全部等级' || item.securityLevel === selectedSecurityLevel;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.scenario.toLowerCase().includes(q) ||
        item.contactPerson.toLowerCase().includes(q);

      return matchIndustry && matchType && matchSecurity && matchSearch;
    });
  }, [resources, selectedIndustry, selectedResourceType, selectedSecurityLevel, searchQuery]);

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedIndustry('全部行业');
    setSelectedResourceType('全部类型');
    setSelectedSecurityLevel('全部等级');
    setSearchQuery('');
  };

  // Submit Handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('请填写资源名称');
      return;
    }

    const newRes: DataResourceItem = {
      id: `res-${Date.now()}`,
      name: formName.trim(),
      type: formType,
      description: formDesc.trim() || '暂无描述',
      industryCategory: formIndustry,
      format: formFormat || '标准规范格式',
      source: formSource || '廊坊市数据管理部门',
      hasPersonalInfo: formPersonalInfo,
      securityLevel: formSecurityLevel,
      updateFrequency: `${formFreqCount} ${formFreqUnit}`,
      contactPerson: formContactPerson || '张主管',
      contactPhone: formContactPhone || '0316-8001234',
      dataScale: formDataScaleVal ? `${formDataScaleVal} ${formDataScaleUnit}` : '10 GB',
      scenario: formScenario || '多场景协同共享',
      extraInfo: formExtraInfo,
      fieldItems: formFieldName
        ? [{ name: formFieldName, dataType: formFieldType || 'VARCHAR(64)', description: '自定义核验字段' }]
        : [{ name: 'id', dataType: 'VARCHAR(32)', description: '唯一标识' }],
      createdTime: new Date().toISOString().split('T')[0],
    };

    setResources([newRes, ...resources]);
    setIsRegisterModalOpen(false);
    showToast(`数据目录条目 "${formName}" 已成功录入！`);

    // Reset Form
    setFormName('');
    setFormDesc('');
    setFormContactPerson('');
    setFormContactPhone('');
    setFormDataScaleVal('');
    setFormScenario('');
    setFormExtraInfo('');
    setFormFieldName('');
    setFormFieldType('');
  };

  const getResourceTypeIcon = (type: DataResourceItem['type']) => {
    switch (type) {
      case '数据库':
        return Database;
      case 'API 接口':
        return Server;
      case '文件':
        return FileText;
      case 'FTP/SFTP':
        return Radio;
      case 'OSS':
        return Cloud;
      case '消息中间件':
        return Layers;
      default:
        return Database;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-blue-500/20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 shadow-2xl border border-blue-500/30 text-sm font-medium"
          >
            <CheckCircle2 className="w-5 h-5 text-blue-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 统一 3D 玻璃质感 Banner */}
      <PageBanner
        title="数据资源大厅"
        subtitle="归集全区政府部门与公共企业的基础数据库、API接口、文件及实时数据流。按行业分类、资源类型及安全分级统一编目，支撑合规授权运营与跨域共享。"
        tag="数据要素底座"
        variant="数据资源"
        stats={[
          { label: '纳管资源', value: resources.length, unit: '个' },
          { label: '覆盖行业', value: '10+', unit: '类' },
          { label: '安全分级', value: 'L1~L4' }
        ]}
      />

      {/* Main Container Layout (Referencing Products.tsx with Left Sidebar + Right Content) */}
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 mt-8 sm:mt-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* Left Sidebar Filters */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-blue-600" />
                  目录筛选
                </h3>
                {(selectedIndustry !== '全部行业' || selectedResourceType !== '全部类型' || selectedSecurityLevel !== '全部等级' || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    重置
                  </button>
                )}
              </div>

              {/* 行业分类 */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">行业分类</p>
                <div className="flex flex-col gap-1">
                  {visibleIndustryCategories.map((cat) => {
                    const isSelected = selectedIndustry === cat;
                    const count = industryCategoryCounts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedIndustry(cat)}
                        className={cn(
                          "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <span className="truncate">{cat}</span>
                        <span className="text-[10px] text-slate-400 ml-1">{count}</span>
                      </button>
                    );
                  })}
                </div>
                {INDUSTRY_CATEGORIES.length > 6 && (
                  <button
                    onClick={() => setIndustryExpanded(!industryExpanded)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 py-1.5 text-[11px] font-semibold text-blue-700 transition-colors hover:border-blue-200 hover:bg-blue-50/60 cursor-pointer"
                  >
                    {industryExpanded ? (
                      <>
                        收起分类
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        展开全部分类
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 资源类型 */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">资源类型</p>
                <div className="flex flex-col gap-1">
                  {RESOURCE_TYPES.map((type) => {
                    const isSelected = selectedResourceType === type;
                    const count = resourceTypeCounts[type] || 0;
                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedResourceType(type)}
                        className={cn(
                          "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <span className="truncate">{type}</span>
                        <span className="text-[10px] text-slate-400 ml-1">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main Content */}
          <div className="flex-1">
            {/* Search Bar and Results Bar (Referencing Products.tsx) */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="检索资源名称、数据来源、关联场景或联系人..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent shadow-sm transition-shadow"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    清空
                  </button>
                )}
              </div>
              <div className="flex items-center text-xs text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm whitespace-nowrap">
                <span>
                  找到 <strong className="text-blue-600 font-bold">{filteredResources.length}</strong> 项数据资源
                </span>
              </div>
            </div>

            {/* Results Grid */}
            {filteredResources.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <Database className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">未找到相关数据资源</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  尝试调整左侧的行业分类、资源类型或搜索关键字。
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  重置筛选条件
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {filteredResources.map((item, idx) => {
                  const TypeIcon = getResourceTypeIcon(item.type);
                  return (
                    <motion.article
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.3 }}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_14px_30px_rgba(15,118,110,0.08)]"
                    >
                      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-teal-400 to-transparent opacity-80" />
                      
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          {/* Header Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className="inline-flex items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                              <TypeIcon className="w-3 h-3 text-blue-600" />
                              {item.type}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                            {item.name}
                          </h3>

                          {/* Description */}
                          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Detail Grid */}
                          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] bg-slate-50/80 rounded-xl p-3 border border-slate-100">
                            <div>
                              <span className="text-slate-400">数据来源：</span>
                              <span className="font-medium text-slate-800">{item.source}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">更新频率：</span>
                              <span className="font-medium text-slate-800">{item.updateFrequency}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">数据规模：</span>
                              <span className="font-medium text-slate-800">{item.dataScale}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">资源格式：</span>
                              <span className="font-medium text-slate-800 truncate block">{item.format}</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.createdTime}
                          </span>

                          <Link
                            to={`/data-resources/${item.id}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 group-hover:translate-x-0.5 transition-all cursor-pointer"
                          >
                            查看详情
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 2: Register Form Modal (exact fields as screenshot) */}
      <AnimatePresence>
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-8 overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="w-5 h-5 text-blue-400" />
                    数据目录录入表单
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    设置数据资源的基本名称、类型描述、分类及信息项字段
                  </p>
                </div>
                <button
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleRegisterSubmit} className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
                {/* Row 1: 资源名称 & 资源类型 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>资源名称
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="请输入资源名称"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>资源类型
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(['数据库', 'API 接口', '文件', 'FTP/SFTP', 'OSS', '消息中间件'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormType(t)}
                          className={cn(
                            'px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer',
                            formType === t
                              ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold ring-1 ring-blue-500/20'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Row 2: 资源描述 */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    <span className="text-rose-500 mr-1">*</span>资源描述
                  </label>
                  <textarea
                    rows={3}
                    maxLength={100}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="请输入资源描述..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div className="text-right text-[11px] text-slate-400 mt-1">
                    {formDesc.length} / 100
                  </div>
                </div>

                {/* Row 3: 行业分类 & 资源格式 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>行业分类
                    </label>
                    <select
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      {INDUSTRY_CATEGORIES.filter((c) => c !== '全部行业').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>资源格式
                    </label>
                    <input
                      type="text"
                      value={formFormat}
                      onChange={(e) => setFormFormat(e.target.value)}
                      placeholder="请选择或输入资源格式，如 MySQL, Restful API, CSV"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 4: 数据来源 & 是否涉及个人信息 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>数据来源
                    </label>
                    <input
                      type="text"
                      value={formSource}
                      onChange={(e) => setFormSource(e.target.value)}
                      placeholder="请选择或输入数据来源单位"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>是否涉及个人信息
                    </label>
                    <select
                      value={formPersonalInfo}
                      onChange={(e) => setFormPersonalInfo(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="否">否</option>
                      <option value="是">是</option>
                      <option value="是（已脱敏）">是（已脱敏）</option>
                    </select>
                  </div>
                </div>

                {/* Row 5: 安全分级分类 & 更新频率 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>安全分级分类
                    </label>
                    <select
                      value={formSecurityLevel}
                      onChange={(e) => setFormSecurityLevel(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    >
                      <option value="1级（公开）">1级（公开）</option>
                      <option value="2级（受控）">2级（受控）</option>
                      <option value="3级（敏感）">3级（敏感）</option>
                      <option value="4级（核心）">4级（核心）</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      <span className="text-rose-500 mr-1">*</span>更新频率
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formFreqCount}
                        onChange={(e) => setFormFreqCount(e.target.value)}
                        placeholder="例如: 1"
                        className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <select
                        value={formFreqUnit}
                        onChange={(e) => setFormFreqUnit(e.target.value)}
                        className="w-1/2 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                      >
                        <option value="次/天">次/天</option>
                        <option value="实时">实时</option>
                        <option value="次/周">次/周</option>
                        <option value="次/月">次/月</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 6: 联系人 & 联系方式 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">联系人</label>
                    <input
                      type="text"
                      value={formContactPerson}
                      onChange={(e) => setFormContactPerson(e.target.value)}
                      placeholder="请输入联系人姓名"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">联系方式</label>
                    <input
                      type="text"
                      value={formContactPhone}
                      onChange={(e) => setFormContactPhone(e.target.value)}
                      placeholder="请输入联系方式 (电话/邮箱)"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 7: 数据规模 & 所属场景 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">数据规模</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formDataScaleVal}
                        onChange={(e) => setFormDataScaleVal(e.target.value)}
                        placeholder="请输入数据规模数字"
                        className="w-2/3 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                      />
                      <select
                        value={formDataScaleUnit}
                        onChange={(e) => setFormDataScaleUnit(e.target.value)}
                        className="w-1/3 rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                      >
                        <option value="GB">GB</option>
                        <option value="MB">MB</option>
                        <option value="TB">TB</option>
                        <option value="万条">万条</option>
                        <option value="次/秒">次/秒</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">所属场景</label>
                    <input
                      type="text"
                      value={formScenario}
                      onChange={(e) => setFormScenario(e.target.value)}
                      placeholder="请选择或输入所属场景"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Row 8: 其他补充 */}
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">其他补充信息</label>
                  <textarea
                    rows={2}
                    maxLength={100}
                    value={formExtraInfo}
                    onChange={(e) => setFormExtraInfo(e.target.value)}
                    placeholder="请输入其他补充信息..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Row 9: 信息项名称 & 信息项数据类型 */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 text-xs mb-2">信息项（Schema 字段）定义</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        信息项名称
                      </label>
                      <input
                        type="text"
                        value={formFieldName}
                        onChange={(e) => setFormFieldName(e.target.value)}
                        placeholder="请输入信息项名称，如 user_id, status"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        信息项数据类型
                      </label>
                      <input
                        type="text"
                        value={formFieldType}
                        onChange={(e) => setFormFieldType(e.target.value)}
                        placeholder="请输入数据类型，如 VARCHAR(64), INT, DATETIME"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer buttons */}
                <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRegisterModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    确认录入数据目录
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
