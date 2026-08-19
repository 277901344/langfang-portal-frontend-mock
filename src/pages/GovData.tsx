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
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ALL_GOV_DEPARTMENTS } from '../data/mockResources';
import {
  govDatasets,
  GovDataItem,
  DataFieldDetail,
  GOV_INDUSTRY_CATEGORIES
} from '../data/govDatasets';

export type { GovDataItem, DataFieldDetail };

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
  const [industryExpanded, setIndustryExpanded] = useState<boolean>(false);

  // 行业分类选项 (国民经济行业分类 20 大类)
  const industryOptions = useMemo(() => {
    return GOV_INDUSTRY_CATEGORIES.map((cat) => ({
      label: cat,
      value: cat === '全部行业' ? ALL_FILTER_VALUE : cat,
    }));
  }, []);

  // 部门统计（包含 48 个全集部门）
  const departmentCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_FILTER_VALUE]: govDatasets.length };
    ALL_GOV_DEPARTMENTS.forEach((dept) => {
      counts[dept] = govDatasets.filter((d) => d.department === dept).length;
    });
    return counts;
  }, []);

  // 部门分类选项 (按全集 48 个部门：有数据的部门排在上面，没数据的部门排在下面)
  const departmentOptions = useMemo(() => {
    const withData = ALL_GOV_DEPARTMENTS.filter((dept) => (departmentCounts[dept] || 0) > 0);
    const withoutData = ALL_GOV_DEPARTMENTS.filter((dept) => (departmentCounts[dept] || 0) === 0);

    // 有数据的部门按数量从高到低排序，同数量保持在全集中的原有相对顺序
    withData.sort((a, b) => (departmentCounts[b] || 0) - (departmentCounts[a] || 0));

    return [
      { label: '全部部门', value: ALL_FILTER_VALUE },
      ...withData.map((d) => ({ label: d, value: d })),
      ...withoutData.map((d) => ({ label: d, value: d })),
    ];
  }, [departmentCounts]);

  // 统计各个行业筛选项的数量
  const industryCounts = useMemo(() => {
    const counts: Record<string, number> = { [ALL_FILTER_VALUE]: govDatasets.length };
    industryOptions.forEach((opt) => {
      if (opt.value !== ALL_FILTER_VALUE) {
        counts[opt.value] = govDatasets.filter((d) => d.industry.includes(opt.value)).length;
      }
    });
    return counts;
  }, [industryOptions]);

  // 可见的行业分类（折叠/展开）
  const visibleIndustryOptions = useMemo(() => {
    if (industryExpanded) return industryOptions;
    const defaults = industryOptions.slice(0, 6);
    if (activeIndustry !== ALL_FILTER_VALUE && !defaults.some((d) => d.value === activeIndustry)) {
      const selectedOpt = industryOptions.find((d) => d.value === activeIndustry);
      if (selectedOpt) return [...defaults.slice(0, 5), selectedOpt];
    }
    return defaults;
  }, [industryExpanded, activeIndustry, industryOptions]);

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
        <div className="w-full max-w-[1680px] mx-auto space-y-6">
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

      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 mt-8 sm:mt-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          
          {/* 左侧侧边栏筛选器 */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                数据筛选
              </h3>

              {/* 1. 行业分类 */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-500">行业分类</p>
                  <span className="text-[10px] text-slate-400 font-mono">共20大类</span>
                </div>
                <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1">
                  {visibleIndustryOptions.map((opt) => {
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
                        <span className="truncate" title={opt.label}>{opt.label}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{industryCounts[opt.value] || 0}</span>
                      </button>
                    );
                  })}
                </div>
                {industryOptions.length > 6 && (
                  <button
                    onClick={() => setIndustryExpanded(!industryExpanded)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer w-full justify-center py-1 hover:bg-blue-50/50 rounded-md transition-colors"
                  >
                    {industryExpanded ? (
                      <>
                        <span>收起行业</span>
                        <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <span>展开全部行业 ({industryOptions.length - 1}类)</span>
                        <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 2. 部门分类 */}
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-500">部门分类</p>
                  <span className="text-[10px] text-slate-400 font-mono">共48个部门</span>
                </div>
                <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1">
                  {departmentOptions.map((opt) => {
                    const isSelected = activeDepartment === opt.value;
                    const count = departmentCounts[opt.value] || 0;
                    const isZero = opt.value !== ALL_FILTER_VALUE && count === 0;

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
                            : isZero
                            ? "text-slate-400 hover:bg-slate-50 hover:text-slate-700 font-normal"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <span className="truncate" title={opt.label}>{opt.label}</span>
                        <span className={cn(
                          "text-[10px] shrink-0 ml-1 font-mono",
                          isSelected ? "text-blue-600 font-bold" : isZero ? "text-slate-300" : "text-slate-400"
                        )}>
                          {count}
                        </span>
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
