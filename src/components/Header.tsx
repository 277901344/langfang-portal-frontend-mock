import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, LogOut, User, ArrowUpRight, Settings, Layers, ExternalLink, ShieldCheck, CheckCircle2, Share2, Sparkles, Cpu, UserCheck, Clock, XCircle, ShieldAlert, Building2, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useAccessWizard } from '../context/AccessWizardContext';
import { getSpSsoLaunchUrl } from '../lib/auth';
import { platformLinks } from '../lib/platformLinks';

export function Header() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { user, isAuthenticated, displayName, logout } = useAuth();
  const { checkAndApply } = useAccessWizard();

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '数据资源目录', path: '/gov-data' },
    { name: '重点场景', path: '/scenarios' },
    { name: '数据产品', path: '/products' },
    { name: '需求大厅', path: '/demands' },
    { name: '开放生态', path: '/ecology' },
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchKeyword.trim())}`);
    }
  };

  const handleLaunchSp = () => {
    checkAndApply({
      productId: 'connector-node-main',
      productName: '可信数据空间连接器节点',
      connectorName: '廊坊数据源节点（主节点）',
      mode: 'launch_connector',
      hasAuthMgmt: false,
    });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#DDE3EC] bg-white/95 backdrop-blur-md shadow-[0_2px_8px_rgba(31,41,55,0.04)] text-[#1F2937]">
      <div className="w-full max-w-[1560px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & 品牌 */}
        <div className="flex min-w-0 items-center gap-8 xl:gap-10">
          <Link to="/" className="flex items-center gap-3 hover:opacity-95 transition-all shrink-0">
            <div className="flex flex-col">
              <span className="text-[18px] lg:text-[20px] font-semibold tracking-tight text-[#1F2937] leading-[28px]">
                廊坊城市可信数据空间
              </span>
              <span className="text-[10px] text-[#1459EB] font-semibold tracking-wider uppercase">
                LANGFANG CITY TRUSTED DATA SPACE
              </span>
            </div>
          </Link>

          {/* 导航菜单 */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/ecology' && (location.pathname === '/eco-cooperation' || location.pathname === '/open-ecology' || location.pathname === '/eco'));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "text-[14px] leading-[22px] font-medium transition-all relative py-1.5 px-2.5 xl:px-3 rounded-[6px] shrink-0",
                    isActive 
                      ? "text-[#1459EB] font-semibold" 
                      : "text-[#5B6472] hover:text-[#1459EB] hover:bg-[#E0E8F8]/60"
                  )}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="header-active-bar"
                      className="absolute bottom-0 left-2.5 right-2.5 h-[2px] bg-[#1459EB] rounded-full"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 右侧按钮与用户信息区 */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {!isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center rounded-[6px] border border-[#1459EB] bg-white px-4 h-[36px] text-[14px] leading-[22px] font-medium text-[#1459EB] transition-all hover:bg-[#E0E8F8] cursor-pointer"
              >
                登录
              </Link>
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center rounded-[6px] bg-[#1459EB] px-4 h-[36px] text-[14px] leading-[22px] font-medium text-white transition-all hover:bg-[#0E43B5] shadow-xs cursor-pointer"
              >
                注册
              </Link>
            </div>
          ) : (
            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-[14px] leading-[22px] font-medium text-[#5B6472] hover:text-[#1459EB] transition-colors py-1.5 px-2.5 rounded-[6px] hover:bg-[#E0E8F8]/50 cursor-pointer focus:outline-none"
              >
                <div className="w-6.5 h-6.5 rounded-full bg-[#E0E8F8] border border-[#1459EB]/20 flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5 text-[#1459EB]" />
                </div>
                <span>{displayName}</span>

                <ChevronDown className={cn("w-3.5 h-3.5 text-[#8A94A6] transition-transform duration-200", isUserMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 mt-2"
                  >
                    {/* 用户信息头部 */}
                    <div className="p-4 bg-gradient-to-r from-sky-50/80 via-blue-50/40 to-slate-50 border-b border-slate-100 flex items-center justify-between gap-3.5">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs ring-2 ring-white">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{displayName}</p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">173****2231</p>
                        </div>
                      </div>

                      {/* 认证状态标牌，点击可直接跳转到身份认证页面 */}
                      {(() => {
                        const status = user?.authStatus ?? 0;
                        let label = '未认证';
                        let badgeClass = 'text-slate-600 bg-slate-100/80 border-slate-200/80 hover:bg-slate-200/80';
                        let dotClass = 'bg-slate-400';

                        if (status === 1) {
                          label = '已认证';
                          badgeClass = 'text-emerald-700 bg-emerald-50 border-emerald-200/80 hover:bg-emerald-100/80';
                          dotClass = 'bg-emerald-500';
                        } else if (status === 2) {
                          label = '认证审核中';
                          badgeClass = 'text-amber-700 bg-amber-50 border-amber-200/80 hover:bg-amber-100/80';
                          dotClass = 'bg-amber-500 animate-pulse';
                        } else if (status === 3) {
                          label = '审核未通过';
                          badgeClass = 'text-rose-700 bg-rose-50 border-rose-200/80 hover:bg-rose-100/80';
                          dotClass = 'bg-rose-500';
                        }

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              navigate('/portal-management?tab=institution');
                            }}
                            className={cn(
                              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-2xs',
                              badgeClass
                            )}
                            title="点击直接跳转到身份认证页面"
                          >
                            <span className={cn('w-2 h-2 rounded-full', dotClass)} />
                            <span>{label}</span>
                          </button>
                        );
                      })()}
                    </div>

                    {/* 菜单主要功能区 */}
                    <div className="p-1.5 space-y-0.5">
                      {/* 门户管理 */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/portal-management');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50/80 rounded-xl transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Building2 className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <span>门户管理</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      {/* 进入服务平台 */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          navigate('/service-platform');
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50/80 rounded-xl transition-all text-left cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          <span>进入服务平台</span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>

                    {/* 退出登录 */}
                    <div className="p-1.5 border-t border-slate-100/80">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50/80 rounded-xl transition-colors text-left cursor-pointer group"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 group-hover:scale-105 transition-transform" />
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
          className="lg:hidden text-slate-600 p-2 hover:bg-slate-50 rounded"
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
        <div id="portal-mobile-navigation" className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "block text-base font-medium py-1.5 px-2 rounded hover:bg-slate-50 hover:text-blue-600",
                location.pathname === link.path ? "text-blue-600 font-bold bg-blue-50/40" : "text-slate-600"
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
                  className="bg-blue-600 text-white text-sm font-semibold p-2.5 rounded-lg text-center"
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
              <div className="space-y-3">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">{displayName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      logout();
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
                  >
                    退出登录
                  </button>
                </div>

                <div className="space-y-1 px-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">后台与管理</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/portal-management');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-semibold text-blue-700 bg-blue-50/50"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      门户管理中心 (含身份认证与商务咨询)
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                  </button>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pt-2">平台快速跳转</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLaunchSp();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      可信数据空间服务平台
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.open(platformLinks.authorization, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      授权运营平台
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      window.open(platformLinks.trading, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-blue-600" />
                      数据交易平台
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLaunchSp();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-xs font-medium text-slate-700"
                  >
                    <span className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-amber-600" />
                      可信数据空间连接器
                    </span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
