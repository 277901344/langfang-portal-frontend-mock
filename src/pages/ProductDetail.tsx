import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Database, Clock, Loader2, ChevronRight, FileText, Download,
  Tags, PackageCheck, Layers, ArrowUpRight, ShieldCheck, Activity,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useAccessWizard } from '../context/AccessWizardContext';
import {
  formatProductType,
  formatDeliveryType,
  formatProductUpdateFrequency,
  formatProductDataAcquisition,
  formatProductDeliveryMethod,
  formatProductDataSize,
  formatProductPrice,
  formatProductPersonalInformation,
  formatProductDataSubject,
  formatProductMeasureMethod,
  formatProductUnit,
  formatProductQualityLevel,
  formatProductSecurityLevel,
  formatProductPricingModel,
} from '../lib/productDisplay';
import { getPortalProductDetail, type PortalProductDetail } from '../lib/products';
import { buildPortalProductDocumentDownloadUrl, buildPortalProductImageUrl, extractPortalFileName, rewritePortalRichTextImageUrls } from '../lib/portalFiles';
import { formatDateOnly } from '../lib/dateDisplay';
import { buildProtectedLoginPath, buildReturnTo } from '../lib/protectedActions';

type DetailDisplayField = {
  label: string;
  value?: string | number | null;
  wide?: boolean;
  downloadUrl?: string;
  downloadName?: string;
};

type DetailGroup = {
  title: string;
  description: string;
  icon: LucideIcon;
  iconWrapClass: string;
  iconClass: string;
  fields: DetailDisplayField[];
  wide?: boolean;
};

const formatFieldValue = (value?: string | number | null) => {
  if (value === undefined || value === null) return '-';
  return String(value).trim() || '-';
};

const hasFieldValue = (field: DetailDisplayField) => (
  Boolean(field.downloadUrl) || formatFieldValue(field.value) !== '-'
);

const decodeHtmlEntities = (value?: string) => {
  if (!value || typeof window === 'undefined') {
    return value || '';
  }
  const textarea = document.createElement('textarea');
  textarea.innerHTML = value;
  return textarea.value;
};

const resolveRichTextHtml = (value?: string) => {
  const text = value || '';
  const decoded = decodeHtmlEntities(text);
  const html = /<\/?[a-z][\s\S]*>/i.test(decoded) ? decoded : text;
  return rewritePortalRichTextImageUrls(html);
};

