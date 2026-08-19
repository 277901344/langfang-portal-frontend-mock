import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
    Button,
    Badge,
    Col,
    DatePicker,
    Descriptions,
    Empty,
    Form,
    Image,
    Input,
    InputNumber,
    message,
    Modal,
    Pagination,
    Radio,
    Row,
    Space,
    Table,
    Tabs,
    Spin,
    Steps,
    Typography,
    Tag,
    Upload,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
    AppstoreOutlined,
    BankOutlined,
    CheckOutlined,
    ClockCircleOutlined,
    DeploymentUnitOutlined,
    DownloadOutlined,
    EnvironmentOutlined,
    FileImageOutlined,
    FileTextOutlined,
    GlobalOutlined,
    HistoryOutlined,
    InboxOutlined,
    InfoCircleOutlined,
    LeftOutlined,
    RightOutlined,
    RocketOutlined,
    SaveOutlined,
    SendOutlined,
    SecurityScanOutlined,
    SafetyCertificateOutlined,
    TagOutlined,
} from '@ant-design/icons';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import { CommonCard } from '@/shared/components/CommonCard';
import { PageContainer } from '@/shared/components/PageContainer';
import { UI_CONFIG } from '@/shared/constants/ui';
import { aesDecrypt, DEFAULT_CUSTOM_KEY } from '@/shared/utils/crypto';
import {
    COMMODITY_TYPE_OPTIONS,
    formatApplicationCategoryLabel,
    formatDataAcquisitionLabel,
    formatIndustryCategoryLabel,
    formatOrganizationCategoryLabel,
    formatQualityLevelLabel,
    formatSecurityLevelLabel,
    formatTopicCategoryLabel,
    formatUpdateFrequencyLabel,
} from '@/shared/utils/tradingLabels';
import { useTradingDictionaryStore } from '@/store/useTradingDictionaryStore';
import { useUserStore } from '@/store/useUserStore';
import {
    getCommodityTypeLabel,
    getProductTypeLabel,
    getSubjectTypeLabel,
    getSubjectTypeTagColor,
} from '../utils/format';
import { getFileDownloadUrl, getFileName } from '../utils/file';
import {
    getCommodityManagementDetail,
    downloadCommoditySampleFile,
    getOwnDataProductDetail,
    listOwnDataProducts,
    publishCommodityManagementItem,
    rejectCommodityManagementItem,
    removeCommodityFile,
    saveCommodityManagementItem,
    uploadCommodityFile,
} from '../services/commodityManagement';
import type { CommodityProductItem, CommoditySavePayload, CommodityStatus, CommodityManagementDetail, CommodityStatusLog } from '../types/api';

const { Paragraph, Text } = Typography;

interface CommodityFormValues {
    productId?: string;
    versionId?: string;
    commodityName?: string;
    commodityType?: string;
    coverImage?: string;
    description?: string;
    pricingModel?: string;
    price?: number;
    discount?: number;
    offerPer?: number;
    businessPer?: number;
    deliveryMethod?: number;
    expiredMode?: 'forever' | 'custom';
    expiredTime?: Dayjs;
}

const COMMODITY_PRICING_MODEL_OPTIONS = [
    { label: '免费', value: 'FREE' },
    { label: '按次计费', value: 'PER_CALL' },
    { label: '包月', value: 'MONTHLY' },
];

const COMMODITY_PRICING_MODEL_LABEL: Record<string, string> = COMMODITY_PRICING_MODEL_OPTIONS.reduce<Record<string, string>>(
    (labels, option) => ({ ...labels, [option.value]: option.label }),
    {}
);

const STATUS_LABEL: Record<CommodityStatus, string> = {
    0: '待完善',
    1: '待审核（未上架）',
    2: '审核通过',
    3: '已驳回',
    4: '已上架',
    5: '已下架',
};

const getDisplayValue = (value?: string | number | null) => {
    if (value === undefined || value === null || value === '') {
        return '-';
    }
    return String(value);
};

const normalizeCommodityTypeValue = (value?: string | null) => {
    const label = getCommodityTypeLabel(value || undefined);
    return COMMODITY_TYPE_OPTIONS.some((option) => option.value === label) ? label : '数据集';
};

const resolveCommodityTypeFromProduct = (product?: Pick<CommodityProductItem, 'productType'> | null) => {
    return normalizeCommodityTypeValue(product?.productType);
};

