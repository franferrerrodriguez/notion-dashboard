import { useState } from 'react';
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
} from 'lucide-react';

// Components
import ProgressBar from './components/ProgressBar';
import SideDrawer from './components/SideDrawer';
import DoughnutChart from './components/DoughnutChart';
import UserDropdown from './components/UserDropdown';
import ThemeToggle from './components/ThemeToggle';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { clientId } = useParams();
  const [selectedProject, setSelectedProject] = useState(null);

  // TanStack Query for projects - If clientId from URL exists, use it (only for Admins)
  const effectiveClientId = user?.role === ROLES.ADMIN && clientId ? clientId : null;

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', effectiveClientId],
    queryFn: () => projectService.getAll(effectiveClientId),
    refetchInterval: 1000 * 60 * 5,
  });

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-notion-light dark:bg-notion-dark gap-4 transition-colors">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-notion-text-secondary animate-pulse uppercase tracking-widest">
          {t('notion_query')}
        </p>
      </div>
    );

  // Stats for Chart
  const stats = {
    notStarted: projects.filter((p) => p.phase !== 'Obra' && p.phase !== 'Proyecto').length,
    inProgress: projects.filter((p) => p.phase === 'Proyecto').length,
    completed: projects.filter((p) => p.phase === 'Obra').length,
  };

  // Sort projects alphabetically (descending) so PR26XX comes before PR25XX
  const sortedProjects = [...projects].sort((a, b) => b.name.localeCompare(a.name));

  // Group by Phase
  const grouped = sortedProjects.reduce((acc, p) => {
    const phaseName = p.phase || 'Sin Fase';
    if (!acc[phaseName]) acc[phaseName] = [];
    acc[phaseName].push(p);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-notion-light dark:bg-notion-dark text-notion-text dark:text-white p-8 font-sans selection:bg-blue-500/30 transition-colors">
      <header className="max-w-6xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
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

        {/* Analytics Section */}
        <div className="grid grid-cols-1 gap-8">
          <div className="bg-white dark:bg-linear-to-br dark:from-[#202020] dark:to-[#1a1a1a] rounded-3xl p-10 border border-notion-border dark:border-white/5 shadow-2xl flex items-center justify-around relative overflow-hidden group transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-150"></div>

            <div className="relative w-40 h-40">
              <DoughnutChart stats={stats} total={projects.length} />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-black tracking-tighter text-notion-text dark:text-white/90">
                  {projects.length}
                </span>
                <span className="text-[9px] text-notion-text-secondary uppercase tracking-[0.2em] font-bold flex items-center gap-1.5">
                  <FolderRoot className="w-2 h-2" />
                  {t('projects')}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <LegendItem
                icon={<PieChart className="w-3 h-3" />}
                color={CHART_COLORS.NOT_STARTED}
                label={t('not_started')}
                count={stats.notStarted}
                t={t}
              />
              <LegendItem
                icon={<TrendingUp className="w-3 h-3" />}
                color={CHART_COLORS.IN_PROGRESS}
                label={t('in_progress')}
                count={stats.inProgress}
                t={t}
              />
              <LegendItem
                icon={<BarChart3 className="w-3 h-3" />}
                color={CHART_COLORS.COMPLETED}
                label={t('completed')}
                count={stats.completed}
                t={t}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-20 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        {Object.entries(grouped).map(([phaseName, items]) => (
          <section key={phaseName} className="relative">
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span
                  className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg border border-white/10"
                  style={{ background: PHASE_COLORS[phaseName] || '#333' }}
                >
                  {phaseName}
                </span>
                <span className="text-[10px] font-bold text-notion-text-secondary dark:text-white/20 bg-black/5 dark:bg-white/5 px-2 py-1 rounded border border-notion-border dark:border-white/5">
                  {items.length}
                </span>
              </div>
              <div className="h-px bg-notion-border dark:bg-white/5 grow"></div>
              <ChevronRight className="w-4 h-4 text-notion-text-secondary/30 dark:text-white/10" />
            </div>

            <div className="overflow-hidden rounded-2xl bg-white dark:bg-white/[0.02] border border-notion-border dark:border-white/5 backdrop-blur-md shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-notion-border dark:border-white/5 bg-notion-bg-light dark:bg-white/[0.03]">
                    <th className="py-5 px-8 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3 h-3" />
                      {t('col_project')}
                    </th>
                    <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                      {t('col_phase')}
                    </th>
                    <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                      {t('col_status')}
                    </th>
                    <th className="py-5 px-8 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                      {t('col_billing')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-notion-border dark:divide-white/5">
                  {items.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-black/[0.02] dark:hover:bg-white/[0.05] cursor-pointer transition-all group"
                      onClick={() => setSelectedProject(p.id)}
                    >
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-notion-border dark:border-white/5 group-hover:border-blue-500/30 transition-colors">
                            <FileText className="w-4 h-4 text-notion-text-secondary dark:text-white/30 group-hover:text-blue-500 transition-colors" />
                          </div>
                          <span className="font-bold text-sm text-notion-text dark:text-white/90 group-hover:text-blue-500 transition-colors">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-center">
                        <span className="text-[10px] font-bold bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-notion-border dark:border-white/5 text-notion-text-secondary dark:text-white/70">
                          {p.phase}
                        </span>
                      </td>
                      <td className="py-6 px-4">
                        <ProgressBar value={p.progress} color="#238636" showText />
                      </td>
                      <td className="py-6 px-8">
                        <ProgressBar value={p.billedAmount} color="#2ea043" showText />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </main>

      {selectedProject && (
        <SideDrawer projectId={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
};

const LegendItem = ({ color, label, count, icon, t }) => (
  <div className="flex items-center gap-4 group cursor-default">
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-black/[0.02] dark:bg-white/[0.03] border border-notion-border dark:border-white/5 group-hover:border-notion-text-secondary/30 dark:group-hover:border-white/20 group-hover:bg-black/5 dark:group-hover:bg-white/5"
      style={{ color }}
    >
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest leading-none mb-1 group-hover:text-notion-text dark:group-hover:text-white/70 transition-colors">
        {label}
      </span>
      <span className="text-xs font-bold text-notion-text-secondary/50 dark:text-white/50">
        {count} {t('projects').toLowerCase()}
      </span>
    </div>
  </div>
);

export default Dashboard;
