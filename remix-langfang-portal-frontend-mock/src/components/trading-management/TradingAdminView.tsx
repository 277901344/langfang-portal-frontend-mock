import { useMemo, useState } from 'react';
import {
  BanknoteArrowUp,
  Eye,
  PackageCheck,
  RefreshCw,
  Search,
  WalletCards,
  X,
} from 'lucide-react';
import {
  billingRecords,
  initialAccounts,
  initialCommodities,
  initialFlows,
  initialOrders,
  type FundAccount,
  type TradingCommodity,
  type TradingOrder,
} from '../../data/tradingAdminData';

export type TradingAdminViewId = 'commodity_management' | 'trade_order' | 'fund_management' | 'billing_management';

interface TradingAdminViewProps {
  view: TradingAdminViewId;
  onShowToast: (message: string) => void;
}

const money = (value: number) => `¥${value.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`;

const statusStyles: Record<string, string> = {
  已上架: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  审核中: 'border-amber-200 bg-amber-50 text-amber-700',
  已下架: 'border-slate-200 bg-slate-100 text-slate-600',
  待确认: 'border-amber-200 bg-amber-50 text-amber-700',
  交付中: 'border-blue-200 bg-blue-50 text-blue-700',
  已完成: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  已取消: 'border-rose-200 bg-rose-50 text-rose-700',
};

