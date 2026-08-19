import React, { useState, useMemo } from 'react';
import {
  Search,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  X,
  FileText,
  Clock,
  CheckCircle2,
  Layers,
  Coins,
  Package,
  Edit3,
  Trash2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  TradingRespondDemand,
  TradingPublishDemand,
  getStoredRespondDemands,
  saveRespondDemands,
  getStoredPublishDemands,
  savePublishDemands,
} from '../../data/tradingDemandData';

interface RespondDemandViewProps {
  onShowToast: (msg: string) => void;
}

export function RespondDemandView({ onShowToast }: RespondDemandViewProps) {
  const [demands, setDemands] = useState<TradingRespondDemand[]>(() => getStoredRespondDemands());
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedDemand, setSelectedDemand] = useState<TradingRespondDemand | null>(null);

  // Filter States
  const [demandType, setDemandType] = useState<string>('请选择');
  const [demandName, setDemandName] = useState<string>('');
  const [industry, setIndustry] = useState<string>('请选择');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Expanded Filter States
  const [pricingType, setPricingType] = useState<string>('请选择');
  const [deliveryFormat, setDeliveryFormat] = useState<string>('请选择');
  const [responseResult, setResponseResult] = useState<string>('请选择');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [jumpPage, setJumpPage] = useState<string>('1');

  // Respond Modal State (Strictly matches 响应需求操作.png)
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TradingRespondDemand | null>(null);
  const [modalSolutionDesc, setModalSolutionDesc] = useState('');
  const [modalPricingType, setModalPricingType] = useState('免费');
  const [modalQuoteAmount, setModalQuoteAmount] = useState('');
  const [modalDeliveryType, setModalDeliveryType] = useState('数据集');
  const [modalRelatedProduct, setModalRelatedProduct] = useState('691131000MA0GJFCJ8N6550PHFTSCZTV / v2');

  // Cancel respond state
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);

  const handleResetFilters = () => {
    setDemandType('请选择');
    setDemandName('');
    setIndustry('请选择');
    setPricingType('请选择');
    setDeliveryFormat('请选择');
    setResponseResult('请选择');
    setCurrentPage(1);
    onShowToast('筛选条件已重置');
  };

  const handleSearch = () => {
    setCurrentPage(1);
    onShowToast('已按条件查询我的认领记录');
  };

  // Filtered List (Demands responded/claimed by current user)
  const filteredData = useMemo(() => {
    return demands.filter((item) => {
      if (demandType !== '请选择' && demandType !== '全部' && item.demandType !== demandType) {
        return false;
      }
      if (demandName.trim() && !item.demandName.toLowerCase().includes(demandName.trim().toLowerCase())) {
        return false;
      }
      if (industry !== '请选择' && industry !== '全部' && item.industry !== industry) {
        return false;
      }
      if (pricingType !== '请选择' && pricingType !== '全部' && item.myPricingType !== pricingType) {
        return false;
      }
      if (deliveryFormat !== '请选择' && deliveryFormat !== '全部' && item.myDeliveryType !== deliveryFormat) {
        return false;
      }
      if (responseResult !== '请选择' && responseResult !== '全部' && item.responseResult !== responseResult) {
        return false;
      }
      return true;
    });
  }, [demands, demandType, demandName, industry, pricingType, deliveryFormat, responseResult]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  // Open Respond Modal (for editing response or responding to demand)
  const handleOpenRespondModal = (item: TradingRespondDemand) => {
    setEditingItem(item);
    setModalSolutionDesc(item.mySolutionDesc || '测试方案说明');
    setModalPricingType(item.myPricingType || '免费');
    setModalQuoteAmount(item.myQuoteAmount === '免费' || item.myQuoteAmount === '若免费可不填' ? '' : item.myQuoteAmount);
    setModalDeliveryType(item.myDeliveryType || '数据集');
    setModalRelatedProduct(item.myRelatedProduct || '691131000MA0GJFCJ8N6550PHFTSCZTV / v2');
    setIsRespondModalOpen(true);
  };

  // Submit Respond Form (Strictly matches 响应需求操作.png)
  const handleRespondSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updatedDemands = demands.map((d) => {
      if (d.id === editingItem.id) {
        return {
          ...d,
          mySolutionDesc: modalSolutionDesc.trim() || '测试方案说明',
          myPricingType: modalPricingType,
          myQuoteAmount: modalPricingType === '免费' || !modalQuoteAmount.trim() ? '免费' : modalQuoteAmount.trim(),
          myDeliveryType: modalDeliveryType,
          myRelatedProduct: modalRelatedProduct,
          respondTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
      }
      return d;
    });

    setDemands(updatedDemands);
    saveRespondDemands(updatedDemands);

    // Sync with publish demands store
    const storedPub = getStoredPublishDemands();
    const updatedPub = storedPub.map((p) => {
      if (p.id === editingItem.demandId) {
        const existingResponses = p.receivedResponses || [];
        const hasMyResponse = existingResponses.some((r) => r.responder === 'lfsc_admin');
        const myUpdatedResponse = {
          id: `SOL-${Date.now().toString().slice(-4)}`,
          responder: 'lfsc_admin',
          responderOrg: '廊坊市数城科技集团有限公司',
          solutionDesc: modalSolutionDesc.trim() || '测试方案说明',
          pricingType: modalPricingType,
          quoteAmount: modalPricingType === '免费' || !modalQuoteAmount.trim() ? '免费' : modalQuoteAmount.trim(),
          deliveryType: modalDeliveryType,
          relatedProduct: modalRelatedProduct,
          date: new Date().toISOString().slice(0, 16).replace('T', ' '),
          status: '待确认' as const,
        };

        const newResponses = hasMyResponse
          ? existingResponses.map((r) => (r.responder === 'lfsc_admin' ? myUpdatedResponse : r))
          : [myUpdatedResponse, ...existingResponses];

        return {
          ...p,
          responseStatus: '已被认领' as const,
          responseCount: newResponses.length,
          receivedResponses: newResponses,
        };
      }
      return p;
    });
    savePublishDemands(updatedPub);

    if (selectedDemand && selectedDemand.id === editingItem.id) {
      const refreshed = updatedDemands.find((d) => d.id === editingItem.id) || null;
      setSelectedDemand(refreshed);
    }

    setIsRespondModalOpen(false);
    onShowToast('响应方案已成功提交');
  };

  const handleCancelRespondConfirm = () => {
    if (!cancelTargetId) return;
    const updated = demands.filter((d) => d.id !== cancelTargetId);
    setDemands(updated);
    saveRespondDemands(updated);
    setCancelTargetId(null);
    if (selectedDemand && selectedDemand.id === cancelTargetId) {
      setViewMode('list');
      setSelectedDemand(null);
    }
    onShowToast('已撤回认领记录');
  };

  // ====================== 视图 1: 详情视图 (Strictly matches 数据提供方响应后的需求详情.png) ======================
  if (viewMode === 'detail' && selectedDemand) {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
              <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
              <span>需求概览</span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">{selectedDemand.demandName}</h2>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
              <div>
                <span className="text-slate-400">需求编号：</span>
                <span className="text-slate-800 font-mono">{selectedDemand.demandId}</span>
              </div>
              <div>
                <span className="text-slate-400">发布方：</span>
                <span className="text-slate-800">{selectedDemand.publisherOrg || 'lfssjj_admin'}</span>
              </div>
              <div>
                <span className="text-slate-400">发布时间：</span>
                <span className="text-slate-800 font-mono">2026-08-12 09:33</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-2">
              <div>
                <span className="text-slate-400">主题分类：</span>
                <span className="text-slate-800">{selectedDemand.industry || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400">应用场景：</span>
                <span className="text-slate-800">-</span>
              </div>
              <div>
                <span className="text-slate-400">截止日期：</span>
                <span className="text-slate-800 font-mono">{selectedDemand.deadline}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400">更新频次：</span>
              <span className="text-slate-800">每周</span>
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
              暂无详细描述
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
              <span className="text-slate-800">免费</span>
            </div>
            <div>
              <span className="text-slate-400">预算金额：</span>
              <span className="text-slate-800">-</span>
            </div>
            <div>
              <span className="text-slate-400">使用目的：</span>
              <span className="text-slate-800">-</span>
            </div>
          </div>
        </div>

        {/* Card 4: 我的响应 (Strictly matches 数据提供方响应后的需求详情.png) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-sm">
            <span className="w-1 h-3.5 bg-blue-600 rounded-full" />
            <span>我的响应 (1)</span>
          </div>

          <div className="p-4 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/50 space-y-2.5 transition-colors">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-xs">我的响应</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                {selectedDemand.responseResult === '待确认' ? '待处理' : selectedDemand.responseResult}
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div>
                <span className="text-slate-400">方案说明：</span>
                <span className="text-slate-700">{selectedDemand.mySolutionDesc || '测试方案说明'}</span>
              </div>
              <div>
                <span className="text-slate-400">报价：</span>
                <span className="text-slate-700">{selectedDemand.myQuoteAmount || '免费'}</span>
                <span className="text-slate-300 mx-2">|</span>
                <span className="text-slate-400">交付：</span>
                <span className="text-slate-700">{selectedDemand.myDeliveryType || '数据集'}</span>
              </div>
              <div>
                <span className="text-slate-400">关联商品：</span>
                <span className="text-slate-700 font-mono">{selectedDemand.myRelatedProduct || '691131000MA0GJFCJ8N6550PHFTSCZTV / v2'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====================== 视图 2: 表格列表模式 ======================
  return (
    <div className="space-y-4">
      {/* 筛选过滤区域 */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 筛选表单输入项 */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 flex-1">
            {/* 需求类型 */}
            <div className="flex items-center gap-2.5">
              <label className="text-xs text-slate-700 whitespace-nowrap">需求类型</label>
              <select
                value={demandType}
                onChange={(e) => setDemandType(e.target.value)}
                className="h-8 min-w-[140px] px-3 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:border-blue-400 focus:outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] cursor-pointer"
              >
                <option value="请选择">请选择</option>
                <option value="全部">全部类型</option>
                <option value="数据集">数据集</option>
                <option value="API产品">API产品</option>
                <option value="数据应用">数据应用</option>
                <option value="数据报告">数据报告</option>
                <option value="数字对象">数字对象</option>
                <option value="其他">其他</option>
              </select>
            </div>

            {/* 需求名称 */}
            <div className="flex items-center gap-2.5">
              <label className="text-xs text-slate-700 whitespace-nowrap">关联需求</label>
              <input
                type="text"
                value={demandName}
                onChange={(e) => setDemandName(e.target.value)}
                placeholder="请输入关联需求名称搜索..."
                className="h-8 w-44 sm:w-56 px-3 bg-white border border-slate-300 rounded text-xs text-slate-700 placeholder:text-slate-400 hover:border-blue-400 focus:outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF]"
              />
            </div>

            {/* 行业领域 */}
            <div className="flex items-center gap-2.5">
              <label className="text-xs text-slate-700 whitespace-nowrap">行业领域</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="h-8 min-w-[140px] px-3 bg-white border border-slate-300 rounded text-xs text-slate-700 hover:border-blue-400 focus:outline-none focus:border-[#1890FF] focus:ring-1 focus:ring-[#1890FF] cursor-pointer"
              >
                <option value="请选择">请选择</option>
                <option value="全部">全部行业</option>
                <option value="工业制造">工业制造</option>
                <option value="金融服务">金融服务</option>
                <option value="智慧城市">智慧城市</option>
                <option value="交通物流">交通物流</option>
                <option value="医疗健康">医疗健康</option>
                <option value="科技创新">科技创新</option>
                <option value="现代农业">现代农业</option>
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
        {/* 响应式数据表格 */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-slate-200 text-slate-700 text-xs font-semibold select-none">
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[200px]">关联需求名称</th>
                <th className="py-3 px-3.5 whitespace-nowrap">需求发起方</th>
                <th className="py-3 px-3.5 whitespace-nowrap">需求类型</th>
                <th className="py-3 px-3.5 whitespace-nowrap">我方定价</th>
                <th className="py-3 px-3.5 whitespace-nowrap">我方交付方式</th>
                <th className="py-3 px-3.5 whitespace-nowrap min-w-[150px]">关联产品</th>
                <th className="py-3 px-3.5 whitespace-nowrap">认领状态</th>
                <th className="py-3 px-3.5 whitespace-nowrap">截止日期</th>
                <th className="py-3 px-3.5 whitespace-nowrap">认领时间</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2 text-slate-400">
                      <FileText className="w-8 h-8 stroke-1 text-slate-300" />
                      <p className="text-xs">暂无认领需求方案记录</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 关联需求名称 */}
                    <td className="py-3 px-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDemand(item);
                          setViewMode('detail');
                        }}
                        className="font-medium text-slate-900 hover:text-[#1890FF] text-left transition-colors line-clamp-2 max-w-sm cursor-pointer"
                        title={item.demandName}
                      >
                        {item.demandName}
                      </button>
                    </td>

                    {/* 需求发起方 */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                      {item.publisherOrg}
                    </td>

                    {/* 需求类型 */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {item.demandType}
                      </span>
                    </td>

                    {/* 我方定价 */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-700 font-medium">
                      {item.myPricingType}
                    </td>

                    {/* 我方交付方式 */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600">
                      {item.myDeliveryType}
                    </td>

                    {/* 关联产品 */}
                    <td className="py-3 px-3.5 font-mono text-slate-600 text-[11px]">
                      <div className="line-clamp-1 max-w-[180px]" title={item.myRelatedProduct}>
                        {item.myRelatedProduct}
                      </div>
                    </td>

                    {/* 认领状态 */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border',
                          item.responseResult === '待确认' && 'bg-blue-50 text-blue-700 border-blue-200',
                          item.responseResult === '评审中' && 'bg-amber-50 text-amber-700 border-amber-200',
                          item.responseResult === '对接中' && 'bg-indigo-50 text-indigo-700 border-indigo-200',
                          item.responseResult === '已达成' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          item.responseResult === '已终止' && 'bg-slate-100 text-slate-600 border-slate-200'
                        )}
                      >
                        {item.responseResult === '待确认' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        {item.responseResult === '评审中' && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                        {item.responseResult === '对接中' && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                        {item.responseResult === '已达成' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                        {item.responseResult === '已终止' && <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                        <span>{item.responseResult === '待确认' ? '待处理' : item.responseResult}</span>
                      </span>
                    </td>

                    {/* 截止日期 */}
                    <td className="py-3 px-3.5 font-mono text-slate-600 whitespace-nowrap">
                      {item.deadline}
                    </td>

                    {/* 认领时间 */}
                    <td className="py-3 px-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {item.respondTime}
                    </td>

                    {/* 操作 */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDemand(item);
                          setViewMode('detail');
                        }}
                        className="text-[#1890FF] hover:text-[#096dd9] text-xs font-medium cursor-pointer"
                      >
                        详情
                      </button>
                    </td>
                  </tr>
                ))
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

      {/* ====================== 响应需求模态框 (Strictly matches 响应需求操作.png) ====================== */}
      {isRespondModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">响应需求</h3>
              <button
                type="button"
                onClick={() => setIsRespondModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleRespondSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              {/* 方案说明 */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 text-xs">
                  <span className="text-rose-500 mr-0.5">*</span> 方案说明
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    maxLength={500}
                    required
                    value={modalSolutionDesc}
                    onChange={(e) => setModalSolutionDesc(e.target.value)}
                    placeholder="请详细描述您针对该需求的响应方案、数据覆盖范围或技术保障能力"
                    className="w-full p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 resize-none pb-6"
                  />
                  <span className="absolute right-3 bottom-2 text-[10px] text-slate-400 pointer-events-none">
                    {modalSolutionDesc.length} / 500
                  </span>
                </div>
              </div>

              {/* Row 1: 定价方式 & 报价金额 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-700 text-xs">
                    <span className="text-rose-500 mr-0.5">*</span> 定价方式
                  </label>
                  <div className="relative">
                    <select
                      value={modalPricingType}
                      onChange={(e) => setModalPricingType(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="免费">免费</option>
                      <option value="按量付费">按量付费</option>
                      <option value="按项目交付">按项目交付</option>
                      <option value="包年订阅">包年订阅</option>
                      <option value="商务面议">商务面议</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-700 text-xs">报价金额</label>
                  <input
                    type="text"
                    value={modalQuoteAmount}
                    onChange={(e) => setModalQuoteAmount(e.target.value)}
                    placeholder="若免费可不填"
                    className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Row 2: 交付方式 & 关联产品 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-slate-700 text-xs">
                    <span className="text-rose-500 mr-0.5">*</span> 交付方式
                  </label>
                  <div className="relative">
                    <select
                      value={modalDeliveryType}
                      onChange={(e) => setModalDeliveryType(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="数据集">数据集</option>
                      <option value="API接口">API接口</option>
                      <option value="离线文件">离线文件</option>
                      <option value="密态计算">密态计算</option>
                      <option value="算法镜像">算法镜像</option>
                      <option value="数据报告">数据报告</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-slate-700 text-xs">关联产品</label>
                  <div className="relative">
                    <select
                      value={modalRelatedProduct}
                      onChange={(e) => setModalRelatedProduct(e.target.value)}
                      className="w-full h-9 px-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 appearance-none pr-8 focus:outline-none focus:border-blue-500 cursor-pointer"
                    >
                      <option value="691131000MA0GJFCJ8N6550PHFTSCZTV / v2">691131000MA0GJFCJ8N6550PHFTSCZTV / v2</option>
                      <option value="智慧足迹位置人口洞察API (v2)">智慧足迹位置人口洞察API (v2)</option>
                      <option value="临空跨境生鲜冷链多温区物联传感数据集">临空跨境生鲜冷链多温区物联传感数据集</option>
                      <option value="工业微电网动态削峰填谷智能调度算法镜像">工业微电网动态削峰填谷智能调度算法镜像</option>
                      <option value="普惠金融多方安全计算沙箱">普惠金融多方安全计算沙箱</option>
                      <option value="京津冀大宗物流多源数据流资产">京津冀大宗物流多源数据流资产</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRespondModalOpen(false)}
                  className="px-5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  取 消
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs cursor-pointer transition-colors"
                >
                  提交响应
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 确认撤销对话框 */}
      {cancelTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-base font-bold text-slate-900">确认撤销响应</h3>
            <p className="text-xs text-slate-600">撤销后需求方将不再能查看到您的响应方案，确认撤回？</p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelTargetId(null)}
                className="px-4 py-2 border rounded text-xs font-bold text-slate-600 cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleCancelRespondConfirm}
                className="px-4 py-2 bg-rose-600 text-white rounded text-xs font-bold cursor-pointer"
              >
                确认撤回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
