import React, { useMemo } from 'react';
import { Space, Button, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { ActionItem } from '../TableActions';

export interface CardActionsProps {
  /** 
   * 操作项数组
   * 与 TableActions 共用 ActionItem 接口 
   */
  actions: ActionItem[];
  
  /** 
   * 最大外显按钮数量，此数量外的按钮将被折叠进“更多”菜单中。
   * 卡片操作区域较窄，默认建议值为 2。
   */
  maxVisible?: number;
}

/**
 * 全局统一的卡片操作栏组件。
 * 
 * 遵循《卡片操作项布局与样式方案》：
 * 1. 纯文字按钮：卡片底部去除按钮边框，全部使用纯文字链接。
 * 2. 智能折叠：默认外显最大 1-2 个操作，剩余自动收纳下拉。
 * 3. 灵活嵌入：不包含任何外部容器的宽度限制，只负责渲染横向按钮组，开箱即用。
 */
export const CardActions: React.FC<CardActionsProps> = ({ actions, maxVisible = 2 }) => {
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
        onClick={(e) => {
          e.stopPropagation();
          if (action.onClick) action.onClick();
        }}
        className={btnClass}
        style={{ 
          padding: '0 6px',
          fontSize: '12px', 
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

    // 既然已经有文字展示了，就仅在禁用状态下才显示 Tooltip（用于解释禁用原因）
    if (action.tooltip && action.disabled) {
      return (
        <Tooltip key={action.key} title={action.tooltip}>
          <span style={{ cursor: 'not-allowed' }}>{btn}</span>
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
        <span className={labelClass} style={{ fontSize: '12px' }}>
          {action.tooltip && action.disabled ? (
            <Tooltip title={action.tooltip} placement="left">
              {action.label}
            </Tooltip>
          ) : (
            action.label
          )}
        </span>
      ),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        if (action.onClick) action.onClick();
      },
    };
  });

  return (
    <div className="flex items-center">
      {inlineActions.map(renderInlineAction)}
      {dropdownActions.length > 0 && (
        <Dropdown menu={{ items: menuItems }} trigger={['hover']} placement="bottomRight">
          <Button 
            type="text" 
            className="!text-blue-600 hover:!text-blue-500 hover:!bg-blue-50 transition-colors"
            style={{ 
              padding: '0 6px',
              fontSize: '12px', 
              height: '24px', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              lineHeight: '1',
              verticalAlign: 'middle'
            }} 
            onClick={(e) => e.preventDefault()}
          >
            <Space size={2} align="center">
              更多
              <DownOutlined style={{ fontSize: '9px' }} className="ml-0.5 opacity-80" />
            </Space>
          </Button>
        </Dropdown>
      )}
    </div>
  );
};
