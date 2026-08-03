import type { PortalProductFilterOption } from './products';

export type PortalStaticFilterOption = {
  label: string;
  value: string;
};

export const PORTAL_PRODUCT_TYPE_OPTIONS: PortalStaticFilterOption[] = [
  { label: '数据集', value: '数据集' },
  { label: 'API产品', value: 'API产品' },
  { label: '数据应用', value: '数据应用' },
  { label: '数据报告', value: '数据报告' },
  { label: '数字对象', value: '数字对象' },
  { label: '其他', value: '其他' },
];

export const PORTAL_PRODUCT_BUSINESS_CATEGORY_OPTIONS: PortalStaticFilterOption[] = [
  '工程建设',
  '运营输配',
  '安全应急',
  '运维保障',
  '科技创新',
  '合规管理',
  '电力能源',
  '工业制造',
  '现代农业',
  '商贸流通',
  '交通运输',
  '金融服务',
  '文化旅游',
  '医疗健康',
  '应急管理',
  '气象服务',
  '城市治理',
  '绿色低碳',
  '其他',
].map((value) => ({ label: value, value }));

export const PORTAL_PRODUCT_DELIVERY_METHOD_OPTIONS: PortalStaticFilterOption[] = [
  { label: '文件传输', value: '01' },
  { label: '数据流传输', value: '02' },
  { label: 'API传输', value: '03' },
  { label: '其他', value: '04' },
];

export function mergePortalProductFilterOptions(
  baseOptions: PortalStaticFilterOption[],
  countedOptions: PortalProductFilterOption[],
): PortalProductFilterOption[] {
  const countsByValue = new Map<string, number>();
  const countsByLabel = new Map<string, number>();

  countedOptions.forEach((option) => {
    if (typeof option.count !== 'number') return;
    countsByValue.set(option.value, option.count);
    countsByLabel.set(option.label, option.count);
  });

  return baseOptions.map((option) => ({
    ...option,
    count: countsByValue.get(option.value) ?? countsByLabel.get(option.label),
  }));
}
