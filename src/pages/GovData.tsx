import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageBanner } from '../components/PageBanner';
import {
  Search,
  Database,
  Building2,
  Table,
  Eye,
  X,
  ChevronRight,
  ChevronLeft,
  Filter,
  Layers
} from 'lucide-react';
import { cn } from '../lib/utils';

// 8大属性结构定义
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

function generateFieldDetail(fieldName: string, index: number): DataFieldDetail {
  const nameStr = fieldName.trim();
  let enName = 'field_' + (index + 1);
  let dataType = 'VARCHAR';
  let length = '50';
  let isPk = index === 0 ? '是' : '否';
  let nullable = isPk === '是' ? '否' : '是';
  let isDict = '否';

  const pinyinMap: Record<string, { en: string; type: string; len: string; dict?: string }> = {
    // 卫健
    '医院代码': { en: 'yydm', type: 'VARCHAR', len: '22' },
    '科室代码': { en: 'ksdm', type: 'VARCHAR', len: '22' },
    '科室名称': { en: 'ksmc', type: 'VARCHAR', len: '50' },
    '停诊日期': { en: 'tzksrq', type: 'DATE', len: '-' },
    '停诊时段': { en: 'tzsd', type: 'VARCHAR', len: '22' },
    '医院名称': { en: 'yymc', type: 'VARCHAR', len: '50' },
    '主键': { en: 'SID', type: 'VARCHAR', len: '64' },
    '就诊流水号': { en: 'jzlsh', type: 'VARCHAR', len: '32' },
    '患者证件号码': { en: 'hzzjhm', type: 'VARCHAR', len: '18' },
    '就诊类型': { en: 'jzlx', type: 'VARCHAR', len: '20', dict: '是' },
    '就诊日期': { en: 'jzrq', type: 'DATE', len: '-' },
    '主要诊断名称': { en: 'zyzdmc', type: 'VARCHAR', len: '100' },
    '医疗总费用': { en: 'ylzfy', type: 'DECIMAL', len: '12,2' },
    '医保报销金额': { en: 'ybbxje', type: 'DECIMAL', len: '12,2' },
    '自费金额': { en: 'zfje', type: 'DECIMAL', len: '12,2' },

    // 不动产 & 住建
    '房产坐落信息': { en: 'fczlxx', type: 'VARCHAR', len: '200' },
    '幢名': { en: 'zm', type: 'VARCHAR', len: '50' },
    '不动产登记日期': { en: 'bdcdjrq', type: 'DATE', len: '-' },
    '单元号': { en: 'dyh', type: 'VARCHAR', len: '30' },
    '建筑面积': { en: 'jzmj', type: 'DECIMAL', len: '12,2' },
    '套内面积': { en: 'tnmj', type: 'DECIMAL', len: '12,2' },
    '户型结构': { en: 'hxjg', type: 'VARCHAR', len: '30', dict: '是' },
    '房屋状态': { en: 'fwzt', type: 'VARCHAR', len: '20', dict: '是' },
    '地下室面积': { en: 'dxsmj', type: 'DECIMAL', len: '12,2' },
    '不动产用途': { en: 'bdcyt', type: 'VARCHAR', len: '50', dict: '是' },
    '产权获取方式': { en: 'cqhqfs', type: 'VARCHAR', len: '30', dict: '是' },
    '不动产权证书号': { en: 'bdcqzsh', type: 'VARCHAR', len: '100' },
    '产权年限': { en: 'cqnx', type: 'NUMBER', len: '10' },
    '不动产登记类型': { en: 'bdcdjlx', type: 'VARCHAR', len: '50', dict: '是' },
    '房产建筑面积': { en: 'fcjzmj', type: 'DECIMAL', len: '12,2' },
    '权利人姓名': { en: 'qlrxm', type: 'VARCHAR', len: '50' },
    '权利人证件类型': { en: 'qlrzjlx', type: 'VARCHAR', len: '30', dict: '是' },
    '权利人证件号码': { en: 'qlrzjhm', type: 'VARCHAR', len: '50' },
    '是否存在抵押': { en: 'sfzdy', type: 'VARCHAR', len: '10', dict: '是' },
    '抵押权人名称': { en: 'dyqrmc', type: 'VARCHAR', len: '100' },
    '抵押登记类型': { en: 'dydjlx', type: 'VARCHAR', len: '30', dict: '是' },
    '抵押登记日期': { en: 'dydjrq', type: 'DATE', len: '-' },
    '抵押金额': { en: 'dyje', type: 'DECIMAL', len: '16,2' },
    '债务履行期限': { en: 'zwlxqx', type: 'VARCHAR', len: '50' },
    '抵押顺位': { en: 'dysw', type: 'NUMBER', len: '5' },
    '抵押注销状态': { en: 'dyzxzt', type: 'VARCHAR', len: '20', dict: '是' },
    '是否存在查封': { en: 'sfzcf', type: 'VARCHAR', len: '10', dict: '是' },
    '预告登记类型': { en: 'ygdjlx', type: 'VARCHAR', len: '30', dict: '是' },
    '预告登记日期': { en: 'ygdjrq', type: 'DATE', len: '-' },
    '预告登记权利人': { en: 'ygdjqlr', type: 'VARCHAR', len: '50' },
    '预告登记义务人': { en: 'ygdjywr', type: 'VARCHAR', len: '50' },
    '预告登记证明号': { en: 'ygdjzmh', type: 'VARCHAR', len: '100' },
    '合同编号': { en: 'htbh', type: 'VARCHAR', len: '50' },
    '买受人姓名': { en: 'msrxm', type: 'VARCHAR', len: '50' },
    '买受人证件号码': { en: 'msrzjhm', type: 'VARCHAR', len: '50' },
    '成交价格': { en: 'cjjg', type: 'DECIMAL', len: '16,2' },
    '签约日期': { en: 'qyrq', type: 'DATE', len: '-' },
    '备案日期': { en: 'barq', type: 'DATE', len: '-' },

    // 公积金
    '个人公积金账号': { en: 'grgjjzh', type: 'VARCHAR', len: '30' },
    '月缴存额': { en: 'yjce', type: 'DECIMAL', len: '12,2' },
    '公积金余额': { en: 'gjjye', type: 'DECIMAL', len: '16,2' },
    '最近提取日期': { en: 'zjtqrq', type: 'DATE', len: '-' },
    '缴存状态': { en: 'jczt', type: 'VARCHAR', len: '20', dict: '是' },
    '开户日期': { en: 'khrq', type: 'DATE', len: '-' },
    '公积金贷款合同号': { en: 'gjjdkhth', type: 'VARCHAR', len: '50' },
    '贷款总额': { en: 'dkze', type: 'DECIMAL', len: '16,2' },
    '贷款余额': { en: 'dkye', type: 'DECIMAL', len: '16,2' },
    '月还款额': { en: 'yhke', type: 'DECIMAL', len: '12,2' },
    '贷款期限': { en: 'dkqx', type: 'NUMBER', len: '10' },
    '逾期次数': { en: 'yqcs', type: 'NUMBER', len: '5' },

    // 法人 / 市场监管
    '统一社会信用代码': { en: 'tyshxydm', type: 'VARCHAR', len: '18' },
    '企业名称': { en: 'qymc', type: 'VARCHAR', len: '100' },
    '法定代表人': { en: 'fddbr', type: 'VARCHAR', len: '50' },
    '成立日期': { en: 'clrq', type: 'DATE', len: '-' },
    '注册资本': { en: 'zczb', type: 'DECIMAL', len: '16,2' },
    '登记状态': { en: 'djzt', type: 'VARCHAR', len: '20', dict: '是' },
    '企业类型': { en: 'qylx', type: 'VARCHAR', len: '50', dict: '是' },
    '所属行业': { en: 'sshy', type: 'VARCHAR', len: '50', dict: '是' },
    '住所地址': { en: 'zsdd', type: 'VARCHAR', len: '200' },
    '经营范围': { en: 'jyfw', type: 'VARCHAR', len: '500' },
    '列入经营异常名录原因': { en: 'lrjyycyy', type: 'VARCHAR', len: '200' },
    '列入日期': { en: 'lrrq', type: 'DATE', len: '-' },
    '移出原因': { en: 'ycyy', type: 'VARCHAR', len: '200' },
    '行政处罚决定书文号': { en: 'xzcfjdswh', type: 'VARCHAR', len: '100' },
    '处罚事由': { en: 'cfsy', type: 'VARCHAR', len: '200' },
    '处罚结果': { en: 'cfjg', type: 'VARCHAR', len: '200' },
    '处罚决定日期': { en: 'cfjdrq', type: 'DATE', len: '-' },
    '股权冻结执行法院': { en: 'gqdjzxfy', type: 'VARCHAR', len: '100' },
    '冻结股权数额': { en: 'djgqse', type: 'DECIMAL', len: '16,2' },
    '动产抵押登记编号': { en: 'dcdydjbh', type: 'VARCHAR', len: '50' },
    '被担保债权数额': { en: 'bdbzqse', type: 'DECIMAL', len: '16,2' },
    '抵押物概况': { en: 'dywgk', type: 'VARCHAR', len: '200' }
  };

  if (pinyinMap[nameStr]) {
    const m = pinyinMap[nameStr];
    enName = m.en;
    dataType = m.type;
    length = m.len;
    if (m.dict) isDict = m.dict;
  } else {
    if (nameStr.includes('日期') || nameStr.includes('时间')) {
      dataType = 'DATE';
      length = '-';
    } else if (nameStr.includes('金额') || nameStr.includes('价格') || nameStr.includes('余额') || nameStr.includes('费用') || nameStr.includes('资本') || nameStr.includes('数额')) {
      dataType = 'DECIMAL';
      length = '16,2';
    } else if (nameStr.includes('次数') || nameStr.includes('数量') || nameStr.includes('年限') || nameStr.includes('顺位')) {
      dataType = 'NUMBER';
      length = '10';
    } else if (nameStr.includes('代码') || nameStr.includes('号') || nameStr.includes('编号') || nameStr.includes('账号')) {
      dataType = 'VARCHAR';
      length = '50';
    }
    if (nameStr.includes('类型') || nameStr.includes('状态') || nameStr.includes('方式')) {
      isDict = '是';
    }
  }

  return {
    name: nameStr,
    enName,
    dataType,
    description: '-',
    length,
    isDict,
    nullable,
    isPk
  };
}

