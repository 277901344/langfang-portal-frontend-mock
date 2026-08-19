export interface DataFieldDetail {
  name: string; // 字段名称
  enName: string; // 英文名称
  dataType: string; // 数据类型
  description: string; // 字段描述
  length: string; // 字段长度
  isDict: string; // 是否字典项
  nullable: string; // 是否为空
  isPk: string; // 是否主键
}

export interface GovDataItem {
  id: string;
  industry: string; // 数据所属行业
  scenario: string; // 应用场景名称
  department: string; // 数据提供部门
  dataName: string; // 数据名称（数据主题）
  dataFields: string[]; // 数据项/字段
  fieldDetails?: DataFieldDetail[];
  updateFrequency: string; // 更新频率
  region: string; // 地域范围
  timeRange: string; // 时间范围
  provideMethod: string; // 提供方式
}

export const GOV_INDUSTRY_CATEGORIES = [
  '全部行业',
  '居民服务',
  '医疗信息化',
  '金融服务',
  '农、林、牧、渔业',
  '采矿业',
  '制造业',
  '电力、热力、燃气及水生产和供应业',
  '建筑业',
  '批发和零售业',
  '交通运输、仓储和邮政业',
  '住宿和餐饮业',
  '信息传输、软件和信息技术服务业',
  '房地产业',
  '租赁和商务服务业',
  '科学研究和技术服务业',
  '水利、环境和公共设施管理业',
  '教育',
  '文化、体育和娱乐业',
  '公共管理、社会保障和社会组织',
  '国际组织',
];

