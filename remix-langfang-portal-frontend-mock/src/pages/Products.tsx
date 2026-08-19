import { startTransition, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Database, Clock, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { formatProductType, formatProductDeliveryMethod } from '../lib/productDisplay';
import {
  mergePortalProductFilterOptions,
  PORTAL_PRODUCT_DELIVERY_METHOD_OPTIONS,
  PORTAL_PRODUCT_INDUSTRY_CATEGORY_OPTIONS,
  PORTAL_PRODUCT_TYPE_OPTIONS,
  type PortalStaticFilterOption,
} from '../lib/productFilters';
import {
  getPortalProducts,
  type PortalProductFilterOption,
  type PortalProductListItem,
} from '../lib/products';
import { useAccessWizard } from '../context/AccessWizardContext';
import { PageBanner } from '../components/PageBanner';

const ALL_FILTER_VALUE = '__all__';
const productsPerPage = 10;

const SCENARIO_FILTER_OPTIONS = [
  { label: '全部场景', value: ALL_FILTER_VALUE },
  { label: '公积金专题', value: 'sc-001' },
  { label: '卫健医疗', value: 'sc-002' },
  { label: '法人信息跨域多维联控', value: 'sc-003' },
  { label: '不动产确权金融联办', value: 'sc-004' },
];

function withAllOption(options: PortalProductFilterOption[], totalCount: number) {
  return [{ label: '全部', value: ALL_FILTER_VALUE, count: totalCount }, ...options];
}

function buildFilterOptions(
  baseOptions: PortalStaticFilterOption[],
  countedOptions: PortalProductFilterOption[],
  totalCount: number,
) {
  return withAllOption(mergePortalProductFilterOptions(baseOptions, countedOptions), totalCount);
}

export function Products() {
  const navigate = useNavigate();
  const { checkAndApply } = useAccessWizard();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialScenario = searchParams.get('scenario') || searchParams.get('scenarioId') || ALL_FILTER_VALUE;

  const isDirectToIdentityAuth = (item: PortalProductListItem) => {
    const name = item.productName || '';
    const id = item.productId || '';
    return (
      id === 'LF-DP-004' ||
      id === 'LF-DP-008' ||
      id === 'dp-004' ||
      id === 'dp-008' ||
      name.includes('不动产确权真伪核验') ||
      name.includes('不动产抵押及查封状态')
    );
  };

  const [products, setProducts] = useState<PortalProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [resultCount, setResultCount] = useState(0);
  const [activeScenario, setActiveScenario] = useState(initialScenario);
  const [activeProductType, setActiveProductType] = useState(ALL_FILTER_VALUE);
  const [activeIndustryCategory, setActiveIndustryCategory] = useState(ALL_FILTER_VALUE);
  const [activeDeliveryMethod, setActiveDeliveryMethod] = useState(ALL_FILTER_VALUE);
  const [industryCategoryOptions, setIndustryCategoryOptions] = useState<PortalProductFilterOption[]>(
    () => withAllOption(PORTAL_PRODUCT_INDUSTRY_CATEGORY_OPTIONS, 0),
  );
  const [industryCategoriesExpanded, setIndustryCategoriesExpanded] = useState(false);
  const [productTypeOptions, setProductTypeOptions] = useState<PortalProductFilterOption[]>(
    () => withAllOption(PORTAL_PRODUCT_TYPE_OPTIONS, 0),
  );
  const [deliveryMethodOptions, setDeliveryMethodOptions] = useState<PortalProductFilterOption[]>(
    () => withAllOption(PORTAL_PRODUCT_DELIVERY_METHOD_OPTIONS, 0),
  );

  useEffect(() => {
    const urlScenario = searchParams.get('scenario') || searchParams.get('scenarioId');
    if (urlScenario) {
      setActiveScenario(urlScenario);
    }
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const response = await getPortalProducts({
          keyword: debouncedSearchQuery || undefined,
          scenario: activeScenario === ALL_FILTER_VALUE ? undefined : activeScenario,
          productType: activeProductType === ALL_FILTER_VALUE ? undefined : activeProductType,
          industryCategory: activeIndustryCategory === ALL_FILTER_VALUE ? undefined : activeIndustryCategory,
          deliveryMethod: activeDeliveryMethod === ALL_FILTER_VALUE ? undefined : activeDeliveryMethod,
          pageNum: currentPage,
          pageSize: productsPerPage,
        });
        if (cancelled) return;

        if (response.pageCount > 0 && currentPage > response.pageCount) {
          startTransition(() => setCurrentPage(response.pageCount));
          return;
        }

        const totalCount = response.totalProductCount || 0;
        setProducts(response.data || []);
        setResultCount(response.dataCount || 0);
        setPageCount(Math.max(response.pageCount || 1, 1));
        setIndustryCategoryOptions(buildFilterOptions(
          PORTAL_PRODUCT_INDUSTRY_CATEGORY_OPTIONS,
          response.industryCategoryOptions || [],
          totalCount,
        ));
        setProductTypeOptions(buildFilterOptions(
          PORTAL_PRODUCT_TYPE_OPTIONS,
          response.productTypeOptions || [],
          totalCount,
        ));
        setDeliveryMethodOptions(buildFilterOptions(
          PORTAL_PRODUCT_DELIVERY_METHOD_OPTIONS,
          response.deliveryMethodOptions || response.deliveryTypeOptions || [],
          totalCount,
        ));
      } catch (error) {
        if (cancelled) return;
        console.error('获取产品列表失败:', error);
        setProducts([]);
        setResultCount(0);
        setPageCount(1);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [activeScenario, activeIndustryCategory, activeDeliveryMethod, activeProductType, currentPage, debouncedSearchQuery]);

  const visibleIndustryCategoryOptions = useMemo(() => {
    if (industryCategoriesExpanded) {
      return industryCategoryOptions;
    }
    const allOption = industryCategoryOptions.find((option) => option.value === ALL_FILTER_VALUE);
    const categoryOptions = industryCategoryOptions.filter((option) => option.value !== ALL_FILTER_VALUE);
    const defaults = categoryOptions.slice(0, 5);
    const activeOption = categoryOptions.find((option) => option.value === activeIndustryCategory);
    const visibleCategories = activeOption && !defaults.some((option) => option.value === activeOption.value)
      ? [...categoryOptions.slice(0, 4), activeOption]
      : defaults;
    if (allOption) {
      return [allOption, ...visibleCategories];
    }
    return visibleCategories;
  }, [activeIndustryCategory, industryCategoriesExpanded, industryCategoryOptions]);

  const hiddenIndustryCategoryCount = Math.max(
    industryCategoryOptions.filter((option) => option.value !== ALL_FILTER_VALUE).length - 5,
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-blue-500/20">
      {/* 统一 3D 玻璃质感 Banner */}
      <PageBanner
        title="数据产品服务大厅"
        subtitle="汇聚政府部门和合作机构发布的数据产品，为城市治理、公共服务和产业发展提供便捷的查找与使用入口，让优质数据资源更好地服务实际业务。"
        tag="数据要素成果"
        variant="数据产品"
        stats={[
          { label: '已上架产品', value: resultCount, unit: '款' },
          { label: '交付方式', value: 'API/沙盒/数据报告' },
          { label: '合规上链', value: '100%' }
        ]}
      />

      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 mt-8 sm:mt-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-72 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-blue-600" />
                产品筛选
              </h3>

              {/* 应用场景 */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">应用场景</p>
                <div className="flex flex-col gap-1">
                  {SCENARIO_FILTER_OPTIONS.map((opt) => {
                    const isSelected = activeScenario === opt.value || (opt.value !== ALL_FILTER_VALUE && activeScenario.includes(opt.value));
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          startTransition(() => {
                            setActiveScenario(opt.value);
                            setCurrentPage(1);
                            if (opt.value === ALL_FILTER_VALUE) {
                              searchParams.delete('scenario');
                              setSearchParams(searchParams);
                            } else {
                              setSearchParams({ scenario: opt.value });
                            }
                          });
                        }}
                        className={cn(
                          "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                          isSelected
                            ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 产品类型 */}
              <div className="mb-5 border-t border-slate-200 pt-4">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">产品类型</p>
                <div className="flex flex-col gap-1">
                  {productTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { startTransition(() => { setActiveProductType(opt.value); setCurrentPage(1); }); }}
                      className={cn(
                        "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                        activeProductType === opt.value
                          ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      )}
                    >
                      <span>{opt.label}</span>
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-slate-400">{opt.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 行业分类 */}
              <div className="mb-5 border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-500">行业分类</p>
                  <span className="text-[10px] text-slate-400 font-mono">共20大类</span>
                </div>
                <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-1">
                  {visibleIndustryCategoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { startTransition(() => { setActiveIndustryCategory(opt.value); setCurrentPage(1); }); }}
                      className={cn(
                        "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                        activeIndustryCategory === opt.value
                          ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      )}
                    >
                      <span className="truncate" title={opt.label}>{opt.label}</span>
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{opt.count}</span>
                      )}
                    </button>
                  ))}
                </div>
                {industryCategoryOptions.length > 6 && (
                  <button
                    type="button"
                    aria-expanded={industryCategoriesExpanded}
                    onClick={() => setIndustryCategoriesExpanded((expanded) => !expanded)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 cursor-pointer w-full justify-center py-1.5 hover:bg-blue-50/50 rounded-lg transition-colors border border-blue-100"
                  >
                    {industryCategoriesExpanded ? (
                      <>
                        <span>收起行业</span>
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        <span>展开全部行业 (20类)</span>
                        <ChevronDown className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* 交付方式 */}
              <div className="border-t border-slate-200 pt-4">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">交付方式</p>
                <div className="flex flex-col gap-1">
                  {deliveryMethodOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { startTransition(() => { setActiveDeliveryMethod(opt.value); setCurrentPage(1); }); }}
                      className={cn(
                        "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                        activeDeliveryMethod === opt.value
                          ? "bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-500 rounded-l-none"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {opt.count !== undefined && (
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">{opt.count}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar and Results Info */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-[#8A94A6]" />
                </div>
                <input
                  type="text"
                  placeholder="检索数据产品名称、提供方..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); startTransition(() => setCurrentPage(1)); }}
                  className="block w-full h-[40px] pl-10 pr-4 bg-white border border-[#DDE3EC] rounded-[6px] text-[#1F2937] text-[14px] placeholder-[#8A94A6] focus:outline-none focus:border-[#1459EB] focus:ring-2 focus:ring-[#1459EB]/20 shadow-2xs transition-all"
                />
              </div>
              <div className="flex items-center text-[13px] text-[#5B6472] bg-white h-[40px] px-4 rounded-[6px] border border-[#DDE3EC] shadow-2xs whitespace-nowrap">
                <span>
                  找到 <strong className="text-[#1459EB] font-semibold">{resultCount}</strong> 项数据产品
                </span>
              </div>
            </div>
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-[#1459EB] animate-spin" />
                <span className="ml-2 text-[14px] text-[#5B6472]">加载中...</span>
              </div>
            )}

            {/* Product Grid */}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
                {products.map((product, idx) => (
                  <motion.article
                    key={product.productId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.2 }}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-[#DDE3EC] bg-white p-6 sm:p-7 min-h-[230px] shadow-[0_2px_10px_rgba(31,41,55,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#1459EB] hover:shadow-[0_8px_24px_rgba(20,89,235,0.1)]"
                  >
                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="inline-flex items-center h-[26px] px-2.5 rounded-[6px] text-[13px] font-semibold bg-[#E0E8F8] text-[#1459EB]">
                          {formatProductType(product.productTypeName || product.productType) || '未分类'}
                        </span>
                        {(product.industryCategoryName || product.industryCategory) && (
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] font-medium text-[#5B6472]">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1459EB]" />
                            <span className="truncate">{product.industryCategoryName || product.industryCategory}</span>
                          </span>
                        )}
                        {product.deliveryTypeName && (
                          <span className="ml-auto text-[13px] font-normal text-[#8A94A6]">
                            {product.deliveryTypeName}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-4 line-clamp-1 text-[18px] sm:text-[19px] font-bold leading-[28px] text-[#1F2937]">
                        <Link to={`/products/${product.productId}`} className="transition-colors group-hover:text-[#1459EB]">
                          {product.productName}
                        </Link>
                      </h3>

                      <p className="mt-2.5 line-clamp-2 sm:line-clamp-3 text-[14px] font-normal leading-[24px] text-[#4B5563]">
                        {product.description || '暂无产品描述'}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-end justify-between gap-4">
                      <div className="min-w-0 space-y-1.5 text-[13px] font-normal text-[#8A94A6]">
                        <div className="flex items-center gap-1.5">
                          <Database className="h-4 w-4 shrink-0 text-[#1459EB]" />
                          <span className="truncate max-w-[200px]">{product.organizationName || product.connectorName || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 shrink-0 text-[#1459EB]" />
                          <span>更新于 {product.updatedAt?.slice(0, 10) || '-'}</span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (isDirectToIdentityAuth(product)) {
                              navigate('/portal-management?tab=institution');
                              return;
                            }
                            checkAndApply({
                              productId: product.productId,
                              productName: product.productName,
                              connectorName: product.connectorName || product.organizationName,
                              requiresTradingPlatform: product.requiresTradingPlatform,
                            });
                          }}
                          className="inline-flex items-center justify-center h-[36px] px-4 rounded-[6px] bg-[#1459EB] hover:bg-[#0E43B5] text-white text-[13px] font-semibold transition-all cursor-pointer shadow-xs"
                        >
                          申请使用
                        </button>
                        <Link
                          to={`/products/${product.productId}`}
                          className="inline-flex items-center gap-1 text-[13px] font-medium text-[#5B6472] transition-colors hover:text-[#1459EB] px-2 py-1.5"
                        >
                          查看详情
                          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 border-dashed">
                <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700 mb-1">未匹配到成果或指标</h3>
                <p className="text-xs text-slate-400">请尝试调整搜索关键词或主题过滤条件。</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setActiveProductType(ALL_FILTER_VALUE);
                    setActiveIndustryCategory(ALL_FILTER_VALUE);
                    setActiveDeliveryMethod(ALL_FILTER_VALUE);
                    setCurrentPage(1);
                  }}
                  className="mt-6 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
                >
                  重置筛选条件
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && pageCount > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => startTransition(() => setCurrentPage(Math.max(1, currentPage - 1)))}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  上一页
                </button>
                <span className="text-xs text-slate-500 px-3">
                  第 {currentPage} / {pageCount} 页
                </span>
                <button
                  onClick={() => startTransition(() => setCurrentPage(Math.min(pageCount, currentPage + 1)))}
                  disabled={currentPage >= pageCount}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  下一页
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
