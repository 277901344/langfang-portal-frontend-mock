import React from 'react';
import { Download, Users, Database, Building2 } from 'lucide-react';
import { PageBanner } from '../components/PageBanner';
import { publicAssetUrl } from '../lib/publicAssets';

interface DocItem {
  id: string;
  title: string;
  category: string;
  roleTag: string;
  description: string;
  fileName: string;
  fileSize: string;
  updateTime: string;
  version: string;
  icon: any;
}

const DOCUMENTS: DocItem[] = [
  {
    id: 'doc-01',
    title: '数商操作手册',
    category: '操作手册',
    roleTag: '数据服务商 / 数商',
    description: '面向数据服务商，详细说明产品发布、业务协同、沙盒算法调试、授权流转及合同签约等核心操作。',
    fileName: '可信数据空间数商操作手册_202606.docx',
    fileSize: '1.36 MB',
    updateTime: '2026-06-15',
    version: 'V2.3',
    icon: Users,
  },
  {
    id: 'doc-02',
    title: '数据源方操作手册',
    category: '操作手册',
    roleTag: '数据提供方 / 政府委办局',
    description: '面向数据提供单位，说明数据接入、资源编目、字段脱敏、授权策略确认及全生命周期安全管控流程。',
    fileName: '可信数据空间数据源方操作手册_202606.docx',
    fileSize: '1.36 MB',
    updateTime: '2026-06-15',
    version: 'V2.3',
    icon: Database,
  },
  {
    id: 'doc-03',
    title: '空间运营方操作手册',
    category: '操作手册',
    roleTag: '空间运营机构 / 管理员',
    description: '面向空间运营管理方，详细阐述平台配置、运营审核、主体入驻认证、交易流转与审计监控等管理规范。',
    fileName: '可信数据空间空间运营方操作手册_202606.docx',
    fileSize: '1.36 MB',
    updateTime: '2026-06-15',
    version: 'V2.3',
    icon: Building2,
  },
];

export function DocumentCenter() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-blue-500/20 pb-20">
      {/* 全屏 Banner 背景组件 */}
      <PageBanner
        title="文档中心"
        subtitle="汇总京畿数港·廊坊城市可信数据空间各参与角色的操作手册、技术规范与接入指南，支撑数据源方、数商和空间运营方高效协作、合规开展业务。"
        variant="文档中心"
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {DOCUMENTS.map((doc) => {
            const Icon = doc.icon;
            const href = publicAssetUrl(`docs/${doc.fileName}`);

            return (
              <article
                key={doc.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-7 shadow-sm transition-all hover:border-blue-300 hover:shadow-md group"
              >
                <div>
                  {/* 头部类型与版本信息 */}
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100/80">
                      {doc.category}
                    </span>
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {doc.version} · {doc.fileSize}
                    </span>
                  </div>

                  {/* 图标与标题 */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                        {doc.title}
                      </h2>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        适用对象：{doc.roleTag}
                      </p>
                    </div>
                  </div>

                  {/* 文档简介 */}
                  <p className="text-xs text-slate-500 leading-relaxed min-h-[50px]">
                    {doc.description}
                  </p>
                </div>

                {/* 底部信息与下载按钮 */}
                <div className="pt-6 mt-6 border-t border-slate-100 space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>更新：{doc.updateTime}</span>
                    <span className="truncate max-w-[160px]" title={doc.fileName}>{doc.fileName}</span>
                  </div>
                  <a
                    href={href}
                    download={doc.fileName}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1459EB] hover:bg-[#0E43B5] text-white px-4 py-3 text-xs font-semibold transition-all shadow-xs group-hover:shadow-md cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>下载官方文档</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
