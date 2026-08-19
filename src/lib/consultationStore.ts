export type ConsultationStatus = '待处理' | '跟进中' | '已完成' | '已忽略';

export interface BusinessConsultation {
  id: string;
  name: string;
  phone: string;
  orgName: string;
  position: string;
  coopType: '合作伙伴申请' | '合作咨询' | string;
  description: string;
  createdAt: string;
  status: ConsultationStatus;
  assignee?: string;
  notes?: string;
}

const STORAGE_KEY = 'jingji_business_consultations_v1';

export const INITIAL_CONSULTATIONS: BusinessConsultation[] = [
  {
    id: 'CS-20260811-001',
    name: '张伟',
    phone: '13812345678',
    orgName: '廊坊智云数字科技有限公司',
    position: '技术总监',
    coopType: '合作伙伴申请',
    description: '希望作为技术支撑服务商接入城市可信数据空间，部署分布式数据连接器节点，并开展TEE密态计算联合研发。',
    createdAt: '2026-08-11 16:45',
    status: '待处理',
  },
  {
    id: 'CS-20260811-002',
    name: '李香玉',
    phone: '18698765432',
    orgName: '河北数通普惠金融服务有限公司',
    position: '业务负责人',
    coopType: '合作咨询',
    description: '咨询关于绿色信贷核验场景的数据授权与合规准入流程，希望对接廊坊电力与公共信用数据专区。',
    createdAt: '2026-08-11 11:20',
    status: '跟进中',
    assignee: '王生态顾问',
    notes: '8/11 已电话初沟通，已发送合规准入指南及评估模板，预约8/13开展线下部署方案研讨。',
  },
  {
    id: 'CS-20260810-003',
    name: '王建国',
    phone: '13900112233',
    orgName: '天津渤海供应链物流集团',
    position: '副总经理',
    coopType: '合作伙伴申请',
    description: '拟作为数据供给侧接入港口多式联运轨迹数据集，希望能获取空间节点访问及收益结算方案。',
    createdAt: '2026-08-10 09:15',
    status: '已完成',
    assignee: '张经理',
    notes: '8/10 合作框架协议已签署完成，平台已分配专属数据节点与准入密钥，已移交技术运维团队实施部署。',
  },
  {
    id: 'CS-20260809-004',
    name: '赵敏',
    phone: '15033445566',
    orgName: '北京大健康医疗数据研究院',
    position: '项目总监',
    coopType: '合作咨询',
    description: '了解医疗健康数据专区的密态计算与脱敏规范，拟开展脱敏临床评价集的跨域合规分析。',
    createdAt: '2026-08-09 17:00',
    status: '跟进中',
    assignee: '刘合规专员',
    notes: '8/09 合规团队审核方案中，已提示对方提交医疗数据算法伦理承诺书。',
  },
  {
    id: 'CS-20260808-005',
    name: '陈明',
    phone: '17711223344',
    orgName: '廊坊市源畅建材工贸有限公司',
    position: '总经理',
    coopType: '合作咨询',
    description: '询问个人及小微企业普通产品采购开票及配送售后事宜。',
    createdAt: '2026-08-08 10:30',
    status: '已忽略',
    assignee: '客服专员',
    notes: '非可信数据空间合作范畴，已引导联系对应商城客服。',
  },
];

export function getStoredConsultations(): BusinessConsultation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONSULTATIONS));
      return INITIAL_CONSULTATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load consultations:', err);
    return INITIAL_CONSULTATIONS;
  }
}

export function saveConsultations(data: BusinessConsultation[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save consultations:', err);
  }
}

export function addConsultation(input: {
  name: string;
  phone: string;
  orgName: string;
  position: string;
  coopType: string;
  description: string;
}): BusinessConsultation {
  const current = getStoredConsultations();
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const randNum = Math.floor(100 + Math.random() * 900);
  const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const newItem: BusinessConsultation = {
    id: `CS-${dateStr}-${randNum}`,
    name: input.name,
    phone: input.phone,
    orgName: input.orgName,
    position: input.position,
    coopType: input.coopType,
    description: input.description,
    createdAt: timeStr,
    status: '待处理',
  };

  const updated = [newItem, ...current];
  saveConsultations(updated);
  return newItem;
}

export function updateConsultationStatus(
  id: string,
  status: ConsultationStatus,
  notes?: string,
  assignee?: string
): BusinessConsultation[] {
  const current = getStoredConsultations();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status,
        ...(notes !== undefined ? { notes } : {}),
        ...(assignee !== undefined ? { assignee } : {}),
      };
    }
    return item;
  });
  saveConsultations(updated);
  return updated;
}

export function deleteConsultation(id: string): BusinessConsultation[] {
  const current = getStoredConsultations();
  const updated = current.filter((item) => item.id !== id);
  saveConsultations(updated);
  return updated;
}
