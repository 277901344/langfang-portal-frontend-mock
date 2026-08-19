import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Eye,
  Sliders,
  Check,
  X,
  RefreshCw,
  Send,
  Sparkles,
  Layers,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  ArrowDownCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  DemandExtendedItem,
  getStoredDemands,
  auditDemand,
  deleteDemand,
} from '../../lib/demandStore';

interface DemandAuditManagementProps {
  showToast: (msg: string) => void;
}

export function DemandAuditManagement({ showToast }: DemandAuditManagementProps) {
  const [demands, setDemands] = useState<DemandExtendedItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [auditFilter, setAuditFilter] = useState<string>('全部');
  const [topicFilter, setTopicFilter] = useState<string>('全部');

  // Modals
  const [selectedDemand, setSelectedDemand] = useState<DemandExtendedItem | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Audit Decision Form
  const [auditResult, setAuditResult] = useState<'审核通过' | '审核驳回' | '违规下架'>('审核通过');
  const [rejectReasonCategory, setRejectReasonCategory] = useState<string>('涉及个人敏感隐私未脱敏');
  const [auditComment, setAuditComment] = useState('');
  const [auditorName, setAuditorName] = useState('合规风控审查专员 (admin_lf)');

  const reloadData = () => {
    const list = getStoredDemands();
    setDemands(list);
  };

  React.useEffect(() => {
    reloadData();
  }, []);

  // Stats
  const stats = useMemo(() => {
    const total = demands.length;
    const pending = demands.filter((d) => d.auditStatus === '待审核').length;
    const approved = demands.filter((d) => d.auditStatus === '已通过').length;
    const rejected = demands.filter((d) => d.auditStatus === '已驳回').length;
    const takenDown = demands.filter((d) => d.auditStatus === '已下架').length;
    return { total, pending, approved, rejected, takenDown };
  }, [demands]);

  // Filtered Demands
  const filteredDemands = useMemo(() => {
    return demands.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.publisherOrg.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());

      let matchStatus = true;
      if (auditFilter === '待审核') matchStatus = item.auditStatus === '待审核';
      else if (auditFilter === '审核通过') matchStatus = item.auditStatus === '已通过';
      else if (auditFilter === '已驳回') matchStatus = item.auditStatus === '已驳回';
      else if (auditFilter === '已下架') matchStatus = item.auditStatus === '已下架';

      const matchTopic = topicFilter === '全部' || item.topicCategory === topicFilter;

      return matchSearch && matchStatus && matchTopic;
    });
  }, [demands, searchTerm, auditFilter, topicFilter]);

  // Open Audit Modal
  const handleOpenAuditModal = (item: DemandExtendedItem) => {
    setSelectedDemand(item);
    setAuditResult(item.auditStatus === '待审核' ? '审核通过' : (item.auditStatus as any) || '审核通过');
    setRejectReasonCategory(item.rejectReasonCategory || '涉及个人敏感隐私未脱敏');
    setAuditComment(
      item.auditStatus === '已驳回'
        ? item.rejectReason || ''
        : '经平台合规委员会审查，该需求发布主体资质真实合规，数据使用目的明确且符合可信数据空间密态计算准入规范，准予上架需求大厅。'
    );
    setIsAuditModalOpen(true);
  };

  // Submit Audit Decision
  const handleSaveAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDemand) return;
    if (!auditComment.trim()) {
      showToast('请填写审核意见或驳回说明');
      return;
    }

    const updated = auditDemand(
      selectedDemand.id,
      auditResult,
      auditComment.trim(),
      auditorName,
      auditResult === '审核驳回' || auditResult === '违规下架' ? rejectReasonCategory : undefined
    );

    setDemands(updated);
    setIsAuditModalOpen(false);

    if (auditResult === '审核通过') {
      showToast(`需求 [${selectedDemand.id}] 审核通过，已成功上架需求大厅！`);
    } else if (auditResult === '审核驳回') {
      showToast(`需求 [${selectedDemand.id}] 已驳回并退回需求方整改`);
    } else {
      showToast(`需求 [${selectedDemand.id}] 已执行违规下架`);
    }
  };

  const renderAuditStatusBadge = (item: DemandExtendedItem) => {
    if (item.auditStatus === '待审核') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 animate-pulse">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>待审核</span>
        </span>
      );
    }
    if (item.auditStatus === '已通过') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>审核通过·已上架</span>
        </span>
      );
    }
    if (item.auditStatus === '已驳回') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>审核已驳回</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
        <span>已下架</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Admin Audit Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-5 rounded-2xl border border-blue-800/40 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/40 rounded text-blue-300 font-mono text-[11px] font-bold">
              平台合规安全审核工作台
            </span>
            <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] font-bold">
              实时审核中
            </span>
          </div>
          <h3 className="text-lg font-bold">需求大厅·发布审核与撮合监管</h3>
          <p className="text-xs text-slate-300">
            把关需求大厅公开数据需求的数据安全、个人隐私合规及主体准入资质，确保跨域数据流通依法合规。
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] text-blue-200">待办审核需求</p>
            <p className="text-xl font-bold font-mono text-amber-300">{stats.pending}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-center">
            <p className="text-[10px] text-blue-200">今日已通过上架</p>
            <p className="text-xl font-bold font-mono text-emerald-300">{stats.approved}</p>
          </div>
        </div>
      </div>

      {/* Filter and Stats Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索需求编号、标题、发布机构、申请目的..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              {[
                { label: '全部', val: '全部', count: stats.total },
                { label: '待审核', val: '待审核', count: stats.pending, color: 'text-amber-700 font-bold' },
                { label: '审核通过', val: '审核通过', count: stats.approved, color: 'text-emerald-700' },
                { label: '已驳回', val: '已驳回', count: stats.rejected, color: 'text-rose-700' },
                { label: '已下架', val: '已下架', count: stats.takenDown, color: 'text-slate-500' },
              ].map((st) => (
                <button
                  key={st.val}
                  onClick={() => setAuditFilter(st.val)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs',
                    auditFilter === st.val
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
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="全部">全部行业主题</option>
              <option value="工业制造">工业制造</option>
              <option value="金融服务">金融服务</option>
              <option value="智慧交通">智慧交通</option>
              <option value="供应链物流">供应链物流</option>
              <option value="城市治理">城市治理</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] font-bold uppercase">
                <th className="py-3 px-4">需求编号 / 标题</th>
                <th className="py-3 px-4">发布主体与机构</th>
                <th className="py-3 px-4">行业分类与预算</th>
                <th className="py-3 px-4">提交审核时间</th>
                <th className="py-3 px-4">审核状态</th>
                <th className="py-3 px-4">审核批注 / 驳回原因</th>
                <th className="py-3 px-4 text-center">审核操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredDemands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p>暂无符合筛选条件的需求审核记录</p>
                  </td>
                </tr>
              ) : (
                filteredDemands.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      'hover:bg-slate-50 transition-colors',
                      item.auditStatus === '待审核' ? 'bg-amber-50/20' : ''
                    )}
                  >
                    <td className="py-3.5 px-4 max-w-[260px]">
                      <div className="space-y-1">
                        <span className="font-mono text-[11px] font-bold text-slate-400 block">{item.id}</span>
                        <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <p className="font-semibold text-slate-800 truncate">{item.publisherOrg}</p>
                      <p className="text-[11px] text-slate-500 font-mono">账号: {item.publisher}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-800">{item.topicCategory}</p>
                      <p className="text-[11px] text-slate-400">{item.budget || item.budgetAmount || '面议'}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                      {item.createdAt}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {renderAuditStatusBadge(item)}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      {item.auditStatus === '已驳回' ? (
                        <p className="text-rose-700 line-clamp-2 text-[11px]" title={item.rejectReason}>
                          <strong>[驳回]</strong> {item.rejectReason}
                        </p>
                      ) : item.auditStatus === '已通过' ? (
                        <p className="text-emerald-700 line-clamp-2 text-[11px]">
                          <strong>[已过审]</strong> 准予上架需求大厅公开撮合
                        </p>
                      ) : (
                        <span className="text-amber-600 font-semibold text-[11px]">等待合规专员审查...</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {item.auditStatus === '待审核' ? (
                          <button
                            onClick={() => handleOpenAuditModal(item)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-[11px] shadow-2xs transition-all cursor-pointer flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>立即审核</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenAuditModal(item)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1"
                            title="重新复核或更改上下架状态"
                          >
                            <Sliders className="w-3 h-3" />
                            <span>复核处置</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedDemand(item);
                            setIsHistoryModalOpen(true);
                          }}
                          className="px-2 py-1 hover:bg-slate-100 text-slate-600 font-medium rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          详情
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

      {/* MODAL 1: AUDIT OPERATION WORKBENCH */}
      {isAuditModalOpen && selectedDemand && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">需求合规性与数据安全审核工作台</h3>
              </div>
              <button onClick={() => setIsAuditModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAudit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
              {/* Review Target Details */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block">{selectedDemand.id}</span>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">{selectedDemand.title}</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-bold shrink-0">
                    {selectedDemand.topicCategory}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-slate-600 pt-2 border-t border-slate-200 text-[11px]">
                  <div>发布主体：<strong className="text-slate-800">{selectedDemand.publisherOrg}</strong></div>
                  <div>申请账号：<span className="font-mono">{selectedDemand.publisher}</span></div>
                  <div>预算额度：<strong className="text-slate-800">{selectedDemand.budget || selectedDemand.budgetAmount}</strong></div>
                  <div>截止日期：<span className="font-mono">{selectedDemand.deadline}</span></div>
                  <div>联系电话：<span className="font-mono">{selectedDemand.contactPhone}</span></div>
                  <div>提交时间：<span className="font-mono">{selectedDemand.createdAt}</span></div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold block mb-1">具体需求与技术要求描述：</span>
                    <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      {selectedDemand.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 font-bold block mb-1">使用目的与安全流通边界：</span>
                    <p className="text-slate-800 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                      {selectedDemand.usePurpose || '未详细填写使用目的'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Audit Decision Options */}
              <div className="space-y-3">
                <label className="font-bold text-sm text-slate-900 block">审核裁决结果 *</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAuditResult('审核通过');
                      setAuditComment('经平台合规委员会审查，该需求发布主体资质真实合规，数据使用目的明确且符合可信数据空间密态计算准入规范，准予上架需求大厅公开撮合。');
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border font-bold text-left cursor-pointer transition-all flex items-center gap-2',
                      auditResult === '审核通过'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-400/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs">审核通过</p>
                      <p className="text-[10px] text-slate-500 font-normal">准予上架公开撮合</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuditResult('审核驳回');
                      setAuditComment('经合规审查，该需求部分数据字段涉及个人未脱敏信息或使用目的合规依据不足，请整改为匿名化聚合指标后重新提交。');
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border font-bold text-left cursor-pointer transition-all flex items-center gap-2',
                      auditResult === '审核驳回'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-400/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <div>
                      <p className="text-xs">审核驳回</p>
                      <p className="text-[10px] text-slate-500 font-normal">退回需求方整改</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAuditResult('违规下架');
                      setAuditComment('该需求存在违规安全隐患或已过撮合有效期，予以强制下架封存。');
                    }}
                    className={cn(
                      'p-3.5 rounded-xl border font-bold text-left cursor-pointer transition-all flex items-center gap-2',
                      auditResult === '违规下架'
                        ? 'bg-slate-100 border-slate-500 text-slate-800 ring-2 ring-slate-400/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                  >
                    <ArrowDownCircle className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="text-xs">违规下架</p>
                      <p className="text-[10px] text-slate-500 font-normal">封存下架处理</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Reject Reason Category Selector */}
              {(auditResult === '审核驳回' || auditResult === '违规下架') && (
                <div className="space-y-1.5 bg-rose-50/50 p-4 rounded-xl border border-rose-200">
                  <label className="font-bold text-rose-900">驳回/处置原因分类 *</label>
                  <select
                    value={rejectReasonCategory}
                    onChange={(e) => setRejectReasonCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-xs text-rose-900 focus:outline-none"
                  >
                    <option value="涉及个人敏感隐私未脱敏">涉及个人敏感隐私未脱敏</option>
                    <option value="数据使用目的描述不清晰/超出合规边界">数据使用目的描述不清晰/超出合规边界</option>
                    <option value="发布主体资质不全或授权证明不足">发布主体资质不全或授权证明不足</option>
                    <option value="预算或技术参数与需求严重不符">预算或技术参数与需求严重不符</option>
                    <option value="其他合规风控原因">其他合规风控原因</option>
                  </select>
                </div>
              )}

              {/* Audit Comment */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">
                  审核审批意见与反馈说明 *
                </label>
                <textarea
                  rows={4}
                  required
                  value={auditComment}
                  onChange={(e) => setAuditComment(e.target.value)}
                  placeholder="填写具体的合规审查批注或整改建议，需求方将可查看此意见..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="p-4 bg-slate-50 border-t flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className={cn(
                    'px-6 py-2 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5',
                    auditResult === '审核通过'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : auditResult === '审核驳回'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-slate-800 hover:bg-slate-900'
                  )}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>确认提交审核决定</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FULL DETAIL & AUDIT LOGS */}
      {isHistoryModalOpen && selectedDemand && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">需求详情与全生命周期日志 [{selectedDemand.id}]</h3>
              <button onClick={() => setIsHistoryModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs text-slate-800 max-h-[75vh] overflow-y-auto">
              <div className="space-y-1">
                <span className="text-slate-400 font-mono">{selectedDemand.id}</span>
                <h4 className="font-bold text-sm text-slate-900">{selectedDemand.title}</h4>
                <p className="text-slate-600 mt-1">{selectedDemand.description}</p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2.5">
                <div>发布主体：<strong>{selectedDemand.publisherOrg}</strong></div>
                <div>行业主题：<strong>{selectedDemand.topicCategory}</strong></div>
                <div>预算金额：<strong>{selectedDemand.budget || selectedDemand.budgetAmount}</strong></div>
                <div>当前审核状态：<strong>{selectedDemand.auditStatus}</strong></div>
              </div>

              {/* Audit Timeline */}
              <div className="space-y-2 pt-2">
                <h5 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>审批流转历史记录</span>
                </h5>
                {(!selectedDemand.auditRecords || selectedDemand.auditRecords.length === 0) ? (
                  <p className="text-slate-400 italic">暂无历史审批记录</p>
                ) : (
                  <div className="space-y-2.5 border-l-2 border-slate-200 pl-4 ml-1">
                    {selectedDemand.auditRecords.map((rec, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold',
                            rec.auditResult === '审核通过'
                              ? 'bg-emerald-50 text-emerald-800'
                              : 'bg-rose-50 text-rose-800'
                          )}>
                            {rec.auditResult}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{rec.auditTime}</span>
                          <span className="text-slate-500 font-medium">{rec.auditor}</span>
                        </div>
                        <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                          {rec.auditComment}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t flex justify-end">
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
