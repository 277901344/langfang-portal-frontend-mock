import { Download, FileText, ShieldCheck, Users, Database, Building2 } from 'lucide-react';

const documents = [
  {
    title: '一级数商操作手册',
    description: '面向一级数据服务商，说明平台入驻、资源管理、服务运营与协同流程。',
    fileName: '可信数据空间一级数商操作手册_202606.docx',
    icon: ShieldCheck,
  },
  {
    title: '二级数商操作手册',
    description: '面向二级数据服务商，说明业务协同、产品服务、授权流转与日常操作。',
    fileName: '可信数据空间二级数商操作手册_202606.docx',
    icon: Users,
  },
  {
    title: '数据源方操作手册',
    description: '面向数据提供单位，说明数据接入、资源维护、授权确认与安全管控流程。',
    fileName: '可信数据空间数据源方操作手册_202606.docx',
    icon: Database,
  },
  {
    title: '空间运营方操作手册',
    description: '面向空间运营管理方，说明平台配置、运营审核、角色管理与审计管理。',
    fileName: '可信数据空间空间运营方操作手册_202606.docx',
    icon: Building2,
  },
];

export function DocumentCenter() {
  return (
    <div className="min-h-screen bg-slate-50 selection:bg-cyan-500/20">
      <section className="relative bg-gradient-to-r from-cyan-900 via-slate-800 to-cyan-950 py-16 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-96 h-96 bg-cyan-400 rounded-full blur-3xl -top-20 -left-20"></div>
          <div className="absolute w-96 h-96 bg-teal-400 rounded-full blur-3xl -bottom-20 -right-20"></div>
        </div>
        <div className="container relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold text-cyan-300">
              <FileText className="h-3.5 w-3.5" />
              操作手册下载
            </div>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tighter text-white">文档中心</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-[15px]">
              汇总可信数据空间各参与角色的操作手册，支撑数据源方、数商和空间运营方按角色快速查阅并开展业务操作。
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto grid max-w-6xl grid-cols-1 gap-5 px-4 md:grid-cols-2">
          {documents.map((doc) => {
            const Icon = doc.icon;
            const href = `/docs/${doc.fileName}`;

            return (
              <article
                key={doc.fileName}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-cyan-200 hover:shadow-md"
              >
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold tracking-tight text-slate-900">{doc.title}</h2>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">{doc.description}</p>
                    <p className="mt-3 truncate text-[11px] font-medium text-slate-400">{doc.fileName}</p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-4">
                  <a
                    href={href}
                    download
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-cyan-500"
                  >
                    <Download className="h-4 w-4" />
                    下载手册
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
