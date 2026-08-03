import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { keyScenarios } from '../data/mockData';
import { Landmark, Heart, Shield, Home as HomeIcon, CheckCircle2, ArrowRight } from 'lucide-react';

const iconMap: Record<string, any> = {
  'sc-001': Landmark,
  'sc-002': Heart,
  'sc-003': Shield,
  'sc-004': HomeIcon,
};

export function Scenarios() {
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Elegant minimalist banner */}
      <div className="bg-gradient-to-r from-cyan-900 via-slate-800 to-cyan-950 py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 bg-cyan-400 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 bg-teal-400 rounded-full blur-3xl -bottom-20 -right-20"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-cyan-400 font-semibold tracking-wider text-xs uppercase bg-cyan-400/10 px-3 py-1 rounded-full">重点应用与数据生态</span>
            <h1 className="text-3xl md:text-4xl font-bold mt-3 mb-4 tracking-tighter">场景方案专题中心</h1>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
              聚焦政务治理与公共民生重大堵点，设计合规高效的数据可信流通方案。以授权运营与可信环境为支撑，推动数据价值深度落地。
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Scenarios Grid */}
      <div className="container mx-auto px-4 mt-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {keyScenarios.map((scenario, index) => {
            const Icon = iconMap[scenario.id] || Shield;
            return (
              <motion.article
                key={scenario.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-200 hover:shadow-md transition-all"
              >
                <Link to={`/scenarios/${scenario.id}`} className="block">
                  <div className="relative h-40 overflow-hidden bg-slate-900">
                    <img
                      src={scenario.image}
                      alt={scenario.name}
                      className="h-full w-full object-cover opacity-75 transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />
                    <div className="absolute bottom-5 left-6 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-cyan-100">可信数据场景</p>
                        <p className="text-lg font-bold text-white">{scenario.name}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="p-3 bg-cyan-50 rounded-xl text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-lg font-bold tracking-tight text-slate-900">{scenario.name}</h3>
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">{scenario.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>

                    <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-xs text-cyan-600 font-medium bg-cyan-50 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        运行成效显著
                      </span>
                      <span className="text-sm font-semibold text-cyan-600">查看方案</span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
