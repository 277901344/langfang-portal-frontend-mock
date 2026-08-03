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
  connectorName?: string;
  organizationName?: string;
  portalProductImage?: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
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
};

export type PortalProductListResponse = {
  data: PortalProductListItem[];
  dataCount: number;
  pageCount: number;
  totalProductCount: number;
  industryCategoryOptions?: PortalProductFilterOption[];
  businessCategoryOptions?: PortalProductFilterOption[];
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
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市住房公积金管理中心',
    organizationName: '廊坊市住房公积金管理中心',
    portalProductImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-06-01 09:30:00',
    updatedAt: '2026-07-18 16:20:00',
    publishedAt: '2026-06-05 10:00:00',
    portalCustomDescription: '<p>该 mock 产品演示跨部门数据核验能力，页面不访问任何后端接口。</p>',
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
    scenario: '异地公积金贷款额度测算',
    timeRange: '近 36 个月',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 120,
    dataSizeUnit: '2',
    isAuth: 1,
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
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市行政审批局',
    organizationName: '廊坊市行政审批局',
    portalProductImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-06-12 10:15:00',
    updatedAt: '2026-07-22 14:40:00',
    publishedAt: '2026-06-18 11:00:00',
    portalCustomDescription: '<p>用于演示法人主题数据产品详情，支持本地 mock 搜索、筛选和详情跳转。</p>',
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
    scenario: '中小微企业授信材料免提交',
    timeRange: '当前有效状态',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 80,
    dataSizeUnit: '2',
    isAuth: 1,
  },
  {
    productId: 'LF-DP-003',
    productName: '公共卫生应急趋势多维数据集',
    productType: 'DATASET',
    productTypeName: '数据集',
    description: '汇聚发热门诊、急诊床位、重点病种趋势等统计指标，支撑公共卫生态势分析。',
    industryCategory: '医疗健康',
    industryCategoryName: '医疗健康',
    businessCategory: '卫健医疗专题',
    deliveryType: 'FILE_SERVICE',
    deliveryTypeName: '文件服务',
    deliveryMethod: '01',
    connectorName: '廊坊市卫生健康委员会',
    organizationName: '廊坊市卫生健康委员会',
    portalProductImage: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-05-20 13:00:00',
    updatedAt: '2026-07-25 09:00:00',
    publishedAt: '2026-05-28 09:00:00',
    portalCustomDescription: '<p>数据已脱敏聚合，仅用于前端离线演示。</p>',
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
    scenario: '公共卫生应急资源调度',
    timeRange: '近 12 个月',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 560,
    dataSizeUnit: '1',
    isAuth: 1,
  },
  {
    productId: 'LF-DP-004',
    productName: '不动产确权真伪核验公共接口',
    productType: 'API_PRODUCT',
    productTypeName: 'API产品',
    description: '用于房产金融场景的产权一致性核验，演示可信数据空间下的隐私保护查询。',
    industryCategory: '金融服务',
    industryCategoryName: '金融服务',
    businessCategory: '不动产生态专题',
    deliveryType: 'API_SERVICE',
    deliveryTypeName: 'API服务',
    deliveryMethod: '03',
    connectorName: '廊坊市自然资源和规划局',
    organizationName: '廊坊市自然资源和规划局',
    portalProductImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200',
    createdAt: '2026-04-26 08:45:00',
    updatedAt: '2026-07-29 17:35:00',
    publishedAt: '2026-05-08 10:00:00',
    portalCustomDescription: '<p>本地 mock 版本仅展示产品信息和详情结构，不执行真实产权查询。</p>',
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
    scenario: '线上房产抵押审核',
    timeRange: '当前有效状态',
    productRegion: '131000',
    productRegionName: '廊坊市',
    dataSize: 45,
    dataSizeUnit: '2',
    isAuth: 1,
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
      product.businessCategory,
      product.industryCategoryName,
    ].some((value) => value?.toLowerCase().includes(keyword));
    const matchesIndustry = !params.industryCategory || product.industryCategory === params.industryCategory || product.industryCategoryName === params.industryCategory;
    const matchesBusiness = !params.businessCategory || product.businessCategory === params.businessCategory;
    const matchesProductType = !params.productType || product.productType === params.productType || product.productTypeName === params.productType;
    const matchesDelivery = !params.deliveryMethod || product.deliveryMethod === params.deliveryMethod || product.deliveryType === params.deliveryMethod;
    return matchesKeyword && matchesIndustry && matchesBusiness && matchesProductType && matchesDelivery;
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
    productTypeOptions: countOptions(MOCK_PRODUCTS, 'productType', 'productTypeName'),
    deliveryMethodOptions: countOptions(MOCK_PRODUCTS, 'deliveryMethod'),
    deliveryTypeOptions: countOptions(MOCK_PRODUCTS, 'deliveryType', 'deliveryTypeName'),
  });
}

export async function getPortalProductDetail(productId: string) {
  const product = MOCK_PRODUCTS.find((item) => item.productId === productId);
  if (!product) {
    throw new Error('产品不存在');
  }
  return delay<PortalProductDetail>(product);
}
