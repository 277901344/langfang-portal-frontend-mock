import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { getSpSsoLaunchUrl } from '../lib/auth';
import { platformLinks } from '../lib/platformLinks';

export interface ApplyTargetProduct {
  productId: string;
  productName: string;
  connectorName?: string;
  provider?: string;
  mode?: 'apply' | 'launch_connector';
  hasAuthMgmt?: boolean; // 是否开启授权管理/授权运营
  hasTradingPlatform?: boolean; // 是否需经过数据交易平台撮合
  requiresTradingPlatform?: boolean;
}

export interface AccessWizardStepStatuses {
  isLogin: boolean;
  isAuth: boolean;
  isConnector: boolean;
  hasAuthMgmt: boolean;
  isAuthorized: boolean;
  hasTradingPlatform: boolean;
  isTradingMatched: boolean;
}

export interface AccessWizardContextValue {
  isOpen: boolean;
  targetProduct: ApplyTargetProduct | null;
  setTargetProduct: (product: ApplyTargetProduct) => void;
  checkAndApply: (product: ApplyTargetProduct) => void;
  closeWizard: () => void;
  isConnectorDeployed: (productId: string) => boolean;
  deployConnector: (productId: string) => Promise<void>;
  toggleConnectorDeployed: (productId: string) => void;
  isProductAuthorized: (productId: string) => boolean;
  applyAuthorization: (productId: string) => Promise<void>;
  toggleAuthorization: (productId: string) => void;
  isTradingMatched: (productId: string) => boolean;
  applyTradingMatch: (productId: string) => Promise<void>;
  toggleTradingMatch: (productId: string) => void;
  getStepStatuses: (productId: string) => AccessWizardStepStatuses;
  completeAuthStep: () => void;
  completeLoginStep: () => void;
}

const AccessWizardContext = createContext<AccessWizardContextValue | null>(null);

export interface ProductAccessPreset {
  forceLogin?: boolean;
  forceAuth?: boolean;
  defaultConnectorDeployed?: boolean;
  hasAuthMgmt?: boolean; // 是否开启授权管理
  defaultAuthorized?: boolean; // 是否已授权
  hasTradingPlatform?: boolean; // 是否需经过数据交易平台撮合
  defaultTradingMatched?: boolean; // 是否已完成交易撮合
}

// Product default status definitions for multi-product demonstration
export const PRODUCT_ACCESS_PRESETS: Record<string, ProductAccessPreset> = {
  // 案例一: 开启授权管理(3步流程) - 认证过/连接器已部署/待前往授权运营平台申请
  'LF-DP-001': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: true, defaultAuthorized: false, hasTradingPlatform: false, defaultTradingMatched: false },
  'dp-001': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: true, defaultAuthorized: false, hasTradingPlatform: false, defaultTradingMatched: false },
  
  // 案例二: 标准2步流程 - 认证过/连接器未部署
  'LF-DP-002': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: false, hasAuthMgmt: false, defaultAuthorized: false, hasTradingPlatform: false, defaultTradingMatched: false },
  'dp-002': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: false, hasAuthMgmt: false, defaultAuthorized: false, hasTradingPlatform: false, defaultTradingMatched: false },

  // 案例三: 全部步骤已通过 (直接就绪)
  'LF-DP-003': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: false, defaultAuthorized: true, hasTradingPlatform: false, defaultTradingMatched: true },
  'dp-003': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: false, defaultAuthorized: true, hasTradingPlatform: false, defaultTradingMatched: true },

  // 案例四: 需经过数据交易平台交易撮合 (3步: 认证 -> 连接器 -> 数据交易平台撮合)
  'LF-DP-007': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: false, defaultAuthorized: false, hasTradingPlatform: true, defaultTradingMatched: false },
  'dp-007': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: false, defaultAuthorized: false, hasTradingPlatform: true, defaultTradingMatched: false },

  // 案例五: 4步全流程 (认证 -> 连接器 -> 授权运营平台 -> 数据交易平台交易撮合)
  'LF-DP-005': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: true, defaultAuthorized: true, hasTradingPlatform: true, defaultTradingMatched: false },
  'dp-005': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: true, defaultAuthorized: true, hasTradingPlatform: true, defaultTradingMatched: false },

  'LF-DP-006': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: false, hasAuthMgmt: true, defaultAuthorized: false, hasTradingPlatform: true, defaultTradingMatched: false },
  'dp-006': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: false, hasAuthMgmt: true, defaultAuthorized: false, hasTradingPlatform: true, defaultTradingMatched: false },

  'LF-DP-008': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: true, defaultAuthorized: false, hasTradingPlatform: true, defaultTradingMatched: false },
  'dp-008': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: true, hasAuthMgmt: true, defaultAuthorized: false, hasTradingPlatform: true, defaultTradingMatched: false },

  // 案例六: 未开启授权管理(标准2步流程) - 认证过/连接器未部署
  'LF-DP-004': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: false, hasAuthMgmt: false, defaultAuthorized: false, hasTradingPlatform: false, defaultTradingMatched: false },
  'dp-004': { forceLogin: true, forceAuth: true, defaultConnectorDeployed: false, hasAuthMgmt: false, defaultAuthorized: false, hasTradingPlatform: false, defaultTradingMatched: false },
};

