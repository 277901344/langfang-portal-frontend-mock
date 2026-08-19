import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Database,
  Server,
  FileText,
  Radio,
  Cloud,
  Layers,
  Clock,
  Table,
  ChevronRight,
  Zap,
  Building2,
  Package,
  Layers3,
  ExternalLink,
  Shield,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { mockDataResources, DataResourceItem } from '../data/mockResources';
import { keyScenarios, Scenario } from '../data/mockData';
import { getPortalProducts, PortalProductListItem } from '../lib/products';
import { formatProductType } from '../lib/productDisplay';
import { useAccessWizard } from '../context/AccessWizardContext';

export function DataResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { checkAndApply } = useAccessWizard();

  const [resource, setResource] = useState<DataResourceItem | null>(null);
  const [associatedProducts, setAssociatedProducts] = useState<PortalProductListItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Find resource
  useEffect(() => {
    if (!id) return;
    const found = mockDataResources.find((r) => r.id === id);
    if (found) {
      setResource(found);
    } else {
      setResource(null);
    }
  }, [id]);

  // Load associated products
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const res = await getPortalProducts({ pageSize: 20 });
        if (!isMounted) return;

        let items = res.data;
        if (resource) {
          // Filter products that match industry or scenario or keyword
          const matched = items.filter((p) => {
            const indMatch =
              p.industryCategoryName?.includes(resource.industryCategory) ||
              resource.industryCategory.includes(p.industryCategoryName || '');
            const descMatch =
              p.productName.includes(resource.name) ||
              resource.description.includes(p.productName) ||
              (p.scenarioName && resource.scenario.includes(p.scenarioName));
            return indMatch || descMatch;
          });

          if (matched.length > 0) {
            setAssociatedProducts(matched.slice(0, 4));
          } else {
            setAssociatedProducts(items.slice(0, 3));
          }
        } else {
          setAssociatedProducts(items.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to fetch associated products:', err);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [resource]);

  // Match associated scenarios
  const matchedScenarios = useMemo(() => {
    if (!resource) return keyScenarios.slice(0, 2);

    const matches = keyScenarios.filter((sc) => {
      return (
        sc.name.includes(resource.industryCategory) ||
        resource.scenario.includes(sc.name) ||
        sc.dataSupport.includes(resource.industryCategory) ||
        sc.description.includes(resource.industryCategory)
      );
    });

    if (matches.length > 0) return matches;
    return keyScenarios.slice(0, 2);
  }, [resource]);

  const getResourceTypeIcon = (type?: DataResourceItem['type']) => {
    switch (type) {
      case '数据库':
        return Database;
      case 'API 接口':
        return Server;
      case '文件':
        return FileText;
      case 'FTP/SFTP':
        return Radio;
      case 'OSS':
        return Cloud;
      case '消息中间件':
        return Layers;
      default:
        return Database;
    }
  };

  if (!resource) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-20 text-center">
        <Database className="w-16 h-16 text-slate-300 mb-4" />
        <h1 className="text-xl font-bold text-slate-800">未找到相关数据目录资源</h1>
        <p className="text-xs text-slate-500 mt-2">该资源条目可能已被移除或编号错误。</p>
        <Link
          to="/data-resources"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          返回数据目录列表
        </Link>
      </div>
    );
  }

  const TypeIcon = getResourceTypeIcon(resource.type);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Top Banner / Breadcrumb Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50/30 border-b border-slate-200 pt-14 pb-16 sm:pt-16 sm:pb-20">
        <div className="relative w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-slate-900 transition-colors">首页</Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <Link to="/data-resources" className="hover:text-slate-900 transition-colors">数据目录</Link>
            <ChevronRight className="h-4 w-4 text-slate-400" />
            <span className="line-clamp-1 text-slate-900 font-medium">{resource.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            <div className="max-w-3xl space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-0.5">
                  <TypeIcon className="w-3.5 h-3.5 text-blue-600" />
                  {resource.type}
                </span>
                <span className="rounded bg-slate-50 border border-slate-200 text-slate-600 text-xs font-semibold px-2.5 py-0.5">
                  {resource.industryCategory}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  目录ID: {resource.id}
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 leading-tight">
                {resource.name}
              </h1>

              <p className="text-sm leading-7 text-slate-600 md:text-[15px]">
                {resource.description}
              </p>
            </div>

            <div className="w-full lg:w-80 shrink-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 text-xs text-slate-600">
              <div className="mb-2 pb-3 border-b border-slate-200">
                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">目录标识</div>
                <div className="text-xs font-bold text-slate-800">{resource.id}</div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>更新时间: <strong className="text-slate-800">{resource.createdTime}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>数据来源: <strong className="text-slate-800">{resource.source}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="w-full max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-10 mt-8 space-y-8">
        
        {/* Section 1: Basic Specifications Grid */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Layers3 className="w-4 h-4 text-blue-600" />
            基本信息规范
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">数据来源单位</span>
              <span className="font-bold text-slate-800">{resource.source}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">规范格式</span>
              <span className="font-bold text-slate-800">{resource.format}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">更新频率</span>
              <span className="font-bold text-slate-800">{resource.updateFrequency}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">数据规模</span>
              <span className="font-bold text-slate-800">{resource.dataScale}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">是否涉及个人信息</span>
              <span className="font-bold text-slate-800">{resource.hasPersonalInfo}</span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">所属场景</span>
              <span className="font-bold text-blue-800 truncate block">{resource.scenario}</span>
            </div>
          </div>

          {resource.extraInfo && (
            <div className="mt-4 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/60 text-xs">
              <span className="font-bold text-amber-900 mr-2">补充说明：</span>
              <span className="text-amber-800">{resource.extraInfo}</span>
            </div>
          )}
        </div>

        {/* Section 2: Schema / Field Items Table */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-600" />
            信息项（Schema 字段）定义 ({resource.fieldItems.length})
          </h2>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">信息项名称</th>
                  <th className="py-3 px-4">数据类型</th>
                  <th className="py-3 px-4">字段说明</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resource.fieldItems.map((field, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 font-mono">{field.name}</td>
                    <td className="py-2.5 px-4 text-blue-700 font-mono text-[11px]">{field.dataType}</td>
                    <td className="py-2.5 px-4 text-slate-600">{field.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Associated Data Products */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                关联的数据产品
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                基于该数据目录资源加工形成的可信数据产品
              </p>
            </div>
            <Link
              to="/products"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              浏览全量数据产品
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="py-8 text-center text-xs text-slate-400">加载关联数据产品中...</div>
          ) : associatedProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">暂无关联数据产品</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {associatedProducts.map((prod) => (
                <div
                  key={prod.productId}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                        {formatProductType(prod.productTypeName || prod.productType)}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                        {prod.organizationName || prod.connectorName}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                      {prod.productName}
                    </h3>

                    <p className="mt-1.5 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        checkAndApply({
                          productId: prod.productId,
                          productName: prod.productName,
                          connectorName: prod.connectorName || prod.organizationName,
                        })
                      }
                      className="inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:from-blue-500 hover:to-blue-500 transition-all shadow-xs active:scale-95 cursor-pointer"
                    >
                      <span>申请试用</span>
                    </button>

                    <Link
                      to={`/products/${prod.productId}`}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-700 transition-colors"
                    >
                      <span>查看详情</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Associated Scenarios */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                关联的重点应用场景
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                该数据目录支撑的核心业务场景与赋能价值
              </p>
            </div>
            <Link
              to="/scenarios"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              查看全量重点场景
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchedScenarios.map((sc) => (
              <div
                key={sc.id}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="rounded bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5">
                      重点场景
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                    {sc.name}
                  </h3>

                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {sc.value}
                  </p>

                  <div className="mt-2 text-[11px] text-slate-400">
                    涉及部门：{sc.departments.join('、')}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex justify-end">
                  <Link
                    to={`/scenarios/${sc.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    <span>查看场景详情</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
