import React, { useEffect, useMemo, useState } from 'react';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import {
  AppstoreOutlined,
  BankOutlined,
  DollarOutlined,
  LogoutOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { getAppConfig } from '@/config';
import * as authService from '@/modules/auth/services/auth';
import { getMarketplaceCategories } from '@/modules/marketplace/services/marketplace';
import TradingTopHeader from '@/shared/components/TradingTopHeader';
import { MODULE_IDS } from '@/shared/constants/authcode';
import { UI_CONFIG } from '@/shared/constants/ui';
import { useQuery } from '@/shared/hooks/useQuery';
import { FRONT_MENU_META, getVisibleModuleIds, resolveUserSubjectLabel } from '@/shared/utils/navigation';
import { useTradingDictionaryStore } from '@/store/useTradingDictionaryStore';
import { useUserStore } from '@/store/useUserStore';

const { Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { VITE_SPACE_NAME } = getAppConfig();
  const { userInfo, logout, menuModules, roleCodes, permissions } = useUserStore();
  const setCategoryDictionaries = useTradingDictionaryStore((state) => state.setCategoryDictionaries);
  const resetCategoryDictionaries = useTradingDictionaryStore((state) => state.reset);

  const { data: categories } = useQuery({
    queryKey: ['trading-category-dictionaries'],
    queryFn: getMarketplaceCategories,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  useEffect(() => {
    if (!categories) {
      return;
    }
    setCategoryDictionaries({
      topicCategories: categories.topicCategories,
      applicationCategories: categories.applicationCategories,
      industryCategories: categories.industryCategories,
      organizationCategories: categories.organizationCategories,
      dataAcquisitions: categories.dataAcquisitions,
      updateFrequencies: categories.updateFrequencies,
      qualityLevels: categories.qualityLevels,
      securityLevels: categories.securityLevels,
    });
  }, [categories, setCategoryDictionaries]);

  const allowedIds = useMemo(() => getVisibleModuleIds(menuModules || []), [menuModules]);
  const frontMenuItems = useMemo<MenuProps['items']>(
    () =>
      FRONT_MENU_META.filter((item) => allowedIds.has(item.moduleId)).map((item) => ({
        key: item.key,
        label: item.label,
        onClick: () => navigate(item.key),
      })),
    [allowedIds, navigate]
  );

  const isAdmin = roleCodes.includes('SUPER_ADMIN') || roleCodes.includes('ADMIN');
  const hasFundAdminAccess = isAdmin || permissions.includes('fund:admin:view');
  const hasFundAccountAccess = permissions.includes('fund:view') && !hasFundAdminAccess;

  const menuItems: MenuProps['items'] = [
    {
      key: '/console/commodity-management',
      icon: <AppstoreOutlined />,
      label: '商品管理',
      onClick: () => navigate('/console/commodity-management'),
    },
    ...(allowedIds.has(MODULE_IDS.TRADE_ORDER.ROOT)
      ? [
          {
            key: '/console/trade-order',
            icon: <ShoppingCartOutlined />,
            label: '交易订单',
            onClick: () => navigate('/console/trade-order'),
          },
        ]
      : []),
    ...(allowedIds.has(MODULE_IDS.BILLING.ROOT)
      ? [
          {
            key: '/console/billing',
            icon: <DollarOutlined />,
            label: '计量计费',
            onClick: () => navigate('/console/billing'),
          },
        ]
      : []),
    ...(hasFundAdminAccess
      ? [
          {
            key: '/console/fund-management',
            icon: <BankOutlined />,
            label: '资金管理',
            children: [
              {
                key: '/console/fund-management/accounts',
                label: '账户列表',
                onClick: () => navigate('/console/fund-management/accounts'),
              },
              {
                key: '/console/fund-management/flows',
                label: '资金流水',
                onClick: () => navigate('/console/fund-management/flows'),
              },
            ],
          },
        ]
      : []),
    ...(hasFundAccountAccess
      ? [
          {
            key: '/console/my-account',
            icon: <UserOutlined />,
            label: '我的账户',
            children: [
              {
                key: '/console/fund-account',
                label: '资金账户',
                onClick: () => navigate('/console/fund-account'),
              },
            ],
          },
        ]
      : []),
  ];

  const selectedKeys = useMemo(() => {
    if (location.pathname.startsWith('/console/fund-management/flows')) {
      return ['/console/fund-management/flows'];
    }
    if (location.pathname.startsWith('/console/fund-management/accounts')) {
      return ['/console/fund-management/accounts'];
    }
    if (location.pathname.startsWith('/console/fund-account')) {
      return ['/console/fund-account'];
    }
    if (location.pathname.startsWith('/console/trade-order')) {
      return ['/console/trade-order'];
    }
    if (location.pathname.startsWith('/console/billing')) {
      return ['/console/billing'];
    }
    if (location.pathname.startsWith('/console/commodity-management')) {
      return ['/console/commodity-management'];
    }
    return [];
  }, [location.pathname]);

  const routeOpenKeys = useMemo(() => {
    if (location.pathname.startsWith('/console/fund-management') && hasFundAdminAccess) {
      return ['/console/fund-management'];
    }
    if (location.pathname.startsWith('/console/fund-account') && hasFundAccountAccess) {
      return ['/console/my-account'];
    }
    return [];
  }, [hasFundAccountAccess, hasFundAdminAccess, location.pathname]);

  const [openKeys, setOpenKeys] = useState<string[]>(routeOpenKeys);

  useEffect(() => {
    setOpenKeys(routeOpenKeys);
  }, [routeOpenKeys]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API failure and always clear local auth state.
    } finally {
      resetCategoryDictionaries();
      logout();
      navigate('/login');
    }
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Layout style={{ height: '100vh', minHeight: 0, overflow: 'hidden' }}>
      <TradingTopHeader
        menuItems={frontMenuItems}
        selectedKeys={[]}
        userMenu={userMenu}
        spaceName={VITE_SPACE_NAME}
        displayName={userInfo?.displayName || userInfo?.username || userInfo?.name || '访客'}
        subjectLabel={resolveUserSubjectLabel(userInfo, roleCodes)}
        avatar={userInfo?.avatar}
        onBrandClick={() => navigate('/marketplace')}
        zIndex={20}
      />

      <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'hidden' }}>
        <Layout
          className={`trading-admin-shell ${UI_CONFIG.layout.desktopMinWidth}`}
          style={{ height: '100%', minHeight: 0, overflow: 'hidden', background: '#f7f9fc' }}
        >
          <Sider
            width={UI_CONFIG.layout.adminSiderContentWidthNum + UI_CONFIG.layout.outerPageGapNum}
            className="trading-admin-sider"
            style={{
              background: 'transparent',
              padding: `18px 0 24px ${UI_CONFIG.layout.outerPageGapNum}px`,
            }}
          >
            <div className="trading-admin-sider-card custom-scrollbar">
              <Menu
                mode="inline"
                selectedKeys={selectedKeys}
                openKeys={openKeys}
                onOpenChange={(keys) => setOpenKeys(keys as string[])}
                items={menuItems}
                className="custom-sidenav-menu trading-admin-sider-menu"
                style={{ borderInlineEnd: 'none', paddingTop: 12, paddingBottom: 12, background: 'transparent' }}
              />
            </div>
          </Sider>

          <Layout style={{ background: 'transparent' }}>
            <Content
              className={`${UI_CONFIG.pageBackground} trading-admin-content`}
              style={{
                margin: 0,
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
              }}
            >
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </div>
    </Layout>
  );
};

export default AdminLayout;
