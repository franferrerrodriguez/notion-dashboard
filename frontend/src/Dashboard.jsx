import {
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarDays,
  Castle,
  ChevronRight,
  FileText,
  FolderRoot,
  Loader2,
  PieChart,
  Receipt,
  ShieldAlert,
  Target,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROLES } from './constants/auth';
import { PHASE_COLORS } from './constants/theme';
import { useLanguage } from './context/LanguageContext';
import { useTheme } from './context/ThemeContext';
import { useDashboardData } from './hooks/useDashboardData';
import { getMetaValue, resolveRelationNames } from './utils/notionHelpers';

// Components
import Calendar from './components/Calendar';
import DoughnutChart from './components/DoughnutChart';
import ProgressBar from './components/ProgressBar';
import SideDrawer from './components/SideDrawer';
import ThemeToggle from './components/ThemeToggle';
import UserDropdown from './components/UserDropdown';

const TABS = {
  CALENDAR: 'CALENDAR',
  PROJECTS: 'PROJECTS',
  OFFERS: 'OFFERS',
  INVOICES: 'INVOICES',
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 py-4 px-2 border-b-2 transition-all cursor-pointer relative ${
      active
        ? 'border-blue-500 text-blue-500'
        : 'border-transparent text-notion-text-secondary hover:text-notion-text dark:hover:text-white'
    }`}
  >
    <span
      className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100 opacity-50'}`}
    >
      {icon}
    </span>
    <span className="text-xs font-black uppercase tracking-widest">{label}</span>
  </button>
);

