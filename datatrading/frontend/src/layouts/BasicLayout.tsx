import React, { useEffect, useMemo } from 'react';
import type { MenuProps } from 'antd';
import { Layout } from 'antd';
import { AppstoreOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { getAppConfig } from '@/config';
import * as authService from '@/modules/auth/services/auth';
import { getMarketplaceCategories } from '@/modules/marketplace/services/marketplace';
import TradingTopHeader from '@/shared/components/TradingTopHeader';
import { UI_CONFIG } from '@/shared/constants/ui';
import { useQuery } from '@/shared/hooks/useQuery';
import {
  FRONT_MENU_META,
  getVisibleModuleIds,
  matchesMenuKey,
  resolveUserSubjectLabel,
} from '@/shared/utils/navigation';
import { useTradingDictionaryStore } from '@/store/useTradingDictionaryStore';
import { useUserStore } from '@/store/useUserStore';

const { Content } = Layout;

const BasicLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { VITE_SPACE_NAME } = getAppConfig();
  const { token, userInfo, logout, menuModules, roleCodes } = useUserStore();
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
      FRONT_MENU_META.filter((item) => !token || allowedIds.has(item.moduleId)).map((item) => ({
        key: item.key,
        label: item.label,
        onClick: () => navigate(item.key),
      })),
    [allowedIds, navigate, token]
  );

  const selectedKey = useMemo(() => {
    const current = FRONT_MENU_META.find(
      (item) => (!token || allowedIds.has(item.moduleId)) && matchesMenuKey(location.pathname, item.key)
    );
    return current?.key ? [current.key] : [];
  }, [allowedIds, location.pathname, token]);

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
    items: token ? [
      {
        key: 'console',
        icon: <AppstoreOutlined />,
        label: '后台管理',
        onClick: () => navigate('/console'),
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ] : [
      {
        key: 'login',
        icon: <LoginOutlined />,
        label: '登录',
        onClick: () => navigate('/login'),
      },
    ],
  };

  return (
    <Layout style={{ height: '100vh', minHeight: 0, overflow: 'hidden' }}>
      <TradingTopHeader
        menuItems={frontMenuItems}
        selectedKeys={selectedKey}
        userMenu={userMenu}
        spaceName={VITE_SPACE_NAME}
        displayName={token ? userInfo?.displayName || userInfo?.username || userInfo?.name || '访客' : '访客'}
        subjectLabel={token ? resolveUserSubjectLabel(userInfo, roleCodes) : '未登录'}
        avatar={token ? userInfo?.avatar : undefined}
        onBrandClick={() => navigate('/marketplace')}
      />

      <Content
        className={UI_CONFIG.pageBackground}
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minHeight: 0,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <div className={`h-full ${UI_CONFIG.layout.desktopMinWidth}`}>
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};

export default BasicLayout;
