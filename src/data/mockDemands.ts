export interface DemandResponseItem {
  id: string;
  responder: string;
  responderOrg: string;
  solutionDesc?: string; // 方案说明
  pricingType?: string; // 定价方式: 免费 / 收费 / 面议
  quoteAmount?: string; // 报价金额
  deliveryType?: string; // 交付方式: 数据集 / API / 数据报告 / 密态算力
  relatedProduct?: string; // 关联产品 / 商品
  date: string;
  status: '待处理' | '已接受' | '已拒绝' | '对接中' | '已对齐';
  // backward compatibility fields
  solutionName?: string;
  message?: string;
}

export type DemandStatus = '未发布' | '已发布' | '已有响应' | '已匹配' | '已关闭';

export interface DemandItem {
  id: string;
  title: string;
  status: DemandStatus;
  type: '已有响应' | '我发布的' | '可响应的';
  publisher: string;
  publisherOrg: string;
  description: string;
  topicCategory: string; // e.g. '金融服务', '智慧交通', '-'
  applicationScene?: string; // 应用场景
  productType?: string; // 产品类型
  updateFrequency?: string; // 更新频次
  usePurpose?: string; // 使用目的
  budgetType?: string; // 预算类型
  budgetAmount?: string; // 预算金额
  datasetRequirement: string;
  expectedFields?: string[];
  deadline: string; // e.g. '2026-08-29'
  responseCount: number;
  createdAt: string; // e.g. '2026-08-12 09:33'
  budget?: string;
  contactPerson: string;
  contactPhone?: string;
  responses: DemandResponseItem[];
}

export const DEMAND_TYPES = ['不限', '已有响应', '我发布的', '可响应的'];
export const DEMAND_STATUSES = ['不限', '未发布', '已发布', '已有响应', '已匹配', '已关闭'];
export const DEMAND_TOPICS = [
  '不限',
  '金融服务',
  '智慧交通',
  '医疗健康',
  '工业制造',
  '城市治理',
  '气象服务',
  '供应链物流',
  '未设置主题',
];

