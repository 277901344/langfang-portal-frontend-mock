export type PortalProductFilterOption = {
  label: string;
  value: string;
  count?: number;
};

export type PortalProductListItem = {
  productId: string;
  productName: string;
  productType?: string;
  productTypeName?: string;
  description?: string;
  industryCategory?: string;
  industryCategoryName?: string;
  businessCategory?: string;
  deliveryType?: string;
  deliveryTypeName?: string;
  deliveryMethod?: string;
  connectorName?: string;
  organizationName?: string;
  portalProductImage?: string;
  scenarioId?: string;
  scenarioName?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  requiresTradingPlatform?: boolean; // 是否需要经过数据交易平台撮合
};

export type PortalProductDetail = PortalProductListItem & {
  portalCustomDescription?: string;
  resourceId?: string;
  updateFrequency?: string;
  updateFrequencyUnit?: string;
  dataAcquisition?: string;
  dataQualityLevel?: string;
  dataSecurityLevel?: string;
  serviceType?: string;
  personalInformation?: string;
  limitations?: string;
  dataSubject?: string;
  complianceAndLegalStatement?: string;
  dataSourceStatement?: string;
  aiTrainingLicense?: string;
  measureMethod?: string;
  unit?: string;
  price?: number;
  pricingModel?: string;
  accessConstraints?: string;
  evaluationReport?: string;
  deliveryInfo?: string;
  energyCategory?: string;
  scenario?: string;
  timeRange?: string;
  productRegion?: string;
  productRegionName?: string;
  deliveryMethod?: string;
  dataSize?: number;
  dataSizeUnit?: string;
  others?: string;
  isAuth?: number;
  requiresTradingPlatform?: boolean; // 是否需要经过数据交易平台撮合
};

export type PortalProductListResponse = {
  data: PortalProductListItem[];
  dataCount: number;
  pageCount: number;
  totalProductCount: number;
  industryCategoryOptions?: PortalProductFilterOption[];
  businessCategoryOptions?: PortalProductFilterOption[];
  scenarioOptions?: PortalProductFilterOption[];
  productTypeOptions: PortalProductFilterOption[];
  deliveryMethodOptions?: PortalProductFilterOption[];
  deliveryTypeOptions?: PortalProductFilterOption[];
};

