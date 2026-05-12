import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  AppWindow, 
  FolderOpen, 
  ChevronLeft, 
  ChevronRight, 
  Shield, 
  LogOut,
  LayoutDashboard,
  FolderRoot,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { appService, userService } from './services/api';
import { ROLES } from './constants/auth';
import { useQuery } from '@tanstack/react-query';

// Views
import NotionDashboard from './NotionDashboard';
import FileDashboardView from './components/FileDashboardView';
import UserDropdown from './components/UserDropdown';
import ThemeToggle from './components/ThemeToggle';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { viewUserId } = useParams();
  const { t } = useLanguage();
  const [activeApp, setActiveApp] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // React Query for Target User (In View As mode)
  const { data: targetUser } = useQuery({
    queryKey: ['target-user', viewUserId],
    queryFn: () => userService.getById(viewUserId),
    enabled: !!viewUserId && user?.role === ROLES.ADMIN,
  });

  // Effective user for display (name and logo)
  const displayUser = viewUserId ? targetUser : user;

  // React Query for User Apps
  const { data: userApps = [], isLoading: loadingApps } = useQuery({
    queryKey: ['user-apps', viewUserId || user?.id],
    queryFn: () => appService.getForUser(viewUserId || user.id, null, viewUserId),
    enabled: !!(user?.id || viewUserId),
  });

  useEffect(() => {
    if (userApps.length > 0) {
      if (!activeApp || !userApps.find(a => a.id === activeApp)) {
        const notionApp = userApps.find(a => a.slug === 'notion-dashboard');
        if (notionApp) {
          setActiveApp(notionApp.id);
        } else {
          setActiveApp(userApps[0].id);
        }
      }
    } else {
      setActiveApp(null);
    }
  }, [userApps, viewUserId]);

  const currentApp = userApps.find(a => a.id === activeApp);

  if (loadingApps) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-notion-light dark:bg-notion-dark gap-4">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs font-black text-notion-text-secondary uppercase tracking-[0.2em] animate-pulse">Iniciando Ecosistema...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-notion-light dark:bg-notion-dark text-notion-text dark:text-white overflow-hidden transition-colors">
      {/* Sidebar - Only shown if there are multiple apps */}
      {userApps.length > 1 && (
        <aside 
          className={`${isSidebarOpen ? 'w-80' : 'w-24'} bg-white dark:bg-[#1a1a1a] border-r border-notion-border dark:border-white/5 transition-all duration-500 ease-in-out flex flex-col relative z-20`}
        >
          {/* Toggle Button */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute -right-3 top-12 bg-white dark:bg-[#1a1a1a] border border-notion-border dark:border-white/10 rounded-full p-1 text-notion-text-secondary hover:text-blue-500 shadow-xl z-50 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Logo Section */}
          <div className={`p-8 border-b border-notion-border dark:border-white/5 flex items-center gap-4 ${!isSidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
               <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden whitespace-nowrap">
                 <h2 className="text-lg font-black tracking-tight uppercase">Portal</h2>
                 <p className="text-[9px] font-black text-notion-text-secondary dark:text-white/20 uppercase tracking-[0.2em]">Servicios Digitales</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
            {isSidebarOpen && (
              <p className="text-[9px] font-black text-notion-text-secondary dark:text-white/20 uppercase tracking-[0.2em] px-4 mb-4">
                Tus Servicios
              </p>
            )}
            
            {userApps.map(app => (
              <button
                key={app.id}
                onClick={() => setActiveApp(app.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${activeApp === app.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'hover:bg-black/5 dark:hover:bg-white/5 text-notion-text-secondary dark:text-white/40'}`}
                title={app.name}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${activeApp === app.id ? 'bg-white/20' : 'bg-notion-bg-light dark:bg-white/5 group-hover:bg-blue-600/10'}`}>
                  {app.slug === 'notion-dashboard' ? <AppWindow className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
                </div>
                {isSidebarOpen && (
                  <div className="text-left overflow-hidden">
                     <p className="text-xs font-black uppercase tracking-tight truncate">
                       {app.name}
                     </p>
                     <p className={`text-[9px] font-bold uppercase tracking-widest truncate ${activeApp === app.id ? 'text-white/60' : 'text-notion-text-secondary dark:text-white/20'}`}>
                       {app.description}
                     </p>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-notion-border dark:border-white/5 space-y-2">
             {user?.role === ROLES.ADMIN && (
                <Link
                  to="/admin"
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-amber-500/10 text-amber-500 group ${!isSidebarOpen ? 'justify-center' : ''}`}
                  title="Administración"
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Administración</span>}
                </Link>
             )}
             <button
                onClick={logout}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-red-500/10 text-red-500 group ${!isSidebarOpen ? 'justify-center' : ''}`}
                title="Cerrar Sesión"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {isSidebarOpen && <span className="text-[10px] font-black uppercase tracking-widest">Cerrar Sesión</span>}
              </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar relative">
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-notion-light/80 dark:bg-notion-dark/80 backdrop-blur-xl px-12 py-6 border-b border-notion-border dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {displayUser?.logo_url && (
              <div className={`rounded-2xl border shadow-inner flex items-center justify-center overflow-hidden transition-all duration-500 bg-white dark:bg-white/5 border-notion-border dark:border-white/10 w-14 h-14 p-2`}>
                <img src={displayUser.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
            <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight uppercase text-notion-text dark:text-white leading-tight">
                  Libro de Mantenimiento Digital
                </h1>
                <p className="text-[10px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-[0.2em] mt-1">
                  {displayUser?.name || displayUser?.email?.split('@')[0]}
                </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <ThemeToggle />
             <UserDropdown />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-12 max-w-full mx-auto">
          {currentApp?.slug === 'notion-dashboard' && (
            <NotionDashboard />
          )}
          {currentApp?.slug === 'file-dashboard' && (
            <FileDashboardView userId={viewUserId || user.id} viewUserId={viewUserId} />
          )}
          {userApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32">
               <Shield className="w-16 h-16 text-notion-text-secondary/10 mb-6" />
               <p className="text-sm font-black text-notion-text dark:text-white uppercase tracking-widest">No tienes aplicaciones habilitadas</p>
               <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-[0.2em]">Contacta con un administrador</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
