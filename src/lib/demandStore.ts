import { DemandItem, DemandResponseItem, DemandStatus, mockDemands } from '../data/mockDemands';

export interface AuditRecord {
  auditor: string;
  auditTime: string;
  auditResult: '审核通过' | '审核驳回' | '违规下架';
  auditComment: string;
  reasonCategory?: string;
}

export interface DemandExtendedItem extends DemandItem {
  auditStatus?: '待审核' | '已通过' | '已驳回' | '已下架';
  auditRecords?: AuditRecord[];
  rejectReason?: string;
  rejectReasonCategory?: string;
  lastAuditTime?: string;
}

const STORAGE_KEY = 'jingji_portal_demands_v3';

export const INITIAL_DEMANDS: DemandExtendedItem[] = [
  {
    id: 'DEM-2026-AUDIT-001',
    title: '京津冀产业园区高耗能企业绿色用电与碳减排追踪数据需求',
    status: '已发布',
    auditStatus: '已通过',
    type: '我发布的',
    publisher: '廊坊市***高新产业投资促进局',
    publisherOrg: '廊坊市高新技术产业园区管理委员会',
    description: '拟引入园区重点用能企业月度用电负荷、光伏绿电消纳比例以及天然气消耗脱敏数据，用于搭建工业园区双碳智慧监测沙盘，评估企业节能减排绩效。',
    topicCategory: '工业制造',
    applicationScene: '双碳监测与节能减排评估',
    productType: '时序数据集 / API接口',
    updateFrequency: '每月',
    usePurpose: '用于园区企业节能改造补贴评定与绿色工厂遴选，数据仅在园区专网环境密态分析，不进行二次流转。',
    budgetType: '按项目采购',
    budgetAmount: '35 万元 / 年',
    datasetRequirement: '重点企业月度脱敏用电负荷（kWh）、光伏并网发电量、天然气表读数时序',
    expectedFields: ['企业社会信用代码(脱敏)', '用电时序读数', '峰谷用电占比', '绿电消纳量', '碳排放估算值'],
    deadline: '2026-09-30',
    responseCount: 0,
    createdAt: '2026-08-16 18:20',
    budget: '35 万元 / 年',
    contactPerson: '李科长',
    contactPhone: '138****6677',
    responses: [],
    auditRecords: [],
  },
  {
    id: 'DEM-2026-AUDIT-002',
    title: '临空经济区跨境生鲜冷链多温区溯源与报关时效比对数据',
    status: '已发布',
    auditStatus: '已通过',
    type: '我发布的',
    publisher: '廊坊***国际供应链管理有限公司',
    publisherOrg: '廊坊临空经济区智慧物流运营中心',
    description: '申请对接海关冷链查验放行时序节点、机场货站温湿度监控与冷藏车GPS轨迹数据，构建全程冷链安全可信溯源体系。',
    topicCategory: '供应链物流',
    applicationScene: '跨境生鲜通关时效优化与断链预警',
    productType: '数据集',
    updateFrequency: '实时 / 每日',
    usePurpose: '优化进出口生鲜查验流转排队模型，并在发生异常温控波动时及时联动预警。',
    budgetType: '按次结算',
    budgetAmount: '20 万元',
    datasetRequirement: '冷链集装箱查验放行时间戳、货站恒温库温湿度探头读数、冷藏车车载GPS脱敏轨迹',
    expectedFields: ['集装箱编号(脱敏)', '查验通关耗时', '温度时序曲线', '湿度时序曲线', '运输路线合规状态'],
    deadline: '2026-10-15',
    responseCount: 0,
    createdAt: '2026-08-16 15:45',
    budget: '20 万元',
    contactPerson: '赵总监',
    contactPhone: '150****8899',
    responses: [],
    auditRecords: [],
  },
  {
    id: 'DEM-2026-REJECT-001',
    title: '商业机构个人精准消费行为与银联信用卡流水明细直连需求',
    status: '未发布',
    auditStatus: '已驳回',
    type: '我发布的',
    publisher: '某***商业智能营销科技有限公司',
    publisherOrg: '某***大数据营销推广服务部',
    description: '申请获取廊坊市各商圈个人信用卡消费明细、单笔消费金额与家庭住址信息，用于精准商户广告推流。',
    topicCategory: '金融服务',
    applicationScene: '商业精准营销推流',
    productType: '原始数据库直连',
    updateFrequency: '每日',
    usePurpose: '用于商业店铺精准短信营销与电话推广。',
    budgetType: '按量付费',
    budgetAmount: '50 万元',
    datasetRequirement: '个人银行卡消费明细流水、用户手机号、住址定位',
    deadline: '2026-09-01',
    responseCount: 0,
    createdAt: '2026-08-15 10:12',
    budget: '50 万元',
    contactPerson: '孙某某',
    contactPhone: '189****0001',
    responses: [],
    rejectReasonCategory: '涉及个人敏感隐私未脱敏',
    rejectReason: '经平台合规委员会审查，该需求申请获取个人信用卡流水明细与未脱敏住址，违反《数据安全法》《个人信息保护法》相关规定，且使用目的涉及未经授权的商业营销推流，不符合可信数据空间准入规范。请整改为聚合匿名化客流统计指标后重新提交。',
    lastAuditTime: '2026-08-15 14:30',
    auditRecords: [
      {
        auditor: '平台合规风控组 - 王审查员',
        auditTime: '2026-08-15 14:30',
        auditResult: '审核驳回',
        auditComment: '经平台合规委员会审查，该需求申请获取个人信用卡流水明细与未脱敏住址，违反《数据安全法》《个人信息保护法》相关规定，且使用目的涉及未经授权的商业营销推流，不符合可信数据空间准入规范。请整改为聚合匿名化客流统计指标后重新提交。',
        reasonCategory: '涉及个人敏感隐私未脱敏',
      },
    ],
  },
  ...mockDemands.map((d, index) => {
    const isApproved = d.status !== '未发布';
    return {
      ...d,
      auditStatus: isApproved ? ('已通过' as const) : ('待审核' as const),
      auditRecords: isApproved
        ? [
            {
              auditor: '系统自动合规审查 / 平台管理员',
              auditTime: d.createdAt !== '-' ? d.createdAt : '2026-08-10 10:00',
              auditResult: '审核通过' as const,
              auditComment: '需求发布主体资质已通过权威认证，数据使用目的明确且符合密态安全准入规范，准予上架需求大厅公开招募。',
            },
          ]
        : [],
    };
  }),
];