export const mockDemands: DemandItem[] = [
  {
    id: 'DM-20260812-0002',
    title: '测试门户2',
    status: '未发布',
    type: '我发布的',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊市数据局',
    description: '暂无详细描述',
    topicCategory: '-',
    applicationScene: '-',
    productType: '-',
    updateFrequency: '每季度',
    usePurpose: '测试使用目的2',
    budgetType: '包月',
    budgetAmount: '11111111 元',
    datasetRequirement: '测试数据需求',
    deadline: '2026-08-12',
    responseCount: 0,
    createdAt: '-',
    budget: '11111111 元',
    contactPerson: 'lfssjj_admin',
    contactPhone: '173****2231',
    responses: [],
  },
  {
    id: 'DM-20260812-0003',
    title: '测试门户3',
    status: '已发布',
    type: '可响应的',
    publisher: 'lfssjj_admin',
    publisherOrg: '廊坊市数据局',
    description: '暂无详细说明',
    topicCategory: '-',
    applicationScene: '-',
    productType: '-',
    updateFrequency: '每周',
    usePurpose: '-',
    budgetType: '免费',
    budgetAmount: '-',
    datasetRequirement: '综合数据资源与测试 API 节点',
    deadline: '2026-08-29',
    responseCount: 0,
    createdAt: '2026-08-12 09:33',
    budget: '免费',
    contactPerson: 'lfssjj_admin',
    contactPhone: '173****2231',
    responses: [],
  },
  {
    id: 'DEM-2026-001',
    title: '中小企业信用风险跨域联合建模需求（一期试点）',
    status: '已匹配',
    type: '已有响应',
    publisher: '廊坊市***科技有限公司',
    publisherOrg: '廊坊市***科技有限公司',
    description: '寻找具备企业发票开具数据、物流海关提单数据与用电量数据的提供方，基于 TEE 密态计算进行联合信贷风险模型构建，评估中小微企业真实经营状况。',
    topicCategory: '未设置主题 / 数据集',
    datasetRequirement: '企业发票流向数据、物流提单数据、企业用电负荷数据',
    deadline: '未设置截止',
    responseCount: 1,
    createdAt: '2026-08-03',
    budget: '面议',
    contactPerson: '管理员',
    contactPhone: '173****2231',
    responses: [
      {
        id: 'RESP-001',
        responder: '廊坊***科技',
        responderOrg: '廊坊市***科技有限公司',
        solutionName: '可信数据节点对接方案',
        message: '已通过可信数据空间连接器完成需求确认与试运行通道搭建。',
        date: '2026-08-04',
        status: '已对齐',
      },
    ],
  },
  {
    id: 'DEM-2026-002',
    title: '廊坊临空经济区气象与航班多维联动预警数据需求',
    status: '已有响应',
    type: '可响应的',
    publisher: '廊坊临空***资产运营公司',
    publisherOrg: '廊坊临空***数据资产运营部',
    description: '需引入高分辨率雷达气象预报数据与临空机场航班起降实时状态，用于临空经济区智慧物流枢纽的恶劣天气应急调度与航路安全管控。',
    topicCategory: '未设置主题 / 数据报告',
    datasetRequirement: '高精气象雷达回波数据、航班实时起降时序数据',
    deadline: '2026-08-29',
    responseCount: 1,
    createdAt: '2026-08-12',
    budget: '30 万元',
    contactPerson: '王主任',
    contactPhone: '139****8811',
    responses: [
      {
        id: 'RESP-002',
        responder: '河北***气象云',
        responderOrg: '河北***气象数据服务中心',
        solutionName: '临空区域气象雷达 API 联调方案',
        message: '已部署加密安全节点，可提供毫秒级风速与雷达图谱推演接口。',
        date: '2026-08-12',
        status: '对接中',
      },
    ],
  },
  {
    id: 'DEM-2026-003',
    title: '工业高端装备供应链零部件区块链溯源与验真需求',
    status: '未发布',
    type: '我发布的',
    publisher: '河北***数安科技服务公司',
    publisherOrg: '河北***数安科技服务有限公司',
    description: '面向廊坊域内高端装备制造龙头企业，规划接入供应链企业资质凭证与零部件批次流转数据，目前处于需求草案审核与脱敏评估阶段。',
    topicCategory: '未设置主题 / 数据应用',
    datasetRequirement: '工业品企业资质数据、供应链区块链凭证',
    deadline: '2026-08-12',
    responseCount: 0,
    createdAt: '2026-08-12',
    budget: '拟申请专项引导资金',
    contactPerson: '管理员',
    contactPhone: '173****2231',
    responses: [],
  },
  {
    id: 'DEM-2026-004',
    title: '商业健康险秒级理赔核验与医保脱敏结算数据集需求',
    status: '已发布',
    type: '可响应的',
    publisher: '某***人寿河北分公司数据中心',
    publisherOrg: '中国***人寿保险股份有限公司河北分公司',
    description: '申请在用户明确授权的前提下，通过数据空间安全节点调取医保脱敏结算凭证与门诊诊断代码（ICD-10），实现商业健康险快赔免赔。',
    topicCategory: '未设置主题 / 数据集',
    datasetRequirement: '医保结算脱敏凭证、门诊诊断编码表',
    deadline: '2026-08-29',
    responseCount: 0,
    createdAt: '2026-08-12',
    budget: '按次付费 (1.2元/次)',
    contactPerson: '孙经理',
    contactPhone: '185****9090',
    responses: [],
  },
  {
    id: 'DEM-2026-005',
    title: '2025年度廊坊市区公共交通客流与网约车合规运力比对',
    status: '已关闭',
    type: '我发布的',
    publisher: '廊坊市***公交运营中心',
    publisherOrg: '廊坊市***交通集团数据部',
    description: '已完成项目阶段性招投标与数据空间节点部署，常态化算法模型比对工作已闭环验收并作封存归档。',
    topicCategory: '未设置主题 / 数字对象',
    datasetRequirement: '公交刷卡脱敏数据、网约车订单轨迹比对库',
    deadline: '2026-08-29',
    responseCount: 0,
    createdAt: '2026-08-12',
    budget: '已归档闭环',
    contactPerson: '管理员',
    contactPhone: '173****2231',
    responses: [],
  },
  {
    id: 'DEM-2026-006',
    title: '不动产登记与商业银行抵押预告跨域联办数据直连',
    status: '已有响应',
    type: '已有响应',
    publisher: '廊坊市***不动产大数据中心',
    publisherOrg: '廊坊市***不动产登记中心',
    description: '接入各大商业银行房贷预告登记数据与电子证照，实现“不动产抵押+银行贷款”线上双向密态核验，办结时间由 3 天缩短至 1 小时。',
    topicCategory: '城市治理',
    datasetRequirement: '不动产电子证照接口、银行抵押预告申请数据',
    deadline: '2026-09-15',
    responseCount: 2,
    createdAt: '2026-08-10',
    budget: '公共授权类',
    contactPerson: '李科长',
    contactPhone: '138****0012',
    responses: [
      {
        id: 'RESP-004',
        responder: '某***银行廊坊分行',
        responderOrg: '中国***银行廊坊分行',
        solutionName: '抵押贷款电子凭证直连服务',
        message: '已通过授权运营平台完成系统联调与密态安全评估，进入常态化协同运行。',
        date: '2026-08-11',
        status: '已对齐',
      },
    ],
  },
  {
    id: 'DEM-2026-007',
    title: '园区企业用能碳足迹评价与绿色金融授信数据需求',
    status: '已发布',
    type: '可响应的',
    publisher: '廊坊***绿金科技实验室',
    publisherOrg: '廊坊***绿色金融创新实验室有限公司',
    description: '征集具备光伏发电、工业用电用气脱敏监测数据的服务商，基于隐私计算建立碳减排绩效模型，提供绿色信贷优惠利率贴息依据。',
    topicCategory: '金融服务',
    datasetRequirement: '园区企业月度用电用气脱敏时序数据',
    deadline: '2026-10-15',
    responseCount: 0,
    createdAt: '2026-08-11',
    budget: '40 万元 / 年',
    contactPerson: '陈研究员',
    contactPhone: '137****6611',
    responses: [],
  },
  {
    id: 'DEM-2026-008',
    title: '京津冀大运河文化旅游客流跨区域时空轨迹分析',
    status: '已匹配',
    type: '已有响应',
    publisher: '河北***运河智旅科技有限公司',
    publisherOrg: '廊坊市***文化广电和旅游局数字化中心',
    description: '融合运河沿线景区扫码购票、周边酒店住宿脱敏数据与交通卡口流量，构建跨区域游客画像与消费力预测模型，已完成方案对齐与上线试运行。',
    topicCategory: '城市治理',
    datasetRequirement: '景区脱敏扫码流量、卡口车流统计',
    deadline: '2026-08-30',
    responseCount: 2,
    createdAt: '2026-08-01',
    budget: '25 万元',
    contactPerson: '周科长',
    contactPhone: '136****5588',
    responses: [
      {
        id: 'RESP-008',
        responder: '河北***智旅云',
        responderOrg: '河北***智慧旅游数据服务公司',
        solutionName: '跨区域文旅客流预测沙盒服务',
        message: '已完成数据空间可信连接节点部署并顺利对接。',
        date: '2026-08-05',
        status: '已对齐',
      },
    ],
  },
  {
    id: 'DEM-2026-009',
    title: '社区居家养老高龄独居老人安居用电与用水异常感知',
    status: '未发布',
    type: '我发布的',
    publisher: '廊坊***康养数字科技有限公司',
    publisherOrg: '廊坊市***智慧社区康养协同组',
    description: '拟接入智能水表/电表高频采集脱敏数据，建立高龄独居老人居家安全预警阈值，正处于隐私保护合规评估中。',
    topicCategory: '未设置主题 / 数据应用',
    datasetRequirement: '智能水表电表高频采样脱敏数据',
    deadline: '2026-09-01',
    responseCount: 0,
    createdAt: '2026-08-12',
    budget: '惠民公共补贴',
    contactPerson: '管理员',
    contactPhone: '173****2231',
    responses: [],
  },
  {
    id: 'DEM-2026-010',
    title: '农产品冷链物流全程温控脱敏时序数据接入测试',
    status: '已关闭',
    type: '我发布的',
    publisher: '河北***冷链供应链有限公司',
    publisherOrg: '河北省***农产品冷链物流协会',
    description: '针对首期蔬菜冷藏车物联网温度节点传感器与GPS轨迹数据，完成密态上链与凭证核验测试，项目已按期总结关停。',
    topicCategory: '供应链物流',
    datasetRequirement: '冷藏车温湿度脱敏时序数据',
    deadline: '2026-07-20',
    responseCount: 1,
    createdAt: '2026-07-22',
    budget: '已完成测试结算',
    contactPerson: '高工',
    contactPhone: '135****9900',
    responses: [
      {
        id: 'RESP-010',
        responder: '河北***冷链服务部',
        responderOrg: '河北***物联网技术中心',
        solutionName: '冷链物流 TEE 节点上链方案',
        message: '已完成阶段测试与安全归档。',
        date: '2026-07-25',
        status: '已对齐',
      },
    ],
  },
];

