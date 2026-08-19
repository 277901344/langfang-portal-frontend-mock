import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig, type AxiosRequestConfig } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '@/shared/types';
import { getAppConfig } from '@/config';
import { router } from '@/router';
import { useUserStore } from '@/store/useUserStore';

const AUTH_EXPIRED_MESSAGE_KEY = 'auth-expired';
let handlingAuthExpired = false;

// Frontend-only demo data. Set VITE_USE_MOCK=false to use the backend again.
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';
let mockUser = 'demo';

const page = (list: unknown[], config?: CustomConfig) => ({
    list,
    total: list.length,
    page: Number((config as any)?.params?.pageNum || 1),
    pageSize: Number((config as any)?.params?.pageSize || 10),
});

const typedPage = <T>(data: T[], config?: CustomConfig) => ({
    data,
    dataCount: data.length,
    pageCount: Math.max(1, Math.ceil(data.length / Number((config as any)?.params?.pageSize || 10))),
});

const mockCommodity = (id: string, index = 0) => ({
    id, commodityId: id, productId: id, versionId: 'v1',
    commodityName: `示例数据商品 ${index + 1}`, productName: `示例数据商品 ${index + 1}`,
    title: `示例数据商品 ${index + 1}`, description: '用于前端演示的 mock 数据',
    status: 'PUBLISHED', statusName: '已发布', price: 1280 + index * 320,
    providerName: '示例数据提供方', categoryName: '金融数据', updatedAt: '2026-08-19 10:00:00',
});

