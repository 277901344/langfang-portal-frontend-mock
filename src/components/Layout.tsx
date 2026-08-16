import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

export function Layout() {
  const location = useLocation();
  const isPortal = location.pathname.startsWith('/portal-management') || location.pathname.startsWith('/operations');

  if (isPortal) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Outlet />
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-500/30 relative">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

