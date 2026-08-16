export function Footer() {
  return (
    <footer className="bg-[#071937] py-12 text-[#8A94A6] border-t border-[#DDE3EC]/10 relative overflow-hidden">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* 左侧品牌与描述 */}
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[20px] leading-[28px] font-semibold text-white tracking-tight">
                京畿数港 · 廊坊城市可信数据空间
              </span>
            </div>
            <p className="text-[13px] leading-[22px] text-[#8A94A6] font-normal max-w-2xl">
              作为廊坊市数据要素市场化配置的关键基础设施，京畿数港-廊坊城市可信数据空间保障政贷、政医、政民跨部门、跨域数据资产安全可信流通，筑牢数字底座。
            </p>
          </div>

          {/* 右侧联系保障部 */}
          <div className="md:col-span-5 md:pl-8 space-y-3">
            <h3 className="text-[14px] leading-[22px] font-medium text-white tracking-wide mb-2">联系保障</h3>
            <ul className="space-y-2 text-[13px] text-[#8A94A6] font-normal">
              <li>服务热线：0316-XXXXXXXX</li>
              <li>政企合作：office@langfang.gov.cn</li>
              <li>技术保障：support@langfang-trusted.cn</li>
              <li>地址：河北省廊坊市广阳区广阳道</li>
            </ul>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="my-8 border-t border-white/10" />

        {/* 底部版权与条款 */}
        <div className="flex flex-col md:flex-row items-center justify-between text-[12px] text-[#8A94A6] gap-4">
          <p>© 2026 京畿数港-廊坊城市可信数据空间运营管理机构 版权所有</p>
          <div className="flex items-center gap-6 text-[#8A94A6]">
            <span className="hover:text-white transition-colors cursor-pointer">安全合规审计</span>
            <span className="hover:text-white transition-colors cursor-pointer">服务条款</span>
            <span className="hover:text-white transition-colors cursor-pointer">冀ICP备XXXXXXXX号</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

