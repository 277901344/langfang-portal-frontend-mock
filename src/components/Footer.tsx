export function Footer() {
  return (
    <footer className="bg-slate-900 py-12 text-slate-400">
      <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-[1.35fr_0.65fr] md:gap-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <img src="./jingji-logo.svg" alt="" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-tight">京畿数港</span>
          </div>
          <p className="max-w-xl text-xs font-light leading-relaxed text-slate-400">
            作为廊坊市数据要素市场化配置的关键基础设施，京畿数港-廊坊城市可信数据空间保障政贷、政医、政民跨部门、跨域数据资产安全可信流通，筑牢数字底座。
          </p>
        </div>
        <div>
          <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">联系保障部</h3>
          <ul className="space-y-2 text-xs font-light">
            <li>服务热线：0316-XXXXXXXX</li>
            <li>政企合作：office@langfang.gov.cn</li>
            <li>技术保障：support@langfang-trusted.cn</li>
            <li>地址：河北省廊坊市广阳区广阳道</li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between border-t border-slate-800 px-4 pt-8 text-[11px] font-light md:flex-row">
        <p>© 2026 京畿数港-廊坊城市可信数据空间运营管理机构 版权所有</p>
        <div className="flex gap-4 mt-4 md:mt-0">
          <span className="hover:text-white transition-colors">安全合规审计</span>
          <span className="hover:text-white transition-colors">服务条款</span>
          <span className="hover:text-white transition-colors">冀ICP备XXXXXXXX号</span>
        </div>
      </div>
    </footer>
  );
}
