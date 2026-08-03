import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft, Database, Clock, Loader2, ChevronRight, FileText, Download,
  Tags, PackageCheck,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';
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
        <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
        <span className="ml-2 text-sm text-slate-500">加载中...</span>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-4 selection:bg-cyan-500/20">
        <Database className="w-16 h-16 text-slate-300 mb-6" />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">{error || '成果不存在'}</h1>
        <p className="text-slate-500 mb-8">您所查询的合规数据要素成果不存在或已被收回。</p>
        <Link to="/products" className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
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
      iconWrapClass: 'bg-cyan-50',
      iconClass: 'text-cyan-700',
      fields: [
        { label: '提供方名称', value: record.connectorName },
        { label: '行业分类', value: record.industryCategoryName || record.industryCategory },
        { label: '业务分类', value: record.businessCategory },
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
      iconWrapClass: 'bg-teal-50',
      iconClass: 'text-teal-700',
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
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-cyan-500/20">

      {/* Hero Banner with Background Image */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 border-b border-slate-200 pt-10 pb-12">
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
              <div className="flex items-center gap-2">
                {productTypeLabel && (
                  <span className="px-2.5 py-0.5 rounded bg-cyan-50 border border-cyan-100 text-cyan-700 text-xs font-semibold">
                    {productTypeLabel}
                  </span>
                )}
                {record.businessCategory && (
                  <span className="px-2.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                    {record.businessCategory}
                  </span>
                )}
                {deliveryTypeLabel && (
                  <span className="px-2.5 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold">
                    {deliveryTypeLabel}
                  </span>
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
                  <Clock className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                  <span>发布时间: {formatDateOnly(record.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />
                  <span>更新时间: {formatDateOnly(record.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto mt-8 max-w-6xl space-y-6 px-4">

            {/* 结构化产品信息 */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {detailGroups.map((group, index) => {
                const Icon = group.icon;
                return (
                  <motion.section
                    key={group.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: index * 0.05 }}
                    className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${group.wide ? 'lg:col-span-2' : ''}`}
                  >
                    <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${group.iconWrapClass}`}>
                        <Icon className={`h-5 w-5 ${group.iconClass}`} />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">{group.title}</h2>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{group.description}</p>
                      </div>
                    </div>

                    <dl className={`grid grid-cols-1 gap-x-6 px-6 py-2 sm:grid-cols-2 ${group.wide ? 'lg:grid-cols-4' : ''}`}>
                      {group.fields.map((field) => (
                        <div
                          key={field.label}
                          className={`border-b border-slate-100 py-4 last:border-b-0 ${field.wide ? (group.wide ? 'sm:col-span-2 lg:col-span-4' : 'sm:col-span-2') : ''}`}
                        >
                          <dt className="text-[11px] font-semibold tracking-wide text-slate-400">{field.label}</dt>
                          <dd className="mt-1.5 break-words text-sm leading-6 text-slate-800">
                            {field.downloadUrl ? (
                              <a
                                href={field.downloadUrl}
                                download={field.downloadName || undefined}
                                className="inline-flex items-center gap-1.5 font-semibold text-cyan-700 transition-colors hover:text-cyan-600"
                              >
                                <Download className="h-4 w-4" />
                                {field.downloadName || '下载相关文件'}
                              </a>
                            ) : (
                              formatFieldValue(field.value)
                            )}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </motion.section>
                );
              })}
            </div>

            {/* 产品详情富文本 */}
            {record.portalCustomDescription && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-cyan-600" />
                    产品详情
                  </h3>
                </div>
                <div className="p-8">
                  <div
                    className="prose prose-sm prose-slate max-w-none text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: resolveRichTextHtml(record.portalCustomDescription) }}
                  />
                </div>
              </motion.section>
            )}

      </div>

    </div>
  );
}