export function getStoredDemands(): DemandExtendedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMANDS));
      return INITIAL_DEMANDS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMANDS));
      return INITIAL_DEMANDS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse stored demands:', err);
    return INITIAL_DEMANDS;
  }
}

export function saveStoredDemands(list: DemandExtendedItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save demands to storage:', err);
  }
}

export function addDemand(params: {
  title: string;
  topicCategory: string;
  type?: DemandItem['type'];
  applicationScene?: string;
  productType?: string;
  updateFrequency?: string;
  usePurpose?: string;
  description: string;
  datasetRequirement?: string;
  expectedFields?: string[];
  budgetType?: string;
  budgetAmount?: string;
  deadline?: string;
  publisher?: string;
  publisherOrg?: string;
  contactPerson?: string;
  contactPhone?: string;
}): DemandExtendedItem {
  const now = new Date();
  const dateStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
  const newId = `DEM-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;

  const newItem: DemandExtendedItem = {
    id: newId,
    title: params.title,
    status: '已发布',
    auditStatus: '已通过',
    type: params.type || '我发布的',
    publisher: params.publisher || 'lfssjj_admin',
    publisherOrg: params.publisherOrg || '廊坊市数据局',
    description: params.description,
    topicCategory: params.topicCategory || '城市治理',
    applicationScene: params.applicationScene || '-',
    productType: params.productType || '数据集',
    updateFrequency: params.updateFrequency || '每周',
    usePurpose: params.usePurpose || '-',
    budgetType: params.budgetType || '面议',
    budgetAmount: params.budgetAmount || '-',
    datasetRequirement: params.datasetRequirement || params.description,
    expectedFields: params.expectedFields || [],
    deadline: params.deadline || '2026-09-30',
    responseCount: 0,
    createdAt: dateStr,
    budget: params.budgetAmount || params.budgetType || '面议',
    contactPerson: params.contactPerson || 'lfssjj_admin',
    contactPhone: params.contactPhone || '173****2231',
    responses: [],
    auditRecords: [],
  };

  const list = getStoredDemands();
  const updated = [newItem, ...list];
  saveStoredDemands(updated);
  return newItem;
}

export function auditDemand(
  id: string,
  result: '审核通过' | '审核驳回' | '违规下架',
  comment: string,
  auditor = '平台管理员 (admin_lf)',
  reasonCategory?: string
): DemandExtendedItem[] {
  const now = new Date();
  const timeStr = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
  const list = getStoredDemands();

  const record: AuditRecord = {
    auditor,
    auditTime: timeStr,
    auditResult: result,
    auditComment: comment,
    reasonCategory,
  };

  const updated = list.map((item) => {
    if (item.id === id) {
      if (result === '审核通过') {
        return {
          ...item,
          status: '已发布' as DemandStatus,
          auditStatus: '已通过' as const,
          rejectReason: undefined,
          rejectReasonCategory: undefined,
          lastAuditTime: timeStr,
          auditRecords: [record, ...(item.auditRecords || [])],
        };
      } else if (result === '审核驳回') {
        return {
          ...item,
          status: '未发布' as DemandStatus,
          auditStatus: '已驳回' as const,
          rejectReason: comment,
          rejectReasonCategory: reasonCategory,
          lastAuditTime: timeStr,
          auditRecords: [record, ...(item.auditRecords || [])],
        };
      } else if (result === '违规下架') {
        return {
          ...item,
          status: '已关闭' as DemandStatus,
          auditStatus: '已下架' as const,
          rejectReason: comment,
          rejectReasonCategory: reasonCategory,
          lastAuditTime: timeStr,
          auditRecords: [record, ...(item.auditRecords || [])],
        };
      }
    }
    return item;
  });

  saveStoredDemands(updated);
  return updated;
}

export function submitDemandResponse(
  demandId: string,
  response: {
    responder?: string;
    responderOrg?: string;
    solutionDesc: string;
    pricingType?: string;
    quoteAmount?: string;
    deliveryType?: string;
    relatedProduct?: string;
    solutionName?: string;
    contactPerson?: string;
    contactPhone?: string;
  }
): DemandExtendedItem[] {
  const now = new Date();
  const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`;
  const respId = `RESP-${Date.now()}`;

  const newResp: DemandResponseItem = {
    id: respId,
    responder: response.responder || 'Ifsc_admin',
    responderOrg: response.responderOrg || '廊坊市***科技集团有限公司',
    solutionDesc: response.solutionDesc,
    pricingType: response.pricingType || '面议',
    quoteAmount: response.quoteAmount,
    deliveryType: response.deliveryType || '数据集',
    relatedProduct: response.relatedProduct || '可信数据空间标准连接器 v2.0',
    solutionName: response.solutionName || '可信数据空间对接交付方案',
    date: dateFormatted,
    status: '待处理',
  };

  const list = getStoredDemands();
  const updated = list.map((d) => {
    if (d.id === demandId) {
      return {
        ...d,
        status: '已有响应' as DemandStatus,
        responseCount: (d.responses?.length || 0) + 1,
        responses: [...(d.responses || []), newResp],
      };
    }
    return d;
  });

  saveStoredDemands(updated);
  return updated;
}

