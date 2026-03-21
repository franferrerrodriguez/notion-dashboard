import { useState, useMemo } from 'react';
import { useTheme } from './context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { projectService } from './services/api';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';
import { PHASE_COLORS, CHART_COLORS } from './constants/theme';
import { ROLES } from './constants/auth';
import {
  FolderRoot,
  BarChart3,
  FileText,
  PieChart,
  TrendingUp,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
  Castle,
  Target,
  Receipt,
} from 'lucide-react';

// Components
import ProgressBar from './components/ProgressBar';
import SideDrawer from './components/SideDrawer';
import DoughnutChart from './components/DoughnutChart';
import UserDropdown from './components/UserDropdown';
import ThemeToggle from './components/ThemeToggle';

const TABS = {
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
    <span className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100 opacity-50'}`}>
      {icon}
    </span>
    <span className="text-xs font-black uppercase tracking-widest">
      {label}
    </span>
    {active && (
      <span className="absolute inset-0 bg-blue-500/5 blur-xl -z-10 rounded-full animate-pulse"></span>
    )}
  </button>
);

const StatusBadge = ({ name, color, className = "" }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border inline-flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${className}`}
      style={{ 
        backgroundColor: isDark ? `${color}15` : `${color}10`, 
        color: isDark ? color : `color-mix(in srgb, ${color}, black 15%)`,
        borderColor: isDark ? `${color}30` : `${color}25` 
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
          borderColor: isDark ? `${color}30` : `${color}25`
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
  const { user } = useAuth();
  const { t } = useLanguage();
  const { clientId } = useParams();
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState(TABS.PROJECTS);

  // TanStack Query for projects - Parallel prefetching for all tabs
  const effectiveClientId = user?.role === ROLES.ADMIN && clientId ? clientId : null;

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['notion_data', effectiveClientId, TABS.PROJECTS],
    queryFn: () => projectService.getAll(effectiveClientId, TABS.PROJECTS.toLowerCase()),
    refetchInterval: 1000 * 60 * 5,
  });

  const { data: offers = [], isLoading: loadingOffers } = useQuery({
    queryKey: ['notion_data', effectiveClientId, TABS.OFFERS],
    queryFn: () => projectService.getAll(effectiveClientId, TABS.OFFERS.toLowerCase()),
    refetchInterval: 1000 * 60 * 5,
  });

  const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
    queryKey: ['notion_data', effectiveClientId, TABS.INVOICES],
    queryFn: () => projectService.getAll(effectiveClientId, TABS.INVOICES.toLowerCase()),
    refetchInterval: 1000 * 60 * 5,
  });

  const isLoading = loadingProjects || loadingOffers || loadingInvoices;

  const resolveRelationNames = (ids, type) => {
    if (!ids || ids.length === 0) return '-';
    const source = type === 'project' ? projects : offers;
    return ids.map(id => {
      const found = source.find(item => item.id === id);
      return found?.identification?.name || '...';
    }).join(', ');
  };

  const getMetaValue = (p, label) => {
    const m = p.metadata?.find(m => m.label.toLowerCase() === label.toLowerCase());
    return m?.value;
  };

  // REVERSE LOOKUP: Group invoices by their related offer ID
  const reverseInvoiceMap = useMemo(() => {
    const map = {};
    if (!invoices) return map;
    
    invoices.forEach(inv => {
      const offerProperty = inv.metadata?.find(m => 
        m.label === 'Vínculo oferta' || 
        m.label === 'Oferta vinculada' || 
        m.label === '↗ Oferta'
      );
      const offerIds = offerProperty?.value;

      if (offerIds) {
        const ids = Array.isArray(offerIds) ? offerIds : [offerIds];
        ids.forEach(id => {
          if (!map[id]) map[id] = [];
          if (inv.identification?.name) {
            map[id].push(inv.identification.name);
          }
        });
      }
    });
    return map;
  }, [invoices]);

  const resolveAllLinkedInvoices = (p) => {
    // 1. Direct relations (from Offer to Invoice)
    const directIds = getMetaValue(p, 'Facturas vinculadas') || 
                      getMetaValue(p, '↗ Facturas vinculadas') || 
                      getMetaValue(p, 'Factura vinculada');
    
    const directNames = directIds ? (Array.isArray(directIds) ? directIds : [directIds]).map(id => {
        return invoices.find(i => i.id === id)?.identification?.name;
    }).filter(Boolean) : [];

    // 2. Reverse relations (from Invoices to this Offer)
    const reverseNames = reverseInvoiceMap[p.id] || [];

    // Combine and unique
    const all = [...new Set([...directNames, ...reverseNames])];
    return all.length > 0 ? all.join(', ') : '-';
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-notion-light dark:bg-notion-dark gap-4 transition-colors">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-notion-text-secondary animate-pulse uppercase tracking-widest">
          {t('notion_query')}
        </p>
      </div>
    );

  // Select data based on active tab
  const activeData = activeTab === TABS.PROJECTS ? projects : (activeTab === TABS.OFFERS ? offers : invoices);

  // Sort alphabetically (descending) so PR26XX comes before PR25XX
  const sortedData = [...activeData].sort((a, b) => (b.identification?.name || '').localeCompare(a.identification?.name || ''));



  // Group by Phase (Projects) or Status (Offers/Invoices)
  const grouped = sortedData.reduce((acc, p) => {
    const groupKey = activeTab === TABS.PROJECTS 
      ? (p.status?.phase?.name || 'Sin Fase')
      : (p.status?.main?.name || 'Sin Estado');
    
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(p);
    return acc;
  }, {});

  // Stats for Chart - Dynamic by groupKey
  const phaseStats = Object.entries(grouped).map(([name, items]) => ({
    name,
    count: items.length,
    color: PHASE_COLORS[name] || '#64748b', 
  }));

  return (
    <div className="min-h-screen bg-notion-light dark:bg-notion-dark text-notion-text dark:text-white p-8 font-sans selection:bg-blue-500/30 transition-colors">
      <header className="max-w-full mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-700 px-6 lg:px-12">
        <div className="flex justify-between items-end mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner">
              <FolderRoot className="w-8 h-8 text-blue-500" />
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
            <ThemeToggle />
            <UserDropdown />
          </div>
        </div>

        <div className="flex items-center gap-10 mb-10 border-b border-notion-border dark:border-white/5">
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

        <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-white dark:bg-linear-to-br dark:from-[#202020] dark:to-[#1a1a1a] rounded-3xl p-10 border border-notion-border dark:border-white/5 shadow-2xl flex items-center justify-around relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150"></div>

            <div className="relative w-40 h-40">
              <DoughnutChart data={phaseStats} total={projects.length} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black tracking-tighter text-notion-text dark:text-white/90">
                  {projects.length}
                </span>
                <span className="text-[9px] text-notion-text-secondary uppercase tracking-[0.2em] font-bold flex items-center gap-1.5">
                  <FolderRoot className="w-2 h-2" />
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
      </header>

      <main className="max-w-full mx-auto space-y-20 pb-20 animate-in fade-in duration-700 delay-200 px-6 lg:px-12">
        {Object.entries(grouped).map(([phaseName, items]) => {
          const getColumns = () => {
            if (activeTab === TABS.OFFERS) {
              return [
                { key: 'code', label: t('col_code'), icon: <FileText className="w-3 h-3" />, align: 'left', width: 'w-[220px]' },
                { key: 'description', label: t('col_description'), align: 'left', width: 'w-[300px]' },
                { key: 'date', label: t('col_date'), align: 'center', width: 'w-[110px]' },
                { key: 'status', label: t('col_status'), align: 'center', width: 'w-[150px]' },
                { key: 'amount_net', label: t('col_amount_net'), align: 'right', width: 'w-[130px]' },
                { key: 'total', label: t('col_total'), align: 'right', width: 'w-[130px]' },
                { key: 'billed_amount', label: t('col_billed_amount'), align: 'right', width: 'w-[140px]' },
                { key: 'progress', label: '%', align: 'center', width: 'w-[120px]' },
                { key: 'linked_invoices', label: t('col_linked_invoices'), align: 'left', width: 'w-[250px]' },
              ];
            }
            if (activeTab === TABS.INVOICES) {
              return [
                { key: 'code', label: t('col_code'), icon: <FileText className="w-3 h-3" />, align: 'left', width: 'w-[150px]' },
                { key: 'offer_link', label: t('col_offer_link'), align: 'left', width: 'w-[180px]' },
                { key: 'project_link', label: t('col_project_link'), align: 'left', width: 'w-[250px]' },
                { key: 'date', label: t('col_date'), align: 'center', width: 'w-[120px]' },
                { key: 'total', label: t('col_amount_invoice'), align: 'right', width: 'w-[130px]' },
                { key: 'status', label: t('col_status'), align: 'center', width: 'w-[150px]' },
                { key: 'quarter', label: t('col_quarter'), align: 'center', width: 'w-[120px]' },
              ];
            }
            return [
              { key: 'project', label: t('col_project'), icon: <FileText className="w-3 h-3" />, align: 'left', width: 'min-w-[250px]' },
              { key: 'phase', label: t('col_phase'), align: 'center', width: 'w-[150px]' },
              { key: 'status', label: t('col_status'), align: 'center', width: 'w-[160px]' },
              { key: 'billing', label: t('col_billing'), align: 'center', width: 'w-[160px]' },
            ];
          };

          const columns = getColumns();

          return (
            <section key={phaseName} className="relative animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-4 mb-8">
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
                          className={`py-5 ${col.key === 'code' || col.key === 'project' ? 'px-8' : 'px-4'} ${col.width} text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                        >
                          <div className={`flex items-center gap-2 ${col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : ''}`}>
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
                              <td key={col.key} className="py-6 px-8 overflow-hidden">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-notion-border dark:border-white/5 group-hover:border-blue-500/30 transition-colors shrink-0">
                                    <FileText className="w-4 h-4 text-notion-text-secondary dark:text-white/30 group-hover:text-blue-500 transition-colors" />
                                  </div>
                                  <span className="font-bold text-sm text-notion-text dark:text-white/90 group-hover:text-blue-500 transition-colors truncate">
                                    {p.identification?.name || t('unnamed')}
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'phase') {
                            return (
                              <td key={col.key} className="py-6 px-4 text-center">
                                <StatusBadge name={p.status?.phase?.name || '-'} color={PHASE_COLORS[p.status?.phase?.name] || '#64748b'} />
                              </td>
                            );
                          }

                          if (col.key === 'status') {
                            if (activeTab === TABS.PROJECTS) {
                              return (
                                <td key={col.key} className="py-6 px-4">
                                  <ProgressBar value={p.status?.progress || 0} color="#238636" showText />
                                </td>
                              );
                            }
                            const s = p.status?.main || {};
                            return (
                              <td key={col.key} className="py-6 px-4 text-center">
                                <StatusBadge name={s.name || '-'} color={PHASE_COLORS[s.name] || '#64748b'} />
                              </td>
                            );
                          }

                          if (col.key === 'offer_link' || col.key === 'project_link') {
                            const type = col.key === 'offer_link' ? 'offer' : 'project';
                            const ids = type === 'offer' ? p.identification?.offer_relation : p.identification?.project_relation;
                            const name = resolveRelationNames(ids, type);
                            return (
                              <td key={col.key} className="py-6 px-4 truncate max-w-[220px]" title={name}>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm grayscale brightness-150">📄</span>
                                  <span className="text-sm text-notion-text dark:text-white/70 truncate uppercase tracking-tight font-medium">
                                    {name}
                                  </span>
                                </div>
                              </td>
                            );
                          }

                          if (col.key === 'billing') {
                            return (
                              <td key={col.key} className="py-6 px-4">
                                <ProgressBar value={p.financials?.billingPercentage || 0} color="#2ea043" showText />
                              </td>
                            );
                          }

                          if (col.key === 'description') {
                              return (
                                <td key={col.key} className="py-6 px-4">
                                  <span className="text-xs text-notion-text-secondary dark:text-white/50 truncate block">
                                    {metaValue('Descripción') || metaValue('Description') || '-'}
                                  </span>
                                </td>
                              );
                          }

                          if (col.key === 'date') {
                              return (
                                <td key={col.key} className="py-6 px-4 text-center">
                                  <span className="text-[10px] font-medium text-notion-text-secondary dark:text-white/40 tracking-wider">
                                    {metaValue('Fecha') || metaValue('Fecha factura') || '-'}
                                  </span>
                                </td>
                              );
                          }

                          if (col.key === 'amount_net') {
                              return (
                                <td key={col.key} className="py-6 px-4 text-right">
                                  <span className="text-xs font-bold text-notion-text dark:text-white/80">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(metaValue('Importe neto') || 0)}
                                  </span>
                                </td>
                              );
                          }

                          if (col.key === 'total') {
                              return (
                                <td key={col.key} className="py-6 px-4 text-right">
                                  <span className="text-xs font-black text-notion-text dark:text-white/95">
                                    {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.financials?.totalOffered || 0)}
                                  </span>
                                </td>
                              );
                          }

                          if (col.key === 'billed_amount') {
                            return (
                              <td key={col.key} className="py-6 px-4 text-right">
                                <span className="text-xs font-bold text-emerald-500/80">
                                  {new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(p.financials?.totalBilled || 0)}
                                </span>
                              </td>
                            );
                          }

                          if (col.key === 'progress') {
                              return (
                                <td key={col.key} className="py-6 px-4">
                                  <ProgressBar value={p.financials?.billingPercentage || 0} color="#2ea043" showText />
                                </td>
                              );
                          }

                          if (col.key === 'linked_invoices') {
                            return (
                              <td key={col.key} className="py-6 pl-12 pr-4">
                                <div className="flex flex-wrap gap-1">
                                  {resolveAllLinkedInvoices(p).split(', ').map((text, i) => (
                                    <span key={i} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 dark:text-blue-400 rounded text-[10px] font-bold border border-blue-500/20 leading-none">
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

                          return <td key={col.key} className="py-6 px-4">-</td>;
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
        <SideDrawer key={selectedProject} projectId={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
};

export default Dashboard;