const MOCK_PRODUCTS: PortalProductDetail[] = [
  {
    productId: 'LF-DP-001',
    productName: '公积金缴存人跨域核验信息服务',
    productType: 'API_PRODUCT',
    productTypeName: 'API产品',
    description: '提供公积金缴存状态、月缴存额、账户状态等核验能力，用于异地贷款和线上审批。',
    industryCategory: '金融服务',
    industryCategoryName: '金融服务',
    businessCategory: '公积金专题',
    scenarioId: 'sc-001',
    scenarioName: '公积金专题数据方案',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市住房公积金管理中心',
    organizationName: '廊坊市住房公积金管理中心',
    portalProductImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-06-01 09:30:00',
    updatedAt: '2026-07-18 16:20:00',
    publishedAt: '2026-06-05 10:00:00',
    portalCustomDescription: '<p>本产品作为“公积金专题数据方案”核心要素，支持跨区域秒级数据碰撞与协同核算。</p>',
    resourceId: 'RES-LF-GJJ-001',
    updateFrequency: '1',
    updateFrequencyUnit: '0',
    dataAcquisition: '04',
    dataQualityLevel: '3',
    dataSecurityLevel: '3',
    serviceType: '实时核验',
    personalInformation: '2',
    dataSubject: '01',
    measureMethod: '4',
    unit: '8',
    price: 0,
    pricingModel: '0',
    energyCategory: '公共服务',
    scenario: '职工异地购房提取公积金',
    timeRange: '近 36 个月',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 120,
    dataSizeUnit: '2',
    isAuth: 1,
  },
  {
    productId: 'LF-DP-005',
    productName: '公积金联名贷款商业银行联合授信评估数据',
    productType: 'API_PRODUCT',
    productTypeName: 'API产品',
    description: '基于脱敏后的住房公积金还款记录、企业连续缴存月份等指标，用于降低组合贷审查周期。',
    industryCategory: '金融服务',
    industryCategoryName: '金融服务',
    businessCategory: '公积金专题',
    scenarioId: 'sc-001',
    scenarioName: '公积金专题数据方案',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市住房公积金管理中心',
    organizationName: '廊坊市住房公积金管理中心',
    portalProductImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-06-10 11:20:00',
    updatedAt: '2026-07-20 15:10:00',
    publishedAt: '2026-06-15 10:00:00',
    portalCustomDescription: '<p>面向银行端公积金组合授信秒级初筛，实现信贷审查周期缩减70%。</p>',
    resourceId: 'RES-LF-GJJ-005',
    updateFrequency: '1',
    updateFrequencyUnit: '1',
    dataAcquisition: '04',
    dataQualityLevel: '3',
    dataSecurityLevel: '3',
    serviceType: '模型计算',
    personalInformation: '2',
    dataSubject: '01',
    measureMethod: '4',
    unit: '8',
    price: 0,
    pricingModel: '0',
    energyCategory: '金融服务',
    scenario: '公积金与商业组合贷联合审批',
    timeRange: '近 24 个月',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 95,
    dataSizeUnit: '2',
    isAuth: 1,
    requiresTradingPlatform: true,
  },
  {
    productId: 'LF-DP-003',
    productName: '公共卫生应急趋势多维数据集',
    productType: 'DATASET',
    productTypeName: '数据集',
    description: '汇聚发热门诊、急诊床位、重点病种趋势等统计指标，支撑公共卫生态势分析与应急资源调度。',
    industryCategory: '医疗健康',
    industryCategoryName: '医疗健康',
    businessCategory: '卫健医疗专题',
    scenarioId: 'sc-002',
    scenarioName: '卫健医疗数据可信方案',
    deliveryType: 'FILE_SERVICE',
    deliveryTypeName: '文件服务',
    deliveryMethod: '01',
    connectorName: '廊坊市卫生健康委员会',
    organizationName: '廊坊市卫生健康委员会',
    portalProductImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-05-20 13:00:00',
    updatedAt: '2026-07-25 09:00:00',
    publishedAt: '2026-05-28 09:00:00',
    portalCustomDescription: '<p>数据已脱敏聚合，用于“卫健医疗数据可信方案”中的态势感知与决策分析。</p>',
    resourceId: 'RES-LF-HEALTH-003',
    updateFrequency: '1',
    updateFrequencyUnit: '1',
    dataAcquisition: '02',
    dataQualityLevel: '2',
    dataSecurityLevel: '2',
    serviceType: '指标数据集',
    personalInformation: '0',
    dataSubject: '03',
    measureMethod: '5',
    unit: '5',
    price: 0,
    pricingModel: '0',
    energyCategory: '公共卫生',
    scenario: '公共卫生应急资源调度与早预警',
    timeRange: '近 12 个月',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 560,
    dataSizeUnit: '1',
    isAuth: 1,
  },
  {
    productId: 'LF-DP-006',
    productName: '医疗脱敏电子病历多维临床指标评价集',
    productType: 'FEDERATED_MODEL',
    productTypeName: '联邦学习模型',
    description: '采用联邦学习技术对诊疗路径进行隐私对齐，提供去标识化的临床统计特征，确保“可算不可识”。',
    industryCategory: '医疗健康',
    industryCategoryName: '医疗健康',
    businessCategory: '卫健医疗专题',
    scenarioId: 'sc-002',
    scenarioName: '卫健医疗数据可信方案',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市卫生健康委员会',
    organizationName: '廊坊市卫生健康委员会',
    portalProductImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-06-05 14:00:00',
    updatedAt: '2026-07-28 10:30:00',
    publishedAt: '2026-06-12 09:00:00',
    portalCustomDescription: '<p>支撑商业补充医疗保险线上直连核赔，保障敏感病例隐私安全。</p>',
    resourceId: 'RES-LF-HEALTH-006',
    updateFrequency: '1',
    updateFrequencyUnit: '2',
    dataAcquisition: '04',
    dataQualityLevel: '3',
    dataSecurityLevel: '3',
    serviceType: '联邦计算服务',
    personalInformation: '1',
    dataSubject: '01',
    measureMethod: '4',
    unit: '8',
    price: 0,
    pricingModel: '0',
    energyCategory: '医疗健康',
    scenario: '商业补充医疗保障险核保核赔评估',
    timeRange: '近 24 个月',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 310,
    dataSizeUnit: '2',
    isAuth: 1,
    requiresTradingPlatform: true,
  },
  {
    productId: 'LF-DP-002',
    productName: '企业法人信用与登记状态核验接口',
    productType: 'API_PRODUCT',
    productTypeName: 'API产品',
    description: '面向普惠金融和政企服务，提供企业登记状态、统一社会信用代码和经营状态核验。',
    industryCategory: '城市治理',
    industryCategoryName: '城市治理',
    businessCategory: '法人信用专题',
    scenarioId: 'sc-003',
    scenarioName: '法人信息跨域多维联控方案',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市行政审批局',
    organizationName: '廊坊市行政审批局',
    portalProductImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-06-12 10:15:00',
    updatedAt: '2026-07-22 14:40:00',
    publishedAt: '2026-06-18 11:00:00',
    portalCustomDescription: '<p>支撑中小微金融服务“免材料”信用背书与便捷授信。</p>',
    resourceId: 'RES-LF-CREDIT-002',
    updateFrequency: '1',
    updateFrequencyUnit: '0',
    dataAcquisition: '04',
    dataQualityLevel: '3',
    dataSecurityLevel: '2',
    serviceType: '核验接口',
    personalInformation: '0',
    dataSubject: '02',
    measureMethod: '4',
    unit: '8',
    price: 0,
    pricingModel: '0',
    energyCategory: '政务服务',
    scenario: '中小微企业金融授信与公共普惠贷款',
    timeRange: '当前有效状态',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 80,
    dataSizeUnit: '2',
    isAuth: 1,
  },
  {
    productId: 'LF-DP-007',
    productName: '企业法人涉诉与经营异常严重失信交叉评价库',
    productType: 'API_PRODUCT',
    productTypeName: 'API产品',
    description: '汇算全市法人涉及严重失信、经营异常等维度，提供经可信数据方案可追溯的单次加密碰撞接口。',
    industryCategory: '城市治理',
    industryCategoryName: '城市治理',
    businessCategory: '法人信用专题',
    scenarioId: 'sc-003',
    scenarioName: '法人信息跨域多维联控方案',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市市场监督管理局',
    organizationName: '廊坊市市场监督管理局',
    portalProductImage: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-06-18 09:00:00',
    updatedAt: '2026-07-29 11:20:00',
    publishedAt: '2026-06-25 10:00:00',
    portalCustomDescription: '<p>用于重大工程招标资质核查及政策红包“免审即享”过滤。</p>',
    resourceId: 'RES-LF-CREDIT-007',
    updateFrequency: '1',
    updateFrequencyUnit: '1',
    dataAcquisition: '04',
    dataQualityLevel: '3',
    dataSecurityLevel: '3',
    serviceType: '单次加密碰撞',
    personalInformation: '0',
    dataSubject: '02',
    measureMethod: '4',
    unit: '8',
    price: 0,
    pricingModel: '0',
    energyCategory: '市场监管',
    scenario: '重大工程招标资质核查及一票否决核验',
    timeRange: '近 5 年累计',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 140,
    dataSizeUnit: '2',
    isAuth: 1,
    requiresTradingPlatform: true,
  },
  {
    productId: 'LF-DP-004',
    productName: '不动产确权真伪核验公共接口',
    productType: 'API_PRODUCT',
    productTypeName: 'API产品',
    description: '用于房产金融场景的产权一致性核验，在可信数据方案下保障个人房产权属核心隐私不出域。',
    industryCategory: '金融服务',
    industryCategoryName: '金融服务',
    businessCategory: '不动产生态专题',
    scenarioId: 'sc-004',
    scenarioName: '不动产确权金融联办可信方案',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市自然资源和规划局',
    organizationName: '廊坊市自然资源和规划局',
    portalProductImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-04-26 08:45:00',
    updatedAt: '2026-07-29 17:35:00',
    publishedAt: '2026-05-08 10:00:00',
    portalCustomDescription: '<p>用于商业银行经营性个人房产贷款、二手房产权真实核实。</p>',
    resourceId: 'RES-LF-ESTATE-004',
    updateFrequency: '1',
    updateFrequencyUnit: '0',
    dataAcquisition: '01',
    dataQualityLevel: '3',
    dataSecurityLevel: '3',
    serviceType: '实时核验',
    personalInformation: '2',
    dataSubject: '01',
    measureMethod: '4',
    unit: '8',
    price: 0,
    pricingModel: '0',
    energyCategory: '不动产',
    scenario: '商业银行经营性个人房产贷款真伪核算',
    timeRange: '当前有效状态',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 45,
    dataSizeUnit: '2',
    isAuth: 1,
  },
  {
    productId: 'LF-DP-008',
    productName: '不动产抵押及查封状态动态监测报警数据',
    productType: 'API_PRODUCT',
    productTypeName: 'API产品',
    description: '提供房产动态查封、涉质、土地变更预降级信息订阅，触发差分发布报警。',
    industryCategory: '金融服务',
    industryCategoryName: '金融服务',
    businessCategory: '不动产生态专题',
    scenarioId: 'sc-004',
    scenarioName: '不动产确权金融联办可信方案',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市自然资源和规划局',
    organizationName: '廊坊市自然资源和规划局',
    portalProductImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-05-15 10:00:00',
    updatedAt: '2026-07-30 16:10:00',
    publishedAt: '2026-05-22 09:00:00',
    portalCustomDescription: '<p>防范重复抵押与押品查封脱网风险，保障抵押资产生命周期安全。</p>',
    resourceId: 'RES-LF-ESTATE-008',
    updateFrequency: '1',
    updateFrequencyUnit: '0',
    dataAcquisition: '01',
    dataQualityLevel: '3',
    dataSecurityLevel: '3',
    serviceType: '订阅推送',
    personalInformation: '2',
    dataSubject: '01',
    measureMethod: '4',
    unit: '8',
    price: 0,
    pricingModel: '0',
    energyCategory: '不动产',
    scenario: '银行抵押类信贷资产全生命周期风险审查',
    timeRange: '实时更新',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 110,
    dataSizeUnit: '2',
    isAuth: 1,
    requiresTradingPlatform: true,
  },
];