export default function ProductDetail() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { checkAndApply } = useAccessWizard();
  const [record, setRecord] = useState<PortalProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const returnTo = buildReturnTo(location);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(buildProtectedLoginPath(returnTo, 'product-detail'), { replace: true });
      return;
    }

    const load = async () => {
      if (!code) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        const data = await getPortalProductDetail(code);
        setRecord(data);
      } catch {
        setRecord(null);
        setError('产品加载失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, isAuthenticated, navigate, returnTo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        <span className="ml-2 text-sm text-slate-500">加载中...</span>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4 selection:bg-blue-500/20">
        <Database className="w-16 h-16 text-slate-300 mb-6" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">{error || '成果不存在'}</h1>
        <p className="text-slate-500 mb-8">您所查询的合规数据要素成果不存在或已被收回。</p>
        <Link to="/products" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> 返回成果产品列表
        </Link>
      </div>
    );
  }

  const productTypeLabel = formatProductType(record.productTypeName || record.productType);
  const deliveryTypeLabel = formatDeliveryType(record.deliveryTypeName || record.deliveryType);
  const heroImageUrl = buildPortalProductImageUrl(record.portalProductImage);
  const deliveryInfoDownloadUrl = buildPortalProductDocumentDownloadUrl(record.deliveryInfo);
  const deliveryInfoFileName = extractPortalFileName(record.deliveryInfo);

  const detailGroups: DetailGroup[] = [
    {
      title: '分类与归属',
      description: '查看产品来源、行业归属及适用场景',
      icon: Tags,
      iconWrapClass: 'bg-blue-50',
      iconClass: 'text-blue-700',
      fields: [
        { label: '提供方名称', value: record.connectorName },
        { label: '行业分类', value: record.industryCategoryName || record.industryCategory },
        { label: '产品类型', value: productTypeLabel },
        { label: '应用场景', value: record.scenario },
        { label: '地域分类', value: record.productRegionName || record.productRegion },
        { label: '能源分类', value: record.energyCategory },
        { label: '数据资源标识', value: record.resourceId, wide: true },
      ],
    },
    {
      title: '数据特征',
      description: '了解数据范围、更新情况与质量安全属性',
      icon: Database,
      iconWrapClass: 'bg-blue-50',
      iconClass: 'text-blue-700',
      fields: [
        { label: '数据来源', value: formatProductDataAcquisition(record.dataAcquisition) },
        { label: '更新频率', value: formatProductUpdateFrequency(record.updateFrequency, record.updateFrequencyUnit) },
        { label: '覆盖时间范围', value: record.timeRange },
        { label: '数据规模', value: formatProductDataSize(record.dataSize, record.dataSizeUnit) },
        { label: '数据质量等级', value: formatProductQualityLevel(record.dataQualityLevel) },
        { label: '数据安全等级', value: formatProductSecurityLevel(record.dataSecurityLevel) },
        { label: '是否含个人信息', value: formatProductPersonalInformation(record.personalInformation) },
        { label: '数据主体', value: formatProductDataSubject(record.dataSubject) },
      ],
    },
    {
      title: '交付与计费',
      description: '明确产品获取方式、服务形式及计费规则',
      icon: PackageCheck,
      iconWrapClass: 'bg-sky-50',
      iconClass: 'text-sky-700',
      wide: true,
      fields: [
        { label: '交付类型', value: deliveryTypeLabel },
        { label: '交付方式', value: formatProductDeliveryMethod(record.deliveryMethod) },
        { label: '服务类型', value: record.serviceType },
        { label: '计量方式', value: formatProductMeasureMethod(record.measureMethod) },
        { label: '计量单位', value: formatProductUnit(record.unit) },
        { label: '价格', value: formatProductPrice(record.price) },
        { label: '商品包装', value: formatProductPricingModel(record.pricingModel) },
        {
          label: '交付材料',
          value: deliveryInfoFileName,
          downloadUrl: deliveryInfoDownloadUrl,
          downloadName: deliveryInfoFileName,
          wide: true,
        },
      ],
    },
  ].map((group) => ({
    ...group,
    fields: group.fields.filter(hasFieldValue),
  })).filter((group) => group.fields.length > 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-blue-500/20">

      {/* Hero Banner with Background Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50/30 border-b border-slate-200 pt-10 pb-12">
        {heroImageUrl && (
          <div
            className="absolute inset-0 bg-cover bg-no-repeat opacity-100"
            style={{ backgroundImage: `url(${heroImageUrl})`, backgroundPosition: '78% center' }}
          />
        )}
        <div className="absolute inset-0 bg-white/60" />
        <div className="relative container mx-auto px-4 max-w-6xl">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors">首页</Link>
            <ChevronRight className="h-4 w-4" />
            <Link to="/products" className="hover:text-slate-900 transition-colors">数据产品</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="line-clamp-1 text-slate-900">{record.productName}</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                {productTypeLabel && (
                  <span className="px-2.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
                    {productTypeLabel}
                  </span>
                )}
                {deliveryTypeLabel && (
                  <span className="px-2.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                    {deliveryTypeLabel}
                  </span>
                )}
                {record.requiresTradingPlatform && (
                  <span className="px-2.5 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                    需交易平台撮合
                  </span>
                )}
                {record.scenarioName && record.scenarioId && (
                  <Link
                    to={`/scenarios/${record.scenarioId}`}
                    className="group inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-blue-50 via-teal-50 to-emerald-50 border border-blue-200/80 text-blue-900 text-xs font-bold hover:border-blue-400 hover:from-blue-100 hover:to-blue-100 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform shrink-0" />
                    <span>关联场景：<span className="text-blue-950 font-extrabold">{record.scenarioName}</span></span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0 ml-0.5" />
                  </Link>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                {record.productName}
              </h1>

              <p className="text-sm leading-7 text-slate-600 md:text-[15px]">
                {record.description || '暂无产品描述'}
              </p>
            </div>

            {/* Right Info Card */}
            <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="mb-4 pb-4 border-b border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">产品标识码</div>
                <div className="text-xs font-bold text-slate-800">{record.productId}</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>发布时间: {formatDateOnly(record.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>更新时间: {formatDateOnly(record.updatedAt)}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    checkAndApply({
                      productId: record.productId,
                      productName: record.productName,
                      connectorName: record.connectorName || record.organizationName,
                      requiresTradingPlatform: record.requiresTradingPlatform,
                    })
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-teal-600 to-emerald-600 px-4 py-3 text-sm font-extrabold text-white shadow-md shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-emerald-500 hover:shadow-lg active:scale-98 cursor-pointer"
                >
                  <PackageCheck className="w-4 h-4 stroke-[2.5]" />
                  <span>申请使用</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
                <div className="mt-2 text-center text-[11px] text-slate-400">
                  支持在线配置约束策略并直达接入连接器
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto mt-8 max-w-6xl space-y-6 px-4">

        {/* 1. Top Row: 分类与归属 & 数据特征 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 分类与归属 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Tags className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">分类与归属</h2>
                <p className="text-xs text-slate-400 mt-0.5">查看产品来源、行业归属及适用场景</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4 px-6 py-3.5">
                <div>
                  <div className="text-slate-400 font-normal mb-1">提供方名称</div>
                  <div className="font-bold text-slate-900 break-all">{record.connectorName || 'lfsc_connector_001'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-normal mb-1">行业分类</div>
                  <div className="font-bold text-slate-900">{record.industryCategoryName || record.industryCategory || 'A1'}</div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4 px-6 py-3.5">
                <div>
                  <div className="text-slate-400 font-normal mb-1">产品类型</div>
                  <div className="font-bold text-slate-900">{productTypeLabel || 'API产品'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-normal mb-1">应用场景</div>
                  <div className="font-bold text-slate-900">{record.scenarioName || record.scenario || '电力数据拉通'}</div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4 px-6 py-3.5">
                <div>
                  <div className="text-slate-400 font-normal mb-1">地域分类</div>
                  <div className="font-bold text-slate-900">{record.productRegionName || record.productRegion || '和平区'}</div>
                </div>
                <div />
              </div>

              {/* Row 4: 数据资源标识 */}
              <div className="px-6 py-3.5">
                <div className="text-slate-400 font-normal mb-1">数据资源标识</div>
                <div className="font-bold text-slate-900 break-all font-mono text-[11px] leading-relaxed">
                  {record.resourceId || '791131000MA0GJFCJ8N0065X7N1WTB8B-a83132c2b27c4cf4'}
                </div>
              </div>
            </div>
          </div>

          {/* 数据特征 */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">数据特征</h2>
                <p className="text-xs text-slate-400 mt-0.5">了解数据范围、更新情况与质量安全属性</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4 px-6 py-3.5">
                <div>
                  <div className="text-slate-400 font-normal mb-1">数据来源</div>
                  <div className="font-bold text-slate-900">{formatProductDataAcquisition(record.dataAcquisition) || '原始取得'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-normal mb-1">更新频率</div>
                  <div className="font-bold text-slate-900">{formatProductUpdateFrequency(record.updateFrequency, record.updateFrequencyUnit) || '1次/天'}</div>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4 px-6 py-3.5">
                <div>
                  <div className="text-slate-400 font-normal mb-1">覆盖时间范围</div>
                  <div className="font-bold text-slate-900">{record.timeRange || '2026-07-23至2026-07-31'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-normal mb-1">数据规模</div>
                  <div className="font-bold text-slate-900">{formatProductDataSize(record.dataSize, record.dataSizeUnit) || '1MB'}</div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-2 gap-4 px-6 py-3.5">
                <div>
                  <div className="text-slate-400 font-normal mb-1">数据质量等级</div>
                  <div className="font-bold text-slate-900">{formatProductQualityLevel(record.dataQualityLevel) || 'B级'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-normal mb-1">数据安全等级</div>
                  <div className="font-bold text-slate-900">{formatProductSecurityLevel(record.dataSecurityLevel) || '2级'}</div>
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-2 gap-4 px-6 py-3.5">
                <div>
                  <div className="text-slate-400 font-normal mb-1">是否个人信息</div>
                  <div className="font-bold text-slate-900">{formatProductPersonalInformation(record.personalInformation) || '不涉及'}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-normal mb-1">数据主体</div>
                  <div className="font-bold text-slate-900">{formatProductDataSubject(record.dataSubject) || '个人信息'}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* 2. Middle Row: 交付与计费 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
              <PackageCheck className="w-5 h-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">交付与计费</h2>
              <p className="text-xs text-slate-400 mt-0.5">明确产品获取方式、服务形式及计费规则</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* Row 1 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-3.5">
              <div>
                <div className="text-slate-400 font-normal mb-1">交付类型</div>
                <div className="font-bold text-slate-900">{deliveryTypeLabel || 'API服务'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-normal mb-1">交付方式</div>
                <div className="font-bold text-slate-900">{formatProductDeliveryMethod(record.deliveryMethod) || 'API传输'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-normal mb-1">服务类型</div>
                <div className="font-bold text-slate-900">{record.serviceType || 'API服务'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-normal mb-1">计量方式</div>
                <div className="font-bold text-slate-900">{formatProductMeasureMethod(record.measureMethod) || '按次数'}</div>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-3.5">
              <div>
                <div className="text-slate-400 font-normal mb-1">计量单位</div>
                <div className="font-bold text-slate-900">{formatProductUnit(record.unit) || '元/次'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-normal mb-1">价格</div>
                <div className="font-bold text-slate-900">{formatProductPrice(record.price) || '100.00元'}</div>
              </div>
              <div>
                <div className="text-slate-400 font-normal mb-1">商品包装</div>
                <div className="font-bold text-slate-900">{formatProductPricingModel(record.pricingModel) || '不可包装'}</div>
              </div>
              <div />
            </div>

            {/* Row 3: 交付材料 */}
            <div className="px-6 py-3.5">
              <div className="text-slate-400 font-normal mb-1.5">交付材料</div>
              <a
                href={deliveryInfoDownloadUrl || '#'}
                download={deliveryInfoFileName || 'qiyiVR.pdf'}
                className="inline-flex items-center gap-1.5 font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span>{deliveryInfoFileName || 'qiyiVR.pdf'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3. Bottom Row: 产品详情 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">产品详情</h2>
          </div>

          <div className="p-8 space-y-8">
            {record.portalCustomDescription && (
              <div
                className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: resolveRichTextHtml(record.portalCustomDescription) }}
              />
            )}

            {/* 图示：可信数据空间准入与合规机制 */}
            <div className="pt-2">
              <div className="text-center max-w-xl mx-auto mb-8">
                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">可信数据空间准入与合规机制</h3>
                <p className="text-xs text-slate-400 mt-1">以流程规则代替主体背书，保障合作可审、可控、可持续</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/60 flex items-center justify-center text-blue-700">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">多维主体合规准入</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    围绕主体资质、授权边界、安全能力与责任承诺开展准入审核，筑牢信任第一防线。
                  </p>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/60 flex items-center justify-center text-blue-700">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">全链路协同流通</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    贯通数据供给、运营治理、服务应用与技术支撑流程，形成可追溯的协作网络。
                  </p>
                </div>

                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-5 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100/60 flex items-center justify-center text-blue-700">
                    <Activity className="w-4.5 h-4.5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">持续审计与风险闭环</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    对授权、调用、交付、交易和异常行为进行持续监测，保障合作过程全程留痕。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
