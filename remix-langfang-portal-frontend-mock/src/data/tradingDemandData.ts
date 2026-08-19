export interface ReceivedResponseSolution {
  id: string;
  responder: string;
  responderOrg: string;
  solutionDesc: string; // 响应方案说明
  pricingType: string; // 定价方式: 免费 / 按次计费 / 包月
  quoteAmount: string; // 报价金额
  deliveryType: string; // 交付方式 / 产品类型: 数据集 / API产品 / 数据应用 / 数据报告 / 数字对象 / 其他
  relatedProduct: string; // 关联产品
  date: string;
  status: '待确认' | '评审中' | '对接中' | '已达成' | '已终止';
}

export type DemandProductType = '数据集' | 'API产品' | '数据应用' | '数据报告' | '数字对象' | '其他';
export type DemandBudgetType = '免费' | '按次计费' | '包月';
export type DemandPublishStatus = '已发布' | '已有响应' | '已匹配' | '已关闭' | '已过期' | '未发布';

export interface TradingPublishDemand {
  id: string;
  demandType?: string; // 兼容字段
  name: string;
  publisher: string;
  publisherOrg: string;
  productType: DemandProductType; // 产品类型: 数据集 / API产品 / 数据应用 / 数据报告 / 数字对象 / 其他
  deliveryFormat?: string; // 兼容字段
  industry: string; // 工业制造, 金融服务, 智慧城市, 交通物流, 医疗健康, 科技创新, 现代农业
  deadline: string;
  status: DemandPublishStatus; // 状态: 已发布 / 已有响应 / 已匹配 / 已关闭 / 已过期 / 未发布
  publishStatus?: DemandPublishStatus; // 兼容字段
  responseStatus: '待认领' | '已被认领' | '对接中' | '已达成';
  responseCount: number; // 收到认领数
  publishTime: string;
  budget?: string; // 预算金额
  budgetType: DemandBudgetType; // 预算类型: 免费 / 按次计费 / 包月
  description?: string; // 需求描述
  applicationScene?: string; // 应用场景
  updateFrequency?: string; // 更新频次
  usePurpose?: string; // 使用目的
  expectedFields?: string[]; // 期望字段
  contactPerson?: string;
  contactPhone?: string;
  receivedResponses?: ReceivedResponseSolution[]; // 收到的认领方案列表
}

export interface TradingRespondDemand {
  id: string; // 认领记录编号 (如 RSP20260818001)
  demandId: string; // 关联需求ID
  demandName: string; // 关联需求名称
  publisherOrg: string; // 需求发起方
  demandType: string; // 需求类型 / 产品类型
  industry: string; // 行业领域
  deliveryFormat: string; // 产品类型 / 交付形态
  myPricingType: string; // 我方定价方式
  myQuoteAmount: string; // 我方报价金额
  myDeliveryType: string; // 我方交付方式
  myRelatedProduct: string; // 关联产品
  mySolutionDesc: string; // 响应方案说明
  responseResult: '待确认' | '评审中' | '对接中' | '已达成' | '已终止'; // 认领结果/状态
  deadline: string; // 需求截止日期
  respondTime: string; // 认领提交时间
  responder: string; // 响应人
  contactPerson?: string;
  contactPhone?: string;
}

const STORAGE_PUBLISH_KEY = 'LF_TRADING_PUBLISH_DEMANDS_V8';
const STORAGE_RESPOND_KEY = 'LF_TRADING_RESPOND_DEMANDS_V8';

export function clearTradingStorage(): void {
  try {
    // Clear all previous versions of demand keys
    const keysToRemove = [
      'LF_TRADING_PUBLISH_DEMANDS_V1',
      'LF_TRADING_PUBLISH_DEMANDS_V2',
      'LF_TRADING_PUBLISH_DEMANDS_V3',
      'LF_TRADING_PUBLISH_DEMANDS_V4',
      'LF_TRADING_PUBLISH_DEMANDS_V5',
      'LF_TRADING_PUBLISH_DEMANDS_V6',
      'LF_TRADING_PUBLISH_DEMANDS_V7',
      'LF_TRADING_PUBLISH_DEMANDS_V8',
      'LF_TRADING_RESPOND_DEMANDS_V1',
      'LF_TRADING_RESPOND_DEMANDS_V2',
      'LF_TRADING_RESPOND_DEMANDS_V3',
      'LF_TRADING_RESPOND_DEMANDS_V4',
      'LF_TRADING_RESPOND_DEMANDS_V5',
      'LF_TRADING_RESPOND_DEMANDS_V6',
      'LF_TRADING_RESPOND_DEMANDS_V7',
      'LF_TRADING_RESPOND_DEMANDS_V8',
    ];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    localStorage.setItem(STORAGE_PUBLISH_KEY, JSON.stringify(initialPublishDemands));
    localStorage.setItem(STORAGE_RESPOND_KEY, JSON.stringify(initialRespondDemands));
  } catch (e) {
    console.error('Failed to clear trading storage', e);
  }
}