const DEFAULT_DEPLOYED_PRODUCTS: Record<string, boolean> = {
  'LF-DP-001': true,
  'dp-001': true,
  'LF-DP-003': true,
  'dp-003': true,
  'LF-DP-005': true,
  'dp-005': true,
  'LF-DP-007': true,
  'dp-007': true,
  'LF-DP-008': true,
  'dp-008': true,
  'LF-DP-002': false,
  'dp-002': false,
  'LF-DP-004': false,
  'dp-004': false,
  'LF-DP-006': false,
  'dp-006': false,
};

const DEFAULT_AUTHORIZED_PRODUCTS: Record<string, boolean> = {
  'LF-DP-001': false,
  'dp-001': false,
  'LF-DP-002': false,
  'dp-002': false,
  'LF-DP-003': true,
  'dp-003': true,
  'LF-DP-004': false,
  'dp-004': false,
  'LF-DP-005': true,
  'dp-005': true,
  'LF-DP-006': false,
  'dp-006': false,
  'LF-DP-007': false,
  'dp-007': false,
  'LF-DP-008': false,
  'dp-008': false,
};

const DEFAULT_TRADING_MATCHED_PRODUCTS: Record<string, boolean> = {
  'LF-DP-001': false,
  'dp-001': false,
  'LF-DP-002': false,
  'dp-002': false,
  'LF-DP-003': true,
  'dp-003': true,
  'LF-DP-004': false,
  'dp-004': false,
  'LF-DP-005': false,
  'dp-005': false,
  'LF-DP-006': false,
  'dp-006': false,
  'LF-DP-007': false,
  'dp-007': false,
  'LF-DP-008': false,
  'dp-008': false,
};

const STORAGE_KEY_CONNECTOR = 'connector_deployed_map_v2';
const STORAGE_KEY_AUTHORIZED = 'authorization_granted_map_v1';
const STORAGE_KEY_TRADING_MATCHED = 'trading_matched_map_v1';

