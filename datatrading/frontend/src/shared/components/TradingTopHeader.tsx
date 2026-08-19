import React from 'react';
import type { MenuProps } from 'antd';
import { Avatar, Dropdown, Layout, Menu } from 'antd';
import { SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { UI_CONFIG } from '../constants/ui';

const { Header } = Layout;

interface TradingTopHeaderProps {
  menuItems: MenuProps['items'];
  selectedKeys: string[];
  userMenu: MenuProps;
  spaceName: string;
  displayName: string;
  subjectLabel: string;
  avatar?: string;
  onBrandClick: () => void;
  zIndex?: number;
}

const TradingTopHeader: React.FC<TradingTopHeaderProps> = ({
  menuItems,
  selectedKeys,
  userMenu,
  spaceName,
  displayName,
  subjectLabel,
  avatar,
  onBrandClick,
  zIndex = 10,
}) => {
  return (
    <Header
      style={{
        padding: `0 ${UI_CONFIG.layout.outerPageGapNum}px`,
        background: '#ffffff',
        flex: '0 0 64px',
        boxShadow: '0 4px 18px rgba(15, 23, 42, 0.08)',
        position: 'relative',
        zIndex,
      }}
      className="flex items-center justify-between border-b border-slate-200/80"
    >
      <div className="flex min-w-0 items-center gap-16">
        <button
          type="button"
          className="flex h-full shrink-0 items-center gap-3 border-0 bg-transparent p-0 text-left"
          onClick={onBrandClick}
        >
          <div
            className="flex items-center justify-center rounded-xl border border-blue-100/80 bg-[linear-gradient(180deg,_#3a86ff_0%,_#165dff_100%)]"
            style={{ width: 40, height: 40 }}
          >
            <SafetyCertificateOutlined style={{ color: '#ffffff', fontSize: 20 }} />
          </div>
          <div className="flex min-w-0 items-center self-stretch">
            <div className="relative -top-px truncate text-xl font-semibold leading-none tracking-[0.02em] text-slate-950">
              {spaceName}
            </div>
          </div>
        </button>

        <Menu
          mode="horizontal"
          selectedKeys={selectedKeys}
          items={menuItems}
          className="trading-top-nav min-w-0 flex-1 border-b-0"
          overflowedIndicator={<span className="px-2">...</span>}
        />
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
          <div className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 transition-colors hover:bg-gray-50">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-bold text-gray-800">{displayName}</span>
              <span className="text-xs text-gray-500">{subjectLabel}</span>
            </div>
            <Avatar size="default" icon={<UserOutlined />} src={avatar} className="bg-gray-200 text-gray-500" />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default TradingTopHeader;