export const initialPublishDemands: TradingPublishDemand[] = [
  {
    id: 'DM-20260812-0003',
    demandType: '数据集',
    name: '测试门户3',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊市数据局',
    productType: '数据集',
    deliveryFormat: '数据集',
    industry: '智慧城市',
    deadline: '2026-08-29',
    status: '已有响应',
    publishStatus: '已有响应',
    responseStatus: '已被认领',
    responseCount: 1,
    publishTime: '2026-08-12 09:33',
    budget: '-',
    budgetType: '免费',
    description: '暂无详细描述',
    applicationScene: '城市综合运行监测',
    updateFrequency: '每周',
    usePurpose: '城市运行体征基础数据对齐',
    expectedFields: ['事件ID', '发生区域', '处置状态'],
    contactPerson: '管理员',
    contactPhone: '173****2231',
    receivedResponses: [
      {
        id: 'SOL-001',
        responder: 'lfssjj_admin',
        responderOrg: '廊坊市数城科技集团有限公司',
        solutionDesc: '11',
        pricingType: '免费',
        quoteAmount: '免费',
        deliveryType: '数据集',
        relatedProduct: '691131000MA0GJFCJ8N6550PHFTSCZTV / v2',
        date: '2026-08-12 10:20',
        status: '待确认',
      },
    ],
  },
  {
    id: 'REQ20260816002',
    demandType: '数据应用',
    name: '工业园区绿色低碳用电负荷峰谷智能预测算法与数据应用',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊市数据局',
    productType: '数据应用',
    deliveryFormat: '数据应用',
    industry: '工业制造',
    deadline: '2026-09-30',
    status: '已匹配',
    publishStatus: '已匹配',
    responseStatus: '已达成',
    responseCount: 1,
    publishTime: '2026-08-16 15:40',
    budget: '30 万元',
    budgetType: '包月',
    description: '针对园区100余家制造业企业用电负荷历史时序数据，构建高精度的短期及中期峰谷用电负荷智能预测模型。',
    applicationScene: '工业微电网动态削峰填谷智能调度',
    updateFrequency: '每日',
    usePurpose: '评估园区绿色用电与碳减排指标，提升清洁能源消纳比。',
    expectedFields: ['企业社会信用代码(脱敏)', '用电时序读数', '峰谷用电占比', '绿电消纳量', '碳排放估算值'],
    contactPerson: '王工',
    contactPhone: '173****2231',
    receivedResponses: [
      {
        id: 'SOL-004',
        responder: 'lfsc_admin',
        responderOrg: '国网河北省电力有限公司廊坊供电分公司',
        solutionDesc: '临空区域气象雷达 API 联调方案',
        pricingType: '免费',
        quoteAmount: '免费',
        deliveryType: '数据集',
        relatedProduct: '691131000MA0GJFCJ8N6550PHFTSCZTV / v2',
        date: '2026-08-17 11:30',
        status: '对接中',
      },
    ],
  },
  {
    id: 'REQ20260818001',
    demandType: 'API产品',
    name: '廊坊临空经济区多式联运货流溯源高频轨迹数据需求',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊临空经济区管委会智慧交通处',
    productType: 'API产品',
    deliveryFormat: 'API产品',
    industry: '交通物流',
    deadline: '2026-10-30',
    status: '已发布',
    publishStatus: '已发布',
    responseStatus: '待认领',
    responseCount: 0,
    publishTime: '2026-08-18 10:24',
    budget: '50 万元',
    budgetType: '按次计费',
    description: '需要接入京津冀区域多式联运冷链与大宗商品货运流转高频轨迹，用于综合交通运力调度和碳足迹监测。',
    applicationScene: '跨境多式联运物流调度与碳足迹核算',
    updateFrequency: '每周',
    usePurpose: '用于临空区多式联运大数据运力智能调配与绿色低碳物流示范。',
    expectedFields: ['车辆/集装箱编号(脱敏)', '经纬度时序轨迹', '瞬时速度与载重比', '冷链多点温度监控', '报关卡口放行时间戳'],
    contactPerson: '王工',
    contactPhone: '173****2231',
    receivedResponses: [],
  },
  {
    id: 'REQ20260810003',
    demandType: '数据报告',
    name: '2026年廊坊市重点产业链供应链韧性分析与景气指数报告',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊市工信局',
    productType: '数据报告',
    deliveryFormat: '数据报告',
    industry: '科技创新',
    deadline: '2026-08-15',
    status: '已过期',
    publishStatus: '已过期',
    responseStatus: '待认领',
    responseCount: 0,
    publishTime: '2026-08-10 09:15',
    budget: '15 万元',
    budgetType: '按次计费',
    description: '需编制关于装备制造、电子信息产业链上下游关联企业经营状况与风险预警深度研究分析报告。',
    applicationScene: '产业链全景监测与补链强链分析',
    updateFrequency: '每月',
    usePurpose: '为产业引导基金与政策扶持提供决策支撑。',
    expectedFields: ['企业纳税评级', '专利创新产出', '供应链上下游依存度'],
    contactPerson: '刘主任',
    contactPhone: '173****2231',
    receivedResponses: [],
  },
  {
    id: 'REQ20260805004',
    demandType: '数字对象',
    name: '可信数据空间跨域身份数字凭证与链上确权标识资产',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊数港可信基础设施运营组',
    productType: '数字对象',
    deliveryFormat: '数字对象',
    industry: '智慧城市',
    deadline: '2026-08-01',
    status: '已关闭',
    publishStatus: '已关闭',
    responseStatus: '已达成',
    responseCount: 0,
    publishTime: '2026-08-01 14:00',
    budget: '-',
    budgetType: '免费',
    description: '针对首期数据空间入驻主体的可验证数字凭证 (VC/DID) 对象进行联调，目前已完成首批签发并归档。',
    applicationScene: '跨域身份认证与数字凭证鉴权',
    updateFrequency: '不定期',
    usePurpose: '空间参与方可信身份核验。',
    expectedFields: ['DID标识符', '公钥凭证', '签发机构数字签名'],
    contactPerson: '赵工',
    contactPhone: '173****2231',
    receivedResponses: [],
  },
  {
    id: 'REQ20260819005',
    demandType: '其他',
    name: '京津冀协同发展区域商贸流通与冷链集散综合定制化需求',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊市商业联合会',
    productType: '其他',
    deliveryFormat: '其他',
    industry: '现代农业',
    deadline: '2026-09-25',
    status: '未发布',
    publishStatus: '未发布',
    responseStatus: '待认领',
    responseCount: 0,
    publishTime: '2026-08-19 10:00',
    budget: '20 万元',
    budgetType: '按次计费',
    description: '针对京津冀主要农产品批发市场进出港品类、销量、价格与冷链溯源进行多源数据融合定制。',
    applicationScene: '菜篮子保供稳价与产销对接',
    updateFrequency: '每日',
    usePurpose: '区域农产品供应链风险监测与价格波动预警。',
    expectedFields: ['品类编码', '批发成交均价', '产地溯源码', '进场车辆载重'],
    contactPerson: '李经理',
    contactPhone: '173****2231',
    receivedResponses: [],
  },
];

