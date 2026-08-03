import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, ArrowUpRight, Settings } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { getSpSsoLaunchUrl } from '../lib/auth';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { user, isAuthenticated, displayName, logout } = useAuth();

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '场景方案', path: '/scenarios' },
    { name: '数据产品', path: '/products' },
    { name: '授权运营', path: '/platform/authorization' },
    { name: '数据交易', path: '/platform/trading' },
    { name: '生态合作', path: '/ecology' },
    { name: '文档中心', path: '/docs' },
  ];

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-100 bg-white/95 backdrop-blur-md shadow-[0_1px_5px_0_rgba(13,148,136,0.05)]">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-6 2xl:gap-10">
          <Link to="/" className="flex items-center gap-2.5 text-cyan-700 hover:opacity-95 transition-all">
            <img src="./jingji-logo.svg" alt="" className="h-10 w-10 shrink-0" />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-slate-900 leading-tight">京畿数港</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">廊坊城市可信数据空间</span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-4 2xl:gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
                || (link.path !== '/' && location.pathname.startsWith(`${link.path}/`));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-[15px] font-medium transition-colors hover:text-cyan-600 relative py-5.5 px-1",
                    isActive ? "text-cyan-600 font-bold" : "text-slate-600"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="header-active-bar"
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-t-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden xl:flex items-center gap-3 2xl:gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                注册
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-sm font-semibold text-cyan-700 shadow-sm transition-colors hover:bg-cyan-100 hover:border-cyan-300"
              >
                登录
              </Link>
            </>
          ) : (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 transition-colors py-2 cursor-pointer focus:outline-none"
              >
                <div className="w-6 h-6 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-cyan-600" />
                </div>
                <span>{displayName}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 w-60 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 mt-2"
                  >
                    {/* 用户信息头部 */}
                    <div className="px-4 py-3 bg-gradient-to-r from-cyan-50 to-teal-50/50 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-sm">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">{displayName}</p>
                          <p className="text-[11px] text-slate-500">已登录</p>
                        </div>
                      </div>
                    </div>

                    {/* 菜单项 */}
                    <div className="py-2">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const result = await getSpSsoLaunchUrl('/');
                            if (result?.launchUrl) {
                              window.open(result.launchUrl, '_blank', 'noopener,noreferrer');
                              return;
                            }
                            window.alert('服务平台跳转地址获取失败');
                          } catch (error) {
                            console.error('Failed to launch SP SSO', error);
                            window.alert('服务平台免密跳转失败');
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:text-cyan-600 hover:bg-cyan-50/50 transition-colors text-left"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        <span>进入服务平台</span>
                      </button>

                      {user?.roleLevel === 100 && (
                        <div
                          className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                          title="管理后台正在建设中"
                        >
                          <div className="flex items-center gap-3">
                            <Settings className="w-4 h-4" />
                            <span>管理后台</span>
                          </div>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded">待建设</span>
                        </div>
                      )}
                    </div>

                    {/* 分隔线和退出 */}
                    <div className="border-t border-slate-100 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50/50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>退出登录</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          type="button"
          className="xl:hidden text-slate-600 p-2 hover:bg-slate-50 rounded"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={isMenuOpen}
          aria-controls="portal-mobile-navigation"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div id="portal-mobile-navigation" className="xl:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "block text-base font-medium py-1.5 px-2 rounded hover:bg-slate-50 hover:text-cyan-600",
                location.pathname === link.path ? "text-cyan-600 font-bold bg-cyan-50/40" : "text-slate-600"
              )}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5 px-2">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/auth/login"
                  className="bg-cyan-600 text-white text-sm font-semibold p-2.5 rounded-lg text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </Link>
                <Link
                  to="/auth/register"
                  className="border border-slate-200 text-slate-700 text-sm font-semibold p-2.5 rounded-lg text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  注册
                </Link>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 px-2">
                  <User className="w-4 h-4 text-cyan-600" />
                  <span className="text-xs font-semibold text-slate-700">{displayName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-rose-500 font-medium px-2 text-left"
                >
                  退出登录
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
