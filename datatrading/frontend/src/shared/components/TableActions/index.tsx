import React, { useMemo } from 'react';
import { Space, Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';

/**
 * 表格操作列的操作项定义
 */
export interface ActionItem {
  /** 唯一标识，通常用于 React 的 key 属性 */
  key: string;
  /** 按钮或菜单项显示的文本内容 */
  label: React.ReactNode;
  /** 按钮或菜单项的前置图标 */
  icon?: React.ReactNode;
  /** 是否为危险操作（会显示为红色，常用于"删除"、"作废"等） */
  danger?: boolean;
  /** 是否禁用该操作 */
  disabled?: boolean;
  /** 是否展示加载态 */
  loading?: boolean;
  /** 鼠标悬浮时的提示文字（如果由于权限等被 disabled，可通过 tooltip 告知原因） */
  tooltip?: React.ReactNode;
  /** 点击事件回调 */
  onClick?: () => void;
  /** 是否显示该操作项。默认为 true。如果为 false，该操作项不仅会被隐藏，还会被完全过滤掉 */
  show?: boolean; 
}

/**
 * 表格操作列统一组件属性
 */
export interface TableActionsProps {
  /** 
   * 操作项数组
   * 示例：[{ key: 'edit', label: '编辑', onClick: () => {} }]
   */
  actions: ActionItem[];
  /**
   * 最大外显操作数量（超过该数量将会被收纳进“更多”的下拉菜单中）。
   * 默认值为 3。
   * 注意：为了流出“更多”按钮的位置，如果 actions.length > maxVisible，实际外显数量会自动变为 maxVisible - 1。
   */
  maxVisible?: number; 
}

/**
 * 全局统一的表格操作列展示组件。
 * 
 * 遵循《前端表格操作栏 UI 统一规范》：
 * 1. 默认平铺展示 1-3 个主要操作。
 * 2. 如果操作项超过最大限制（maxVisible），多余的低频操作会自动收纳进“更多...”下拉菜单中。
 * 3. 自动适配 danger（标红警告）、disabled（置灰禁用）、tooltip（提示语）等属性。
 * 4. 彻底解放开发者手动编写 Space、Button、Dropdown 的重复劳动。
 */
export const TableActions: React.FC<TableActionsProps> = ({ actions, maxVisible = 3 }) => {
  const visibleActions = useMemo(() => actions.filter((a) => a.show !== false), [actions]);

  if (visibleActions.length === 0) {
    return null;
  }

  let displayCount = visibleActions.length;
  // If we exceed maxVisible, we need to leave room for the "More" button
  if (visibleActions.length > maxVisible) {
    displayCount = Math.max(1, maxVisible - 1);
  }

  const inlineActions = visibleActions.slice(0, displayCount);
  const dropdownActions = visibleActions.slice(displayCount);

  const renderInlineAction = (action: ActionItem) => {
    const btnClass = action.disabled 
      ? '' 
      : (action.danger 
          ? '!text-red-500 hover:!text-red-400 hover:!bg-red-50 transition-colors' 
          : '!text-blue-600 hover:!text-blue-500 hover:!bg-blue-50 transition-colors');

    const btn = (
      <Button
        key={action.key}
        type="text"
        danger={action.danger}
        disabled={action.disabled}
        loading={action.loading}
        icon={action.icon}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          action.onClick?.();
        }}
        className={btnClass}
        style={{ 
          padding: '0 6px',
          fontSize: '14px', 
          height: '24px', 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          lineHeight: '1', 
          verticalAlign: 'middle'
        }}
      >
        {action.label}
      </Button>
    );

    if (action.tooltip) {
      return (
        <Tooltip key={action.key} title={action.tooltip}>
          {action.disabled ? <span style={{ cursor: 'not-allowed' }}>{btn}</span> : btn}
        </Tooltip>
      );
    }
    
    return btn;
  };

  const menuItems: MenuProps['items'] = dropdownActions.map((action) => {
    const labelClass = action.disabled ? '' : (action.danger ? '!text-red-500 group-hover:!text-red-500' : '!text-blue-600 group-hover:!text-blue-500');
    const itemClass = action.disabled ? '' : (action.danger ? 'hover:!bg-red-50 transition-colors group' : 'hover:!bg-blue-50 transition-colors group');

    return {
      key: action.key,
      danger: action.danger,
      disabled: action.disabled,
      className: itemClass,
      icon: action.icon,
      label: (
        <span className={labelClass}>
          {action.tooltip && !action.disabled ? (
            <Tooltip title={action.tooltip} placement="left">
              {action.label}
            </Tooltip>
          ) : (
            action.label
          )}
        </span>
      ),
      onClick: (info) => {
        info.domEvent.preventDefault();
        info.domEvent.stopPropagation();
        if (action.onClick) action.onClick();
      },
    };
  });

  return (
    <Space size={4}>
      {inlineActions.map(renderInlineAction)}
      {dropdownActions.length > 0 && (
        <Dropdown menu={{ items: menuItems }} trigger={['hover']} placement="bottomRight">
          <Button 
            type="text" 
            className="!text-blue-600 hover:!text-blue-500 hover:!bg-blue-50 transition-colors"
            style={{ 
              padding: '0 6px',
              fontSize: '14px', 
              height: '24px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              lineHeight: '1',
              verticalAlign: 'middle'
            }} 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Space size={2} align="center">
              更多
              <DownOutlined style={{ fontSize: '10px' }} />
            </Space>
          </Button>
        </Dropdown>
      )}
    </Space>
  );
};