const asRecord = (value: unknown): Record<string, unknown> | undefined => {
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

const asArray = (value: unknown): Array<Record<string, unknown>> => Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object' && !Array.isArray(item))
    : [];

const getNestedRecord = (record: Record<string, unknown> | undefined, key: string) => asRecord(record?.[key]);

const parseMaybeJson = (value: unknown): unknown => {
    if (typeof value !== 'string') {
        return value;
    }
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
};

const setByPath = (target: Record<string, unknown>, path: string[], value: unknown) => {
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

const getProductSampleData = (product?: CommodityProductItem) => asRecord(product?.sampleData);

const getBlobErrorMessage = async (error: unknown, fallback: string) => {
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

const isApiError = (error: unknown) => error instanceof Error
    && ['AuthError', 'ParamError', 'SystemError', 'BizError', 'ApiError'].includes(error.name);

const getStrategyValue = (product?: CommodityProductItem) => parseMaybeJson(product?.accessConstraints?.strategyValue);

const toStrategyConfig = (strategyValue: unknown) => {
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

const getProductUsageExample = (product?: CommodityProductItem) => asRecord(getProductSampleData(product)?.usageExample);

const getApiAuthTypeLabel = (value?: unknown) => {
    if (value === 1 || value === '1') return 'Basic 认证';
    if (value === 2 || value === '2') return 'Bearer Token';
    if (value === 3 || value === '3') return 'API Key';
    if (value === 4 || value === '4') return 'OAuth2 Token';
    if (value === 5 || value === '5') return '自定义摘要签名';
    return '无（None）';
};

const maskTokenUrl = (value?: unknown) => {
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

const normalizeRequestList = (items: unknown, fallbackPath: string) => asArray(items)
    .map((item) => normalizeRequestItem(item, fallbackPath))
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .map((item) => fallbackPath === 'Header' ? { ...item, path: 'Header' } : item);

const normalizeResponseList = (items: unknown) => asArray(items)
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

const normalizeAuthConfig = (value: unknown) => {
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

const getMessageQueueInitialOffsetText = (value?: Record<string, unknown>) => {
    const normalized = normalizeMessageQueueInitialOffset(value);
    if (normalized.initialOffsetPolicy === 'LATEST_MINUS_N') {
        return `最近 ${normalized.initialBackfillCount} 条：每个分区最多回溯 ${normalized.initialBackfillCount} 条历史消息。`;
    }
    return '仅新消息：从合同首次执行后的新消息开始。';
};

const normalizePaginationConfig = (value: unknown) => {
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

const getPaginationSummaryText = (value?: Record<string, unknown>) => {
    const normalized = normalizePaginationConfig(value);
    if (!normalized) {
        return '';
    }
    const page = normalized.pageParam;
    const pageSize = normalized.pageSizeParam;
    return `${page.name}(${page.path}) 从 ${page.start} 开始；${pageSize.name}(${pageSize.path}) 默认 ${pageSize.value}；${normalized.fetchAll ? '拉取全量' : '仅拉取单页'}`;
};

const normalizeOssIncrementalConfig = (value: unknown) => {
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

const isCustomSignatureCredentialItem = (record: Record<string, unknown>) => {
    const key = String(record.key || record.label || '').trim().toLowerCase();
    return key === 'appid' || key === 'appkey';
};

const renderAuthDescription = (authType: unknown, value: unknown, record: Record<string, unknown>) => {
    if (Number(authType) !== 5) {
        return String(value || '-');
    }
    return isCustomSignatureCredentialItem(record)
        ? <Tag color="blue" className="m-0">认证凭证</Tag>
        : <Tag color="cyan" className="m-0">HTTP Header</Tag>;
};

const getSampleFiles = (sampleData?: Record<string, unknown>) => {
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

const formatSampleSize = (value?: unknown) => {
    const size = Number(value);
    if (!Number.isFinite(size) || size <= 0) {
        return '-';
    }
    return `${(size / 1024).toFixed(2)} KB`;
};

const STEP_REQUIRED_FIELDS: Record<number, Array<keyof CommodityFormValues>> = {
    0: ['productId', 'versionId'],
    1: ['commodityName', 'commodityType', 'coverImage', 'deliveryMethod', 'pricingModel'],
};

const IMAGE_ACCEPT_TYPES = ['image/jpeg', 'image/png'];
const MAX_COVER_SIZE = 3 * 1024 * 1024;

const DEFAULT_FORM_VALUES: Partial<CommodityFormValues> = {
    commodityType: '数据集',
    pricingModel: 'FREE',
    discount: 100,
    offerPer: 100,
    businessPer: 0,
    deliveryMethod: 1,
    expiredMode: 'forever',
};

const mergeFormValues = (
    ...sources: Array<Partial<CommodityFormValues> | undefined>
): Partial<CommodityFormValues> => sources.reduce<Partial<CommodityFormValues>>((merged, source) => {
    return { ...merged, ...(source || {}) };
}, {});

const CommodityManagementFormPage = () => {
    useTradingDictionaryStore((state) => state.dictionaryRevision);
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ commodityId: string }>();
    const commodityId = params.commodityId;
    const viewMode = location.pathname.includes('/view/');
    const editing = Boolean(commodityId);
    const [form] = Form.useForm<CommodityFormValues>();
    const roleCodes = useUserStore((state) => state.roleCodes);
    const userInfo = useUserStore((state) => state.userInfo);
    const hasAdminRole = roleCodes.includes('SUPER_ADMIN') || roleCodes.includes('ADMIN');
    const canManageOwnCommodity = !hasAdminRole || userInfo?.accountType === 2;
    const adminViewMode = viewMode && hasAdminRole;

    const [currentStep, setCurrentStep] = useState(() => (viewMode ? 2 : 0));
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productDetailLoading, setProductDetailLoading] = useState(false);
    const [products, setProducts] = useState<CommodityProductItem[]>([]);
    const [productTotal, setProductTotal] = useState(0);
    const [productPageNum, setProductPageNum] = useState(1);
    const [productPageSize, setProductPageSize] = useState(UI_CONFIG.pagination.gridPageSize);
    const [productSearchText, setProductSearchText] = useState('');
    const [productSearchKeyword, setProductSearchKeyword] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<CommodityProductItem | undefined>();
    const [detail, setDetail] = useState<CommodityManagementDetail | undefined>();
    const canOperateCurrentCommodity = canManageOwnCommodity
        && (!editing || Number(detail?.userId) === Number(userInfo?.id));
    const [formSnapshot, setFormSnapshot] = useState<Partial<CommodityFormValues>>(DEFAULT_FORM_VALUES);
    const [coverUploading, setCoverUploading] = useState(false);
    const [coverDeleting, setCoverDeleting] = useState(false);
    const [sampleDownloadKey, setSampleDownloadKey] = useState('');
    const [submitAction, setSubmitAction] = useState<'save' | 'publish' | 'approve' | 'reject' | ''>('');
    const lifecycleScrollRef = useRef<HTMLDivElement>(null);
    const productDetailRequestKeyRef = useRef('');
    const [lifecycleScrollState, setLifecycleScrollState] = useState({
        canScrollLeft: false,
        canScrollRight: false,
        scrollable: false,
    });

    const persistFormValues = useCallback((values: Partial<CommodityFormValues>) => {
        setFormSnapshot((previous) => mergeFormValues(previous, values));
    }, []);

    const patchFormValues = useCallback((values: Partial<CommodityFormValues>) => {
        form.setFieldsValue(values);
        persistFormValues(values);
    }, [form, persistFormValues]);

    const watchedFields = Form.useWatch([], form) || {};
    const watchedValues = mergeFormValues(
        DEFAULT_FORM_VALUES,
        formSnapshot,
        form.getFieldsValue(true),
        watchedFields
    );
    const coverImage = watchedValues.coverImage;
    const paymentMethod = watchedValues.deliveryMethod ?? form.getFieldValue('deliveryMethod');
    const pricingModel = watchedValues.pricingModel || 'FREE';
    const expiredMode = watchedValues.expiredMode ?? form.getFieldValue('expiredMode');
    const requiresPrice = pricingModel !== 'FREE';
    const isCustomExpired = expiredMode === 'custom';
    const coverBusy = coverUploading || coverDeleting;
    const coverFileList: UploadFile[] = coverImage
        ? [{
              uid: coverImage,
              name: getFileName(coverImage),
              status: coverDeleting ? 'uploading' : 'done',
              url: getFileDownloadUrl(coverImage),
          }]
        : [];

    const updateLifecycleScrollState = useCallback(() => {
        const element = lifecycleScrollRef.current;
        if (!element) {
            setLifecycleScrollState({
                canScrollLeft: false,
                canScrollRight: false,
                scrollable: false,
            });
            return;
        }

        const maxScrollLeft = element.scrollWidth - element.clientWidth;
        const scrollable = maxScrollLeft > 1;
        setLifecycleScrollState({
            canScrollLeft: scrollable && element.scrollLeft > 1,
            canScrollRight: scrollable && element.scrollLeft < maxScrollLeft - 1,
            scrollable,
        });
    }, []);

    useEffect(() => {
        const frame = window.requestAnimationFrame(updateLifecycleScrollState);
        window.addEventListener('resize', updateLifecycleScrollState);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener('resize', updateLifecycleScrollState);
        };
    }, [detail?.statusLogs?.length, updateLifecycleScrollState, viewMode]);

    const scrollLifecycle = (direction: -1 | 1) => {
        const element = lifecycleScrollRef.current;
        if (!element) {
            return;
        }
        element.scrollBy({
            left: direction * Math.max(280, element.clientWidth * 0.55),
            behavior: 'smooth',
        });
        window.setTimeout(updateLifecycleScrollState, 260);
    };

    const handleViewRejectReason = (log: CommodityStatusLog) => {
        Modal.info({
            title: '驳回原因',
            content: (
                <Paragraph className="mb-0 whitespace-pre-wrap text-slate-700">
                    {String(log.errors || '').trim() || '暂无驳回原因'}
                </Paragraph>
            ),
            okText: '知道了',
        });
    };

    const fetchProducts = useCallback(async () => {
        setProductsLoading(true);
        try {
            const result = await listOwnDataProducts({
                keyword: productSearchKeyword || undefined,
                pageNum: productPageNum,
                pageSize: productPageSize,
            });
            setProducts(result.data || []);
            setProductTotal(result.dataCount || 0);
        } catch {
            message.error('获取可选数据产品失败');
        } finally {
            setProductsLoading(false);
        }
    }, [productPageNum, productPageSize, productSearchKeyword]);

    const fetchDetail = useCallback(async () => {
        if (!commodityId) {
            return;
        }
        setLoading(true);
        try {
            const result = await getCommodityManagementDetail(commodityId);
            const detailProductId = result.product?.productId || result.productId;
            const detailVersionId = result.product?.versionId || result.versionId;
            setDetail(result);
            setSelectedProduct(detailProductId ? {
                ...(result.product || {}),
                id: result.product?.id || detailProductId,
                productId: detailProductId,
                versionId: detailVersionId,
                productName: result.product?.productName || result.productName || result.commodityName || '',
            } : undefined);
            patchFormValues({
                productId: detailProductId,
                versionId: detailVersionId,
                commodityName: result.commodityName,
                commodityType: normalizeCommodityTypeValue(result.commodityType),
                pricingModel: result.pricingModel || 'FREE',
                coverImage: result.coverImage,
                description: result.description,
                price: result.price,
                discount: result.discount ?? 100,
                offerPer: 100,
                businessPer: 0,
                deliveryMethod: result.deliveryMethod ?? 1,
                expiredMode: result.expiredTime ? 'custom' : 'forever',
                expiredTime: result.expiredTime ? dayjs(result.expiredTime) : undefined,
            });
        } catch {
            message.error('获取商品详情失败');
        } finally {
            setLoading(false);
        }
    }, [commodityId, patchFormValues]);

    useEffect(() => {
        if (!viewMode && canManageOwnCommodity) {
            void fetchProducts();
        }
    }, [canManageOwnCommodity, fetchProducts, viewMode]);

    useEffect(() => {
        void fetchDetail();
    }, [fetchDetail]);

    useEffect(() => {
        if (viewMode) {
            setCurrentStep(2);
        }
    }, [viewMode]);

    const handleProductSelect = async (product: CommodityProductItem): Promise<boolean> => {
        if (viewMode) {
            return false;
        }
        setSelectedProduct(product);
        const productValues: Partial<CommodityFormValues> = {
            productId: product.productId,
            versionId: product.versionId,
        };
        if (!editing) {
            productValues.commodityType = resolveCommodityTypeFromProduct(product);
        }
        if (!editing && !form.isFieldTouched('commodityName') && product.productName) {
            productValues.commodityName = product.productName;
        }
        if (!editing && !form.isFieldTouched('description') && product.description) {
            productValues.description = product.description;
        }
        patchFormValues(productValues);
        if (!product.productId || !product.versionId) {
            message.warning('产品版本信息缺失，无法读取产品详情');
            return false;
        }
        const requestKey = `${product.productId}:${product.versionId}`;
        productDetailRequestKeyRef.current = requestKey;
        setProductDetailLoading(true);
        try {
            const fullProduct = await getOwnDataProductDetail(product.productId, product.versionId);
            if (productDetailRequestKeyRef.current !== requestKey) {
                return false;
            }
            setSelectedProduct(fullProduct);
            const fullProductValues: Partial<CommodityFormValues> = {
                productId: fullProduct.productId,
                versionId: fullProduct.versionId,
            };
            if (!editing) {
                fullProductValues.commodityType = resolveCommodityTypeFromProduct(fullProduct);
            }
            if (!editing && !form.isFieldTouched('commodityName') && fullProduct.productName) {
                fullProductValues.commodityName = fullProduct.productName;
            }
            if (!editing && !form.isFieldTouched('description') && fullProduct.description) {
                fullProductValues.description = fullProduct.description;
            }
            patchFormValues(fullProductValues);
            return true;
        } catch {
            if (productDetailRequestKeyRef.current === requestKey) {
                patchFormValues({ versionId: undefined });
                message.error('获取产品详情失败');
            }
            return false;
        } finally {
            if (productDetailRequestKeyRef.current === requestKey) {
                setProductDetailLoading(false);
            }
        }
    };

    const handleProductSearch = () => {
        setProductPageNum(1);
        setProductSearchKeyword(productSearchText.trim());
    };

    const validatePercentRange = (_: unknown, value?: number) => {
        if (value === undefined || value === null) {
            return Promise.resolve();
        }
        if (value < 0 || value > 100) {
            return Promise.reject(new Error('比例必须在0到100之间'));
        }
        return Promise.resolve();
    };

    const resolveCurrentProductId = () => {
        const formProductId = form.getFieldValue('productId');
        const productId = String(formProductId || selectedProduct?.productId || '').trim();
        if (productId && productId !== formProductId) {
            patchFormValues({ productId });
        }
        return productId;
    };

    const resolveCurrentVersionId = () => {
        const formVersionId = form.getFieldValue('versionId');
        const versionId = String(formVersionId || selectedProduct?.versionId || '').trim();
        if (versionId && versionId !== formVersionId) {
            patchFormValues({ versionId });
        }
        return versionId;
    };

    const syncVisibleSelectedProduct = async () => {
        const productId = resolveCurrentProductId();
        const versionId = resolveCurrentVersionId();
        const visibleProduct = products.find((product) => product.productId === productId);
        if (!visibleProduct || !visibleProduct.versionId || visibleProduct.versionId === versionId) {
            return true;
        }
        return handleProductSelect(visibleProduct);
    };

    const resolveSubmitValues = (): Partial<CommodityFormValues> => mergeFormValues(
        DEFAULT_FORM_VALUES,
        formSnapshot,
        form.getFieldsValue(true)
    );

    const buildPayload = async (): Promise<CommoditySavePayload> => {
        resolveCurrentProductId();
        resolveCurrentVersionId();
        await form.validateFields([...STEP_REQUIRED_FIELDS[0], ...STEP_REQUIRED_FIELDS[1]]);
        let values = resolveSubmitValues();
        values = resolveSubmitValues();
        if (values.expiredMode === 'custom') {
            await form.validateFields(['expiredTime']);
        }
        const isOnline = values.deliveryMethod === 1;
        const productId = String(values.productId || selectedProduct?.productId || '').trim();
        const versionId = String(values.versionId || selectedProduct?.versionId || '').trim();
        const commodityName = String(values.commodityName || '').trim();
        if (!productId) {
            throw new Error('请选择数据产品');
        }
        if (!versionId) {
            throw new Error('产品版本不能为空');
        }
        if (!commodityName) {
            throw new Error('请输入商品名称');
        }
        if (!values.coverImage) {
            throw new Error('请上传商品封面');
        }
        const pricingModel = values.pricingModel || 'FREE';
        if (pricingModel !== 'FREE' && (!values.price || values.price <= 0)) {
            throw new Error('商品价格必须大于0');
        }
        return {
            commodityId,
            productId,
            versionId,
            commodityName,
            commodityType: values.commodityType || '数据集',
            pricingModel,
            coverImage: values.coverImage,
            description: values.description,
            price: pricingModel === 'FREE' ? 0 : values.price || 0,
            discount: pricingModel === 'FREE' ? 100 : values.discount,
            offerPer: isOnline && pricingModel !== 'FREE' ? 100 : undefined,
            businessPer: isOnline && pricingModel !== 'FREE' ? 0 : undefined,
            deliveryMethod: values.deliveryMethod,
            expiredTime: values.expiredMode === 'custom' && values.expiredTime ? values.expiredTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
        };
    };

    const validateStep = async (step: number) => {
        if (step === 0) {
            const synced = await syncVisibleSelectedProduct();
            if (!synced) {
                return false;
            }
        }
        if (step === 0 && !resolveCurrentProductId()) {
            message.warning('请选择数据产品');
            return false;
        }
        if (step === 0 && !resolveCurrentVersionId()) {
            message.warning('产品版本不能为空');
            return false;
        }
        if (step === 0 && productDetailLoading) {
            message.warning('产品详情正在加载，请稍候');
            return false;
        }
        try {
            await form.validateFields(STEP_REQUIRED_FIELDS[step] || []);
            if (step === 1 && form.getFieldValue('pricingModel') !== 'FREE') {
                await form.validateFields(['price', 'discount']);
            }
            if (step === 1 && form.getFieldValue('expiredMode') === 'custom') {
                await form.validateFields(['expiredTime']);
            }
            return true;
        } catch {
            message.warning('请先完善当前步骤的必填信息');
            return false;
        }
    };

    const validateBeforeStep = async (targetStep: number) => {
        for (let step = 0; step < targetStep; step += 1) {
            const valid = await validateStep(step);
            if (!valid) {
                setCurrentStep(step);
                return false;
            }
        }
        return true;
    };

    const handleNext = async () => {
        if (currentStep >= 2) {
            return;
        }
        const valid = await validateStep(currentStep);
        if (valid) {
            persistFormValues(form.getFieldsValue(true));
            setCurrentStep((step) => Math.min(2, step + 1));
        }
    };

    const handleStepChange = async (nextStep: number) => {
        if (nextStep <= currentStep) {
            setCurrentStep(nextStep);
            return;
        }
        if (await validateBeforeStep(nextStep)) {
            persistFormValues(form.getFieldsValue(true));
            setCurrentStep(nextStep);
        }
    };

    const handleSave = async (publishAfterSave: boolean) => {
        if (!(await validateBeforeStep(2))) {
            return;
        }
        setSubmitting(true);
        setSubmitAction(publishAfterSave ? 'publish' : 'save');
        try {
            const saved = await saveCommodityManagementItem(await buildPayload());
            if (publishAfterSave) {
                await publishCommodityManagementItem(saved.commodityId);
                message.success('商品已保存并提交审核，审核通过后才会出现在数据市场');
            } else {
                message.success('商品已保存');
            }
            navigate('/console/commodity-management');
        } catch (error) {
            if (!isApiError(error)) {
                message.error(error instanceof Error ? error.message : (publishAfterSave ? '保存并提交审核失败' : '保存失败'));
            }
        } finally {
            setSubmitting(false);
            setSubmitAction('');
        }
    };

    const handleAdminApprove = () => {
        if (!commodityId) {
            return;
        }
        Modal.confirm({
            title: '确定审核通过该商品吗？',
            content: '审核通过后商品将直接上架到交易市场。',
            okText: '审核通过',
            onOk: async () => {
                setSubmitting(true);
                setSubmitAction('approve');
                try {
                    await publishCommodityManagementItem(commodityId);
                    message.success('商品审核通过并已上架');
                    navigate('/console/commodity-management');
                } finally {
                    setSubmitting(false);
                    setSubmitAction('');
                }
            },
        });
    };

    const handleAdminReject = () => {
        if (!commodityId) {
            return;
        }
        let rejectReason = '';
        Modal.confirm({
            title: '驳回商品',
            content: (
                <div className="pb-7">
                    <Input.TextArea
                        rows={4}
                        maxLength={200}
                        showCount
                        placeholder="请输入驳回原因"
                        onChange={(event) => {
                            rejectReason = event.target.value;
                        }}
                    />
                </div>
            ),
            okText: '驳回',
            okType: 'danger',
            onOk: async () => {
                const trimmedReason = rejectReason.trim();
                if (!trimmedReason) {
                    message.warning('请输入驳回原因');
                    return Promise.reject(new Error('请输入驳回原因'));
                }
                setSubmitting(true);
                setSubmitAction('reject');
                try {
                    await rejectCommodityManagementItem(commodityId, trimmedReason);
                    message.success('商品已驳回');
                    navigate('/console/commodity-management');
                } finally {
                    setSubmitting(false);
                    setSubmitAction('');
                }
            },
        });
    };

    const beforeCoverUpload: UploadProps['beforeUpload'] = (file) => {
        if (coverBusy) {
            message.warning(coverDeleting ? '商品封面正在删除，请稍候' : '商品封面正在上传，请稍候');
            return Upload.LIST_IGNORE;
        }
        if (!IMAGE_ACCEPT_TYPES.includes(file.type)) {
            message.warning('仅支持 jpg、jpeg、png 格式图片');
            return Upload.LIST_IGNORE;
        }
        if (file.size > MAX_COVER_SIZE) {
            message.warning('商品封面不能超过 3M');
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    const handleCoverUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
        setCoverUploading(true);
        try {
            const fileUrl = await uploadCommodityFile(file as File);
            patchFormValues({ coverImage: fileUrl });
            message.success('商品封面上传成功');
            onSuccess?.(fileUrl);
        } catch (error) {
            message.error('商品封面上传失败');
            onError?.(error as Error);
        } finally {
            setCoverUploading(false);
        }
    };

    const handleCoverRemove: UploadProps['onRemove'] = async (file) => {
        if (coverUploading) {
            message.warning('商品封面正在上传，请稍候');
            return false;
        }
        if (coverDeleting) {
            message.warning('商品封面正在删除，请稍候');
            return false;
        }
        const fileUrl = String(file.uid || coverImage || '');
        if (!fileUrl) {
            patchFormValues({ coverImage: undefined });
            return true;
        }
        setCoverDeleting(true);
        try {
            await removeCommodityFile(fileUrl);
            patchFormValues({ coverImage: undefined });
            message.success('商品封面已删除');
            return true;
        } catch {
            message.error('商品封面删除失败');
            return false;
        } finally {
            setCoverDeleting(false);
        }
    };

    const handleDownloadSampleFile = async (product?: CommodityProductItem) => {
        const sampleData = getProductSampleData(product);
        const fileUrl = sampleData?.fileUrl ? String(sampleData.fileUrl) : '';
        if (!fileUrl) {
            message.error('样例数据文件不存在');
            return;
        }
        if (sampleDownloadKey) {
            return;
        }

        setSampleDownloadKey(fileUrl);
        try {
            const { blob, fileName } = await downloadCommoditySampleFile(fileUrl);
            const objectUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = fileName || String(sampleData?.name || '样例数据');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
            message.success('样例数据下载已开始');
        } catch (error) {
            message.error(await getBlobErrorMessage(error, '样例数据下载失败'));
        } finally {
            setSampleDownloadKey('');
        }
    };

    const renderProductCard = (product: CommodityProductItem) => {
        const selectedProductId = String(watchedValues.productId || selectedProduct?.productId || '').trim();
        const selected = selectedProductId === product.productId;
        return (
            <div
                className={[
                    'relative h-full cursor-pointer rounded-2xl border-[2px] transition-all duration-300',
                    selected
                        ? 'border-blue-600 bg-[#EFF6FF] shadow-[0_8px_24px_-4px_rgba(22,119,255,0.2)]'
                        : 'border-transparent hover:-translate-y-0.5 hover:border-blue-100',
                    viewMode ? 'cursor-default' : '',
                ].join(' ')}
                onClick={() => void handleProductSelect(product)}
            >
                {selected && (
                    <div className="absolute right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-200">
                        <CheckOutlined style={{ fontSize: 11, strokeWidth: 4 }} />
                    </div>
                )}
                <CommonCard
                    padding={12}
                    className={[
                        'h-full transition-all duration-300',
                        selected ? 'border-transparent !bg-transparent shadow-none' : '',
                    ].join(' ')}
                    title={
                        <div className="flex items-center gap-2 pr-8">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                <AppstoreOutlined className="text-blue-600 text-[12px]" />
                            </div>
                            <Text strong className="truncate text-[14px] text-slate-800">
                                {product.productName || product.productId}
                            </Text>
                        </div>
                    }
                >
                    <div className="space-y-3">
                        <Paragraph
                            style={{ fontSize: 12 }}
                            className="mb-0 min-h-[36px] text-slate-500 line-clamp-2 leading-relaxed opacity-90"
                        >
                            {product.description || '该产品暂无详细描述'}
                        </Paragraph>
                        <div className="space-y-2 border-t border-slate-50 pt-1">
                            <div className="flex items-center justify-between gap-3">
                                <Text className="shrink-0 font-medium text-slate-500" style={{ fontSize: 12 }}>产品标识</Text>
                                <Text className="max-w-[150px] truncate font-mono text-slate-700" style={{ fontSize: 12 }}>
                                    {product.productId}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <Text className="shrink-0 font-medium text-slate-500" style={{ fontSize: 12 }}>提供方</Text>
                                <Text className="max-w-[150px] truncate text-slate-700" style={{ fontSize: 12 }}>
                                    {product.connectorName || product.connectorId || '-'}
                                </Text>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <Text className="shrink-0 font-medium text-slate-500" style={{ fontSize: 12 }}>产品类型</Text>
                                <Tag color="blue" className="m-0 rounded-full px-2 text-[10px]">
                                    {getProductTypeLabel(product.productType)}
                                </Tag>
                            </div>
                        </div>
                    </div>
                </CommonCard>
            </div>
        );
    };

    useEffect(() => {
        if (!editing && !viewMode && products.length > 0 && !selectedProduct) {
            void handleProductSelect(products[0]);
        }
    }, [editing, products, selectedProduct, viewMode]);

    const renderProductInfoItem = (
        label: string,
        value: string,
        icon: ReactNode,
        iconClassName: string
    ) => (
        <div>
            <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ${iconClassName}`}>
                    {icon}
                </div>
                <span style={{ fontSize: 12 }}>{label}</span>
            </div>
            <Text strong style={{ fontSize: 12 }} className="text-slate-700">
                {value}
            </Text>
        </div>
    );

    const renderPolicySummaryItems = (product?: CommodityProductItem) => {
        const strategyValue = toStrategyConfig(getStrategyValue(product));
        const behaviors = getNestedRecord(strategyValue, 'behaviors');
        const delivery = getNestedRecord(behaviors, 'delivery');
        const operations = getNestedRecord(behaviors, 'operations');
        const constraints = getNestedRecord(strategyValue, 'constraints');
        const time = getNestedRecord(constraints, 'time');
        const location = getNestedRecord(constraints, 'location');
        const items: ReactNode[] = [];

        if (delivery) {
            const actions = [
                delivery.masking ? '脱敏' : '',
                delivery.encrypt ? '加密' : '',
                delivery.anonymize ? '匿名' : '',
                delivery.convert ? '转换' : '',
            ].filter(Boolean);
            if (actions.length > 0) {
                items.push(
                    <div key="delivery" className="flex items-center gap-2 rounded border border-emerald-100 bg-emerald-50 px-3 py-2 text-[12px] text-emerald-600">
                        <RocketOutlined className="shrink-0" />
                        <span className="truncate font-medium">交付: {actions.join('/')}</span>
                    </div>
                );
            }
        }

        if (operations) {
            const actions = [
                operations.view ? '查看' : '',
                operations.download ? '下载' : '',
                operations.sandbox ? '沙箱' : '',
                operations.trade ? '交易' : '',
                operations.recordSending ? '记录发送' : '',
                operations.distribute ? '分发' : '',
            ].filter(Boolean);
            if (actions.length > 0) {
                items.push(
                    <div key="ops" className="flex items-center gap-2 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-[12px] text-blue-600">
                        <SafetyCertificateOutlined className="shrink-0" />
                        <span className="truncate font-medium">操作: {actions.join(', ')}</span>
                    </div>
                );
            }
        }

        if (time && (time.range || time.window || time.maxCount || time.frequency)) {
            const frequency = asRecord(time.frequency);
            const frequencyText = frequency?.count
                ? `${String(frequency.count)}次/${String(frequency.unit || '')}`
                : '';
            items.push(
                <div key="time" className="flex items-center gap-2 rounded border border-purple-100 bg-purple-50 px-3 py-2 text-[12px] text-purple-600">
                    <ClockCircleOutlined className="shrink-0" />
                    <span className="truncate font-medium">
                        时间: {time.range ? '日期范围' : ''}{time.window ? ' 时段' : ''}{time.maxCount ? ` ${time.maxCount}次` : ''}{frequencyText ? ` ${frequencyText}` : ''}{(!time.range && !time.window && !time.maxCount && !frequencyText) ? '受限' : ''}
                    </span>
                </div>
            );
        }

        const regions = Array.isArray(location?.regions) ? location?.regions : [];
        const ipWhitelist = Array.isArray(location?.ipWhitelist) ? location?.ipWhitelist : [];
        if (regions.length > 0 || ipWhitelist.length > 0) {
            items.push(
                <div key="location" className="flex items-center gap-2 rounded border border-amber-100 bg-amber-50 px-3 py-2 text-[12px] text-amber-600">
                    <EnvironmentOutlined className="shrink-0" />
                    <span className="truncate font-medium">地点: 受控区域/IP</span>
                </div>
            );
        }

        return items.length > 0 ? items : (
            <div className="flex items-center gap-2 rounded border border-dashed border-slate-100 bg-slate-50 px-3 py-2 text-[12px] text-slate-400">
                <GlobalOutlined className="shrink-0" />
                <span className="truncate">基础通用策略</span>
            </div>
        );
    };

    const renderPolicyCard = (product?: CommodityProductItem) => {
        const policy = product?.accessConstraints;
        if (!policy) {
            return <div className="py-8 text-center text-slate-400 italic">未绑定授权策略</div>;
        }
        return (
            <div className="space-y-4 p-1">
                {Boolean(policy.strategyName) && (
                    <Text strong className="block text-slate-700" style={{ fontSize: 13 }}>{String(policy.strategyName)}</Text>
                )}
                {Boolean(policy.strategyDesc) && (
                    <Text type="secondary" className="block" style={{ fontSize: 12 }}>{String(policy.strategyDesc)}</Text>
                )}
                <div className="flex flex-col gap-2">
                    {renderPolicySummaryItems(product)}
                </div>
            </div>
        );
    };

    const renderUsagePreview = (product?: CommodityProductItem) => {
        const sampleData = getProductSampleData(product);
        const usageExample = getProductUsageExample(product);
        const authConfig = normalizeAuthConfig(usageExample?.authConfig);
        const authItems = authConfig?.items || [];
        const requestHeaders = normalizeRequestList(usageExample?.requestHeaders, 'Header');
        const requestBody = normalizeRequestList(usageExample?.requestBody, 'Query');
        const responseFields = normalizeResponseList(usageExample?.responseFields);
        const messageQueueInitialOffset = getNestedRecord(usageExample, 'messageQueueInitialOffset');
        const paginationConfig = normalizePaginationConfig(usageExample?.pagination);
        const ossIncrementalConfig = normalizeOssIncrementalConfig(usageExample?.ossIncrementalPull);
        const sampleFiles = getSampleFiles(sampleData);
        const isTokenUrlAuthConfig = authConfig?.authType === 4;

        const requestBodyColumns = [
            { title: '参数名称', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => String(value || record.label || '-') },
            { title: '位置', dataIndex: 'path', key: 'path', render: (value: unknown) => String(value || '-') },
            { title: '类型', dataIndex: 'type', key: 'type', render: (value: unknown) => String(value || '-') },
            { title: '说明', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
            { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
        ];
        const requestHeaderColumns = [
            { title: '参数名称', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => String(value || record.label || '-') },
            { title: '类型', dataIndex: 'type', key: 'type', render: (value: unknown) => String(value || '-') },
            { title: '描述', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
            { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
        ];
        const authColumns = isTokenUrlAuthConfig
            ? [
                { title: '参数名', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => String(value || record.label || '-') },
                { title: '位置', dataIndex: 'path', key: 'path', render: (value: unknown) => String(value || 'Query') },
                { title: '描述', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
                { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
            ]
            : [
                { title: '认证项', dataIndex: 'label', key: 'label', render: (value: unknown, record: Record<string, unknown>) => String(value || record.key || '-') },
                { title: '认证标识', dataIndex: 'key', key: 'key', render: (value: unknown, record: Record<string, unknown>) => record.editableKey ? '可填写' : String(value || '-') },
                { title: '描述', dataIndex: 'description', key: 'description', render: (value: unknown, record: Record<string, unknown>) => renderAuthDescription(authConfig?.authType, value, record) },
                { title: '必填', dataIndex: 'required', key: 'required', render: (value: unknown) => value ? '是' : '否' },
            ];

        const renderUsageContent = () => (
            <div className="space-y-5 p-1">
                {messageQueueInitialOffset && (
                    <div>
                        <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>首次消费范围</Text>
                        <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                            <Text className="block text-slate-700" style={{ fontSize: 12 }}>
                                {getMessageQueueInitialOffsetText(messageQueueInitialOffset)}
                            </Text>
                        </div>
                    </div>
                )}

                {authConfig && authItems.length > 0 && (
                    <div>
                        <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>认证配置要求</Text>
                        <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                            {isTokenUrlAuthConfig && (
                                <div className="grid grid-cols-3 gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Token URL</Text>
                                        <div className="mt-1 break-all text-[12px] text-slate-700">{maskTokenUrl(authConfig.tokenUrl)}</div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Token 方法</Text>
                                        <div className="mt-1 text-[12px] text-slate-700">{String(authConfig.tokenMethod || 'GET')}</div>
                                    </div>
                                    <div>
                                        <Text type="secondary" style={{ fontSize: 12 }}>Token 提取路径</Text>
                                        <div className="mt-1 text-[12px] text-slate-700">{String(authConfig.tokenResponsePath || '$.access_token')}</div>
                                    </div>
                                </div>
                            )}
                            {authItems.length > 0 && (
                                <Table
                                    size="small"
                                    pagination={false}
                                    rowKey={(_, index) => `auth-${index}`}
                                    dataSource={authItems}
                                    columns={authColumns}
                                    summary={() => (
                                        <Table.Summary.Row>
                                            <Table.Summary.Cell index={0} colSpan={4}>
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    认证类型：{getApiAuthTypeLabel(authConfig.authType)}
                                                </Text>
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    )}
                                />
                            )}
                        </div>
                    </div>
                )}

                {requestHeaders.length > 0 && (
                    <div>
                        <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>请求头配置</Text>
                        <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                            <Table size="small" pagination={false} rowKey={(_, index) => `header-${index}`} dataSource={requestHeaders} columns={requestHeaderColumns} />
                        </div>
                    </div>
                )}

                {requestBody.length > 0 && (
                    <div>
                        <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>请求体配置</Text>
                        <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                            <Table size="small" pagination={false} rowKey={(_, index) => `body-${index}`} dataSource={requestBody} columns={requestBodyColumns} />
                        </div>
                    </div>
                )}

                {paginationConfig && (
                    <div>
                        <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>分页配置</Text>
                        <div className="mt-2 space-y-1 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                            <Text className="block text-slate-700" style={{ fontSize: 12 }}>
                                {getPaginationSummaryText(paginationConfig)}
                            </Text>
                            <Text className="block text-slate-500" style={{ fontSize: 12 }}>
                                数据数组路径：{paginationConfig.recordsPath || '未配置，运行时自动推测'}
                            </Text>
                            {(paginationConfig.totalPagesPath || paginationConfig.totalRecordsPath) && (
                                <Text className="block text-slate-500" style={{ fontSize: 12 }}>
                                    总页数字段：{paginationConfig.totalPagesPath || '-'}；总记录数字段：{paginationConfig.totalRecordsPath || '-'}
                                </Text>
                            )}
                        </div>
                    </div>
                )}

                {ossIncrementalConfig && (
                    <div>
                        <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>增量拉取</Text>
                        <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                            <Text className="block text-slate-700" style={{ fontSize: 12 }}>
                                {ossIncrementalConfig.description}
                            </Text>
                        </div>
                    </div>
                )}

                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>响应说明配置</Text>
                    {responseFields.length > 0 ? (
                        <div className="mt-2 overflow-hidden rounded-lg border border-slate-100">
                            <Table
                                size="small"
                                pagination={false}
                                rowKey={(_, index) => `response-${index}`}
                                dataSource={responseFields}
                                columns={[
                                    { title: '字段名称', dataIndex: 'key', key: 'key', render: (value: unknown) => String(value || '-') },
                                    { title: '类型', dataIndex: 'type', key: 'type', render: (value: unknown) => String(value || '-') },
                                    { title: '字段说明', dataIndex: 'description', key: 'description', render: (value: unknown) => String(value || '-') },
                                ]}
                            />
                        </div>
                    ) : (
                        <div className="py-4 text-center text-slate-400 italic" style={{ fontSize: 12 }}>未配置响应字段说明</div>
                    )}
                </div>

                <div>
                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>样本文件</Text>
                    {sampleFiles.length > 0 ? (
                        <div className="mt-2 grid grid-cols-2 gap-4">
                            {sampleFiles.map((file, index) => (
                            <div key={String(file.id || file.fileUrl || file.name || index)} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-emerald-50">
                                        <FileTextOutlined className="text-emerald-600" style={{ fontSize: 12 }} />
                                    </div>
                                    <Text strong className="truncate text-slate-800" style={{ fontSize: 12 }}>
                                        {String(file.name || '样例数据')}
                                    </Text>
                                </div>
                                <Tag bordered={false} className="m-0 shrink-0 bg-slate-200/50 text-[10px]">
                                    {formatSampleSize(file.size)}
                                </Tag>
                                {Boolean(file.fileUrl) && (
                                    <Button
                                        size="small"
                                        type="link"
                                        icon={<DownloadOutlined />}
                                        loading={sampleDownloadKey === String(file.fileUrl)}
                                        disabled={Boolean(sampleDownloadKey)}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            void handleDownloadSampleFile(product);
                                        }}
                                    >
                                        下载
                                    </Button>
                                )}
                            </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-4 text-center text-slate-400 italic" style={{ fontSize: 12 }}>未上传任何样本数据文件</div>
                    )}
                </div>
            </div>
        );

        const renderPreprocessContent = () => product?.processConfig ? (
            <pre className="m-0 max-h-80 overflow-auto rounded-lg border border-slate-100 bg-slate-50 p-4 text-[12px] text-slate-700">
                {JSON.stringify(product.processConfig, null, 2)}
            </pre>
        ) : (
            <div className="py-8 text-center text-slate-400 italic">未配置数据预处理</div>
        );

        return (
            <Tabs
                items={[
                    { key: 'usage', label: '使用说明', children: renderUsageContent() },
                    { key: 'preprocess', label: '数据预处理', children: renderPreprocessContent() },
                ]}
            />
        );
    };

    const renderProviderInfo = () => {
        const providerInfo = detail?.providerInfo;
        if (!viewMode || !hasAdminRole || !providerInfo) {
            return null;
        }
        const identityLabel = providerInfo.phone ? '电话' : '证件号码';
        const identityValue = providerInfo.phone
            || providerInfo.unifiedSocialCreditCode
            || [providerInfo.operatorCertType, providerInfo.operatorCertNumber].filter(Boolean).join(' ');

        return (
            <CommonCard
                padding={18}
                title={
                    <div className="flex items-center gap-2">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-50">
                            <BankOutlined className="text-cyan-600 text-[12px]" />
                        </div>
                        <Text strong style={{ fontSize: 14 }}>提供方信息</Text>
                    </div>
                }
            >
                <div className="grid grid-cols-4 gap-x-6 gap-y-5 p-1">
                    {renderProductInfoItem(
                        '主体名称',
                        getDisplayValue(providerInfo.subjectName),
                        <BankOutlined style={{ fontSize: 12 }} className="text-cyan-600" />,
                        'bg-cyan-50'
                    )}
                    <div>
                        <div className="mb-1 flex items-center gap-1.5 text-slate-400">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-blue-50">
                                <InfoCircleOutlined style={{ fontSize: 12 }} className="text-blue-600" />
                            </div>
                            <span style={{ fontSize: 12 }}>主体类型</span>
                        </div>
                        <Tag color={getSubjectTypeTagColor(providerInfo.authType, providerInfo.subjectType)} className="m-0">
                            {getSubjectTypeLabel(providerInfo.authType, providerInfo.subjectType)}
                        </Tag>
                    </div>
                    {renderProductInfoItem(
                        '连接器名称',
                        getDisplayValue(providerInfo.connectorName),
                        <DeploymentUnitOutlined style={{ fontSize: 12 }} className="text-indigo-600" />,
                        'bg-indigo-50'
                    )}
                    {renderProductInfoItem(
                        identityLabel,
                        getDisplayValue(identityValue),
                        <SecurityScanOutlined style={{ fontSize: 12 }} className="text-rose-600" />,
                        'bg-rose-50'
                    )}
                </div>
            </CommonCard>
        );
    };

    const renderStatusLifecycle = () => {
        const fallbackStatus = detail?.status;
        const shouldShowFallback = fallbackStatus === 1 || fallbackStatus === 3 || fallbackStatus === 5;
        const statusLogs = (detail?.statusLogs && detail.statusLogs.length > 0)
            ? detail.statusLogs
            : (detail && shouldShowFallback ? [{
                id: `current-${fallbackStatus}`,
                commodityId: detail.commodityId,
                status: fallbackStatus,
                createTime: detail.updatedAt || detail.createdAt,
            } as CommodityStatusLog] : []);
        if (!viewMode || statusLogs.length === 0) {
            return null;
        }

        const getStatusTone = (status: CommodityStatus) => {
            if (status === 4) {
                return {
                    color: '#16a34a',
                    background: '#f0fdf4',
                    border: '#bbf7d0',
                    line: '#86efac',
                };
            }
            if (status === 5) {
                return {
                    color: '#ea580c',
                    background: '#fff7ed',
                    border: '#fed7aa',
                    line: '#fdba74',
                };
            }
            if (status === 3) {
                return {
                    color: '#dc2626',
                    background: '#fef2f2',
                    border: '#fecaca',
                    line: '#fca5a5',
                };
            }
            return {
                color: '#1677ff',
                background: '#eff6ff',
                border: '#bfdbfe',
                line: '#93c5fd',
            };
        };

        return (
            <CommonCard
                padding={18}
                className="mt-5"
                title={<Text strong style={{ fontSize: 14 }}>商品状态生命周期</Text>}
                extra={lifecycleScrollState.scrollable ? (
                    <Space size={8}>
                        <Button
                            shape="circle"
                            size="small"
                            icon={<LeftOutlined />}
                            disabled={!lifecycleScrollState.canScrollLeft}
                            onClick={() => scrollLifecycle(-1)}
                        />
                        <Button
                            shape="circle"
                            size="small"
                            icon={<RightOutlined />}
                            disabled={!lifecycleScrollState.canScrollRight}
                            onClick={() => scrollLifecycle(1)}
                        />
                    </Space>
                ) : null}
            >
                <div
                    ref={lifecycleScrollRef}
                    className="overflow-x-auto px-1 py-2"
                    onScroll={updateLifecycleScrollState}
                >
                    <div className="flex min-w-max items-start">
                        {statusLogs.map((log, index) => {
                            const tone = getStatusTone(log.status);
                            const isLast = index === statusLogs.length - 1;
                            return (
                                <div key={log.id || `${log.status}-${index}`} className="flex items-start">
                                    <div className="w-48 shrink-0">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                                                style={{ borderColor: tone.color }}
                                            >
                                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tone.color }} />
                                            </div>
                                            <Tag
                                                bordered={false}
                                                className="m-0 rounded-full px-2 font-medium"
                                                style={{
                                                    color: tone.color,
                                                    backgroundColor: tone.background,
                                                    border: `1px solid ${tone.border}`,
                                                }}
                                            >
                                                {STATUS_LABEL[log.status] || log.status}
                                            </Tag>
                                        </div>
                                        <div className="ml-9 mt-2 whitespace-nowrap text-xs text-slate-400">
                                            {log.createTime ? dayjs(log.createTime).format('YYYY-MM-DD HH:mm:ss') : '-'}
                                        </div>
                                        {log.status === 3 && (
                                            <Button
                                                type="link"
                                                size="small"
                                                className="ml-7 mt-1 h-auto p-0 text-xs"
                                                onClick={() => handleViewRejectReason(log)}
                                            >
                                                详情
                                            </Button>
                                        )}
                                    </div>
                                    {!isLast && (
                                        <div className="mx-3 mt-3 h-px w-16 shrink-0" style={{ backgroundColor: tone.line }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </CommonCard>
        );
    };

    const renderPreview = () => {
        const product = selectedProduct;
        return (
            <div className="space-y-5">
                <CommonCard
                    padding={18}
                    title={
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50">
                                <TagOutlined className="text-amber-600 text-[12px]" />
                            </div>
                            <Text strong style={{ fontSize: 14 }}>商品信息</Text>
                        </div>
                    }
                >
                    <div className="grid grid-cols-[160px_1fr] gap-5">
                        <div className="flex h-36 items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                            {coverImage ? (
                                <Image src={getFileDownloadUrl(coverImage)} alt="商品图片" width="100%" height="100%" style={{ objectFit: 'cover' }} />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                    <FileImageOutlined style={{ fontSize: 28 }} />
                                    <span style={{ fontSize: 12 }}>暂无图片</span>
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <Text strong className="block truncate text-lg text-slate-900">
                                {watchedValues.commodityName || '未命名商品'}
                            </Text>
                            <Paragraph className="mb-4 mt-2 text-slate-500" style={{ fontSize: 13 }}>
                                {watchedValues.description || '暂无商品描述'}
                            </Paragraph>
                            <Descriptions column={3} size="small">
                                <Descriptions.Item label="商品类型">{getCommodityTypeLabel(watchedValues.commodityType)}</Descriptions.Item>
                                <Descriptions.Item label="定价模式">
                                    {COMMODITY_PRICING_MODEL_LABEL[pricingModel] || pricingModel}
                                </Descriptions.Item>
                                {requiresPrice ? (
                                    <>
                                        <Descriptions.Item label={pricingModel === 'MONTHLY' ? '包月价格' : '单次价格'}>
                                            {Number(watchedValues.price || 0).toFixed(2)}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="折扣">{watchedValues.discount ?? 100}%</Descriptions.Item>
                                    </>
                                ) : (
                                    <Descriptions.Item label="价格">免费</Descriptions.Item>
                                )}
                                <Descriptions.Item label="支付方式">{paymentMethod === 0 ? '线下支付' : '线上支付'}</Descriptions.Item>
                            </Descriptions>
                        </div>
                    </div>
                </CommonCard>

                <CommonCard
                    padding={18}
                    title={
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                                <InfoCircleOutlined className="text-blue-600 text-[12px]" />
                            </div>
                            <Text strong style={{ fontSize: 14 }}>产品详情</Text>
                        </div>
                    }
                    className="bg-slate-50/30"
                >
                    {product ? (
                        <div className="grid grid-cols-4 gap-x-6 gap-y-5 p-1">
                            <div className="col-span-4">
                                <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>产品名称</Text>
                                <Text strong className="mt-1 block text-slate-800" style={{ fontSize: 15 }}>
                                    {product.productName || '-'}
                                </Text>
                            </div>
                            <div className="col-span-4 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 px-4 py-3">
                                <div>
                                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>产品编码</Text>
                                    <Text strong className="mt-1 block break-all text-slate-700" style={{ fontSize: 13 }}>
                                        {product.productId || '-'}
                                    </Text>
                                </div>
                                <div>
                                    <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>签约授权</Text>
                                    <div className="mt-1">
                                    {product.isAuth === 1 ? (
                                        <Tag color="warning" bordered={false} className="m-0 text-[11px] font-bold">需要授权</Tag>
                                    ) : (
                                        <Tag color="success" bordered={false} className="m-0 text-[11px] font-bold">无需授权</Tag>
                                    )}
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-4 mb-1 border-b border-slate-100 pb-4">
                                <Text className="font-medium text-slate-400" style={{ fontSize: 12 }}>描述信息</Text>
                                <Paragraph className="mb-0 mt-1 text-slate-600" style={{ fontSize: 12 }}>
                                    {product.description || '暂无描述信息'}
                                </Paragraph>
                            </div>
                            {renderProductInfoItem(
                                '主题分类',
                                formatTopicCategoryLabel(product.topicCategoryLabel, product.topicCategory),
                                <TagOutlined style={{ fontSize: 12 }} className="text-blue-600" />,
                                'bg-blue-50'
                            )}
                            {renderProductInfoItem(
                                '行业分类',
                                formatIndustryCategoryLabel(product.industryCategoryLabel, product.industryCategory),
                                <DeploymentUnitOutlined style={{ fontSize: 12 }} className="text-indigo-600" />,
                                'bg-indigo-50'
                            )}
                            {renderProductInfoItem(
                                '机构分类',
                                formatOrganizationCategoryLabel(product.organizationCategoryLabel, product.organizationCategory),
                                <BankOutlined style={{ fontSize: 12 }} className="text-cyan-600" />,
                                'bg-cyan-50'
                            )}
                            {renderProductInfoItem(
                                '应用场景分类',
                                formatApplicationCategoryLabel(product.applicationCategoryLabel, product.applicationCategory),
                                <AppstoreOutlined style={{ fontSize: 12 }} className="text-emerald-600" />,
                                'bg-emerald-50'
                            )}
                            {renderProductInfoItem(
                                '数据来源',
                                formatDataAcquisitionLabel(product.dataAcquisitionLabel, product.dataAcquisition),
                                <InfoCircleOutlined style={{ fontSize: 12 }} className="text-slate-600" />,
                                'bg-slate-100'
                            )}
                            {renderProductInfoItem(
                                '更新频率',
                                formatUpdateFrequencyLabel(product.updateFrequencyLabel, product.updateFrequency),
                                <HistoryOutlined style={{ fontSize: 12 }} className="text-orange-600" />,
                                'bg-orange-50'
                            )}
                            {renderProductInfoItem(
                                '质量等级',
                                formatQualityLevelLabel(product.dataQualityLevelLabel, product.dataQualityLevel),
                                <Badge status={product.dataQualityLevel ? 'success' : 'default'} className="m-0" />,
                                'bg-slate-100'
                            )}
                            {renderProductInfoItem(
                                '安全分级',
                                formatSecurityLevelLabel(product.dataSecurityLevelLabel, product.dataSecurityLevel),
                                <SecurityScanOutlined style={{ fontSize: 12 }} className="text-rose-600" />,
                                'bg-rose-50'
                            )}
                            <div className="col-span-4 space-y-7 border-t border-slate-100 pt-6">
                                <CommonCard
                                    padding={16}
                                    title={
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-purple-50">
                                                <SafetyCertificateOutlined className="text-purple-600 text-[12px]" />
                                            </div>
                                            <Text strong style={{ fontSize: 14 }}>授权控制策略</Text>
                                        </div>
                                    }
                                >
                                    {renderPolicyCard(product)}
                                </CommonCard>
                                <CommonCard
                                    padding={16}
                                    title={
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                                <FileTextOutlined className="text-emerald-600 text-[12px]" />
                                            </div>
                                            <Text strong style={{ fontSize: 14 }}>使用说明预览</Text>
                                        </div>
                                    }
                                >
                                    {renderUsagePreview(product)}
                                </CommonCard>
                            </div>
                        </div>
                    ) : (
                        <Empty description="暂无产品详情" />
                    )}
                </CommonCard>

                {renderProviderInfo()}
            </div>
        );
    };

    return (
        <PageContainer
            title={viewMode ? '查看商品' : editing ? '编辑商品' : '新建商品'}
            subtitle={viewMode ? detail?.commodityName : undefined}
            layout="narrow"
            onBack={() => navigate('/console/commodity-management')}
            loading={loading}
            contentClassName="pb-8"
        >
            <Spin spinning={submitting}>
                {!viewMode && (
                    <div className={`${UI_CONFIG.block.base} ${UI_CONFIG.block.contentAreaPadding} mb-5`}>
                        <Steps
                            current={currentStep}
                            onChange={(nextStep) => void handleStepChange(nextStep)}
                            items={[
                                { title: '选择数据产品' },
                                { title: '填写商品定义' },
                                { title: '发布预览' },
                            ]}
                        />
                    </div>
                )}
                <Form
                    form={form}
                    layout="vertical"
                    disabled={viewMode}
                    onValuesChange={(_, allValues) => persistFormValues(allValues)}
                    initialValues={DEFAULT_FORM_VALUES}
                >
                    {currentStep === 0 && (
                        <div className="flex flex-col rounded-xl bg-white">
                            <div className="border-b border-slate-200/60 bg-slate-50 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-0.5 flex items-center gap-3">
                                            <div className="h-5 w-1 rounded-full bg-linear-to-b from-blue-600 to-indigo-600" />
                                            <Text strong className="m-0 text-base text-slate-800">选择数据产品</Text>
                                        </div>
                                        <Text className="ml-4 block text-slate-500" style={{ fontSize: 12 }}>
                                            从当前用户自己的数据产品中选择一项作为商品核心内容。
                                        </Text>
                                    </div>
                                    <Space.Compact style={{ width: 320 }}>
                                        <Input
                                            value={productSearchText}
                                            onChange={(event) => {
                                                const value = event.target.value;
                                                setProductSearchText(value);
                                                if (value === '') {
                                                    setProductSearchKeyword('');
                                                    setProductPageNum(1);
                                                }
                                            }}
                                            onPressEnter={handleProductSearch}
                                            placeholder="搜索产品名称"
                                            allowClear
                                            className="text-[12px]"
                                            style={{ height: UI_CONFIG.input.baseInputHeight }}
                                        />
                                        <Button
                                            type="primary"
                                            className="font-bold"
                                            style={{ height: UI_CONFIG.input.baseInputHeight }}
                                            onClick={handleProductSearch}
                                        >
                                            搜索
                                        </Button>
                                    </Space.Compact>
                                </div>
                            </div>
                            <div className="p-5">
                                <Form.Item name="productId" hidden rules={[{ required: true, message: '请选择数据产品' }]}>
                                    <Input />
                                </Form.Item>
                                <Form.Item name="versionId" hidden rules={[{ required: true, message: '产品版本不能为空' }]}>
                                    <Input />
                                </Form.Item>
                                <Spin spinning={productsLoading}>
                                    {products.length === 0 ? (
                                        <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 text-center">
                                            <Empty
                                                description={
                                                    <div className="text-slate-500">
                                                        <div>暂无可选数据产品</div>
                                                        <div className="mt-1 text-xs">请先在连接器侧发布自己的数据产品后再创建商品</div>
                                                    </div>
                                                }
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <Row gutter={[UI_CONFIG.spacing.cardGap, UI_CONFIG.spacing.cardGap]}>
                                                {products.map((product) => (
                                                    <Col key={`${product.productId}-${product.versionId || ''}`} span={8}>
                                                        {renderProductCard(product)}
                                                    </Col>
                                                ))}
                                            </Row>
                                            <div className="flex justify-end" style={{ marginTop: UI_CONFIG.spacing.tableToPaginationNum }}>
                                                <Pagination
                                                    current={productPageNum}
                                                    pageSize={productPageSize}
                                                    total={productTotal}
                                                    onChange={(nextPage, nextPageSize) => {
                                                        setProductPageNum(nextPage);
                                                        if (nextPageSize !== productPageSize) {
                                                            setProductPageSize(nextPageSize);
                                                        }
                                                    }}
                                                    showTotal={(totalCount) => `共 ${totalCount} 条产品`}
                                                    size="small"
                                                />
                                            </div>
                                        </>
                                    )}
                                </Spin>
                            </div>
                        </div>
                    )}

                    {currentStep === 1 && (
                        <CommonCard padding={20} title={<Text strong>商品定义信息</Text>}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item name="commodityName" label="商品名称" rules={[{ required: true, message: '请输入商品名称' }]}>
                                        <Input maxLength={128} placeholder="请输入商品名称" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="commodityType" label="商品类型" rules={[{ required: true, message: '请选择商品类型' }]}>
                                        <Radio.Group options={COMMODITY_TYPE_OPTIONS} optionType="button" buttonStyle="solid" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="商品封面" required>
                                        <Form.Item name="coverImage" noStyle rules={[{ required: true, message: '请上传商品封面' }]}>
                                            <Input type="hidden" />
                                        </Form.Item>
                                        <Upload.Dragger
                                            name="file"
                                            accept=".jpg,.jpeg,.png"
                                            multiple={false}
                                            maxCount={1}
                                            fileList={coverFileList}
                                            beforeUpload={beforeCoverUpload}
                                            customRequest={handleCoverUpload}
                                            disabled={coverBusy}
                                            onRemove={handleCoverRemove}
                                            className={coverBusy ? '!bg-blue-50/30' : '!bg-transparent'}
                                        >
                                            {coverBusy ? (
                                                <div className="flex flex-col items-center justify-center py-8">
                                                    <Spin size="large" />
                                                    <p className="ant-upload-text mt-4">
                                                        {coverDeleting ? '正在删除商品封面...' : '正在上传商品封面...'}
                                                    </p>
                                                    <p className="ant-upload-hint">
                                                        {coverDeleting ? '请稍候，删除完成后会自动清空文件' : '请保持当前页面，上传完成后会自动回填文件'}
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="ant-upload-drag-icon">
                                                        <InboxOutlined />
                                                    </p>
                                                    <p className="ant-upload-text">点击或将文件拖拽到这里上传</p>
                                                    <p className="ant-upload-hint">
                                                        支持文件类型: jpg、jpeg、png，文件不能超过3M，建议宽高比3:2
                                                    </p>
                                                </>
                                            )}
                                        </Upload.Dragger>
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item name="description" label="商品描述">
                                        <Input.TextArea rows={5} maxLength={1000} showCount placeholder="请输入商品描述" />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item label="定价设置" required>
                                        <div className="space-y-5">
                                            <Form.Item
                                                name="pricingModel"
                                                noStyle
                                                rules={[{ required: true, message: '请选择定价模式' }]}
                                            >
                                                <Radio.Group
                                                    optionType="button"
                                                    buttonStyle="solid"
                                                    options={COMMODITY_PRICING_MODEL_OPTIONS}
                                                />
                                            </Form.Item>
                                            {requiresPrice && (
                                                <div className="grid grid-cols-1 gap-5 rounded-lg bg-slate-50/70 p-4 md:grid-cols-2">
                                                    <div className="min-w-0 space-y-2">
                                                        <Text className="block text-slate-700">
                                                            {pricingModel === 'MONTHLY' ? '包月价格' : '单次价格'}
                                                        </Text>
                                                        <Form.Item
                                                            name="price"
                                                            rules={[
                                                                { required: true, message: '请输入商品价格' },
                                                                { type: 'number', min: 0.01, message: '商品价格必须大于0' },
                                                            ]}
                                                            className="!mb-0"
                                                        >
                                                            <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="请输入" />
                                                        </Form.Item>
                                                    </div>
                                                    <div className="min-w-0 space-y-2">
                                                        <Text className="block text-slate-700">折扣</Text>
                                                        <Form.Item
                                                            name="discount"
                                                            rules={[
                                                                { required: true, message: '请输入折扣' },
                                                                { validator: validatePercentRange },
                                                            ]}
                                                            className="!mb-0"
                                                        >
                                                            <InputNumber min={0} max={100} step={1} precision={2} style={{ width: '100%' }} addonAfter="%" />
                                                        </Form.Item>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Form.Item>
                                </Col>
                                <Form.Item name="deliveryMethod" hidden initialValue={1}>
                                    <Input />
                                </Form.Item>
                                <Col span={12}>
                                    <Form.Item name="expiredMode" label="有效期" rules={[{ required: true, message: '请选择有效期' }]}>
                                        <Radio.Group
                                            options={[
                                                { value: 'forever', label: '永久' },
                                                { value: 'custom', label: '自定义' },
                                            ]}
                                            onChange={(event) => {
                                                if (event.target.value === 'forever') {
                                                    patchFormValues({ expiredTime: undefined });
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </Col>
                                {isCustomExpired && (
                                    <Col span={12}>
                                        <Form.Item name="expiredTime" label="过期时间" rules={[{ required: true, message: '请选择过期时间' }]}>
                                            <DatePicker showTime className="w-full" />
                                        </Form.Item>
                                    </Col>
                                )}
                            </Row>
                        </CommonCard>
                    )}

                    {currentStep === 2 && renderPreview()}
                </Form>

                {renderStatusLifecycle()}

                <div className="mt-3 flex justify-end">
                    <Space>
                        <Button onClick={() => navigate('/console/commodity-management')}>
                            取消
                        </Button>
                        {!viewMode && canOperateCurrentCommodity && (
                            <Button disabled={currentStep === 0} onClick={() => setCurrentStep((step) => Math.max(0, step - 1))}>
                                上一步
                            </Button>
                        )}
                        {!viewMode && canOperateCurrentCommodity && currentStep < 2 && (
                            <Button type="primary" onClick={() => void handleNext()}>
                                下一步
                            </Button>
                        )}
                        {adminViewMode && detail?.status === 1 && (
                            <>
                                <Button
                                    danger
                                    loading={submitAction === 'reject'}
                                    disabled={submitting && submitAction !== 'reject'}
                                    onClick={handleAdminReject}
                                >
                                    驳回
                                </Button>
                                <Button
                                    type="primary"
                                    loading={submitAction === 'approve'}
                                    disabled={submitting && submitAction !== 'approve'}
                                    onClick={handleAdminApprove}
                                >
                                    审核通过
                                </Button>
                            </>
                        )}
                        {!viewMode && canOperateCurrentCommodity && currentStep === 2 && (
                            <>
                                <Button
                                    icon={<SaveOutlined />}
                                    loading={submitAction === 'save'}
                                    disabled={submitting && submitAction !== 'save'}
                                    onClick={() => void handleSave(false)}
                                >
                                    保存
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<SendOutlined />}
                                    loading={submitAction === 'publish'}
                                    disabled={submitting && submitAction !== 'publish'}
                                    onClick={() => void handleSave(true)}
                                >
                                    提交审核
                                </Button>
                            </>
                        )}
                    </Space>
                </div>
            </Spin>
        </PageContainer>
    );
};

export default CommodityManagementFormPage;
