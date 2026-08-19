export interface EcoPartner {
  id: string;
  name: string; // 脱敏企业名称, e.g. '廊坊市***科技有限公司'
  shortName: string;
  roleType: '数据供给侧' | '数据需求侧' | '运营治理侧' | '技术支撑侧';
  roleBadge: string;
  logoPlaceholderText: string;
  verified: boolean;
  joinedDate: string;
  nodeStatus: '在线' | '试运行' | '备用节点';
  location: string;
  industry: string;
  capabilities: string[];
  description: string;
  contributedResourcesCount: number;
  respondedDemandsCount: number;
  contactPerson: string;
  contactPhone: string;
}

export interface EcoDemandLink {
  id: string;
  title: string;
  publisherOrg: string; // 脱敏企业主体
  type: string;
  category: string;
  budget: string;
  deadline: string;
  responseCount: number;
  status: '可响应' | '对接中' | '已完成';
}

export const mockEcoPartners: EcoPartner[] = [
  {
    id: 'PARTNER-001',
    name: '廊坊市***科技有限公司',
    shortName: '廊坊***科技',
    roleType: '数据需求侧',
    roleBadge: '核心需求方',
    logoPlaceholderText: '[ 廊坊***科技 Logo 占位 ]',
    verified: true,
    joinedDate: '2025-11-15',
    nodeStatus: '在线',
    location: '河北省廊坊市广阳区',
    industry: '金融科技与信用风险',
    capabilities: ['联合风控模型', '企业征信评级', 'TEE密态计算应用'],
    description: '专注于基于可信数据空间打造中小微企业跨域联合授信评估，提供发票与税收数据深度算法建模服务。',
    contributedResourcesCount: 2,
    respondedDemandsCount: 8,
    contactPerson: '张经理',
    contactPhone: '173****2231',
  },
  {
    id: 'PARTNER-002',
    name: '河北***数据集团有限公司',
    shortName: '河北***数据',
    roleType: '数据供给侧',
    roleBadge: '公共数据要素供给源',
    logoPlaceholderText: '[ 河北***数据 Logo 占位 ]',
    verified: true,
    joinedDate: '2025-08-20',
    nodeStatus: '在线',
    location: '河北省石家庄市 / 廊坊节点',
    industry: '公共数据运营与要素流通',
    capabilities: ['海量数据集治理', '数据要素资产化', '数据 API 极速交付'],
    description: '省市级数据要素一级开发与公共数据授权运营主体，提供多领域脱敏数据集与分布式接口节点。',
    contributedResourcesCount: 18,
    respondedDemandsCount: 12,
    contactPerson: '李主管',
    contactPhone: '186****9012',
  },
  {
    id: 'PARTNER-003',
    name: '北京***信息技术有限公司',
    shortName: '北京***信息',
    roleType: '技术支撑侧',
    roleBadge: '可信基础设施节点',
    logoPlaceholderText: '[ 北京***信息 Logo 占位 ]',
    verified: true,
    joinedDate: '2025-09-10',
    nodeStatus: '在线',
    location: '北京市海淀区',
    industry: '隐私计算与密态基础设施',
    capabilities: ['联邦学习平台', '数据连接器部署', '硬件 TEE 飞地算力'],
    description: '提供国产可信数据空间基础设施与可信连接器构建服务，具备跨算力中心的密态多方安全计算实力。',
    contributedResourcesCount: 5,
    respondedDemandsCount: 15,
    contactPerson: '王总监',
    contactPhone: '138****5566',
  },
  {
    id: 'PARTNER-004',
    name: '天津***数字科技股份有限公司',
    shortName: '天津***数科',
    roleType: '数据供给侧',
    roleBadge: '港口物流数据源',
    logoPlaceholderText: '[ 天津***数科 Logo 占位 ]',
    verified: true,
    joinedDate: '2025-10-05',
    nodeStatus: '在线',
    location: '天津市滨海新区',
    industry: '智慧物流与供应链',
    capabilities: ['海关提单数据分析', '跨省物流轨迹跟踪', '多式联运运力评估'],
    description: '提供京津冀区域跨境物流与多式联运全链路脱敏数据，助力跨区域供应链金融与保理结算。',
    contributedResourcesCount: 12,
    respondedDemandsCount: 6,
    contactPerson: '赵部长',
    contactPhone: '139****7788',
  },
  {
    id: 'PARTNER-005',
    name: '廊坊***智算科技有限公司',
    shortName: '廊坊***智算',
    roleType: '技术支撑侧',
    roleBadge: '算力与空间运维',
    logoPlaceholderText: '[ 廊坊***智算 Logo 占位 ]',
    verified: true,
    joinedDate: '2025-12-01',
    nodeStatus: '在线',
    location: '河北省廊坊市安次区',
    industry: '算力中心与密态环境',
    capabilities: ['智算集群托管', '可信空间监控', '日志区块链存证'],
    description: '负责廊坊城市可信数据空间底座节点维护与安全隔离算力调度，确保数据可用不可见。',
    contributedResourcesCount: 3,
    respondedDemandsCount: 9,
    contactPerson: '刘工',
    contactPhone: '150****3344',
  },
  {
    id: 'PARTNER-006',
    name: '河北***金融科技有限公司',
    shortName: '河北***金科',
    roleType: '数据需求侧',
    roleBadge: '金融场景应用',
    logoPlaceholderText: '[ 河北***金科 Logo 占位 ]',
    verified: true,
    joinedDate: '2026-01-10',
    nodeStatus: '在线',
    location: '河北省廊坊市开发区',
    industry: '数字金融与保险科技',
    capabilities: ['普惠金融风险画像', '商业保险快捷理赔', '动态额度模型'],
    description: '对接电力、税务与公积金数据，开展绿色信贷及中小企业无抵押首贷智能审查。',
    contributedResourcesCount: 1,
    respondedDemandsCount: 11,
    contactPerson: '陈经理',
    contactPhone: '177****8899',
  },
  {
    id: 'PARTNER-007',
    name: '廊坊***医药数据服务有限公司',
    shortName: '廊坊***医药',
    roleType: '数据供给侧',
    roleBadge: '医疗健康专区',
    logoPlaceholderText: '[ 廊坊***医药 Logo 占位 ]',
    verified: true,
    joinedDate: '2026-02-18',
    nodeStatus: '试运行',
    location: '河北省廊坊市三河市',
    industry: '医疗健康与生物医药',
    capabilities: ['脱敏临床科研集', '药品流向追踪', '公卫预警特征'],
    description: '提供经严格去标识化处理的医疗临床评价集，支撑商业补充医疗险核保与医药研发协同。',
    contributedResourcesCount: 6,
    respondedDemandsCount: 4,
    contactPerson: '孙医生',
    contactPhone: '136****1122',
  },
  {
    id: 'PARTNER-008',
    name: '河北***服务治理联合体',
    shortName: '河北***治理',
    roleType: '运营治理侧',
    roleBadge: '合规与审计委员会',
    logoPlaceholderText: '[ 河北***治理 Logo 占位 ]',
    verified: true,
    joinedDate: '2025-07-01',
    nodeStatus: '在线',
    location: '河北省廊坊市',
    industry: '数据合规与运营审计',
    capabilities: ['合规准入评估', '收益分配结算', '全流程合规存证'],
    description: '受托承担可信数据空间的运营治理、安全审计、合规评估及争议调解，保障数据空间依法合规运行。',
    contributedResourcesCount: 0,
    respondedDemandsCount: 22,
    contactPerson: '周律师',
    contactPhone: '180****6677',
  },
];

