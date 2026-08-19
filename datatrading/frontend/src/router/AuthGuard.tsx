import React, { useEffect } from 'react';
import { message } from 'antd';
import { matchPath, useLocation, useNavigate } from 'react-router-dom';

import { getCurrentAuthz } from '@/shared/services/authz';
import { useUserStore } from '@/store/useUserStore';
import {
    getVisibleModuleIds,
    PATH_MODULE_MAP,
    resolveFirstAccessiblePath,
} from '@/shared/utils/navigation';

interface AuthGuardProps {
    children: React.ReactNode;
}

const PUBLIC_ROUTE_PATTERNS = [
    '/',
    '/marketplace',
    '/marketplace/products',
    '/marketplace/products/:id',
    '/demand-center',
    '/demand-center/:id',
];

const PROTECTED_ROUTE_PATTERNS = [
    '/marketplace/products/:id/confirm',
    '/demand-center/create',
    '/demand-center/:id/edit',
];

function isPublicRoute(pathname: string) {
    if (PROTECTED_ROUTE_PATTERNS.some((path) => matchPath({ path, end: true }, pathname))) {
        return false;
    }
    return PUBLIC_ROUTE_PATTERNS.some((path) => matchPath({ path, end: true }, pathname));
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const token = useUserStore((state) => state.token);
    const menuModules = useUserStore((state) => state.menuModules);
    const authzLoaded = useUserStore((state) => state.authzLoaded);
    const userInfo = useUserStore((state) => state.userInfo);
    const setUserInfo = useUserStore((state) => state.setUserInfo);
    const setAuthz = useUserStore((state) => state.setAuthz);
    const logout = useUserStore((state) => state.logout);
    const publicRoute = isPublicRoute(location.pathname);

    useEffect(() => {
        if (!token && !publicRoute) {
            navigate('/login', { replace: true });
            return;
        }

        if (token && location.pathname === '/login') {
            navigate('/', { replace: true });
            return;
        }

        if (token && !authzLoaded) {
            getCurrentAuthz()
                .then((res) => {
                    setAuthz(res.permissions || [], res.menuModules || [], res.roleCodes || []);
                    if (userInfo && (res.accountType != null || res.subjectName || res.userIdentityCode)) {
                        setUserInfo({
                            ...userInfo,
                            accountType: res.accountType ?? userInfo.accountType,
                            subjectName: res.subjectName || userInfo.subjectName,
                            userIdentityCode: res.userIdentityCode || userInfo.userIdentityCode,
                        });
                    }
                })
                .catch(() => {
                    logout();
                    message.error('授权信息加载失败，请重新登录');
                    if (!publicRoute) {
                        navigate('/login', { replace: true });
                    }
                });
            return;
        }

        if (token && authzLoaded && userInfo && (userInfo.accountType == null || !userInfo.subjectName) && location.pathname !== '/login') {
            getCurrentAuthz()
                .then((res) => {
                    const hasUserInfoUpdate = (res.accountType != null && res.accountType !== userInfo.accountType)
                        || Boolean(res.subjectName && res.subjectName !== userInfo.subjectName)
                        || Boolean(res.userIdentityCode && res.userIdentityCode !== userInfo.userIdentityCode);
                    if (hasUserInfoUpdate) {
                        setUserInfo({
                            ...userInfo,
                            accountType: res.accountType ?? userInfo.accountType,
                            subjectName: res.subjectName || userInfo.subjectName,
                            userIdentityCode: res.userIdentityCode || userInfo.userIdentityCode,
                        });
                    }
                })
                .catch(() => undefined);
        }

        if (token && location.pathname !== '/login' && authzLoaded && !publicRoute) {
            const firstAccessiblePath = resolveFirstAccessiblePath(menuModules);
            const allowed = getVisibleModuleIds(menuModules);
            const matched = PATH_MODULE_MAP.find((item) =>
                location.pathname === item.prefix || location.pathname.startsWith(`${item.prefix}/`)
            );

            if (matched && !allowed.has(matched.moduleId) && location.pathname !== firstAccessiblePath) {
                navigate(firstAccessiblePath, { replace: true });
            }
        }
    }, [token, location.pathname, navigate, menuModules, authzLoaded, userInfo, setUserInfo, setAuthz, logout, publicRoute]);

    if (!token && !publicRoute) {
        return null;
    }

    if (token && !authzLoaded && location.pathname !== '/login') {
        return null;
    }

    return <>{children}</>;
};

export default AuthGuard;
