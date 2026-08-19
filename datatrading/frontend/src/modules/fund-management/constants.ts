import type { TagProps } from 'antd';

export const ACCOUNT_ROLE_OPTIONS = [
  { label: '全部角色', value: '' },
  { label: '需求方', value: 'BUYER' },
  { label: '提供方', value: 'SELLER' },
];

export const FLOW_TYPE_OPTIONS = [
  { label: '全部类型', value: '' },
  { label: '充值', value: 'RECHARGE' },
  { label: '充值作废', value: 'RECHARGE_VOID' },
  { label: '扣费', value: 'DEBIT' },
  { label: '扣费作废', value: 'DEBIT_VOID' },
  { label: '收入', value: 'INCOME' },
  { label: '收入冲回', value: 'INCOME_VOID' },
];

export const ROLE_LABEL: Record<string, string> = {
  BUYER: '需求方',
  SELLER: '提供方',
};

export const FLOW_TYPE_LABEL: Record<string, string> = {
  RECHARGE: '充值',
  RECHARGE_VOID: '充值作废',
  DEBIT: '扣费',
  DEBIT_VOID: '扣费作废',
  INCOME: '收入',
  INCOME_VOID: '收入冲回',
};

export const FLOW_COLOR: Record<string, TagProps['color']> = {
  RECHARGE: 'blue',
  RECHARGE_VOID: 'orange',
  DEBIT: 'red',
  DEBIT_VOID: 'gold',
  INCOME: 'green',
  INCOME_VOID: 'purple',
};