export const mockEcoDemands: EcoDemandLink[] = [
  {
    id: 'ECO-DEM-01',
    title: '中小企业信用风险跨域联合建模需求（一期试点）',
    publisherOrg: '廊坊市***科技有限公司',
    type: '已有响应',
    category: '金融风控',
    budget: '面议',
    deadline: '2026-09-15',
    responseCount: 3,
    status: '对接中',
  },
  {
    id: 'ECO-DEM-02',
    title: '京津冀物流车联网时空轨迹密态计算场景需求',
    publisherOrg: '天津***数字科技股份有限公司',
    type: '可响应',
    category: '智慧交通',
    budget: '免费共享',
    deadline: '2026-08-30',
    responseCount: 2,
    status: '可响应',
  },
  {
    id: 'ECO-DEM-03',
    title: '普惠医疗商业健康险精准核保数据空间对接需求',
    publisherOrg: '河北***金融科技有限公司',
    type: '可响应',
    category: '医疗保险',
    budget: '按次付费',
    deadline: '2026-10-01',
    responseCount: 5,
    status: '可响应',
  },
  {
    id: 'ECO-DEM-04',
    title: '绿色园区企业用电与碳排放因子评估需求',
    publisherOrg: '廊坊***智算科技有限公司',
    type: '可响应',
    category: '绿色低碳',
    budget: '包年合作',
    deadline: '2026-08-25',
    responseCount: 1,
    status: '可响应',
  },
];
