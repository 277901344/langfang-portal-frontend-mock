import { MODULE_IDS } from '@/shared/constants/authcode';
import type { MenuModule } from '@/shared/types/rbac';
import type { User } from '@/shared/types/user';

const DEFAULT_FALLBACK_PATH = '/marketplace';

export interface FrontMenuMeta {
    moduleId: string;
    key: string;
    label: string;
}

export const FRONT_MENU_META: FrontMenuMeta[] = [
    {
        moduleId: MODULE_IDS.MARKETPLACE.ROOT,
        key: '/marketplace',
        label: '数据市场',
    },
    {
        moduleId: MODULE_IDS.DEMAND_CENTER.ROOT,
        key: '/demand-center',
        label: '需求中心',
    },
];

const MODULE_ROUTE_CANDIDATES: Array<{ moduleId: string; path: string }> = [
    { moduleId: MODULE_IDS.MARKETPLACE.ROOT, path: '/marketplace' },
    { moduleId: MODULE_IDS.DEMAND_CENTER.ROOT, path: '/demand-center' },
    { moduleId: MODULE_IDS.BILLING.ROOT, path: '/billing' },
    { moduleId: MODULE_IDS.TRADE_ORDER.ROOT, path: '/trade-order' },
];

export const PATH_MODULE_MAP: Array<{ prefix: string; moduleId: string }> = [
    { prefix: '/marketplace', moduleId: MODULE_IDS.MARKETPLACE.ROOT },
    { prefix: '/demand-center', moduleId: MODULE_IDS.DEMAND_CENTER.ROOT },
    { prefix: '/billing', moduleId: MODULE_IDS.BILLING.ROOT },
    { prefix: '/trade-order', moduleId: MODULE_IDS.TRADE_ORDER.ROOT },
    { prefix: '/console/billing', moduleId: MODULE_IDS.BILLING.ROOT },
    { prefix: '/console/trade-order', moduleId: MODULE_IDS.TRADE_ORDER.ROOT },
];

export function resolveUserIdentityLabel(roleCodes: string[] = []) {
    if (roleCodes.includes('SUPER_ADMIN')) {
        return '平台超级管理员';
    }

    if (roleCodes.includes('ADMIN')) {
        return '平台运营管理员';
    }

    if (roleCodes.includes('VERIFIED_USER')) {
        return '认证用户';
    }

    if (roleCodes.includes('VERIFIED_SUB_ACCOUNT')) {
        return '认证子账户';
    }

    if (roleCodes.includes('REGISTER_UNVERIFIED_USER')) {
        return '未认证注册用户';
    }

    return '访客用户';
}

export function resolveUserSubjectLabel(userInfo?: User | null, _roleCodes: string[] = []) {
    const subjectName = userInfo?.subjectName?.trim();
    if (subjectName) {
        return subjectName;
    }

    const userIdentityCode = userInfo?.userIdentityCode?.trim();
    if (userIdentityCode) {
        return userIdentityCode;
    }

    const displayName = userInfo?.displayName?.trim();
    const username = userInfo?.username?.trim();
    const legacyName = userInfo?.name?.trim();
    const nonLoginName = [displayName, legacyName].find((value) => value && value !== username);
    if (nonLoginName) {
        return nonLoginName;
    }

    return '';
}

export function getVisibleModuleIds(menuModules: MenuModule[] = []) {
    return new Set((menuModules || []).map((item) => item.moduleId));
}

export function matchesMenuKey(pathname: string, menuKey: string) {
    return pathname === menuKey || pathname.startsWith(`${menuKey}/`);
}

export function resolveFirstAccessiblePath(menuModules: MenuModule[] = []) {
    const visibleIds = getVisibleModuleIds(menuModules);
    const first = MODULE_ROUTE_CANDIDATES.find((item) => visibleIds.has(item.moduleId));
    return first ? first.path : DEFAULT_FALLBACK_PATH;
}