function delay<T>(data: T, ms = 160) {
  return new Promise<T>((resolve) => {
    window.setTimeout(() => resolve(data), ms);
  });
}

function countOptions(items: PortalProductDetail[], key: keyof PortalProductDetail, labelKey?: keyof PortalProductDetail) {
  const counts = new Map<string, PortalProductFilterOption>();
  items.forEach((item) => {
    const value = String(item[key] || '').trim();
    if (!value) return;
    const label = String((labelKey ? item[labelKey] : item[key]) || value).trim();
    const current = counts.get(value);
    counts.set(value, {
      label,
      value,
      count: (current?.count || 0) + 1,
    });
  });
  return Array.from(counts.values());
}

export async function getPortalProducts(params: {
  keyword?: string;
  industryCategory?: string;
  businessCategory?: string;
  scenario?: string;
  productType?: string;
  deliveryMethod?: string;
  pageNum?: number;
  pageSize?: number;
}) {
  const keyword = params.keyword?.trim().toLowerCase();
  const filtered = MOCK_PRODUCTS.filter((product) => {
    const matchesKeyword = !keyword || [
      product.productName,
      product.description,
      product.connectorName,
      product.organizationName,
      product.industryCategoryName,
      product.scenarioName,
    ].some((value) => value?.toLowerCase().includes(keyword));
    const matchesIndustry = !params.industryCategory || product.industryCategory === params.industryCategory || product.industryCategoryName === params.industryCategory;
    const matchesScenario = !params.scenario || product.scenarioId === params.scenario || product.scenarioName === params.scenario;
    const matchesProductType = !params.productType || product.productType === params.productType || product.productTypeName === params.productType;
    const matchesDelivery = !params.deliveryMethod || product.deliveryMethod === params.deliveryMethod || product.deliveryType === params.deliveryMethod;
    return matchesKeyword && matchesIndustry && matchesScenario && matchesProductType && matchesDelivery;
  });

  const pageSize = Math.max(1, params.pageSize || 10);
  const pageNum = Math.max(1, params.pageNum || 1);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const start = (pageNum - 1) * pageSize;

  return delay<PortalProductListResponse>({
    data: filtered.slice(start, start + pageSize),
    dataCount: filtered.length,
    pageCount,
    totalProductCount: MOCK_PRODUCTS.length,
    industryCategoryOptions: countOptions(MOCK_PRODUCTS, 'industryCategory', 'industryCategoryName'),
    businessCategoryOptions: countOptions(MOCK_PRODUCTS, 'businessCategory'),
    scenarioOptions: countOptions(MOCK_PRODUCTS, 'scenarioId', 'scenarioName'),
    productTypeOptions: countOptions(MOCK_PRODUCTS, 'productType', 'productTypeName'),
    deliveryMethodOptions: countOptions(MOCK_PRODUCTS, 'deliveryMethod'),
    deliveryTypeOptions: countOptions(MOCK_PRODUCTS, 'deliveryType', 'deliveryTypeName'),
  });
}

export async function getPortalProductDetail(productId: string) {
  const normalizedId = (productId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const product = MOCK_PRODUCTS.find((item) => {
    const itemNorm = item.productId.toLowerCase().replace(/[^a-z0-9]/g, '');
    return item.productId === productId || itemNorm === normalizedId || itemNorm.includes(normalizedId) || normalizedId.includes(itemNorm);
  });
  if (!product) {
    // If still not found, return the first mock product as graceful fallback
    if (MOCK_PRODUCTS.length > 0) {
      return delay<PortalProductDetail>(MOCK_PRODUCTS[0]);
    }
    throw new Error('产品不存在');
  }
  return delay<PortalProductDetail>(product);
}

export function getProductsByScenario(scenarioIdOrName: string) {
  return MOCK_PRODUCTS.filter(
    (product) =>
      product.scenarioId === scenarioIdOrName ||
      product.scenarioName === scenarioIdOrName
  );
}

