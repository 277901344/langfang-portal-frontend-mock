import { startTransition, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Database, Clock, ChevronRight, ChevronLeft, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { formatProductType, formatProductDeliveryMethod } from '../lib/productDisplay';
import {
  mergePortalProductFilterOptions,
  PORTAL_PRODUCT_DELIVERY_METHOD_OPTIONS,
  PORTAL_PRODUCT_TYPE_OPTIONS,
  type PortalStaticFilterOption,
} from '../lib/productFilters';
import {
  getPortalProducts,
  type PortalProductFilterOption,
  type PortalProductListItem,
} from '../lib/products';

const ALL_FILTER_VALUE = '__all__';
const productsPerPage = 10;

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
  const [products, setProducts] = useState<PortalProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [resultCount, setResultCount] = useState(0);
  const [activeProductType, setActiveProductType] = useState(ALL_FILTER_VALUE);
  const [activeIndustryCategory, setActiveIndustryCategory] = useState(ALL_FILTER_VALUE);
  const [activeDeliveryMethod, setActiveDeliveryMethod] = useState(ALL_FILTER_VALUE);
  const [industryCategoryOptions, setIndustryCategoryOptions] = useState<PortalProductFilterOption[]>(
    () => withAllOption([], 0),
  );
  const [industryCategoriesExpanded, setIndustryCategoriesExpanded] = useState(false);
  const [productTypeOptions, setProductTypeOptions] = useState<PortalProductFilterOption[]>(
    () => withAllOption(PORTAL_PRODUCT_TYPE_OPTIONS, 0),
  );
  const [deliveryMethodOptions, setDeliveryMethodOptions] = useState<PortalProductFilterOption[]>(
    () => withAllOption(PORTAL_PRODUCT_DELIVERY_METHOD_OPTIONS, 0),
  );

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
        setIndustryCategoryOptions(withAllOption(response.industryCategoryOptions || [], totalCount));
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
  }, [activeIndustryCategory, activeDeliveryMethod, activeProductType, currentPage, debouncedSearchQuery]);

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
    <div className="min-h-screen bg-slate-50 pb-24 selection:bg-cyan-500/20">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-800 to-cyan-950 py-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 bg-cyan-400 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 bg-teal-400 rounded-full blur-3xl -bottom-20 -right-20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <span className="text-cyan-400 font-semibold tracking-wider text-xs uppercase bg-cyan-400/10 px-3 py-1 rounded-full">数据要素成果</span>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4 tracking-tighter">数据产品服务</h1>
          <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
            汇聚政府部门和合作机构发布的数据产品，为城市治理、公共服务和产业发展提供便捷的查找与使用入口，让优质数据资源更好地服务实际业务。
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-64 shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-cyan-600" />
                产品筛选
              </h3>

              {/* 产品类型 */}
              <div className="mb-5">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">产品类型</p>
                <div className="flex flex-col gap-1">
                  {productTypeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { startTransition(() => { setActiveProductType(opt.value); setCurrentPage(1); }); }}
                      className={cn(
                        "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                        activeProductType === opt.value
                          ? "bg-cyan-50 text-cyan-700 font-bold border-l-2 border-cyan-500 rounded-l-none"
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
                <p className="mb-2 text-[11px] font-semibold text-slate-500">行业分类</p>
                <div className="flex flex-col gap-1">
                  {visibleIndustryCategoryOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { startTransition(() => { setActiveIndustryCategory(opt.value); setCurrentPage(1); }); }}
                      className={cn(
                        "text-left px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between",
                        activeIndustryCategory === opt.value
                          ? "bg-cyan-50 text-cyan-700 font-bold border-l-2 border-cyan-500 rounded-l-none"
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
                {hiddenIndustryCategoryCount > 0 && (
                  <button
                    type="button"
                    aria-expanded={industryCategoriesExpanded}
                    onClick={() => setIndustryCategoriesExpanded((expanded) => !expanded)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-slate-200 py-1.5 text-[11px] font-semibold text-cyan-700 transition-colors hover:border-cyan-200 hover:bg-cyan-50/60"
                  >
                    {industryCategoriesExpanded ? (
                      <>
                        收起分类
                        <ChevronUp className="h-3.5 w-3.5" />
                      </>
                    ) : (
                      <>
                        展开其余 {hiddenIndustryCategoryCount} 类
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
                          ? "bg-cyan-50 text-cyan-700 font-bold border-l-2 border-cyan-500 rounded-l-none"
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
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search Bar and Results Info */}
            <div className="mb-6 flex items-center gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="检索数据产品名称、提供方..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); startTransition(() => setCurrentPage(1)); }}
                  className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-500 focus:border-transparent shadow-sm transition-shadow"
                />
              </div>
              <div className="flex items-center text-xs text-slate-600 bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm whitespace-nowrap">
                <span>
                  找到 <strong className="text-cyan-600 font-bold">{resultCount}</strong> 项数据产品
                </span>
              </div>
            </div>
            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
                <span className="ml-2 text-xs text-slate-500">加载中...</span>
              </div>
            )}

            {/* Product Grid */}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {products.map((product, idx) => (
                  <motion.article
                    key={product.productId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_14px_30px_rgba(15,118,110,0.08)]"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-transparent opacity-80" />
                    <div className="flex flex-1 flex-col">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-cyan-100 bg-cyan-50 px-2.5 py-0.5 text-[10px] font-bold text-cyan-700">
                          {formatProductType(product.productTypeName || product.productType) || '未分类'}
                        </span>
                        {(product.industryCategoryName || product.industryCategory) && (
                          <span className="inline-flex min-w-0 items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" />
                            <span className="truncate">{product.industryCategoryName || product.industryCategory}</span>
                          </span>
                        )}
                        {product.deliveryTypeName && (
                          <span className="ml-auto text-[10px] font-semibold text-slate-400">
                            {product.deliveryTypeName}
                          </span>
                        )}
                      </div>

                      <h3 className="mt-3 line-clamp-1 text-base font-bold leading-6 text-slate-900">
                        <Link to={`/products/${product.productId}`} className="transition-colors group-hover:text-cyan-700">
                          {product.productName}
                        </Link>
                      </h3>

                      <p className="mt-1.5 line-clamp-2 text-xs font-normal leading-5 text-slate-500">
                        {product.description || '暂无产品描述'}
                      </p>

                      <div className="mt-3.5 grid grid-cols-2 divide-x divide-slate-100 border-y border-slate-100 py-2.5">
                        <div className="min-w-0 pr-4">
                          <div className="text-[10px] font-semibold tracking-wide text-slate-400">应用场景</div>
                          <div className="mt-0.5 truncate text-xs font-semibold text-slate-700">{product.businessCategory || '-'}</div>
                        </div>
                        <div className="min-w-0 pl-4">
                          <div className="text-[10px] font-semibold tracking-wide text-slate-400">交付方式</div>
                          <div className="mt-0.5 truncate text-xs font-semibold text-slate-700">
                            {formatProductDeliveryMethod(product.deliveryMethod) || product.deliveryTypeName || '-'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div className="min-w-0 space-y-1 text-[10px] font-medium text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Database className="h-3.5 w-3.5 shrink-0 text-cyan-600" />
                          <span className="truncate">{product.organizationName || product.connectorName || '-'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-cyan-600" />
                          <span>更新于 {product.updatedAt?.slice(0, 10) || '-'}</span>
                        </div>
                      </div>
                      <Link
                        to={`/products/${product.productId}`}
                        className="flex shrink-0 items-center gap-0.5 text-xs font-bold text-cyan-700 transition-colors hover:text-cyan-600"
                      >
                        查看详情
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
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
