import { LucideIcon, Database, Shield, Zap, Globe, Share2, ShieldCheck, Heart, UserCheck, FileText } from 'lucide-react';

export interface Stat {
  id: string;
  label: string;
  value: string;
  suffix: string;
  icon: LucideIcon;
  category: '建设' | '业务' | '专题' | '协同';
}

export const platformStats: Stat[] = [
  { id: '1', label: '接入政府部门', value: '32', suffix: ' +', icon: Database, category: '建设' },
  { id: '2', label: '累计数据交换量', value: '15.4', suffix: ' 亿次', icon: Share2, category: '业务' },
  { id: '3', label: '支撑重点场景', value: '12', suffix: ' 个', icon: Zap, category: '专题' },
  { id: '4', label: '协同生态主体', value: '85', suffix: ' 家', icon: Shield, category: '协同' },
];

export interface DataProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  provider: string;
  updateFrequency: string;
  dataVolume: string;
  tags: string[];
  status: 'active' | 'beta' | 'deprecated';
  price: string;
  serviceScene: string; // 服务场景
  supportMatter: string; // 支撑事项
}

export const dataProducts: DataProduct[] = [
  {
    id: 'dp-001',
    title: '公积金缴存人跨域核验信息服务',
    description: '提供廊坊市住房公积金缴存人的基本公积金账号、缴存状态、月缴存额及累计余额。数据采用安全多方求交或安全流式接口交付，保障个人隐私安全，可跨区域秒级核算。',
    category: '公积金专题',
    provider: '廊坊市住房公积金管理中心',
    updateFrequency: '实时',
    dataVolume: '多维度接口流',
    tags: ['公积金', '跨域核验', '个人信用'],
    status: 'active',
    price: '政务无偿共享 / 协同定价',
    serviceScene: '职工异地购房提取公积金',
    supportMatter: '异地公积金贷款额度交叉免审与秒级线上核验'
  },
  {
    id: 'dp-002',
    title: '公积金联名贷款商业银行联合授信评估数据',
    description: '基于脱敏后的住房公积金还款记录、企业连续缴存月份、违规提取负面清单等多重指标，提供安全多方隐私计算评估结果。专用于降低组合贷审查周期。',
    category: '公积金专题',
    provider: '廊坊市住房公积金管理中心',
    updateFrequency: '每日',
    dataVolume: '约 10万条/日',
    tags: ['公积金', '联合授信', '信用评估'],
    status: 'active',
    price: '协议共享',
    serviceScene: '公积金与商业组合贷联合审批',
    supportMatter: '银行端公积金组合授信秒级初筛'
  },
  {
    id: 'dp-003',
    title: '区域公共卫生应急趋势多维数据产品',
    description: '汇集廊坊市本级及区县二级以上医疗机构发热门诊、急诊床位占用、流行病种结构变化等，经网格化脱敏和空间汇聚后的统计数据集，提供决策支撑和绿色低碳健康调度。',
    category: '卫健医疗专题',
    provider: '廊坊市卫生健康委员会',
    updateFrequency: '每日',
    dataVolume: '约 50MB/天',
    tags: ['公共卫生', '应急医疗', '趋势分析'],
    status: 'active',
    price: '政务无偿调拨',
    serviceScene: '疾病预防控制与应急医疗资源调度评估',
    supportMatter: '市级应急医疗床位流转度盘点与重大疫情早预警'
  },
  {
    id: 'dp-004',
    title: '医疗脱敏电子病历多维临床指标评价集',
    description: '采用联邦学习技术对各大中心诊疗路径进行隐私对齐，提供去标识化的脱敏病历统计特征、常见非敏感检查检验平均指标，确保患者身份“可算不可识”。',
    category: '卫健医疗专题',
    provider: '廊坊市卫生健康委员会',
    updateFrequency: '每周级更新',
    dataVolume: '数百指标维度',
    tags: ['电子病历', '联邦学习', '医疗保险'],
    status: 'beta',
    price: '成果分成共享',
    serviceScene: '商业补充医疗保障险核保核赔评估',
    supportMatter: '普惠型健康险线上快捷报销合规直连'
  },
  {
    id: 'dp-005',
    title: '企业法人统一社会信用与登记状态核验接口',
    description: '涵盖廊坊辖区内登记注册法人的名称、社会信用代码、法定代表人、注册资本以及存续/在营等在册状态。支撑政企信贷通和中小微金融服务。',
    category: '法人信用专题',
    provider: '廊坊市行政审批局',
    updateFrequency: '实时',
    dataVolume: '百万级记录实时交互',
    tags: ['法人库', '信用代码', '企业画像'],
    status: 'active',
    price: '无偿共享 / 普惠免签',
    serviceScene: '中小微企业金融授信与公共普惠贷款',
    supportMatter: '廊坊市中小微金融服务平台“免材料”信用背书'
  },
  {
    id: 'dp-006',
    title: '企业法人涉诉与经营异常严重失信交叉评价库',
    description: '精细化汇算全市法人涉及严重失信名单、列入经营异常名录、安全生产处罚纪录。提供经可信数据空间可追溯的单次加密碰撞接口，规避过度授权泄密。',
    category: '法人信用专题',
    provider: '廊坊市市场监督管理局',
    updateFrequency: '每日级',
    dataVolume: '高变动事件触发流',
    tags: ['涉诉记录', '经营异常', '一票否决'],
    status: 'active',
    price: '政务无偿调用',
    serviceScene: '重大工程招标资质核查及一票否决核验',
    supportMatter: '政府财政补贴及高新政策红包申报“免审即享”过滤'
  },
  {
    id: 'dp-007',
    title: '不动产登记信息与确权真伪核算公共接口',
    description: '输入身份证号、产权证号，通过安全多方安全判定算法，直接输出“一致”或“不一致”的可信判定，保障个人房产权属核心隐私不出域，适用于涉房金融。',
    category: '不动产生态专题',
    provider: '廊坊市自然资源和规划局',
    updateFrequency: '实时',
    dataVolume: '高并发秒级请求',
    tags: ['不动产', '确权核验', '房产安全'],
    status: 'active',
    price: '按需购买/授信抵扣',
    serviceScene: '商业银行经营性个人房产贷款、二手房产权真实核实',
    supportMatter: '线上无接触房产净值安全初估与真伪判定'
  },
  {
    id: 'dp-008',
    title: '不动产抵押及查封状态动态监测报警数据',
    description: '对选定抵押状态房产提供在可信数据空间中全闭环的动态查封、涉质、土地变更预降级信息。当监测要素出现流转变更时，在保护主体名册前提下触发差分发布。',
    category: '不动产生态专题',
    provider: '廊坊市自然资源和规划局',
    updateFrequency: '近实时',
    dataVolume: '高警性订阅流',
    tags: ['抵押查封', '动态报警', '差分隐私'],
    status: 'beta',
    price: '按月订阅模式',
    serviceScene: '银行抵押类信贷资产全生命周期风险审查',
    supportMatter: '抵押质押权线上登记秒办结与押品安全常态化保障'
  }
];