export function AccessWizardProvider({ children }: { children: React.ReactNode }) {
  const { user, setAuthenticatedUser } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [targetProduct, setTargetProduct] = useState<ApplyTargetProduct | null>(null);

  // Completed steps per product session overrides
  const [sessionAuthDone, setSessionAuthDone] = useState<Record<string, boolean>>({});
  const [sessionLoginDone, setSessionLoginDone] = useState<boolean>(false);

  // Deployed connector map
  const [deployedMap, setDeployedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CONNECTOR);
      if (stored) {
        return { ...DEFAULT_DEPLOYED_PRODUCTS, ...JSON.parse(stored) };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_DEPLOYED_PRODUCTS;
  });

  // Authorization granted map (Step 3)
  const [authorizedMap, setAuthorizedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTHORIZED);
      if (stored) {
        return { ...DEFAULT_AUTHORIZED_PRODUCTS, ...JSON.parse(stored) };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_AUTHORIZED_PRODUCTS;
  });

  // Trading platform matched map (Step 4 / 交易平台撮合)
  const [tradingMatchedMap, setTradingMatchedMap] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRADING_MATCHED);
      if (stored) {
        return { ...DEFAULT_TRADING_MATCHED_PRODUCTS, ...JSON.parse(stored) };
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_TRADING_MATCHED_PRODUCTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONNECTOR, JSON.stringify(deployedMap));
    } catch (e) {
      // ignore
    }
  }, [deployedMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUTHORIZED, JSON.stringify(authorizedMap));
    } catch (e) {
      // ignore
    }
  }, [authorizedMap]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TRADING_MATCHED, JSON.stringify(tradingMatchedMap));
    } catch (e) {
      // ignore
    }
  }, [tradingMatchedMap]);

  const isConnectorDeployed = (productId: string): boolean => {
    if (!productId) return false;
    if (productId in deployedMap) {
      return Boolean(deployedMap[productId]);
    }
    return false;
  };

  const isProductAuthorized = (productId: string): boolean => {
    if (!productId) return false;
    if (productId in authorizedMap) {
      return Boolean(authorizedMap[productId]);
    }
    const preset = PRODUCT_ACCESS_PRESETS[productId];
    return Boolean(preset?.defaultAuthorized);
  };

  const isTradingMatched = (productId: string): boolean => {
    if (!productId) return false;
    if (productId in tradingMatchedMap) {
      return Boolean(tradingMatchedMap[productId]);
    }
    const preset = PRODUCT_ACCESS_PRESETS[productId];
    return Boolean(preset?.defaultTradingMatched);
  };

  const deployConnector = async (productId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setDeployedMap((prev) => ({
          ...prev,
          [productId]: true,
        }));
        resolve();
      }, 1000);
    });
  };

  const toggleConnectorDeployed = (productId: string) => {
    setDeployedMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const applyAuthorization = async (productId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setAuthorizedMap((prev) => ({
          ...prev,
          [productId]: true,
        }));
        resolve();
      }, 1000);
    });
  };

  const toggleAuthorization = (productId: string) => {
    setAuthorizedMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const applyTradingMatch = async (productId: string) => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setTradingMatchedMap((prev) => ({
          ...prev,
          [productId]: true,
        }));
        resolve();
      }, 1000);
    });
  };

  const toggleTradingMatch = (productId: string) => {
    setTradingMatchedMap((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }));
  };

  const getStepStatuses = (productId: string): AccessWizardStepStatuses => {
    const preset = PRODUCT_ACCESS_PRESETS[productId];

    // Step 1: Login
    let isLogin = Boolean(user) || sessionLoginDone;
    if (preset && preset.forceLogin === false && !sessionLoginDone) {
      isLogin = false;
    } else if (preset && preset.forceLogin === true) {
      isLogin = true;
    }

    // Step 2: Auth (主体认证)
    let isAuth = (user?.authStatus === 1) || Boolean(sessionAuthDone[productId]);
    if (preset && preset.forceAuth === false && !sessionAuthDone[productId]) {
      isAuth = false;
    } else if (preset && preset.forceAuth === true) {
      isAuth = true;
    }

    // Step 3: Connector (连接器部署)
    const isConnector = isConnectorDeployed(productId);

    // Auth Management Switch & Status (授权运营开关与授权状态)
    // 当点击连接器节点 (mode === 'launch_connector') 时，不属于具体数据产品申请，不需要授权运营管理这一步
    let hasAuthMgmt = false;
    if (targetProduct?.mode === 'launch_connector') {
      hasAuthMgmt = false;
    } else if (targetProduct?.hasAuthMgmt !== undefined) {
      hasAuthMgmt = targetProduct.hasAuthMgmt;
    } else if (preset?.hasAuthMgmt !== undefined) {
      hasAuthMgmt = preset.hasAuthMgmt;
    } else {
      hasAuthMgmt = true;
    }

    const isAuthorized = isProductAuthorized(productId);

    // Trading Platform Switch & Status (数据交易平台撮合开关与状态)
    let hasTradingPlatform = false;
    if (targetProduct?.mode === 'launch_connector') {
      hasTradingPlatform = false;
    } else if (targetProduct?.hasTradingPlatform !== undefined) {
      hasTradingPlatform = targetProduct.hasTradingPlatform;
    } else if (targetProduct?.requiresTradingPlatform !== undefined) {
      hasTradingPlatform = targetProduct.requiresTradingPlatform;
    } else if (preset?.hasTradingPlatform !== undefined) {
      hasTradingPlatform = preset.hasTradingPlatform;
    } else {
      hasTradingPlatform = false;
    }

    const isTradingMatchedStatus = isTradingMatched(productId);

    return {
      isLogin,
      isAuth,
      isConnector,
      hasAuthMgmt,
      isAuthorized,
      hasTradingPlatform,
      isTradingMatched: isTradingMatchedStatus,
    };
  };

  const completeAuthStep = () => {
    if (targetProduct) {
      setSessionAuthDone((prev) => ({ ...prev, [targetProduct.productId]: true }));
      if (user) {
        setAuthenticatedUser({ ...user, authStatus: 1 });
      }
    }
  };

  const completeLoginStep = () => {
    setSessionLoginDone(true);
  };

  // Pre-requisite check
  const checkAndApply = async (product: ApplyTargetProduct) => {
    setTargetProduct(product);

    const { isLogin, isAuth, isConnector, hasAuthMgmt, isAuthorized, hasTradingPlatform, isTradingMatched: isMatched } = getStepStatuses(product.productId);

    if (!isLogin) {
      // 未登录，直接跳转登录页面
      navigate('/auth/login');
      return;
    }

    // 如果未完成身份认证（!isAuth），不显示步骤向导弹窗，直接跳转到门户管理的身份认证页面
    if (!isAuth) {
      navigate('/portal-management?tab=institution');
      return;
    }

    const isAllReady = isAuth && isConnector && (!hasAuthMgmt || isAuthorized);

    if (isAllReady) {
      if (product.mode === 'launch_connector') {
        try {
          const result = await getSpSsoLaunchUrl(platformLinks.service);
          const url = result?.launchUrl || platformLinks.service;
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch {
          window.open(platformLinks.service, '_blank', 'noopener,noreferrer');
        }
      } else {
        // All passed, directly navigate to contract application page
        navigate(`/products/${product.productId}/apply`);
      }
    } else {
      // Some steps incomplete, show Access Wizard modal
      setIsOpen(true);
    }
  };

  const closeWizard = () => {
    setIsOpen(false);
  };

  return (
    <AccessWizardContext.Provider
      value={{
        isOpen,
        targetProduct,
        setTargetProduct,
        checkAndApply,
        closeWizard,
        isConnectorDeployed,
        deployConnector,
        toggleConnectorDeployed,
        isProductAuthorized,
        applyAuthorization,
        toggleAuthorization,
        isTradingMatched,
        applyTradingMatch,
        toggleTradingMatch,
        getStepStatuses,
        completeAuthStep,
        completeLoginStep,
      }}
    >
      {children}
    </AccessWizardContext.Provider>
  );
}

export function useAccessWizard() {
  const ctx = useContext(AccessWizardContext);
  if (!ctx) {
    throw new Error('useAccessWizard must be used within AccessWizardProvider');
  }
  return ctx;
}