function mockApi(url: string, method: string, data?: any, config?: CustomConfig): ApiResponse<any> {
    const path = url.replace(/^\//, '').split('?')[0];
    if (path.startsWith('auth/captcha')) return { code: 10000, message: 'success', data: { captchaId: 'mock-captcha', imageBase64: '' } };
    if (path === 'auth/login') {
        mockUser = data?.username || 'demo';
        const token = `mock-token-${mockUser}`;
        localStorage.setItem(getAppConfig().VITE_AUTH_TOKEN_KEY || 'token', token);
        return { code: 10000, message: 'success', data: { token, id: 1001, username: mockUser, displayName: mockUser, user: { id: `mock-${mockUser}`, username: mockUser, email: `${mockUser}@example.com` } } };
    }
    if (path === 'auth/logout') return { code: 10000, message: 'success', data: null };
    if (path === 'authz/current/permissions' || path === 'authz/current/menu-modules') {
        const menuModules = [
            { id: 1, moduleId: '01', moduleName: '数据市场', routePath: '/marketplace', sortOrder: 1, status: 'ENABLED' },
            { id: 2, moduleId: '02', moduleName: '需求中心', routePath: '/demand-center', sortOrder: 2, status: 'ENABLED' },
            { id: 3, moduleId: '03', moduleName: '计费管理', routePath: '/billing', sortOrder: 3, status: 'ENABLED' },
            { id: 4, moduleId: '04', moduleName: '交易订单', routePath: '/trade-order', sortOrder: 4, status: 'ENABLED' },
        ];
        if (path.endsWith('menu-modules')) return { code: 10000, message: 'success', data: menuModules };
        return { code: 10000, message: 'success', data: { permissions: ['marketplace:read', 'demand:read', 'trade-order:read', 'billing:read'], roleCodes: ['VERIFIED_USER'], menuModules, accountType: 1, userIdentityCode: `ID-${mockUser}`, subjectName: `${mockUser} 演示账户` } };
    }
    if (path.includes('categories')) return { code: 10000, message: 'success', data: { categories: [{ code: 'finance', name: '金融数据' }, { code: 'energy', name: '能源数据' }, { code: 'logistics', name: '物流数据' }] } };
    if (path.includes('commodity-management/products/detail') || path.includes('commodity-management/detail') || path.includes('marketplace/commodities/detail')) return { code: 10000, message: 'success', data: { ...mockCommodity(data?.commodityId || data?.productId || 'commodity-1'), versions: [{ id: 'v1', version: '1.0', status: '已发布' }] } };
    if (path.includes('commodity-management') || path.includes('marketplace/commodities')) {
        const list = Array.from({ length: 6 }, (_, i) => ({ ...mockCommodity(`commodity-${i + 1}`, i), providerName: i % 2 ? '华东数据中心' : '示例数据提供方', ownerUsername: mockUser }));
        if (path.endsWith('/provider-info')) return { code: 10000, message: 'success', data: { providerName: '示例数据提供方', contactName: '演示联系人', contactPhone: '13800000000' } };
        if (path.endsWith('/purchase')) return { code: 10000, message: 'success', data: { orderId: `mock-order-${Date.now()}`, status: 'PENDING' } };
        return { code: 10000, message: 'success', data: page(list, config) };
    }
    if (path.includes('trade-order/orders')) {
        const list = Array.from({ length: 5 }, (_, i) => ({ id: `order-${mockUser}-${i + 1}`, orderNo: `MOCK20260819${String(i + 1).padStart(3, '0')}`, orderTitle: `示例数据商品 ${i + 1} 采购订单`, sourceType: i % 2 ? 'MARKETPLACE' : 'DEMAND', commodityId: `commodity-${i + 1}`, commodityName: `示例数据商品 ${i + 1}`, buyerId: 1001, buyerName: mockUser === 'seller' ? '演示采购方' : mockUser, sellerId: 2001, sellerName: mockUser === 'seller' ? mockUser : '示例数据提供方', unitPrice: 1280 + i * 500, quantity: i + 1, estimatedAmount: (1280 + i * 500) * (i + 1), actualAmount: i === 0 ? undefined : (1280 + i * 500) * (i + 1), status: i === 0 ? 'PENDING_CONFIRM' : i === 1 ? 'DELIVERING' : 'COMPLETED', paymentStatus: i === 0 ? 'UNPAID' : 'PAID', createdAt: '2026-08-19 09:30:00', updatedAt: '2026-08-19 10:00:00' }));
        if (path.endsWith('/contracts')) return { code: 10000, message: 'success', data: [{ contractId: 'contract-1', contractName: '示例采购合同' }] };
        if (/\/orders\/[^/]+$/.test(path)) return { code: 10000, message: 'success', data: { ...list[0], statusLogs: [{ id: 'log-1', orderId: list[0].id, toStatus: 'PENDING_CONFIRM', operatorName: mockUser, createdAt: '2026-08-19 09:30:00' }], providerInfo: { providerName: '示例数据提供方', contactName: '演示联系人', contactPhone: '13800000000' }, contractName: '示例采购合同' } };
        return { code: 10000, message: 'success', data: typedPage(list, config) };
    }
    if (path.includes('demand-center')) {
        const list = Array.from({ length: 4 }, (_, i) => ({ id: `demand-${mockUser}-${i + 1}`, demandNo: `DMD20260819${String(i + 1).padStart(3, '0')}`, title: `${mockUser} 的示例数据需求 ${i + 1}`, description: '需要一份可用于经营分析的脱敏数据集', topicCategory: '金融', applicationCategory: '风险管理', productType: '结构化数据', updateFrequency: '每日', expectedFields: ['日期', '机构', '金额'], usagePurpose: '内部分析与决策', budgetType: 'RANGE', budgetAmount: 5000 + i * 1000, expectedDelivery: 'API', deadline: '2026-09-30', status: i === 0 ? 'PUBLISHED' : 'DRAFT', publisherId: 1001, publisherName: mockUser, responseCount: i, createdAt: '2026-08-19 09:00:00', updatedAt: '2026-08-19 09:00:00', publishedAt: i === 0 ? '2026-08-19 09:10:00' : '', ownDemand: true, canEdit: true, canClose: i === 0, canRespond: ! (i === 0), canReviewResponses: true }));
        if (/\/demands\/[^/]+$/.test(path)) return { code: 10000, message: 'success', data: { ...list[0], matchedResponseId: '', orderId: '', responses: [] } };
        if (path.includes('/responses/')) return { code: 10000, message: 'success', data: { responseId: 'response-1', status: 'ACCEPTED', message: '操作成功' } };
        return { code: 10000, message: 'success', data: typedPage(list, config) };
    }
    if (path.includes('/billing')) {
        if (path.endsWith('/summary')) return { code: 10000, message: 'success', data: { totalOrderCount: 5, totalUsageValue: 342, totalBillableUsage: 318, totalAmount: mockUser === 'seller' ? 168600 : 28600, latestRecordedAt: '2026-08-19 10:30:00' } };
        if (path.includes('statistics')) return { code: 10000, message: 'success', data: { data: ['08-15', '08-16', '08-17', '08-18', '08-19'].map((statDate, i) => ({ statDate, totalUsageValue: 40 + i * 18, totalBillableUsage: 35 + i * 16, totalAmount: 1200 + i * 500 })) } };
        if (path.includes('order-summary')) return { code: 10000, message: 'success', data: { data: Array.from({ length: 5 }, (_, i) => ({ orderId: `order-${mockUser}-${i + 1}`, orderNo: `MOCK20260819${i + 1}`, orderTitle: `示例数据商品 ${i + 1} 采购订单`, commodityName: `示例数据商品 ${i + 1}`, usageCount: 10 + i, totalUsageValue: 40 + i * 10, totalBillableUsage: 35 + i * 9, totalAmount: 1280 + i * 500, orderStatus: 'COMPLETED', meteringReady: true })) } };
        return { code: 10000, message: 'success', data: typedPage(Array.from({ length: 8 }, (_, i) => ({ id: i + 1, orderId: `order-${mockUser}-${(i % 5) + 1}`, orderNo: `MOCK20260819${(i % 5) + 1}`, commodityName: `示例数据商品 ${(i % 4) + 1}`, usageType: 'API_CALL', usageValue: 10 + i, billableUsage: 9 + i, amount: 320 + i * 40, recordedAt: '2026-08-19 10:00:00' })), config) };
    }
    if (path.includes('/fund/')) {
        const account = { id: `account-${mockUser}`, accountNo: `FA20260819${mockUser}`, userIdentityCode: `ID-${mockUser}`, subjectName: `${mockUser} 演示账户`, accountRole: 'BUYER', availableBalance: mockUser === 'seller' ? 286600 : 128600, totalRechargeAmount: 200000, totalDebitAmount: 71400, totalIncomeAmount: mockUser === 'seller' ? 158000 : 0, status: 'ACTIVE' };
        const flow = { id: 1, flowNo: `FLOW-${mockUser}-001`, userIdentityCode: `ID-${mockUser}`, subjectName: account.subjectName, accountRole: 'BUYER', flowType: 'RECHARGE', amount: 50000, beforeBalance: 78600, afterBalance: 128600, orderId: `order-${mockUser}-1`, orderNo: 'MOCK20260819001', remark: '演示账户充值', createdAt: '2026-08-19 08:00:00' };
        if (path.includes('/flows')) return { code: 10000, message: 'success', data: typedPage([flow], config) };
        if (path.includes('/accounts')) return { code: 10000, message: 'success', data: typedPage([account], config) };
        if (path.includes('/subjects')) return { code: 10000, message: 'success', data: typedPage([{ id: 'subject-1', subjectName: '示例结算主体', subjectType: 'ORGANIZATION', authStatus: 1 }], config) };
        return { code: 10000, message: 'success', data: typedPage([account], config) };
    }
    if (path.includes('/file/')) return { code: 10000, message: 'success', data: 'mock://file/demo' };
    return { code: 10000, message: 'success', data: method === 'GET' ? page([] , config) : '操作成功' };
}

function handleAuthExpired(msg?: string, silentError = false) {
    if (!silentError) {
        message.error({
            key: AUTH_EXPIRED_MESSAGE_KEY,
            content: msg || '登录过期，请重新登录',
        });
    }

    if (handlingAuthExpired) {
        return;
    }

    handlingAuthExpired = true;
    const tokenKey = getAppConfig().VITE_AUTH_TOKEN_KEY || 'token';
    localStorage.removeItem(tokenKey);
    useUserStore.getState().logout();
    router.navigate('/login');
}

const service: AxiosInstance = axios.create({
    baseURL: getAppConfig().VITE_API_BASE_URL,
    timeout: 60000,
    headers: {
        'Content-Type': 'application/json',
    },
});

service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const tokenKey = getAppConfig().VITE_AUTH_TOKEN_KEY || 'token';
        const token = localStorage.getItem(tokenKey);
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

service.interceptors.response.use(
    (response) => {
        // Capture token from headers if present
        const authorization = response.headers['authorization'];
        if (authorization) {
            const tokenKey = getAppConfig().VITE_AUTH_TOKEN_KEY || 'token';
            localStorage.setItem(tokenKey, authorization);
            handlingAuthExpired = false;
        }
        return response;
    },
    (error: AxiosError) => {
        console.error('Request Error:', error);
        let msg = error.message || 'Request Failed';
        const config = error.config as CustomConfig | undefined;
        const silentError = config?.silentError === true;

        if (error.code === 'ECONNABORTED' || msg.includes('timeout')) {
            msg = '请求超时，请检查网络或资源配置后重试';
        }

        if (error.response) {
            const status = error.response.status;
            const data = error.response.data as any;

            // Check for business error code in response body even if HTTP status is error
            if (data?.code === -99999) {
                handleAuthExpired(data.message, silentError);
                return Promise.reject(error);
            }

            if (status === 401) {
                // specific handling for 401 if needed
            }

            if (!silentError) {
                message.error(`Error ${status}: ${msg}`);
            }
        } else {
            if (!silentError) {
                message.error(msg);
            }
        }

        return Promise.reject(error);
    }
);

interface CustomConfig extends AxiosRequestConfig {
    customOnSuccess?: (response: ApiResponse<any>) => any;
    silentError?: boolean;
}

function handleResponse<T>(response: ApiResponse<T>, config?: CustomConfig): T {
    if (config?.customOnSuccess) {
        return config.customOnSuccess(response);
    }
    const { code, message: msg, data } = response;

    switch (true) {
        case code === 10000:
            return data;
        case code === -99999:
            handleAuthExpired(msg, config?.silentError);
            throw Object.assign(new Error(msg), { name: 'AuthError', code, originalData: response });
        case code >= 11000 && code < 12000:
            if (!config?.silentError) {
                message.error(msg);
            }
            throw Object.assign(new Error(msg), { name: 'ParamError', code, originalData: response });
        case code >= 12000 && code < 13000:
            if (!config?.silentError) {
                message.error(msg);
            }
            throw Object.assign(new Error(msg), { name: 'SystemError', code, originalData: response });
        case code >= 13000 && code < 14000:
            if (!config?.silentError) {
                message.error(msg);
            }
            throw Object.assign(new Error(msg), { name: 'BizError', code, originalData: response });
        default:
            if (!config?.silentError) {
                message.error(msg);
            }
            throw Object.assign(new Error(msg), { name: 'ApiError', code, originalData: response });
    }
}

export async function get<T = unknown>(url: string, config?: CustomConfig): Promise<T> {
    if (USE_MOCK) return handleResponse(mockApi(url, 'GET', undefined, config), config) as T;
    const response = await service.get<ApiResponse<T>>(url, config);
    return handleResponse(response.data, config);
}

export async function post<T = unknown>(url: string, data?: unknown, config?: CustomConfig): Promise<T> {
    if (USE_MOCK) return handleResponse(mockApi(url, 'POST', data, config), config) as T;
    const response = await service.post<ApiResponse<T>>(url, data, config);
    return handleResponse(response.data, config);
}

export async function put<T = unknown>(url: string, data?: unknown, config?: CustomConfig): Promise<T> {
    if (USE_MOCK) return handleResponse(mockApi(url, 'PUT', data, config), config) as T;
    const response = await service.put<ApiResponse<T>>(url, data, config);
    return handleResponse(response.data, config);
}

export async function del<T = unknown>(url: string, config?: CustomConfig): Promise<T> {
    if (USE_MOCK) return handleResponse(mockApi(url, 'DELETE', undefined, config), config) as T;
    const response = await service.delete<ApiResponse<T>>(url, config);
    return handleResponse(response.data, config);
}

export { service };
export type { ApiResponse };