export interface GovDataItem {
  id: string;
  industry: string; // 数据所属行业
  scenario: string; // 应用场景名称 ('不动产信息' | '公积金信息' | '卫健信息' | '法人信息')
  department: string; // 数据提供部门
  dataName: string; // 数据名称（数据主题）
  dataFields: string[]; // 数据项/字段
  fieldDetails?: DataFieldDetail[];
  updateFrequency: string; // 更新频率
  region: string; // 地域范围
  timeRange: string; // 时间范围
  provideMethod: string; // 提供方式
}

// 模拟完整政务数据集
const govDatasets: GovDataItem[] = [
  {
    id: '1',
    industry: '金融服务',
    scenario: '不动产信息',
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
    id: '2',
    industry: '金融服务',
    scenario: '不动产信息',
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
    id: '3',
    industry: '金融服务',
    scenario: '不动产信息',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产登记查封信息】',
    dataFields: ['是否存在查封'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '4',
    industry: '金融服务',
    scenario: '不动产信息',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产登记预告信息】',
    dataFields: ['预告登记类型', '预告登记日期', '预告登记权利人', '预告登记义务人', '预告登记证明号'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '5',
    industry: '金融服务',
    scenario: '不动产信息',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产登记历史变更记录】',
    dataFields: ['登记类型', '登记日期', '变更前权利人', '变更后权利人', '变更原因', '登记机构'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '6',
    industry: '金融服务',
    scenario: '不动产信息',
    department: '廊坊市自然资源和规划局',
    dataName: '【不动产权属人信息】',
    dataFields: ['权利人姓名', '证件类型', '证件号码', '共有方式', '共有份额', '联系电话'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '7',
    industry: '金融服务',
    scenario: '不动产信息',
    department: '廊坊市住房和城乡建设局',
    dataName: '【房屋网签备案信息】',
    dataFields: [
      '合同编号', '买受人姓名', '买受人证件类型', '买受人证件号码', '出卖人姓名',
      '出卖人证件类型', '出卖人证件号码', '房屋坐落', '房屋建筑面积', '房屋用途',
      '成交价格', '签约日期', '备案日期', '合同状态'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '8',
    industry: '金融服务',
    scenario: '不动产信息',
    department: '廊坊市住房和城乡建设局',
    dataName: '【房屋交易监管信息】',
    dataFields: ['监管账户编号', '监管金额', '监管状态', '资金划转记录', '交易完成确认状态'],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '近1年',
    provideMethod: '数据接口'
  },
  {
    id: '9',
    industry: '金融服务 / 生活服务',
    scenario: '公积金信息',
    department: '廊坊市住房公积金管理中心',
    dataName: '【公积金缴存与提取信息】',
    dataFields: [
      '个人公积金账号', '缴存状态', '单位缴存比例', '个人缴存比例', '月缴存额',
      '公积金余额', '最近缴存年月', '累计提取金额', '提取原因', '最近提取日期'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '10',
    industry: '金融服务 / 住房保障',
    scenario: '公积金信息',
    department: '廊坊市住房公积金管理中心',
    dataName: '【公积金贷款还款明细信息】',
    dataFields: [
      '公积金贷款合同号', '借款人姓名', '借款人证件号码', '贷款总额', '贷款期限',
      '月还款额', '贷款余额', '还款状态', '逾期次数', '当前逾期金额'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '11',
    industry: '医疗健康 / 金融服务',
    scenario: '卫健信息',
    department: '廊坊市卫生健康委员会',
    dataName: '【医院就诊与医疗结算信息】',
    dataFields: [
      '就诊流水号', '患者证件号码', '医院代码', '医院名称', '就诊类型',
      '就诊日期', '科室名称', '主要诊断名称', '医疗总费用', '医保报销金额', '自费金额'
    ],
    updateFrequency: '每日更新',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: '12',
    industry: '医疗健康',
    scenario: '卫健信息',
    department: '廊坊市卫生健康委员会',
    dataName: '【医疗机构执业与床位资源信息】',
    dataFields: [
      '医疗机构代码', '机构名称', '机构等级', '执业许可证号', '法定代表人',
      '编制床位数', '实有床位数', '空闲床位数', '特色科室', '执业医师数'
    ],
    updateFrequency: '每月更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '13',
    industry: '企业服务 / 金融服务',
    scenario: '法人信息',
    department: '廊坊市市场监督管理局',
    dataName: '【企业法人登记注册基本信息】',
    dataFields: [
      '统一社会信用代码', '企业名称', '法定代表人', '成立日期', '注册资本',
      '登记状态', '企业类型', '所属行业', '住所地址', '经营范围'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  },
  {
    id: '14',
    industry: '企业服务',
    scenario: '法人信息',
    department: '廊坊市市场监督管理局',
    dataName: '【企业经营异常与行政处罚信息】',
    dataFields: [
      '统一社会信用代码', '企业名称', '列入经营异常名录原因', '列入日期', '移出原因',
      '行政处罚决定书文号', '处罚事由', '处罚结果', '处罚决定日期'
    ],
    updateFrequency: '每日更新',
    region: '河北省廊坊市',
    timeRange: '近3年',
    provideMethod: '数据接口'
  },
  {
    id: '15',
    industry: '企业服务 / 金融服务',
    scenario: '法人信息',
    department: '廊坊市市场监督管理局',
    dataName: '【企业股权冻结与动产抵押信息】',
    dataFields: [
      '统一社会信用代码', '企业名称', '股权冻结执行法院', '冻结股权数额',
      '动产抵押登记编号', '被担保债权数额', '抵押物概况'
    ],
    updateFrequency: '实时更新',
    region: '河北省廊坊市',
    timeRange: '最新数据',
    provideMethod: '数据接口'
  }
];

const ALL_FILTER_VALUE = '全部';
const ITEMS_PER_PAGE = 10;

export function GovData() {
  const [searchParams] = useSearchParams();
  const initialIndustry = searchParams.get('industry') || searchParams.get('category') || ALL_FILTER_VALUE;

  const [activeIndustry, setActiveIndustry] = useState<string>(initialIndustry);
  const [activeDepartment, setActiveDepartment] = useState<string>(ALL_FILTER_VALUE);
  const [searchKey, setSearchKey] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [detailItem, setDetailItem] = useState<GovDataItem | null>(null);

  // 行业分类选项
  const industryOptions = [
    { label: '全部行业', value: ALL_FILTER_VALUE },
    { label: '金融服务', value: '金融服务' },
    { label: '生活服务', value: '生活服务' },
    { label: '医疗健康', value: '医疗健康' },
    { label: '企业服务', value: '企业服务' },
    { label: '住房保障', value: '住房保障' }
  ];

  // 部门分类选项
  const departmentOptions = [
    { label: '全部部门', value: ALL_FILTER_VALUE },
    { label: '廊坊市自然资源和规划局', value: '廊坊市自然资源和规划局' },
    { label: '廊坊市住房和城乡建设局', value: '廊坊市住房和城乡建设局' },
    { label: '廊坊市住房公积金管理中心', value: '廊坊市住房公积金管理中心' },
    { label: '廊坊市卫生健康委员会', value: '廊坊市卫生健康委员会' },
    { label: '廊坊市市场监督管理局', value: '廊坊市市场监督管理局' }
  ];

  // 统计各个筛选项的数量
  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_FILTER_VALUE]: govDatasets.length };
    industryOptions.forEach((opt) => {
      if (opt.value !== ALL_FILTER_VALUE) {
        counts[opt.value] = govDatasets.filter((d) => d.industry.includes(opt.value)).length;
      }
    });
    return counts;
  }, []);

  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_FILTER_VALUE]: govDatasets.length };
    departmentOptions.forEach((opt) => {
      if (opt.value !== ALL_FILTER_VALUE) {
        counts[opt.value] = govDatasets.filter((d) => d.department === opt.value).length;
      }
    });
    return counts;
  }, []);

  // 筛选过滤
  const filteredData = useMemo(() => {
    return govDatasets.filter((item) => {
      if (activeIndustry !== ALL_FILTER_VALUE && !item.industry.includes(activeIndustry)) {
        return false;
      }
      if (activeDepartment !== ALL_FILTER_VALUE && item.department !== activeDepartment) {
        return false;
      }
      if (searchKey.trim()) {
        const k = searchKey.toLowerCase();
        const matchName = item.dataName.toLowerCase().includes(k);
        const matchDept = item.department.toLowerCase().includes(k);
        const matchFields = item.dataFields.some((f) => f.toLowerCase().includes(k));
        const matchIndustry = item.industry.toLowerCase().includes(k);
        const matchScenario = item.scenario.toLowerCase().includes(k);
        if (!matchName && !matchDept && !matchFields && !matchIndustry && !matchScenario) {
          return false;
        }
      }
      return true;
    });
  }, [activeIndustry, activeDepartment, searchKey]);

  // 分页
  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // 如果选中了详情条目，渲染【面包屑二级详情页面】
  if (detailItem) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 text-xs py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 面包屑导航 */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-blue-700 transition-colors">
              首页
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <button
              onClick={() => setDetailItem(null)}
              className="hover:text-blue-700 transition-colors cursor-pointer font-medium"
            >
              数据资源目录
            </button>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">{detailItem.dataName}</span>
          </div>

          {/* 顶部详情 Banner / Header Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                {detailItem.dataName}
              </h1>
              <button
                onClick={() => setDetailItem(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>返回目录</span>
              </button>
            </div>

            {/* 详细信息区域 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs bg-slate-50 p-4 rounded-lg border border-slate-200/80">
              <div>
                <span className="text-slate-400">行业分类：</span>
                <span className="font-semibold text-slate-800">{detailItem.industry}</span>
              </div>
              <div>
                <span className="text-slate-400">提供部门：</span>
                <span className="font-semibold text-blue-700">{detailItem.department}</span>
              </div>
              <div>
                <span className="text-slate-400">地域范围：</span>
                <span className="font-medium text-slate-800">{detailItem.region}</span>
              </div>
              <div>
                <span className="text-slate-400">时间范围：</span>
                <span className="font-medium text-slate-800">{detailItem.timeRange}</span>
              </div>
              <div>
                <span className="text-slate-400">更新频率：</span>
                <span className="font-semibold text-emerald-700">{detailItem.updateFrequency}</span>
              </div>
              <div>
                <span className="text-slate-400">提供方式：</span>
                <span className="font-bold text-blue-700">{detailItem.provideMethod}</span>
              </div>
            </div>
          </div>

          {/* 数据项属性表格 */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Table className="w-4 h-4 text-blue-600" />
                <span>数据字段明细（共 {detailItem.dataFields.length} 项）</span>
              </h2>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white">
              <table className="w-full text-center border-collapse min-w-[720px] text-xs">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-700 border-b border-slate-200 font-bold divide-x divide-slate-200">
                    <th className="py-2.5 px-3">字段名称</th>
                    <th className="py-2.5 px-3">数据类型</th>
                    <th className="py-2.5 px-3">字段描述</th>
                    <th className="py-2.5 px-3">字段长度</th>
                    <th className="py-2.5 px-3">是否字典项</th>
                    <th className="py-2.5 px-3">是否为空</th>
                    <th className="py-2.5 px-3">是否主键</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal">
                  {detailItem.dataFields.map((fName, idx) => {
                    const row = (detailItem.fieldDetails && detailItem.fieldDetails[idx]) || generateFieldDetail(fName, idx);
                    return (
                      <tr
                        key={idx}
                        className={`divide-x divide-slate-200 hover:bg-blue-50/50 transition-colors ${
                          idx % 2 === 0 ? 'bg-blue-50/20' : 'bg-white'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-slate-900 font-medium">{row.name}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{row.dataType}</td>
                        <td className="py-2.5 px-3 text-slate-500">{row.description || '-'}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">{row.length || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.isDict || '否'}</td>
                        <td className="py-2.5 px-3 text-slate-700">{row.nullable || '否'}</td>
                        <td className="py-2.5 px-3 text-slate-700 font-semibold">{row.isPk || '否'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-blue-500/20">
      {/* 全屏 Banner 背景组件 */}
      <PageBanner
        title="数据资源目录"
        subtitle="归集不动产登记、住房建设、住房公积金、卫生健康及市场监管等数据共享目录与字段明细，支持跨部门数据安全合规共享与调用。"
        tag="数据资源目录"
        variant="政委数据"
      />

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 左侧侧边栏筛选器 */}
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                数据筛选
              </h3>

              {/* 1. 行业分类 */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">行业分类</p>
                <div className="flex flex-col gap-1">
                  {industryOptions.map((opt) => {
                    const isSelected = activeIndustry === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setActiveIndustry(opt.value);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        <span className="text-[10px] text-slate-400">{industryCounts[opt.value] || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. 部门分类 */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">部门分类</p>
                <div className="flex flex-col gap-1">
                  {departmentOptions.map((opt) => {
                    const isSelected = activeDepartment === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setActiveDepartment(opt.value);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <span className="truncate" title={opt.label}>{opt.label}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{departmentCounts[opt.value] || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </div>

          {/* 右侧主内容卡片展示区 */}
          <div className="flex-1 min-w-0 space-y-6">
            
            {/* 搜索框与结果计数栏 */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchKey}
                  onChange={(e) => {
                    setSearchKey(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="搜索数据名称、提供部门、字段或行业分类..."
                  className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                />
                {searchKey && (
                  <button
                    onClick={() => {
                      setSearchKey('');
                      setCurrentPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-500 shrink-0 font-medium">
                共检索到 <span className="font-bold text-blue-600">{filteredData.length}</span> 项数据资源
              </div>
            </div>

            {/* 卡片网格 */}
            {paginatedData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedData.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between group relative overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* 头部行业与更新频率 */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px] border border-blue-100">
                          {item.industry}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {item.updateFrequency}
                        </span>
                      </div>

                      {/* 数据主题名称 */}
                      <div>
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {item.dataName}
                        </h3>
                      </div>

                      {/* 信息网格 */}
                      <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-1.5">
                          <span className="text-slate-400 shrink-0">行业分类：</span>
                          <span className="text-slate-800 font-medium">{item.industry}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-slate-400 shrink-0">提供部门：</span>
                          <span className="text-slate-800 font-medium">{item.department}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <span className="text-slate-400 shrink-0">核心字段：</span>
                          <span className="text-slate-600 truncate">
                            {item.dataFields.slice(0, 4).join('、')}
                            {item.dataFields.length > 4 ? ` 等${item.dataFields.length}项` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 底部共享方式与数据预览按钮 */}
                    <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-mono">
                        共享方式：{item.provideMethod}
                      </span>
                      <button
                        onClick={() => setDetailItem(item)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>数据预览</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-2">
                <Database className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold">未找到匹配的数据资源</p>
              </div>
            )}

            {/* 分页组件 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer",
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