function StatusBadge({ value }: { value: string }) {
  return <span className={`inline-flex rounded border px-2 py-0.5 text-[11px] font-semibold ${statusStyles[value] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>{value}</span>;
}

function Toolbar({ keyword, onKeywordChange, status, statuses, onStatusChange, onRefresh }: {
  keyword: string;
  onKeywordChange: (value: string) => void;
  status?: string;
  statuses?: string[];
  onStatusChange?: (value: string) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-3">
      <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input value={keyword} onChange={(event) => onKeywordChange(event.target.value)} placeholder="搜索编号、名称或主体" className="h-9 w-full rounded border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      </div>
      {statuses && onStatusChange && (
        <select value={status} onChange={(event) => onStatusChange(event.target.value)} className="h-9 rounded border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-blue-400">
          <option value="全部">全部状态</option>
          {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      )}
      <button type="button" onClick={onRefresh} className="inline-flex h-9 items-center gap-1.5 rounded border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:border-blue-300 hover:text-blue-600">
        <RefreshCw className="h-3.5 w-3.5" />刷新
      </button>
    </div>
  );
}

function PageFrame({ title, description, action, children }: { title: string; description: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5">
        <div><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-[11px] text-slate-500">{description}</p></div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyRow({ columns }: { columns: number }) {
  return <tr><td colSpan={columns} className="px-4 py-12 text-center text-xs text-slate-400">暂无符合条件的数据</td></tr>;
}

function DetailDialog({ title, rows, onClose }: { title: string; rows: Array<[string, React.ReactNode]>; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-md bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><h3 className="text-sm font-bold text-slate-900">{title}</h3><button type="button" onClick={onClose} title="关闭" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button></div>
        <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-3 p-5 text-xs">{rows.map(([label, value]) => <div className="contents" key={label}><dt className="text-slate-500">{label}</dt><dd className="font-medium text-slate-800">{value}</dd></div>)}</dl>
        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-5 py-3"><button type="button" onClick={onClose} className="rounded bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500">关闭</button></div>
      </div>
    </div>
  );
}

function CommodityView({ onShowToast }: Pick<TradingAdminViewProps, 'onShowToast'>) {
  const [items, setItems] = useState(initialCommodities);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('全部');
  const [selected, setSelected] = useState<TradingCommodity | null>(null);
  const filtered = useMemo(() => items.filter((item) => (status === '全部' || item.status === status) && [item.id, item.name, item.provider].join(' ').toLowerCase().includes(keyword.toLowerCase())), [items, keyword, status]);
  const toggle = (item: TradingCommodity) => {
    const nextStatus = item.status === '已上架' ? '已下架' : '已上架';
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: nextStatus } : entry));
    onShowToast(`${item.name} 已${nextStatus === '已上架' ? '上架' : '下架'}`);
  };
  return <PageFrame title="商品管理" description="管理数据商品的审核、发布与上下架状态" action={<span className="text-xs text-slate-500">共 {filtered.length} 项</span>}>
    <Toolbar keyword={keyword} onKeywordChange={setKeyword} status={status} statuses={['已上架', '审核中', '已下架']} onStatusChange={setStatus} onRefresh={() => onShowToast('商品数据已刷新')} />
    <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead className="bg-white text-slate-500"><tr>{['商品编号', '商品名称', '分类 / 交付', '提供方', '定价', '状态', '更新时间', '操作'].map((label) => <th key={label} className="border-b border-slate-200 px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.length ? filtered.map((item) => <tr key={item.id} className="hover:bg-blue-50/30"><td className="px-4 py-3 font-mono text-[11px] text-slate-500">{item.id}</td><td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td><td className="px-4 py-3 text-slate-600">{item.category}<span className="mx-1 text-slate-300">/</span>{item.delivery}</td><td className="px-4 py-3 text-slate-600">{item.provider}</td><td className="px-4 py-3 font-semibold text-slate-800">{money(item.price)}</td><td className="px-4 py-3"><StatusBadge value={item.status} /></td><td className="px-4 py-3 text-slate-500">{item.updatedAt}</td><td className="px-4 py-3"><div className="flex items-center gap-2"><button type="button" onClick={() => setSelected(item)} title="查看详情" className="text-blue-600 hover:text-blue-800"><Eye className="h-4 w-4" /></button><button type="button" onClick={() => toggle(item)} disabled={item.status === '审核中'} className="text-[11px] font-semibold text-blue-600 disabled:text-slate-300">{item.status === '已上架' ? '下架' : '上架'}</button></div></td></tr>) : <EmptyRow columns={8} />}</tbody></table></div>
    {selected && <DetailDialog title="商品详情" onClose={() => setSelected(null)} rows={[["商品编号", selected.id], ["商品名称", selected.name], ["数据分类", selected.category], ["提供主体", selected.provider], ["交付方式", selected.delivery], ["商品定价", money(selected.price)], ["当前状态", <StatusBadge value={selected.status} />]]} />}
  </PageFrame>;
}

function OrderView({ onShowToast }: Pick<TradingAdminViewProps, 'onShowToast'>) {
  const [items, setItems] = useState(initialOrders);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('全部');
  const [selected, setSelected] = useState<TradingOrder | null>(null);
  const filtered = useMemo(() => items.filter((item) => (status === '全部' || item.status === status) && [item.orderNo, item.title, item.buyer, item.seller].join(' ').toLowerCase().includes(keyword.toLowerCase())), [items, keyword, status]);
  const advance = (item: TradingOrder) => {
    const next = item.status === '待确认' ? '交付中' : item.status === '交付中' ? '已完成' : item.status;
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: next } : entry));
    onShowToast(`订单 ${item.orderNo} 已更新为${next}`);
  };
  return <PageFrame title="交易订单" description="统一查看交易来源、交易双方、金额与履约进度" action={<span className="text-xs text-slate-500">交易额 {money(filtered.reduce((sum, item) => sum + item.amount, 0))}</span>}>
    <Toolbar keyword={keyword} onKeywordChange={setKeyword} status={status} statuses={['待确认', '交付中', '已完成', '已取消']} onStatusChange={setStatus} onRefresh={() => onShowToast('订单数据已刷新')} />
    <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-xs"><thead><tr>{['订单编号', '交易内容', '来源', '数据需求方', '数据提供方', '订单金额', '状态', '创建时间', '操作'].map((label) => <th key={label} className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.length ? filtered.map((item) => <tr key={item.id} className="hover:bg-blue-50/30"><td className="px-4 py-3 font-mono text-[11px] text-blue-600">{item.orderNo}</td><td className="px-4 py-3 font-semibold text-slate-800">{item.title}</td><td className="px-4 py-3 text-slate-600">{item.source}</td><td className="px-4 py-3 text-slate-600">{item.buyer}</td><td className="px-4 py-3 text-slate-600">{item.seller}</td><td className="px-4 py-3 font-semibold">{money(item.amount)}</td><td className="px-4 py-3"><StatusBadge value={item.status} /></td><td className="px-4 py-3 text-slate-500">{item.createdAt}</td><td className="px-4 py-3"><div className="flex gap-2"><button type="button" onClick={() => setSelected(item)} title="查看详情" className="text-blue-600"><Eye className="h-4 w-4" /></button>{['待确认', '交付中'].includes(item.status) && <button type="button" onClick={() => advance(item)} className="text-[11px] font-semibold text-blue-600">推进</button>}</div></td></tr>) : <EmptyRow columns={9} />}</tbody></table></div>
    {selected && <DetailDialog title="订单详情" onClose={() => setSelected(null)} rows={[["订单编号", selected.orderNo], ["交易内容", selected.title], ["订单来源", selected.source], ["数据需求方", selected.buyer], ["数据提供方", selected.seller], ["订单金额", money(selected.amount)], ["履约状态", <StatusBadge value={selected.status} />]]} />}
  </PageFrame>;
}

function FundView({ onShowToast }: Pick<TradingAdminViewProps, 'onShowToast'>) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [keyword, setKeyword] = useState('');
  const filtered = useMemo(() => accounts.filter((item) => [item.subjectName, item.identityCode, item.role].join(' ').toLowerCase().includes(keyword.toLowerCase())), [accounts, keyword]);
  const recharge = (account: FundAccount) => {
    setAccounts((current) => current.map((item) => item.id === account.id ? { ...item, balance: item.balance + 10000, rechargeTotal: item.rechargeTotal + 10000 } : item));
    onShowToast(`${account.subjectName} 已模拟充值 ${money(10000)}`);
  };
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-3">{[{ label: '账户总余额', value: money(accounts.reduce((sum, item) => sum + item.balance, 0)), icon: WalletCards }, { label: '累计充值', value: money(accounts.reduce((sum, item) => sum + item.rechargeTotal, 0)), icon: BanknoteArrowUp }, { label: '累计交易收入', value: money(accounts.reduce((sum, item) => sum + item.incomeTotal, 0)), icon: PackageCheck }].map(({ label, value, icon: Icon }) => <div key={label} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-4 shadow-sm"><div><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div><Icon className="h-5 w-5 text-blue-500" /></div>)}</div>
    <PageFrame title="资金账户" description="查询交易主体余额、累计充值、扣费与收入"><Toolbar keyword={keyword} onKeywordChange={setKeyword} onRefresh={() => onShowToast('资金账户已刷新')} /><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-xs"><thead><tr>{['主体名称', '主体标识', '账户角色', '当前余额', '累计充值', '累计扣费', '累计收入', '操作'].map((label) => <th key={label} className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((item) => <tr key={item.id} className="hover:bg-blue-50/30"><td className="px-4 py-3 font-semibold text-slate-800">{item.subjectName}</td><td className="px-4 py-3 font-mono text-[11px] text-slate-500">{item.identityCode}</td><td className="px-4 py-3">{item.role}</td><td className="px-4 py-3 font-bold text-slate-900">{money(item.balance)}</td><td className="px-4 py-3 text-slate-600">{money(item.rechargeTotal)}</td><td className="px-4 py-3 text-slate-600">{money(item.debitTotal)}</td><td className="px-4 py-3 text-emerald-700">{money(item.incomeTotal)}</td><td className="px-4 py-3"><button type="button" onClick={() => recharge(item)} className="text-[11px] font-semibold text-blue-600">充值 1 万</button></td></tr>)}</tbody></table></div></PageFrame>
    <PageFrame title="最近资金流水" description="展示充值、扣款和入账记录"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-xs"><thead><tr>{['流水号', '操作类型', '主体名称', '金额', '关联订单', '操作人', '操作时间'].map((label) => <th key={label} className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{initialFlows.map((item) => <tr key={item.id}><td className="px-4 py-3 font-mono text-[11px] text-blue-600">{item.flowNo}</td><td className="px-4 py-3">{item.type}</td><td className="px-4 py-3">{item.subjectName}</td><td className={`px-4 py-3 font-semibold ${item.amount >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>{item.amount >= 0 ? '+' : ''}{money(item.amount)}</td><td className="px-4 py-3 text-slate-500">{item.orderNo || '-'}</td><td className="px-4 py-3">{item.operator}</td><td className="px-4 py-3 text-slate-500">{item.createdAt}</td></tr>)}</tbody></table></div></PageFrame></div>;
}