const StatusBadge = ({ name, color, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border inline-flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${className}`}
      style={{
        backgroundColor: isDark ? `${color}15` : `${color}10`,
        color: isDark ? color : `color-mix(in srgb, ${color}, black 15%)`,
        borderColor: isDark ? `${color}30` : `${color}25`,
      }}
    >
      {name}
    </span>
  );
};

const LegendItem = ({ color, label, count, icon, t }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-4 group cursor-default">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all border"
        style={{
          backgroundColor: isDark ? `${color}15` : `${color}10`,
          color: isDark ? color : `color-mix(in srgb, ${color}, black 15%)`,
          borderColor: isDark ? `${color}30` : `${color}25`,
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest leading-none mb-1 group-hover:text-notion-text dark:group-hover:text-white/70 transition-colors">
          {label}
        </span>
        <span className="text-xs font-bold text-notion-text-secondary/50 dark:text-white/50">
          {count} {t('total').toLowerCase()}
        </span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { t } = useLanguage();

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.CALENDAR);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loadingNotificationId, setLoadingNotificationId] = useState(null);
  const isMarkingAll = false;

  // Extract heavy data loading logic into custom hook
  const {
    effectiveClientId,
    user,
    projects,
    offers,
    invoices,
    tasks,
    clientInfo,
    unreadItems,
    unreadCount,
    loadingUnread,
    isTabLoading,
    handleMarkAllRead,
    markNotificationAsRead
  } = useDashboardData(activeTab);

  // REVERSE LOOKUP: Group invoices by their related offer ID
  const reverseInvoiceMap = useMemo(() => {
    const map = {};
    if (!invoices || !offers) return map;

    invoices.forEach((inv) => {
      // Robustly identify relations that point to an Offer by checking the ID against the offers list
      const relatedOfferIds =
        inv.metadata
          ?.filter((m) => m.type === 'relation')
          ?.flatMap((m) => (Array.isArray(m.value) ? m.value : [m.value]))
          ?.filter((id) => offers.some((o) => o.id === id)) || [];

      relatedOfferIds.forEach((id) => {
        if (!map[id]) map[id] = [];
        if (inv.identification?.name) {
          map[id].push(inv.identification.name);
        }
      });
    });
    return map;
  }, [invoices, offers]);

  const resolveAllLinkedInvoices = (p) => {
    // 1. Direct relations (from Offer/Project to Invoice)
    const directIds =
      p.metadata
        ?.filter((m) => m.type === 'relation')
        ?.flatMap((m) => (Array.isArray(m.value) ? m.value : [m.value]))
        ?.filter((id) => invoices.some((i) => i.id === id)) || [];

    const directNames = directIds
      .map((id) => {
        return invoices.find((i) => i.id === id)?.identification?.name;
      })
      .filter(Boolean);

    // 2. Reverse relations (from Invoices pointing to this Offer)
    const reverseNames = reverseInvoiceMap[p.id] || [];

    // Combine and unique
    const all = [...new Set([...directNames, ...reverseNames])];
    return all.length > 0 ? all.join(', ') : '-';
  };

  // Select data based on active tab
  const activeData =
    activeTab === TABS.PROJECTS ? projects : activeTab === TABS.OFFERS ? offers : invoices;

  // Sort alphabetically (descending)
  const sortedData = useMemo(() => {
    return [...activeData].sort((a, b) =>
      (b.identification?.name || '').localeCompare(a.identification?.name || '')
    );
  }, [activeData]);

  // Group by Phase (Projects) or Status (Offers/Invoices)
  const grouped = useMemo(() => {
    return sortedData.reduce((acc, p) => {
      const groupKey =
        activeTab === TABS.PROJECTS
          ? p.status?.phase?.name || 'Sin Fase'
          : p.status?.main?.name || 'Sin Estado';

      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(p);
      return acc;
    }, {});
  }, [sortedData, activeTab]);

  // Stats for Chart - Dynamic by groupKey
  const phaseStats = useMemo(() => {
    return Object.entries(grouped).map(([name, items]) => ({
      name,
      count: items.length,
      color: PHASE_COLORS[name] || '#64748b',
    }));
  }, [grouped]);

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-notion-text-secondary animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/10 rounded-full animate-ping"></div>
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin relative z-10"></div>
      </div>
      <p className="text-[10px] font-black text-notion-text-secondary dark:text-gray-400 uppercase tracking-[0.3em] animate-pulse">
        {t('notion_query')}
      </p>
    </div>
  );

        const displayLogo = clientInfo?.logo_url || user?.logo_url;

  return (
    <div className="min-h-screen bg-notion-light dark:bg-notion-dark text-notion-text dark:text-white p-8 font-sans selection:bg-blue-500/30 transition-colors">
      <header className="max-w-full mx-auto mb-8 animate-in fade-in slide-in-from-top-4 duration-700 px-6 lg:px-12">
        <div className="flex justify-between items-end mb-6">
          <div className="flex items-center gap-6">
            <div className={`rounded-2xl border shadow-inner flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-105 ${displayLogo ? 'w-24 h-24 p-2 bg-white dark:bg-white/5 border-notion-border dark:border-white/10' : 'w-14 h-14 p-3 bg-blue-500/10 border-blue-500/20'}`}>
              {displayLogo ? (
                <img src={displayLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
              ) : (
                <FolderRoot className="w-8 h-8 text-blue-500" />
              )}
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-1 uppercase flex items-center gap-3">
                {effectiveClientId || user?.external_client_id || t('control_panel')}
                {effectiveClientId && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] rounded-lg tracking-widest font-black uppercase slide-in-from-left-2 animate-in duration-500">
                    <ShieldAlert className="w-3 h-3" />
                    Vista Administrador
                  </span>
                )}
              </h1>
              <p className="text-notion-text-secondary font-medium uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                {user?.role === ROLES.ADMIN ? (
                  effectiveClientId ? (
                    <Link
                      to="/admin"
                      className="hover:text-amber-500 transition-colors flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3 h-3" /> Volver a Admin
                    </Link>
                  ) : (
                    t('admin_general')
                  )
                ) : (
                  `${t('mgmt_projects')} • ${user?.external_client_id}`
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications Button */}
            <div className="relative group">
              <button
                className="p-2.5 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-notion-border dark:border-white/10 hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:bg-white dark:hover:bg-white/10 transition-all text-notion-text-secondary dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 relative group"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                disabled={loadingUnread || isMarkingAll}
              >
                {loadingUnread || isMarkingAll ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                ) : (
                  <Bell className="w-5 h-5 transition-transform group-active:scale-95" />
                )}
                {!(loadingUnread || isMarkingAll) && unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-notion-bg-default dark:border-notion-bg-dark shadow-sm">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Minimalist Dropdown */}
              {isNotificationOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsNotificationOpen(false)}
                  ></div>
                  <div className="absolute top-full mt-3 right-0 w-[500px] bg-white dark:bg-[#1e1e1e] border border-notion-border dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-notion-border dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/2">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-notion-text-secondary dark:text-gray-400">
                        {t('notifications')}
                      </h3>
                      <div className="flex items-center gap-3">
                        {unreadCount > 0 && (
                          <button
                            disabled={isMarkingAll}
                            onClick={() => {
                              handleMarkAllRead();
                              setIsNotificationOpen(false);
                            }}
                            className="text-[9px] font-black text-blue-500 hover:text-blue-600 uppercase tracking-tight transition-colors flex items-center gap-1.5"
                          >
                            {t('mark_all_read_btn')}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                      {unreadCount === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-12 h-12 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-5 h-5 text-gray-400" />
                          </div>
                          <p className="text-xs text-notion-text-secondary dark:text-gray-500 font-medium italic">
                            No hay notificaciones pendientes
                          </p>
                        </div>
                      ) : (
                        <div className="divide-y divide-notion-border dark:divide-white/5">
                          {unreadItems
                            .sort(
                              (a, b) =>
                                new Date(b.last_edited_time).getTime() -
                                new Date(a.last_edited_time).getTime()
                            )
                            .slice(0, 15)
                            .map((item) => (
                              <div
                                key={item.id}
                                className="w-full p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between gap-3 text-left group border-b border-notion-border dark:border-white/5 last:border-0"
                                title={item.text || item.identification?.name}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-blue-500/10 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0 mt-0.5">
                                    <FileText className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="text-left overflow-hidden grow">
                                    {item.project_name && (
                                      <button 
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          
                                          try {
                                            await markNotificationAsRead(item);
                                          } catch (err) {
                                            console.error('Failed to mark as read on navigation:', err);
                                          }
                                          setSelectedProject(item.parent_id);
                                          setIsNotificationOpen(false);
                                        }}
                                        className="text-[9px] font-bold text-blue-500 dark:text-blue-400 hover:underline mb-0.5 block truncate uppercase tracking-wider text-left cursor-pointer"
                                      >
                                        {item.project_name}
                                      </button>
                                    )}
                                    <p className="text-xs font-bold text-notion-text dark:text-gray-200 mb-1 leading-relaxed">
                                      {item.text || item.identification?.name || 'Item sin nombre'}
                                    </p>
                                    <p className="text-[10px] text-notion-text-secondary dark:text-gray-500 flex items-center gap-1.5 uppercase font-black">
                                      {item.last_edited_time}
                                    </p>
                                  </div>
                                </div>
                                
                                <button
                                  disabled={loadingNotificationId === item.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    
                                    setLoadingNotificationId(item.id);
                                    try {
                                      await markNotificationAsRead(item);
                                    } finally {
                                      setLoadingNotificationId(null);
                                    }
                                  }}
                                  className="shrink-0 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-tight transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 disabled:opacity-50"
                                >
                                  {t('mark_read_btn')}
                                </button>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <ThemeToggle />
            <UserDropdown />
          </div>
        </div>

        <div className="flex items-center gap-8 mb-4 border-b border-notion-border dark:border-white/5">
          <TabButton
            active={activeTab === TABS.CALENDAR}
            onClick={() => setActiveTab(TABS.CALENDAR)}
            icon={<CalendarDays className="w-4 h-4" />}
            label={t('tab_calendar') || 'Calendario'}
          />
          <TabButton
            active={activeTab === TABS.PROJECTS}
            onClick={() => setActiveTab(TABS.PROJECTS)}
            icon={<Castle className="w-4 h-4" />}
            label={t('tab_projects')}
          />
          <TabButton
            active={activeTab === TABS.OFFERS}
            onClick={() => setActiveTab(TABS.OFFERS)}
            icon={<Target className="w-4 h-4" />}
            label={t('tab_offers')}
          />
          <TabButton
            active={activeTab === TABS.INVOICES}
            onClick={() => setActiveTab(TABS.INVOICES)}
            icon={<Receipt className="w-4 h-4" />}
            label={t('tab_invoices')}
          />
        </div>

        {isTabLoading ? (
          renderLoadingState()
        ) : activeTab === TABS.CALENDAR ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Calendar tasks={tasks} projects={projects} onSelectTask={setSelectedTask} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white dark:bg-linear-to-br dark:from-[#202020] dark:to-[#1a1a1a] rounded-3xl p-6 border border-notion-border dark:border-white/10 shadow-2xl flex items-center justify-around relative overflow-hidden group transition-colors">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150"></div>

              <div className="relative w-40 h-40">
                <DoughnutChart data={phaseStats} total={activeData.length} />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-4xl font-black tracking-tighter text-notion-text dark:text-white/90">
                    {activeData.length}
                  </span>
                  <span className="text-[9px] text-notion-text-secondary uppercase tracking-[0.2em] font-bold flex items-center gap-1.5">
                    <BarChart3 className="w-2 h-2" />
                    {t('total')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-5">
                {phaseStats.map((stat) => (
                  <LegendItem
                    key={stat.name}
                    icon={<PieChart className="w-3 h-3" />}
                    color={stat.color}
                    label={stat.name}
                    count={stat.count}
                    t={t}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-full mx-auto space-y-10 pb-10 animate-in fade-in duration-700 delay-200 px-6 lg:px-12">
        {activeTab !== TABS.CALENDAR &&
          Object.entries(grouped).map(([phaseName, items]) => {
            const getColumns = () => {
              if (activeTab === TABS.OFFERS) {
                return [
                  {
                    key: 'code',
                    label: t('col_code'),
                    align: 'left',
                    width: 'w-[220px]',
                  },
                  {
                    key: 'description',
                    label: t('col_description'),
                    align: 'left',
                    width: 'w-[300px]',
                  },
                  { key: 'date', label: t('col_date'), align: 'center', width: 'w-[110px]' },
                  { key: 'status', label: t('col_status'), align: 'center', width: 'w-[150px]' },
                  {
                    key: 'amount_net',
                    label: t('col_amount_net'),
                    align: 'right',
                    width: 'w-[130px]',
                  },
                  { key: 'total', label: t('col_total'), align: 'right', width: 'w-[130px]' },
                  {
                    key: 'billed_amount',
                    label: t('col_billed_amount'),
                    align: 'right',
                    width: 'w-[140px]',
                  },
                  { key: 'progress', label: '%', align: 'center', width: 'w-[120px]' },
                  {
                    key: 'linked_invoices',
                    label: t('col_linked_invoices'),
                    align: 'left',
                    width: 'w-[250px]',
                  },
                ];
              }
              if (activeTab === TABS.INVOICES) {
                return [
                  {
                    key: 'code',
                    label: t('col_code'),
                    align: 'left',
                    width: 'w-[150px]',
                  },
                  {
                    key: 'offer_link',
                    label: t('col_offer_link'),
                    align: 'left',
                    width: 'w-[180px]',
                  },
                  {
                    key: 'project_link',
                    label: t('col_project_link'),
                    align: 'left',
                    width: 'w-[250px]',
                  },
                  { key: 'date', label: t('col_date'), align: 'center', width: 'w-[120px]' },
                  {
                    key: 'total',
                    label: t('col_amount_invoice'),
                    align: 'right',
                    width: 'w-[130px]',
                  },
                  { key: 'status', label: t('col_status'), align: 'center', width: 'w-[150px]' },
                  { key: 'quarter', label: t('col_quarter'), align: 'center', width: 'w-[120px]' },
                ];
              }
              return [
                {
                  key: 'project',
                  label: t('col_project'),
                  align: 'left',
                  width: 'w-[40%]',
                },
                { key: 'phase', label: t('col_phase'), align: 'center', width: 'w-[20%]' },
                { key: 'status', label: t('col_status'), align: 'center', width: 'w-[20%]' },
                { key: 'billing', label: t('col_billing'), align: 'center', width: 'w-[20%]' },
              ];
            };

            const columns = getColumns();

            return (
              <section
                key={phaseName}
                className="relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge name={phaseName} color={PHASE_COLORS[phaseName] || '#64748b'} />
                    <span className="text-[10px] font-bold text-notion-text-secondary dark:text-white/20 bg-black/5 dark:bg-white/5 px-2 py-1 rounded border border-notion-border dark:border-white/5">
                      {items.length}
                    </span>
                  </div>
                  <div className="h-px bg-notion-border dark:bg-white/5 grow"></div>
                  <ChevronRight className="w-4 h-4 text-notion-text-secondary/30 dark:text-white/10" />
                </div>

                <div className="overflow-x-auto rounded-2xl bg-white dark:bg-white/2 border border-notion-border dark:border-white/5 backdrop-blur-md shadow-sm scrollbar-thin scrollbar-thumb-notion-border/50">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="border-b border-notion-border dark:border-white/5 bg-notion-bg-light dark:bg-white/3">
                        {columns.map((col) => (
                          <th
                            key={col.key}
                            className={`py-3 ${col.key === 'code' || col.key === 'project' ? 'px-6' : 'px-4'} ${col.width} text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                          >
                            <div
                              className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}
                            >
                              {col.icon}
                              {col.label}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-notion-border dark:divide-white/5">
                      {items.map((p) => (
                        <tr
                          key={p.id}
                          className="hover:bg-black/2 dark:hover:bg-white/5 cursor-pointer transition-all group"
                          onClick={() => setSelectedProject(p.id)}
                        >
                          {columns.map((col) => {
                            const metaValue = (label) => {
                              const val = getMetaValue(p, label);
                              if (!val) return null;
                              return Array.isArray(val) ? val.join(', ') : val;
                            };

                            if (col.key === 'project' || col.key === 'code') {
                              return (
                                <td key={col.key} className="py-3.5 px-6 overflow-hidden">
                                  <div className="flex items-center gap-2 overflow-hidden grow">
                                    <span className="font-bold text-sm text-notion-text dark:text-white/90 group-hover:text-blue-500 transition-colors truncate">
                                      {p.identification?.name || t('unnamed')}
                                    </span>
                                  </div>
                                </td>
                              );
                            }

                            if (col.key === 'phase') {
                              return (
                                <td key={col.key} className="py-3 px-4 text-center">
                                  <StatusBadge
                                    name={p.status?.phase?.name || '-'}
                                    color={PHASE_COLORS[p.status?.phase?.name] || '#64748b'}
                                  />
                                </td>
                              );
                            }

                            if (col.key === 'status') {
                              if (activeTab === TABS.PROJECTS) {
                                return (
                                  <td key={col.key} className="py-3 px-4">
                                    <ProgressBar
                                      value={p.status?.progress || 0}
                                      color="#238636"
                                      showText
                                    />
                                  </td>
                                );
                              }
                              const s = p.status?.main || {};
                              return (
                                <td key={col.key} className="py-3 px-4 text-center">
                                  <StatusBadge
                                    name={s.name || '-'}
                                    color={PHASE_COLORS[s.name] || '#64748b'}
                                  />
                                </td>
                              );
                            }

                            if (col.key === 'offer_link' || col.key === 'project_link') {
                              const type = col.key === 'offer_link' ? 'offer' : 'project';
                              const ids =
                                type === 'offer'
                                  ? p.identification?.offer_relation
                                  : p.identification?.project_relation;
                              const name = resolveRelationNames(ids, type, projects, offers);
                              return (
                                <td
                                  key={col.key}
                                  className="py-3 px-4 truncate max-w-[220px]"
                                  title={name}
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-notion-text dark:text-white/70 truncate uppercase tracking-tight font-medium">
                                      {name}
                                    </span>
                                  </div>
                                </td>
                              );
                            }

                            if (col.key === 'billing') {
                              return (
                                <td key={col.key} className="py-3 px-4">
                                  <ProgressBar
                                    value={p.financials?.billingPercentage || 0}
                                    color="#2ea043"
                                    showText
                                  />
                                </td>
                              );
                            }

                            if (col.key === 'description') {
                              return (
                                <td key={col.key} className="py-3 px-4">
                                  <span className="text-xs text-notion-text-secondary dark:text-white/50 truncate block">
                                    {metaValue('Descripción') || metaValue('Description') || '-'}
                                  </span>
                                </td>
                              );
                            }

                            if (col.key === 'date') {
                              return (
                                <td key={col.key} className="py-3 px-4 text-center">
                                  <span className="text-[10px] font-medium text-notion-text-secondary dark:text-white/40 tracking-wider">
                                    {metaValue('Fecha') || metaValue('Fecha factura') || '-'}
                                  </span>
                                </td>
                              );
                            }

                            if (col.key === 'amount_net') {
                              return (
                                <td key={col.key} className="py-3 px-4 text-right">
                                  <span className="text-xs font-bold text-notion-text dark:text-white/80">
                                    {new Intl.NumberFormat('de-DE', {
                                      style: 'currency',
                                      currency: 'EUR',
                                    }).format(metaValue('Importe neto') || 0)}
                                  </span>
                                </td>
                              );
                            }

                            if (col.key === 'total') {
                              return (
                                <td key={col.key} className="py-3 px-4 text-right">
                                  <span className="text-xs font-black text-notion-text dark:text-white/95">
                                    {new Intl.NumberFormat('de-DE', {
                                      style: 'currency',
                                      currency: 'EUR',
                                    }).format(p.financials?.totalOffered || 0)}
                                  </span>
                                </td>
                              );
                            }

                            if (col.key === 'billed_amount') {
                              return (
                                <td key={col.key} className="py-3 px-4 text-right">
                                  <span className="text-xs font-bold text-emerald-500/80">
                                    {new Intl.NumberFormat('de-DE', {
                                      style: 'currency',
                                      currency: 'EUR',
                                    }).format(p.financials?.totalBilled || 0)}
                                  </span>
                                </td>
                              );
                            }

                            if (col.key === 'progress') {
                              return (
                                <td key={col.key} className="py-3 px-4">
                                  <ProgressBar
                                    value={p.financials?.billingPercentage || 0}
                                    color="#2ea043"
                                    showText
                                  />
                                </td>
                              );
                            }

                            if (col.key === 'linked_invoices') {
                              return (
                                <td key={col.key} className="py-3 pl-12 pr-4">
                                  <div className="flex flex-wrap gap-1">
                                    {resolveAllLinkedInvoices(p)
                                      .split(', ')
                                      .map((text, i) => (
                                        <span
                                          key={i}
                                          className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-500/20 leading-none"
                                        >
                                          {text}
                                        </span>
                                      ))}
                                  </div>
                                </td>
                              );
                            }

                            if (col.key === 'quarter') {
                              const q = metaValue('Trimestre');
                              return (
                                <td key={col.key} className="py-6 px-4 text-center">
                                  <span className="text-[10px] font-bold bg-blue-500/5 text-blue-500 px-2 py-1 rounded border border-blue-500/10">
                                    {q || '-'}
                                  </span>
                                </td>
                              );
                            }

                            return (
                              <td key={col.key} className="py-6 px-4">
                                -
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
      </main>

      {selectedProject && (
        <SideDrawer
          key={`project-${selectedProject}`}
          itemId={selectedProject}
          type={
            activeTab === TABS.PROJECTS
              ? 'project'
              : activeTab === TABS.OFFERS
                ? 'offer'
                : 'invoice'
          }
          onClose={() => setSelectedProject(null)}
          projects={projects}
        />
      )}

      {selectedTask && (
        <SideDrawer
          key={`task-${selectedTask}`}
          itemId={selectedTask}
          type="task"
          onClose={() => setSelectedTask(null)}
          projects={projects}
          onProjectClick={(projectId) => {
            setSelectedTask(null);
            setTimeout(() => {
              setSelectedProject(projectId);
            }, 100);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
