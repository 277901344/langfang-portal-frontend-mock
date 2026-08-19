import { aesDecrypt, DEFAULT_CUSTOM_KEY } from '@/shared/utils/crypto';
import type { CommodityProductItem } from '../types/api';

export const asRecord = (value: unknown): Record<string, unknown> | undefined => {
    if (!value) {
        return undefined;
    }
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value);
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : undefined;
        } catch {
            return undefined;
        }
    }
    return typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
};

export const asArray = (value: unknown): Array<Record<string, unknown>> => Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : [];

export const getNestedRecord = (record: Record<string, unknown> | undefined, key: string) => asRecord(record?.[key]);

export const parseMaybeJson = (value: unknown): unknown => {
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

export const setByPath = (target: Record<string, unknown>, path: string[], value: unknown) => {
    let cursor = target;
    path.forEach((segment, index) => {
        if (index === path.length - 1) {
            cursor[segment] = parseMaybeJson(value);
            return;
        }
        const current = asRecord(cursor[segment]) || {};
        cursor[segment] = current;
        cursor = current;
    });
};

export const getProductSampleData = (product?: CommodityProductItem) => asRecord(product?.sampleData);

export const getBlobErrorMessage = async (error: unknown, fallback: string) => {
    const responseData = (error as { response?: { data?: unknown } })?.response?.data;
    if (responseData instanceof Blob) {
        try {
            const text = await responseData.text();
            const parsed = JSON.parse(text) as { message?: string; msg?: string };
            return parsed.message || parsed.msg || fallback;
        } catch {
            return fallback;
        }
    }
    return fallback;
};

export const getStrategyValue = (product?: CommodityProductItem) => parseMaybeJson(product?.accessConstraints?.strategyValue);

export const toStrategyConfig = (strategyValue: unknown) => {
    const parsed = parseMaybeJson(strategyValue);
    const parsedRecord = asRecord(parsed);
    const rawConstraints = parsedRecord?.constraints;
    const rawActions = parsedRecord?.actions;
    if (
        parsedRecord?.behaviors ||
        (rawConstraints && !Array.isArray(rawConstraints) && !Array.isArray(rawActions))
    ) {
        return parsedRecord;
    }

    const config: Record<string, unknown> = {};
    const applyItem = (rawName: unknown, rawValue: unknown) => {
        if (!rawName) {
            return;
        }
        const name = String(rawName);
        const path = name.split('-').filter(Boolean);
        if (path.length < 2) {
            return;
        }
        const dimension = path[0];
        const rootKey = ['time', 'location', 'subject', 'object', 'environment', 'application'].includes(dimension)
            ? 'constraints'
            : ['delivery', 'operations', 'period'].includes(dimension)
                ? 'behaviors'
                : undefined;
        if (!rootKey) {
            return;
        }
        const root = asRecord(config[rootKey]) || {};
        config[rootKey] = root;
        setByPath(root, path, rawValue);
    };

    asArray(Array.isArray(parsed) ? parsed : rawConstraints).forEach((item) => {
        applyItem(item.constraintName, item.constraintValue);
    });
    asArray(rawActions).forEach((item) => {
        applyItem(item.actionName, item.actionValue);
    });
    return config;
};

export const getProductUsageExample = (product?: CommodityProductItem) => asRecord(getProductSampleData(product)?.usageExample);

export const getApiAuthTypeLabel = (value?: unknown) => {
    if (value === 1 || value === '1') return 'Basic 认证';
    if (value === 2 || value === '2') return 'Bearer Token';
    if (value === 3 || value === '3') return 'API Key';
    if (value === 4 || value === '4') return 'OAuth2 Token';
    if (value === 5 || value === '5') return '自定义摘要签名';
    return '无（None）';
};

export const maskTokenUrl = (value?: unknown) => {
    if (!value) {
        return '-';
    }
    const text = String(value).trim();
    const protocolMatch = text.match(/^([a-z][a-z0-9+.-]*:\/\/)/i);
    return `${protocolMatch?.[1] || ''}******`;
};

const decryptSensitiveUsageValue = (value: unknown) => {
    if (typeof value !== 'string' || value.trim() === '') {
        return value;
    }
    return aesDecrypt(value, DEFAULT_CUSTOM_KEY);
};

const isUsagePath = (value: unknown) => value === 'Query' || value === 'Header' || value === 'Body' || value === 'Path';

const isTokenCredentialPath = (value: unknown) => value === 'Query' || value === 'Header' || value === 'Body';

const toBoolean = (value: unknown, fallback = false) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true') return true;
        if (value.toLowerCase() === 'false') return false;
    }
    return fallback;
};

const normalizeNumber = (value: unknown, fallback: number) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeRequestItem = (item: Record<string, unknown>, fallbackPath: string) => {
    const key = String(item.key || item.name || '').trim();
    if (!key) {
        return null;
    }
    return {
        key,
        path: isUsagePath(item.path) ? item.path : fallbackPath,
        type: String(item.type || 'String'),
        description: String(item.description || ''),
        required: toBoolean(item.required),
    };
};

export const normalizeRequestList = (items: unknown, fallbackPath: string) => asArray(items)
    .map((item) => normalizeRequestItem(item, fallbackPath))
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map((item) => fallbackPath === 'Header' ? { ...item, path: 'Header' } : item);