function BillingView({ onShowToast }: Pick<TradingAdminViewProps, 'onShowToast'>) {
  const [refreshedAt, setRefreshedAt] = useState('2026-08-19 10:30');
  const totalUsage = billingRecords.reduce((sum, item) => sum + item.usageValue, 0);
  const totalAmount = billingRecords.reduce((sum, item) => sum + item.amount, 0);
  const refresh = () => { const time = new Date().toLocaleString('zh-CN', { hour12: false }); setRefreshedAt(time); onShowToast('计费数据刷新完成'); };
  return <div className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[['计量订单数', `${billingRecords.length} 笔`], ['累计使用量', totalUsage.toLocaleString('zh-CN')], ['当前累计金额', money(totalAmount)], ['最近计量时间', refreshedAt]].map(([label, value]) => <div key={label} className="rounded-md border border-slate-200 bg-white p-4 shadow-sm"><p className="text-[11px] text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-slate-900">{value}</p></div>)}</div><PageFrame title="订单计费汇总" description="按交易订单汇总数据调用、计费用量和累计金额" action={<button type="button" onClick={refresh} className="inline-flex h-8 items-center gap-1.5 rounded bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-500"><RefreshCw className="h-3.5 w-3.5" />刷新计费</button>}><div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-xs"><thead><tr>{['订单编号', '商品', '使用次数', '累计使用量', '当前累计金额', '最近计量时间', '计量状态'].map((label) => <th key={label} className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-500">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{billingRecords.map((item) => <tr key={item.id} className="hover:bg-blue-50/30"><td className="px-4 py-3 font-mono text-[11px] text-blue-600">{item.orderNo}</td><td className="px-4 py-3 font-semibold text-slate-800">{item.commodityName}</td><td className="px-4 py-3">{item.usageCount}</td><td className="px-4 py-3">{item.usageValue.toLocaleString('zh-CN')}</td><td className="px-4 py-3 font-bold">{money(item.amount)}</td><td className="px-4 py-3 text-slate-500">{item.latestAt}</td><td className="px-4 py-3"><StatusBadge value="已完成" /></td></tr>)}</tbody></table></div></PageFrame></div>;
}

export function TradingAdminView({ view, onShowToast }: TradingAdminViewProps) {
  if (view === 'commodity_management') return <CommodityView onShowToast={onShowToast} />;
  if (view === 'trade_order') return <OrderView onShowToast={onShowToast} />;
  if (view === 'fund_management') return <FundView onShowToast={onShowToast} />;
  return <BillingView onShowToast={onShowToast} />;
}
