import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { applyImageFallback, publicAssetUrl } from '../lib/publicAssets';

const AUTH_BACKGROUND = publicAssetUrl('auth-trusted-data-space-bg.webp');
const AUTH_BACKGROUND_FALLBACK = publicAssetUrl('assets/banner/重要场景.png');
const BRAND_LOGO = publicAssetUrl('jingji-logo.svg');

type AuthShellProps = {
  title: string;
  children: ReactNode;
};

export function AuthShell({ title, children }: AuthShellProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 selection:bg-blue-400/25">
      <img
        src={AUTH_BACKGROUND}
        alt=""
        onError={(event) => applyImageFallback(event.currentTarget, AUTH_BACKGROUND_FALLBACK)}
        className="fixed inset-0 h-full w-full object-cover object-center"
      />
      <div className="fixed inset-0 bg-slate-950/20" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.18)_48%,rgba(2,6,23,0.48)_100%)]" />

      <main className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-8 sm:py-4">
        <div className="flex w-full max-w-[460px] flex-col items-center gap-4 sm:gap-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-2xl border border-white/15 bg-slate-950/30 px-4 py-2.5 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-slate-950/45"
              aria-label="返回京畿数港首页"
            >
              <img src={BRAND_LOGO} alt="" className="h-10 w-10" />
              <div className="text-left">
                <div className="text-lg font-extrabold tracking-tight">京畿数港</div>
                <div className="text-[9px] tracking-[0.12em] text-blue-50/70">廊坊城市可信数据空间</div>
              </div>
            </Link>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 14, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="w-full rounded-[1.6rem] border border-white/70 bg-white/95 p-5 shadow-[0_28px_90px_rgba(2,6,23,0.38)] backdrop-blur-xl sm:p-6"
          >
            <h1 className="mb-5 text-center text-2xl font-extrabold tracking-tight text-slate-950">{title}</h1>

            {children}
          </motion.section>
        </div>
      </main>

      <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-950/25 px-4 py-2 text-[10px] text-white/65 backdrop-blur-md [@media(max-height:760px)]:hidden">
        © 2026 京畿数港 · 廊坊城市可信数据空间
      </div>
    </div>
  );
}