export function acceptDemandResponse(demandId: string, responseId: string): DemandExtendedItem[] {
  const list = getStoredDemands();
  const updated = list.map((d) => {
    if (d.id === demandId) {
      const updatedResps = (d.responses || []).map((r) =>
        r.id === responseId ? { ...r, status: '已接受' as const } : { ...r, status: (r.status === '待处理' ? '已拒绝' : r.status) as any }
      );
      return {
        ...d,
        status: '已匹配' as DemandStatus,
        responses: updatedResps,
      };
    }
    return d;
  });
  saveStoredDemands(updated);
  return updated;
}

export function rejectDemandResponse(demandId: string, responseId: string): DemandExtendedItem[] {
  const list = getStoredDemands();
  const updated = list.map((d) => {
    if (d.id === demandId) {
      const updatedResps = (d.responses || []).map((r) =>
        r.id === responseId ? { ...r, status: '已拒绝' as const } : r
      );
      return {
        ...d,
        responses: updatedResps,
      };
    }
    return d;
  });
  saveStoredDemands(updated);
  return updated;
}

export function updateDemandContent(demandId: string, updates: Partial<DemandExtendedItem>): DemandExtendedItem[] {
  const list = getStoredDemands();
  const updated = list.map((d) => {
    if (d.id === demandId) {
      return {
        ...d,
        ...updates,
        // If it was rejected and edited, reset to 待审核
        auditStatus: '待审核' as const,
        status: '未发布' as const,
      };
    }
    return d;
  });
  saveStoredDemands(updated);
  return updated;
}

export function deleteDemand(id: string): DemandExtendedItem[] {
  const list = getStoredDemands();
  const updated = list.filter((item) => item.id !== id);
  saveStoredDemands(updated);
  return updated;
}