export const govDatasets: GovDataItem[] = [
  // ==========================================
  // 附件2：拟授权运营的公共数据资源范围及数据资源目录
  // 一、不动产信息信用评估场景 (8条)
  // ==========================================
  {
    id: 'bdc-01',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产权属信息】',
    dataFields: [
      '房产坐落信息', '幢名', '不动产登记日期', '单元号', '建筑面积', '套内面积',
      '户型结构', '房屋状态', '地下室面积', '不动产用途', '产权获取方式',
      '不动产权证书号', '产权年限', '不动产登记类型', '房产建筑面积',
      '权利人姓名', '权利人证件类型', '权利人证件号码'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: 'bdc-02',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产登记抵押信息】',
    dataFields: [
      '是否存在抵押', '抵押权人名称', '抵押登记类型', '抵押登记日期',
      '抵押金额', '债务履行期限', '抵押顺位', '抵押注销状态'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: 'bdc-03',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产登记查封信息】',
    dataFields: ['是否存在查封'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: 'bdc-04',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产登记预告信息】',
    dataFields: ['预告登记类型', '预告登记日期', '预告登记权利人', '预告登记义务人', '预告登记证明号'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: 'bdc-05',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产登记历史变更记录】',
    dataFields: ['登记类型', '登记日期', '变更前权利人', '变更后权利人', '变更原因', '登记机构'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: 'bdc-06',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产权利人信息】',
    dataFields: ['权利人姓名', '证件类型', '证件号码', '共有方式', '共有份额', '联系电话'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: 'bdc-07',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市住房和城乡建设局',
    dataName: '【房屋网签备案信息】',
    dataFields: [
      '合同编号', '买受人姓名', '买受人证件类型', '买受人证件号码',
      '出卖人姓名', '出卖人证件类型', '出卖人证件号码', '房屋坐落',
      '房屋建筑面积', '房屋用途', '成交价格', '签约日期', '备案日期', '合同状态'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: 'bdc-08',
    industry: '金融服务',
    scenario: '不动产信息信用评估场景',
    department: '廊坊市住房和城乡建设局',
    dataName: '【房屋交易监管信息】',
    dataFields: ['监管账户编号', '监管金额', '监管状态', '资金划转记录', '交易完成确认状态'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '近1年',
    provideMethod: '数据接口'
  },

  // ==========================================
  // 二、公共设施点位查询场景 (43条)
  // 提供部门：廊坊市数据局，更新频率：T+1，地域范围：河北省廊坊市，时间范围：近3年全量数据，提供方式：数据接口
  // ==========================================
  {
    id: 'ggss-01',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '公交站点基本信息',
    dataFields: ['站点名称', '车辆线路', '坐标', '到站时间', '起始站点名称'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-02',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '养老机构基本信息',
    dataFields: ['机构名称', '服务等级', '服务对象', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-03',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '机动车检验机构基本信息',
    dataFields: ['机构名称', '营业时间', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-04',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '公积金网点基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-05',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '开锁企业基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-06',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '不动产网点基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '政策解读'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-07',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '犬伤处置门基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-08',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '停车场基本信息',
    dataFields: ['机构名称', '车位数量', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-09',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '电动车违规记录站基本信息',
    dataFields: ['机构名称', '营业时间', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-10',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '驾驶人考试场地基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-11',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '车管所基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-12',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '菜市场基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-13',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '供热网点基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-14',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '燃气网点基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '营业范围', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-15',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '燃气加气站基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-16',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '公厕基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-17',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '运动健身基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-18',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '星级饭店基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-19',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '社会团体基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-20',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '公墓基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-21',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '殡仪馆基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-22',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '医保定点药店基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-23',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '医保定点机构基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-24',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '医保门诊基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-25',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '献血站点基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '营业时间', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-26',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: 'AED位置基本信息',
    dataFields: ['地址', '设备品牌', '责任单位'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-27',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '医院基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-28',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '出入境网点基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '营业时间', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-29',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '司法鉴定机构基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '营业范围', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-30',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '司法所基本信息',
    dataFields: ['机构名称', '联系方式', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-31',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '法律援助中心基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-32',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '社保网点基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-33',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '旅行社基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '营业范围', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-34',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '景点基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-35',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '文化馆基本信息',
    dataFields: ['机构名称', '地址', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-36',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '图书馆基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-37',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '婚姻登记机关基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-38',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '收养登记机关基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-39',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '市级新闻媒体机构基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-40',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '救助站基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '床位数量', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-41',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '公墓基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '单位简介', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-42',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '服务机构基本信息',
    dataFields: ['机构名称', '地址', '联系方式', '营业时间', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },
  {
    id: 'ggss-43',
    industry: '居民服务',
    scenario: '公共设施点位查询场景',
    department: '廊坊市数据局',
    dataName: '烈士纪念设施基本信息',
    dataFields: ['机构名称', '地址', '保护管理单位情况', '建设及改扩建时间', '保护范围', '设施概况', '英烈事迹', '坐标'],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年全量数据',
    provideMethod: '数据接口'
  },

  // ==========================================
  // 三、商业健康保险智能服务场景 (14条)
  // 提供部门：廊坊市卫生健康委员会，更新频率：T+1，地域范围：河北省廊坊市，时间范围：近3年，提供方式：数据接口
  // ==========================================
  {
    id: 'jk-01',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '门急诊病历记录',
    dataFields: [
      '记录ID', '人员ID', '就诊流水号', '姓名', '身份证号', '出生日期', '性别代码', '性别',
      '工作单位', '联系电话', '接诊时间', '科室代码', '科室名称', '机构内科室代码',
      '标准科室编码', '接诊医生ID', '接诊医生姓名', '其它医学检查名称', '就诊类别代码',
      '就诊类别', '是否本地标志', '主诉', '现病史', '既往史', '初诊标志', '代初标志',
      '医疗类别代码', '医疗类别', '主诊断', '关键主键', '创建日期', '医疗机构代码',
      '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-02',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '门急诊病例诊断记录',
    dataFields: [
      '记录ID', '人员ID', '就诊流水号', '门急诊类别代码', '传染标志', '西医诊断代码',
      '西医诊断名称', '中医病症诊断代码', '中医病症诊断名称', '中医疾病诊断代码',
      '中医疾病诊断名称', '诊断时间', '诊断医生代码', '诊断医生姓名', '诊断类别代码',
      '诊断类别', '关键主键', '创建日期', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-03',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '门急诊处方主记录',
    dataFields: [
      '记录ID', '人员ID', '就诊流水号', '处方号', '处方类别代码', '处方类别',
      '处方状态', '处方类型代码', '处方类型名称', '医师开具处方日期', '处方的有效天数',
      '医嘱类型代码', '医嘱类型名称', '身份证号', '中药剂数', '中药处方类别代码',
      '中药处方类别', '中药处方', '申请单号', '是否收费标志', '是否收费', '收费单号',
      '发药时间', '处方备注', '处方金额', '处方开立医师代码', '处方开立医师姓名',
      '处方开立科室代码', '处方开立科室名称', '处方开立医师签名日期', '外键', '上报系统',
      '关键主键', '创建日期', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-04',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '门急诊处方明细记录',
    dataFields: [
      '记录ID', '人员ID', '就诊流水号', '处方号', '明细序号', '处方药品组号',
      '处方项目类型代码', '处方项目类型名称', '医嘱分类代码', '医嘱分类名称',
      '项目编码', '项目名称', '项目规格', '项目单位', '药物通用名称',
      '药物使用次剂量', '药物使用剂量单位', '药物使用总剂量', '药物使用总剂量单位',
      'DDD值/最小剂量', '药物剂型代码', '药物剂型名称', '药物使用频次代码',
      '药物使用频次', '药物使用途径代码', '药物使用途径', '单价', '数量',
      '外键', '关键主键', '创建日期', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-05',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '门急诊收费用记录',
    dataFields: [
      '记录ID', '人员ID', '姓名', '就诊流水号', '收费单号', '医疗类别代码', '医疗类别',
      '医保符合相关流水号', '医疗付费方式代码', '医疗付费方式', '开单科室代码',
      '开单科室名称', '开单医生代码', '开单医生姓名', '总金额', '报销金额', '报销比例',
      '个人承担费用', '减免金额', '报销日期', '收费时间', '收费员代码', '收费员姓名',
      '打印发票号', '红票标志代码', '红票标志', '原收费单号', '是否婴儿标志',
      '是否婴儿', '备注', '上报系统', '关键主键', '创建日期', '医疗机构代码',
      '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-06',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '门急诊费用明细记录',
    dataFields: [
      '记录ID', '人员ID', '就诊流水号', '收费单号', '序号', '项目代码', '项目名称',
      '费用项目类型代码', '费用项目类型名称', '规格', '价值项内代码', '价值项内名称',
      '价值标准代码', '明细项目单价', '明细项目数量', '明细项目单位', '明细项目金额',
      '医保对应对应编码', '项目类型代码', '项目类型用型', '报销标识名称',
      '农合报销标志代码', '农合报销标志', '报销金额', '报销比例', '自费金额',
      '收费时间', '上报日期', '外键', '上报系统', '关键主键', '创建日期',
      '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-07',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '住院病案出院诊断其他诊断记录',
    dataFields: [
      '记录ID', '人员ID', '住院流水号', '住院号', '中西医诊断标识代码', '中西医诊断',
      '出院诊断其他诊断编码', '出院诊断其他诊断', '出院诊断其他诊断顺位',
      '出院诊断其他诊断入院病情代码', '出院诊断其他诊断入院病情', '治疗结果代码',
      '治疗结果', '诊断性质代码', '诊断性质', '诊断类型代码', '诊断类型',
      '诊断说明', '关键主键', '外键', '创建日期', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-08',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '住院病案出院诊断主要诊断记录',
    dataFields: [
      '记录ID', '人员ID', '住院流水号', '住院号', '中西医诊断标识代码', '中西医诊断',
      '出院诊断主要诊断编码', '出院诊断主要诊断名称', '出院诊断主要诊断顺位',
      '出院诊断主要诊断入院病情代码', '出院诊断主要诊断入院病情', '治疗结果代码',
      '治疗结果', '诊断性质代码', '诊断性质', '诊断类型代码', '诊断类型',
      '诊断说明', '关键主键', '外键', '创建日期', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-09',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '住院费用记录',
    dataFields: [
      '记录ID', '人员ID', '住院流水号', '收费单号', '住院号', '姓名',
      '医疗类别代码', '医疗类别', '医保农合相关流水号', '医疗付费方式代码',
      '医疗付费方式', '总金额', '报销金额', '个人承担费用', '减免金额',
      '报销日期', '医保自费比例', '收费时间', '收费员代码', '收费员姓名',
      '打印发票号', '是否婴儿标志', '是否婴儿', '红票标志代码', '红票标志',
      '原收费单号', '上报系统', '关键主键', '创建日期', '医疗机构代码',
      '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-10',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '住院费用明细记录',
    dataFields: [
      '记录ID', '人员ID', '住院流水号', '收费单号', '住院号', '序号',
      '价值项内代码', '价值项内名称', '价值标准代码', '费用项目类型代码',
      '费用项目类型名称', '项目代码', '项目名称', '规格', '明细项目单价',
      '明细项目数量', '明细项目单位', '明细项目金额', '项目费用类型代码',
      '项目费用类型', '报销标识代码', '报销标识名称', '报销金额', '自费金额',
      '收费时间', '报销日期', '开单科室代码', '开单科室名称', '开单医生代码',
      '开单医生姓名', '是否婴儿标志', '是否婴儿', '外键', '上报系统',
      '关键主键', '创建日期', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-11',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '居民信息表',
    dataFields: [
      '记录ID', '人员ID', '卡类型代码', '卡类型', '姓名', '社会保障卡号',
      '医疗服务编号', '居民健康卡编号', '英文姓名', '出生日期', '死亡日期',
      '年龄(年)', '年龄不足1周岁天数', '证件类别代码', '证件类别', '证件号码',
      '性别代码', '性别', '民族代码', '民族', '婚姻状况代码', '婚姻状况',
      '学历代码', '学历', '职业类别代码', '职业类别', '详细职业类别代码',
      '详细职业类别', 'ABO血型代码', 'ABO血型', 'RH血型代码', 'RH血型',
      '国籍代码', '行政区划代码', '行政区划', '地址省', '地址市', '地址县/区',
      '地址乡/镇/街道', '地址村/街', '现住址省', '现住址市', '现住址县/区',
      '现住址详细地址', '出生地代码', '出生地', '困难代码', '国籍', '手机号码',
      '联系电话', '电子邮件', '地址', '邮政编码', '患者类型代码', '患者类型',
      '医疗保险类别代码', '医疗保险类别', '卡号', '保险类型', '医疗待遇名称',
      '医疗待遇代码', '患者就诊类别描述', '有效期', '建档日期', '医疗机构代码',
      '医疗机构名称', '数据状态', '重点关注人群标志', '重点关注人群类别代码',
      '重点关注人群名称'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-12',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '住院病案首页记录',
    dataFields: [
      '记录ID', '人员ID', '电子申请单顺序号', '病案首页类型代码', '病案首页类型',
      '住院流水号', '病案号', '住院号', '病区名称', '病房号', '姓名',
      '性别代码', '性别', '出生日期', '年龄', '年龄月份', '年龄天', '年龄天数',
      '国籍代码', '国籍', '新生儿入院体重', '身份证件类别代码', '身份证件类别',
      '身份证号', '民族代码', '民族', '婚姻状况代码', '婚姻状况', '现住地址',
      '现住址省', '现住址市', '来院前常住地址省', '来院前常住地址市',
      '来院前常住地址县/区', '来院前常住地址乡/镇/街道', '来院前常住地址村/街',
      '来院前常住地址门牌号', '电话', '户籍地址省', '户籍地址市', '户籍地址县/区',
      '户籍地址乡/镇/街道', '户籍地址村/街', '户籍地址门牌号', '户籍邮政编码',
      '联系人姓名', '联系人电话', '医疗保险类别代码', '医疗保险类别', '医疗保险号',
      '住院次数', '科室代码', '科室名称', '入院途径代码', '入院途径', '入院时间',
      '入院科室代码', '入院科室名称', '标准入院科室名称', '标准入院科室编码',
      '入院病房号', '是否本地标志', '转入科室名称', '转入科室代码', '出院时间',
      '出院科室名称', '标准出院科室名称', '标准出院科室编码', '出院病房号',
      '住院天数', '离院方式', '关键主键', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-13',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '检查报告记录',
    dataFields: [
      '记录ID', '就诊流水号', '住院流水号', '人员ID', '报告单号', '报告标题',
      '文档创建时间', '保密级别', '报告机构代码', '报告机构名称', '报告科室代码',
      '报告科室名称', '报告医师代码', '报告医师姓名', '检查报告日期', '影像所见',
      '影像结论', '可互认标志代码', '可互认标志', '是否异常代码', '是否异常',
      '定量检查计量单位', '检查定量结果', '检查结果代码', '检查结果',
      '检查结果客观说明', '检查结果主观说明', '检查报告备注', '审核医师代码',
      '审核医师姓名', '审核日期', '外键', '上报系统', '关键主键', '创建日期',
      '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: 'jk-14',
    industry: '医疗信息化',
    scenario: '商业健康保险智能服务场景',
    department: '廊坊市卫生健康委员会',
    dataName: '检验报告记录',
    dataFields: [
      '记录ID', '人员ID', '就诊流水号', '住院流水号', '检验报告单号',
      '检验报告分类编码', '检验报告分类名称', '报告标题', '文档创建时间',
      '保密级别', '报告机构代码', '报告机构名称', '报告科室代码', '报告科室名称',
      '报告医师代码', '报告医师姓名', '检验定量结果', '检验定量结果计量单位',
      '正常参考值上限', '正常参考值下限', '参考范围', '提示或参考值备注',
      '结果值解释', '检验结果代码', '检验结果', '结果代码', '结果代码类型',
      '检验结果客观说明', '检验结果主观说明', '可互认标志代码', '可互认标志',
      '报告日期', '审核医师代码', '审核医师姓名', '审核日期', '外键', '上报系统',
      '关键主键', '创建日期', '医疗机构代码', '医疗机构名称', '数据状态'
    ],
    updateFrequency: 'T+1',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },

  // ==========================================
  // 四、住房公积金信用赋能场景 (1条)
  // 提供部门：廊坊市住房公积金管理中心，更新频率：实时，地域范围：河北省廊坊市，时间范围：接口，提供方式：数据接口
  // ==========================================
  {
    id: 'gjj-01',
    industry: '金融服务',
    scenario: '住房公积金信用赋能场景',
    department: '廊坊市住房公积金管理中心',
    dataName: '个人公积金信息表',
    dataFields: [
      '单位类别', '客户类别', '单位所属行业', '单位经济类型', '最近12个月的平均缴存额',
      '缴存基数', '连续缴存月数', '个人平均每月缴交额/单位平均每次缴交金额',
      '最近6个月的平均缴存额', '单位缴存的基数', '单位平均每个月缴存总额（最近12个月）',
      '个人缴存额', '单位缴存额', '单位缴存总月数', '单位人数（最近12个月的平均）',
      '账号余额', '个人缴存比例', '单位缴存比例', '个人账户状态', '单位名称',
      '单位账户状态', '单位缴存人数', '开户日期', '初缴年月', '最近汇缴日期',
      '个人缴存额（明细）-近12个月', '单位缴存额（明细）-近12个月',
      '个人缴存比例（明细）-近12个月', '单位缴存比例（明细）-近12个月',
      '缴纳时间（明细）-近12个月', '最近24月的缴存情况', '累计缴存月份',
      '单位开户日期', '单位缴至年月', '业务种类', '缴至年月', '本年汇缴次数',
      '本年补缴次数', '近三年补缴次数', '近三年汇缴次数', '历年支取次数',
      '本年支取次数', '最后支取日期', '公积金贷款状态', '当前期次'
    ],
    updateFrequency: '实时',
    region: '河北省廊坊市',
    timeRange: '接口',
    provideMethod: '数据接口'
  }
];