export const normalizeResponseList = (items: unknown) => asArray(items)
    .map((item) => {
        const key = String(item.key || item.name || '').trim();
        if (!key) {
            return null;
        }
        return {
            key,
            type: String(item.type || 'String'),
            description: String(item.description || ''),
            required: toBoolean(item.required),
        };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

export const normalizeAuthConfig = (value: unknown) => {
    const config = asRecord(value);
    const authType = Number(config?.authType);
    if (!config || ![1, 2, 3, 4, 5].includes(authType)) {
        return undefined;
    }
    const items = asArray(config.items)
        .map((item) => {
            const key = String(item.key || '').trim();
            const label = String(item.label || key).trim();
            if (!key && !label) {
                return null;
            }
            return {
                key,
                label,
                required: item.required === undefined ? true : toBoolean(item.required, true),
                editableKey: item.editableKey === undefined ? !key : toBoolean(item.editableKey),
                description: String(item.description || ''),
                ...(isTokenCredentialPath(item.path) ? { path: item.path } : {}),
            };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    if (items.length === 0) {
        return undefined;
    }
    return {
        authType,
        tokenUrl: decryptSensitiveUsageValue(config.tokenUrl),
        tokenMethod: decryptSensitiveUsageValue(config.tokenMethod),
        tokenResponsePath: decryptSensitiveUsageValue(config.tokenResponsePath),
        signatureConfig: config.signatureConfig,
        items,
    };
};

const normalizeMessageQueueInitialOffset = (value: unknown) => {
    const config = asRecord(value);
    const rawCount = normalizeNumber(config?.initialBackfillCount, 10);
    return {
        initialOffsetPolicy: config?.initialOffsetPolicy === 'LATEST_MINUS_N' ? 'LATEST_MINUS_N' : 'LATEST',
        initialBackfillCount: Math.min(100, Math.max(1, Math.floor(rawCount))),
    };
};

export const getMessageQueueInitialOffsetText = (value?: Record<string, unknown>) => {
    const normalized = normalizeMessageQueueInitialOffset(value);
    if (normalized.initialOffsetPolicy === 'LATEST_MINUS_N') {
        return `最近 ${normalized.initialBackfillCount} 条：每个分区最多回溯 ${normalized.initialBackfillCount} 条历史消息。`;
    }
    return '仅新消息：从合同首次执行后的新消息开始。';
};

export const normalizePaginationConfig = (value: unknown) => {
    const config = asRecord(value);
    if (!config || !config.enabled) {
        return undefined;
    }
    const pageParam = asRecord(config.pageParam) || {};
    const pageSizeParam = asRecord(config.pageSizeParam) || {};
    return {
        enabled: true,
        pageParam: {
            name: String(pageParam.name || 'page').trim() || 'page',
            path: isUsagePath(pageParam.path) ? pageParam.path : 'Query',
            start: Math.max(0, normalizeNumber(pageParam.start, 1)),
            description: String(pageParam.description || '').trim(),
        },
        pageSizeParam: {
            name: String(pageSizeParam.name || 'pageSize').trim() || 'pageSize',
            path: isUsagePath(pageSizeParam.path) ? pageSizeParam.path : 'Query',
            value: Math.max(1, normalizeNumber(pageSizeParam.value, 100)),
            description: String(pageSizeParam.description || '').trim(),
        },
        fetchAll: Boolean(config.fetchAll),
        recordsPath: String(config.recordsPath || '').trim(),
        totalPagesPath: String(config.totalPagesPath || '').trim(),
        totalRecordsPath: String(config.totalRecordsPath || '').trim(),
    };
};

export const getPaginationSummaryText = (value?: Record<string, unknown>) => {
    const normalized = normalizePaginationConfig(value);
    if (!normalized) {
        return '';
    }
    const page = normalized.pageParam;
    const pageSize = normalized.pageSizeParam;
    return `${page.name}(${page.path}) 从 ${page.start} 开始；${pageSize.name}(${pageSize.path}) 默认 ${pageSize.value}；${normalized.fetchAll ? '拉取全量' : '仅拉取单页'}`;
};

export const normalizeOssIncrementalConfig = (value: unknown) => {
    const config = asRecord(value);
    if (!config || config.supported !== true) {
        return undefined;
    }
    return {
        supported: true,
        enabled: Boolean(config.enabled),
        mode: 'WATERMARK',
        description: String(config.description || '').trim() || '目录型资源支持增量拉取，使用方可在合约中选择是否启用。',
    };
};

export const isCustomSignatureCredentialItem = (record: Record<string, unknown>) => {
    const key = String(record.key || record.label || '').trim().toLowerCase();
    return key === 'appid' || key === 'appkey';
};

export const getSampleFiles = (sampleData?: Record<string, unknown>) => {
    const files = [
        ...asArray(sampleData?.files),
        ...asArray(sampleData?.sampleFiles),
    ];
    if (files.length > 0) {
        return files;
    }
    if (sampleData?.name || sampleData?.fileUrl) {
        return [sampleData];
    }
    return [];
};

export const formatSampleSize = (value?: unknown) => {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        return '-';
    }
    return `${(size / 1024).toFixed(2)} KB`;
};