export const categories = ['全部', '公积金专题', '卫健医疗专题', '法人信用专题', '不动产生态专题'];

// 四大场景定义
export interface Scenario {
  id: string;
  name: string;
  value: string; // 主管价值
  departments: string[]; // 涉及部门
  dataSupport: string; // 支撑数据或能力
  description: string;
  image: string;
}

export const keyScenarios: Scenario[] = [
  {
    id: 'sc-001',
    name: '公积金专题数据空间',
    value: '打通跨省跨域公积金核验，职工公积金异地贷款额度测算提质 300%，贷款全生命安全验证“零跑腿”。',
    departments: ['市住房公积金管理中心', '商业银行', '市政务服务中心'],
    dataSupport: '跨域异地缴存明细、公积金状态真伪、安全双因子碰撞。',
    description: '基于可信数据空间完成公积金跨地域交叉碰撞，省去线下开具证明环节，实现职工异地申贷零手续。',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sc-002',
    name: '卫健医疗数据可信空间',
    value: '解决医疗信息“数据孤岛”难题，推动商业补充健康险“瞬时核算与直连快批”，守护个人重大健康档案。',
    departments: ['市卫生健康委员会', '各大二级及以上机构', '中外合资保险商'],
    dataSupport: '电子病历分级多方安全对齐，医疗多维脱敏指标联邦学算法。',
    description: '利用安全计算对医疗检查与既往病史指标进行模型训练和比对，不再泄露具体隐私，使商业医疗理赔直连。',
    image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sc-003',
    name: '法人信息跨域多维联控空间',
    value: '形成多维立体企业画像，普惠贷款材料精减 85%，防范企业财务欺诈和空壳诈骗，助力中小企业低息纾困。',
    departments: ['市行政审批局', '市市场监督管理局', '市税务局', '各大信贷机构'],
    dataSupport: '法人库基础登记一致性核算、社保欠费及严重失信一票否决算法。',
    description: '数据多方碰撞协助金融机构建立免担保贷款风控模式，企业仅需线上“一键授权”两秒钟生成授信，无需提交任何纸质报告。',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'sc-004',
    name: '不动产确权金融联办可信空间',
    value: '破除产权查封脱网监控空窗期，商业银行抵押房产权属可信校验极速秒结，规避重复抵押。',
    departments: ['市自然资源和规划局', '市中级人民法院', '签约商业银行集团'],
    dataSupport: '不公开房源差分比对报警、房产权真伪极速判定及司法查封实时拦截流。',
    description: '银行可在可信空间秒级判别抵押房产状态，实时抓取查封指令变更，使房屋线上抵押联审成为可能，防止交易风险。',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800'
  }
];

// 生态合作角色数据，避免在页面中展示真实单位或企业名称。
export interface EcologyGroup {
  category: string;
  description: string;
  members: string[];
}

export const ecologyGroups: EcologyGroup[] = [
  {
    category: '公共治理主体',
    description: '主要数据提供方与监管主体，保障共享数据合法合规流转。',
    members: ['综合审批类部门', '民生保障类部门', '公共卫生类部门', '自然资源类部门', '市场监管类部门', '财税服务类部门']
  },
  {
    category: '场景应用主体',
    description: '深度应用消费端主体，将数据红利极速转化为普惠金融活水。',
    members: ['普惠金融服务机构', '产业金融服务机构', '保险服务机构', '供应链服务机构', '公共服务运营机构']
  },
  {
    category: '社会服务主体',
    description: '融合民生大数据，搭建可信共享智慧服务网。',
    members: ['能源服务单位', '市政服务单位', '公共出行服务单位', '社区服务运营单位']
  },
  {
    category: '技术支撑主体',
    description: '核心技术中台攻坚，保障隐私安全计算算法国际领先。',
    members: ['科研协作团队', '网络安全实验团队', '可信计算服务商', '城市数字底座服务商', '安全测评服务商']
  }
];