export const initialRespondDemands: TradingRespondDemand[] = [
  {
    id: 'RSP-20260812-001',
    demandId: 'DM-20260812-003',
    demandName: '测试门户3',
    publisherOrg: '廊坊市数据局',
    demandType: '数据集',
    industry: '-',
    deliveryFormat: '数据集',
    myPricingType: '免费',
    myQuoteAmount: '若免费可不填',
    myDeliveryType: '数据集',
    myRelatedProduct: '691131000MA0GJFCJ8N6550PHFTSCZTV / v2',
    mySolutionDesc: '测试方案说明',
    responseResult: '待确认',
    deadline: '2026-08-29',
    respondTime: '2026-08-12 10:20',
    responder: 'lfsc_admin',
    contactPerson: '王经理',
    contactPhone: '186****5678',
  },
  {
    id: 'RSP20260818001',
    demandId: 'REQ20260818001',
    demandName: '廊坊临空经济区多式联运货流溯源高频轨迹数据集',
    publisherOrg: '廊坊临空经济区管委会智慧交通处',
    demandType: '数据集',
    industry: '交通物流',
    deliveryFormat: 'API接口',
    myPricingType: '免费',
    myQuoteAmount: '若免费可不填',
    myDeliveryType: '数据集',
    myRelatedProduct: '智慧足迹位置人口洞察API (v2)',
    mySolutionDesc: '提供覆盖京津冀骨干公路网络与铁路场站的实时货运轨迹合规脱敏API，具备高并发毫秒级时空索引检索与GIS渲染能力。',
    responseResult: '待确认',
    deadline: '2026-10-30',
    respondTime: '2026-08-18 14:10',
    responder: 'lfsc_admin',
    contactPerson: '李总监',
    contactPhone: '173****2231',
  },
];

export function getStoredPublishDemands(): TradingPublishDemand[] {
  try {
    const raw = localStorage.getItem(STORAGE_PUBLISH_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_PUBLISH_KEY, JSON.stringify(initialPublishDemands));
      return initialPublishDemands;
    }
    return JSON.parse(raw);
  } catch {
    return initialPublishDemands;
  }
}

export function savePublishDemands(data: TradingPublishDemand[]): void {
  try {
    localStorage.setItem(STORAGE_PUBLISH_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save publish demands', e);
  }
}

export function getStoredRespondDemands(): TradingRespondDemand[] {
  try {
    const raw = localStorage.getItem(STORAGE_RESPOND_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_RESPOND_KEY, JSON.stringify(initialRespondDemands));
      return initialRespondDemands;
    }
    return JSON.parse(raw);
  } catch {
    return initialRespondDemands;
  }
}

export function saveRespondDemands(data: TradingRespondDemand[]): void {
  try {
    localStorage.setItem(STORAGE_RESPOND_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save respond demands', e);
  }
}
