import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { getPortalProductDetail, type PortalProductDetail } from '../lib/products';

export function ContractCreatePage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const productId = code || searchParams.get('code') || 'LF-DP-001';
  const [product, setProduct] = useState<PortalProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Purchase quantity state (default: 1)
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [orderNo, setOrderNo] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const detail = await getPortalProductDetail(productId);
        if (!cancelled && detail) {
          setProduct(detail);
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
  }, [productId]);

  // Compute pricing info
  const pricingType = product?.pricingInfo?.type || '免费';
  const unitPrice =
    pricingType === '包月'
      ? Number(product?.pricingInfo?.discountMonthlyPrice ?? product?.pricingInfo?.monthlyPrice ?? 160)
      : pricingType === '按次计费'
      ? Number(product?.pricingInfo?.discountUnitPrice ?? product?.pricingInfo?.unitPrice ?? 0.05)
      : 0;

  const unitPriceFormatted =
    pricingType === '包月'
      ? `${unitPrice.toFixed(2)}/月`
      : pricingType === '按次计费'
      ? `${unitPrice.toFixed(2)}/次`
      : '0.00';

  const totalPriceFormatted = (unitPrice * quantity).toFixed(2);

  const handleSubmitOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const generatedOrderNo = `LF-ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
      setOrderNo(generatedOrderNo);
      setIsSubmitting(false);
      setIsSuccessModalOpen(true);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600 text-base bg-white px-8 py-5 rounded-xl shadow-xs border border-slate-200">
          <Loader2 className="w-6 h-6 animate-spin text-[#1677ff]" />
          <span>正在加载订单确认信息...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-800 font-sans py-8 px-4 sm:px-8 lg:px-12">
      {/* 顶部面包屑导航（按参照图片样式：纯文本链接加 > 分隔符，支持返回） */}
      <div className="max-w-[1240px] mx-auto mb-5 flex items-center justify-between">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap text-sm text-slate-600">
          <Link
            to="/"
            className="hover:text-blue-600 transition-colors"
          >
            首页
          </Link>
          <span className="mx-2 text-slate-400 font-normal select-none">&gt;</span>
          <Link
            to="/products"
            className="hover:text-blue-600 transition-colors"
          >
            数据产品
          </Link>
          <span className="mx-2 text-slate-400 font-normal select-none">&gt;</span>
          <Link
            to={`/products/${productId}`}
            className="hover:text-blue-600 transition-colors max-w-[380px] truncate"
            title={product?.productName}
          >
            {product?.productName || '产品详情'}
          </Link>
          <span className="mx-2 text-slate-400 font-normal select-none">&gt;</span>
          <span className="text-slate-900 font-medium">订单确认</span>
        </nav>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回</span>
        </button>
      </div>

      {/* 订单确认主体大表单卡片（保持原有排版并放大比例） */}
      <div className="max-w-[1240px] mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-[0_4px_24px_rgba(31,41,55,0.05)] p-8 sm:p-12 md:p-14 space-y-10">
        
        {/* 1. 数据提供方 */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            数据提供方
          </h2>

          <div className="bg-[#F8FAFC] rounded-xl p-6 sm:p-8 border border-slate-100/90">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 text-sm sm:text-base">
              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">主体名称</span>
                <span className="font-semibold text-slate-900 truncate text-sm sm:text-base">
                  {product?.organizationName || '廊坊市住房公积金管理中心'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">主体类型</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs sm:text-sm font-medium bg-[#f9f0ff] text-[#722ed1] border border-[#d3adf7]">
                  机构/法人
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">连接名称</span>
                <span className="font-medium text-slate-800 text-sm sm:text-base truncate">
                  {product?.connectorName || product?.organizationName || '廊坊市住房公积金管理中心'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">证件号码</span>
                <span className="font-mono font-medium text-slate-800 text-sm sm:text-base">
                  91131000MA0GJFCJ8N
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 商品信息 */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            商品信息
          </h2>

          <div className="pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-10 text-sm sm:text-base">
              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">商品名称</span>
                <span className="font-bold text-slate-900 truncate text-sm sm:text-base" title={product?.productName}>
                  {product?.productName || '公积金缴存人跨域核验信息...'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">商品类型</span>
                <span className="text-slate-800 text-sm sm:text-base">
                  {product?.productTypeName || product?.productType || 'API产品'}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">支付方式</span>
                <span className="text-slate-800 text-sm sm:text-base">线上支付</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">定价模式</span>
                <span className="text-slate-800 text-sm sm:text-base">{pricingType}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">成交价格</span>
                <span className="text-slate-800 font-medium text-sm sm:text-base">{unitPriceFormatted}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">购买数量</span>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24 h-9 px-3 bg-white border border-slate-300 rounded text-slate-900 text-sm sm:text-base text-center focus:outline-none focus:border-[#1677ff] focus:ring-1 focus:ring-[#1677ff]/20 shadow-2xs"
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-slate-500 w-24 shrink-0 text-sm sm:text-base">订单总价</span>
                <span className="text-lg sm:text-xl font-bold text-slate-900">
                  {totalPriceFormatted}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. 分割线与居中提交订单按钮 */}
        <div className="pt-8 border-t border-slate-100 flex items-center justify-center">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitOrder}
            className="inline-flex items-center justify-center min-w-[160px] h-[44px] px-10 rounded-lg bg-[#1677ff] hover:bg-blue-600 active:scale-[0.99] text-white text-base font-medium transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>正在提交...</span>
              </>
            ) : (
              <span>提交订单</span>
            )}
          </button>
        </div>
      </div>

      {/* 提交成功结果弹窗 */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 sm:p-10 max-w-lg w-full text-center space-y-6 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">订单提交成功！</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                已生成履约结算单并同步至国家可信数据空间存证节点
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-left text-xs sm:text-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">订单编号</span>
                <span className="font-mono font-bold text-slate-800">{orderNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">商品名称</span>
                <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                  {product?.productName}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">成交总额</span>
                <span className="font-bold text-[#1677ff] text-base">¥ {totalPriceFormatted}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">履约通道</span>
                <span className="text-emerald-700 font-semibold">已自动关联边缘连接器</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/products')}
                className="w-full h-[42px] px-4 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                返回产品大厅
              </button>
              <button
                type="button"
                onClick={() => navigate('/platform/service')}
                className="w-full h-[42px] px-4 rounded-xl bg-[#1677ff] hover:bg-blue-600 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                前往空间工作台
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



