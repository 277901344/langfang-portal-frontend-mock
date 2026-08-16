const PRODUCT_TYPE_LABELS: Record<string, string> = {
  'API 产品': 'API产品',
  '数据对象': '数字对象',
  '数据服务': 'API产品',
  DATASET: '数据集',
  DATASET_PRODUCT: '数据集',
  API_PRODUCT: 'API产品',
  STREAMING_PRODUCT: '其他',
  FILE_PRODUCT: '数据集',
};

const DELIVERY_TYPE_LABELS: Record<string, string> = {
  API_SERVICE: 'API服务',
  FILE_DUMP: '文件导出',
  FILE_SERVICE: '文件服务',
  STREAMING_SERVICE: '流式服务',
};

const DATA_ACQUISITION_LABELS: Record<string, string> = {
  '01': '原始取得',
  '02': '收集取得',
  '03': '交易取得',
  '04': '共享取得',
  '05': '其他',
};

const UPDATE_FREQUENCY_UNIT_LABELS: Record<string, string> = {
  '0': '实时',
  '1': '次/天',
  '2': '次/周',
  '3': '次/月',
  '4': '次/季度',
  '5': '次/年',
  '6': '不更新',
  '7': '其他',
};

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  '01': '文件传输',
  '02': '数据流传输',
  '03': 'API传输',
  '04': '其他',
};

const DATA_SIZE_UNIT_LABELS: Record<string, string> = {
  '1': 'MB',
  '2': 'GB',
  '3': 'TB',
};

const PERSONAL_INFORMATION_LABELS: Record<string, string> = {
  '0': '不涉及',
  '1': '一般个人信息',
  '2': '敏感个人信息',
};

const DATA_SUBJECT_LABELS: Record<string, string> = {
  '01': '个人信息',
  '02': '企业数据',
  '03': '公共数据',
};

const MEASURE_METHOD_LABELS: Record<string, string> = {
  '1': '按用量',
  '2': '按周期',
  '3': '按条数',
  '4': '按次数',
  '5': '按订阅',
  '6': '按流量',
  '7': '一事一议',
};

const UNIT_LABELS: Record<string, string> = {
  '1': '元/MB',
  '2': '元/GB',
  '3': '元/TB',
  '4': '元/天',
  '5': '元/月',
  '6': '元/年',
  '7': '元/条',
  '8': '元/次',
};

const AUTH_MODE_LABELS: Record<string, string> = {
  '0': '无需授权',
  '1': '需要授权',
};

export function formatProductType(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return PRODUCT_TYPE_LABELS[normalized] || normalized;
}

export function formatDeliveryType(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return DELIVERY_TYPE_LABELS[normalized] || normalized;
}

export function formatProductDataAcquisition(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return DATA_ACQUISITION_LABELS[normalized] || normalized;
}

export function formatProductUpdateFrequency(updateFrequency?: string, updateFrequencyUnit?: string) {
  const unitCode = updateFrequencyUnit?.trim();
  const count = updateFrequency?.trim();
  if (!unitCode) return count || '';
  const unitLabel = UPDATE_FREQUENCY_UNIT_LABELS[unitCode] || unitCode;
  if (['0', '6', '7'].includes(unitCode)) return unitLabel;
  return `${count || '1'}${unitLabel}`;
}

export function formatProductDeliveryMethod(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return DELIVERY_METHOD_LABELS[normalized] || normalized;
}

export function formatProductDataSize(dataSize?: number, dataSizeUnit?: string) {
  if (dataSize === undefined || dataSize === null) return '';
  const unitCode = dataSizeUnit?.trim();
  const unit = unitCode ? (DATA_SIZE_UNIT_LABELS[unitCode] || unitCode) : '';
  return `${dataSize}${unit}`;
}

export function formatProductPrice(value?: number) {
  if (value === undefined || value === null) return '';
  return `${Number(value).toFixed(2)}元`;
}

export function formatProductPersonalInformation(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return PERSONAL_INFORMATION_LABELS[normalized] || normalized;
}

export function formatProductDataSubject(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return DATA_SUBJECT_LABELS[normalized] || normalized;
}

export function formatProductMeasureMethod(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return MEASURE_METHOD_LABELS[normalized] || normalized;
}

export function formatProductUnit(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return UNIT_LABELS[normalized] || normalized;
}

export function formatProductQualityLevel(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return normalized.endsWith('级') ? normalized : `${normalized}级`;
}

export function formatProductSecurityLevel(value?: string) {
  if (!value) return '';
  const normalized = value.trim();
  return /^\d+$/.test(normalized) ? `${normalized}级` : normalized;
}

export function formatProductPricingModel(value?: string | number) {
  if (value === undefined || value === null || value === '') return '';
  return Number(value) === 1 ? '可包装' : '不可包装';
}

export function formatProductAuthMode(value?: string | number) {
  if (value === undefined || value === null || value === '') return '';
  const normalized = String(value).trim();
  return AUTH_MODE_LABELS[normalized] || normalized;
}
