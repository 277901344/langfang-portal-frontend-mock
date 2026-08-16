import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { keyScenarios } from '../data/mockData';
import { getProductsByScenario } from '../lib/products';
import { Landmark, Heart, Shield, Home as HomeIcon, CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { PageBanner } from '../components/PageBanner';
import { applyImageFallback, publicAssetUrl } from '../lib/publicAssets';

const SCENARIO_IMAGE_FALLBACK = publicAssetUrl('assets/banner/重要场景.png');

const iconMap: Record<string, any> = {
  'sc-001': Landmark,
  'sc-002': Heart,
  'sc-003': Shield,
  'sc-004': HomeIcon,
};

export function Scenarios() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* 统一的高科技 3D 玻璃质感 Banner */}
      <PageBanner
        title="重点场景专题中心"
        subtitle="聚焦政务治理与公共民生重大堵点，设计合规高效的数据可信流通方案。以授权运营与可信环境为支撑，推动数据价值深度落地。"
        tag="重点应用与数据生态"
        variant="重要场景"
        stats={[
          { label: '重点场景', value: keyScenarios.length, unit: '个' },
          { label: '覆盖行业', value: '4+', unit: '大领域' },
          { label: '安全合规', value: '100%' }
        ]}
      />

      {/* Main Scenarios Grid */}

      {/* Main Scenarios Grid */}
      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {keyScenarios.map((scenario, index) => {
            const Icon = iconMap[scenario.id] || Shield;
            const productCount = getProductsByScenario(scenario.id).length;
            return (
              <motion.article
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <Link to={`/scenarios/${scenario.id}`} className="block flex-1">
                  <div className="relative h-40 overflow-hidden bg-slate-900">
                    <img
                      src={scenario.image}
                      alt={scenario.name}
                      loading="lazy"
                      onError={(event) => applyImageFallback(event.currentTarget, SCENARIO_IMAGE_FALLBACK)}
                      className="h-full w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                    <div className="absolute bottom-5 left-6 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-blue-100">可信数据场景</p>
                        <p className="text-lg font-bold text-white">{scenario.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold tracking-tight text-slate-900">{scenario.name}</h3>
                          <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{scenario.description}</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>

                {/* Card Footer Actions */}
                <div className="px-6 pb-5 pt-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-medium bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    已上线运行
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/products?scenario=${encodeURIComponent(scenario.id)}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1.5 rounded-lg transition-all shadow-2xs group/btn"
                    >
                      <Package className="w-3.5 h-3.5 text-blue-600 group-hover/btn:scale-110 transition-transform" />
                      <span>关联产品</span>
                    </Link>

                    <Link
                      to={`/scenarios/${scenario.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-500 hover:to-blue-500 px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95"
                    >
                      <span>方案详情</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
