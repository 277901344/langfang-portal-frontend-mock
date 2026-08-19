export type CommodityStatus = '已上架' | '审核中' | '已下架';
export type OrderStatus = '待确认' | '交付中' | '已完成' | '已取消';

export interface TradingCommodity {
  id: string;
  name: string;
  category: string;
  provider: string;
  delivery: string;
  price: number;
  status: CommodityStatus;
  updatedAt: string;
}

export interface TradingOrder {
  id: string;
  orderNo: string;
  title: string;
  source: string;
  buyer: string;
  seller: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

export interface FundAccount {
  id: string;
  subjectName: string;
  identityCode: string;
  role: string;
  balance: number;
  rechargeTotal: number;
  debitTotal: number;
  incomeTotal: number;
}

export interface FundFlow {
  id: string;
  flowNo: string;
  type: string;
  subjectName: string;
  amount: number;
  orderNo?: string;
  operator: string;
  createdAt: string;
}

export interface BillingRecord {
  id: string;
  orderNo: string;
  commodityName: string;
  usageCount: number;
  usageValue: number;
  amount: number;
  latestAt: string;
}

export const initialCommodities: TradingCommodity[] = [
  { id: 'DC-20260801', name: '京津冀企业经营风险画像数据', category: '金融数据', provider: '廊坊市数据集团', delivery: 'API', price: 2800, status: '已上架', updatedAt: '2026-08-19 10:18' },
  { id: 'DC-20260802', name: '临空经济区物流时效指数', category: '物流数据', provider: '廊坊临空产业发展有限公司', delivery: '文件', price: 1600, status: '已上架', updatedAt: '2026-08-19 09:42' },
  { id: 'DC-20260803', name: '园区能耗与碳排放监测数据', category: '能源数据', provider: '河北绿色能源服务中心', delivery: 'API', price: 3600, status: '审核中', updatedAt: '2026-08-18 16:20' },
  { id: 'DC-20260804', name: '城市商圈客流热力月报', category: '商业数据', provider: '廊坊智慧城市运营中心', delivery: '报告', price: 980, status: '已下架', updatedAt: '2026-08-17 14:06' },
  { id: 'DC-20260805', name: '制造业供应链景气指数', category: '产业数据', provider: '北方工业数据联合体', delivery: '文件', price: 2200, status: '已上架', updatedAt: '2026-08-16 11:35' },
];

export const initialOrders: TradingOrder[] = [
  { id: 'ORD-1', orderNo: 'JY202608190001', title: '企业经营风险画像数据采购', source: '数据市场', buyer: '廊坊银行股份有限公司', seller: '廊坊市数据集团', amount: 5600, status: '待确认', createdAt: '2026-08-19 09:30' },
  { id: 'ORD-2', orderNo: 'JY202608180017', title: '物流时效指数季度订阅', source: '需求撮合', buyer: '河北物流科技有限公司', seller: '廊坊临空产业发展有限公司', amount: 4800, status: '交付中', createdAt: '2026-08-18 15:12' },
  { id: 'ORD-3', orderNo: 'JY202608170009', title: '制造业供应链景气指数采购', source: '数据市场', buyer: '北方供应链管理有限公司', seller: '北方工业数据联合体', amount: 2200, status: '已完成', createdAt: '2026-08-17 11:08' },
  { id: 'ORD-4', orderNo: 'JY202608160003', title: '城市客流热力分析报告', source: '需求撮合', buyer: '广阳区商业联合会', seller: '廊坊智慧城市运营中心', amount: 1960, status: '已取消', createdAt: '2026-08-16 10:25' },
];

export const initialAccounts: FundAccount[] = [
  { id: 'FA-001', subjectName: '廊坊银行股份有限公司', identityCode: 'LFDS-BANK-001', role: '数据需求方', balance: 128600, rechargeTotal: 300000, debitTotal: 171400, incomeTotal: 0 },
  { id: 'FA-002', subjectName: '廊坊市数据集团', identityCode: 'LFDS-DATA-008', role: '数据提供方', balance: 286600, rechargeTotal: 50000, debitTotal: 21400, incomeTotal: 258000 },
  { id: 'FA-003', subjectName: '河北物流科技有限公司', identityCode: 'LFDS-LOGI-016', role: '数据需求方', balance: 78600, rechargeTotal: 120000, debitTotal: 41400, incomeTotal: 0 },
];

export const initialFlows: FundFlow[] = [
  { id: 'FL-1', flowNo: 'LS202608190021', type: '充值', subjectName: '廊坊银行股份有限公司', amount: 50000, operator: '平台运营员', createdAt: '2026-08-19 08:20' },
  { id: 'FL-2', flowNo: 'LS202608190018', type: '交易扣款', subjectName: '廊坊银行股份有限公司', amount: -5600, orderNo: 'JY202608190001', operator: '交易系统', createdAt: '2026-08-19 09:31' },
  { id: 'FL-3', flowNo: 'LS202608180066', type: '交易入账', subjectName: '廊坊临空产业发展有限公司', amount: 4800, orderNo: 'JY202608180017', operator: '交易系统', createdAt: '2026-08-18 15:13' },
];

export const billingRecords: BillingRecord[] = [
  { id: 'BL-1', orderNo: 'JY202608190001', commodityName: '京津冀企业经营风险画像数据', usageCount: 128, usageValue: 4260, amount: 5600, latestAt: '2026-08-19 10:30' },
  { id: 'BL-2', orderNo: 'JY202608180017', commodityName: '临空经济区物流时效指数', usageCount: 86, usageValue: 3180, amount: 4800, latestAt: '2026-08-19 10:12' },
  { id: 'BL-3', orderNo: 'JY202608170009', commodityName: '制造业供应链景气指数', usageCount: 42, usageValue: 1560, amount: 2200, latestAt: '2026-08-18 17:45' },
];
