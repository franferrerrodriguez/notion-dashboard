import { useState, useEffect } from 'react';
import { projectService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  History, 
  CheckSquare, 
  FileText, 
  Calendar, 
  Flag,
  Info,
  ExternalLink,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const SideDrawer = ({ projectId, onClose }) => {
  const { t } = useLanguage();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectService.getById(projectId);
      setDetails(data);
    } catch (err) {
      console.error('Error loading project details:', err);
      setError(t('settings_save_error'));
    } finally {
      setLoading(false);
    }
  };

  if (!projectId) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-[#1a1a1a] shadow-[-10px_0_40px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-right duration-500 overflow-y-auto border-l border-notion-border dark:border-white/10">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 dark:bg-[#1a1a1a]/80 backdrop-blur-md z-10 px-8 py-6 border-b border-notion-border dark:border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-notion-text dark:text-white leading-tight">
                  {details?.name || t('project_details')}
                </h2>
                <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-[0.2em]">
                  ID: {projectId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all active:scale-90 text-notion-text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-12 flex-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-6">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest animate-pulse">
                  {t('user_loading_data')}
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                <div className="p-4 bg-red-500/10 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-sm font-bold text-red-500">{error}</p>
                <button 
                  onClick={loadDetails}
                  className="px-6 py-2 bg-black/5 dark:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black/10 transition-colors"
                >
                  {t('retry')}
                </button>
              </div>
            ) : details ? (
              <>
                {/* Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <DetailCard 
                    icon={<Info className="w-3.5 h-3.5" />}
                    label={t('col_phase')}
                    value={details.phase}
                    color="blue"
                  />
                  <DetailCard 
                    icon={<Calendar className="w-3.5 h-3.5" />}
                    label={t('col_status')}
                    value={`${details.progress}%`}
                    color="green"
                  />
                  <DetailCard 
                    icon={<ShieldCheck className="w-3.5 h-3.5" />}
                    label={t('col_billing')}
                    value={`${details.billedAmount}%`}
                    color="amber"
                  />
                </div>

                {/* Notion-Style Sections */}
                <div className="space-y-12">
                  {/* Summary / Interactions */}
                  <Section
                    icon={<History className="w-4 h-4" />}
                    title={t('project_interactions') || 'Historial'}
                  >
                    <div className="bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl p-6 border border-notion-border dark:border-white/5">
                      <p className="text-sm text-notion-text dark:text-white/70 leading-relaxed italic">
                        {details.description || 'Sin descripción detallada.'}
                      </p>
                    </div>
                  </Section>

                  {/* Tasks / Next Steps */}
                  <Section
                    icon={<CheckSquare className="w-4 h-4" />}
                    title={t('project_tasks') || 'Tareas Pendientes'}
                  >
                    <div className="space-y-3">
                      <TaskItem text={t('task_review')} completed={details.progress > 50} />
                      <TaskItem text={t('task_approval')} completed={details.progress > 80} />
                    </div>
                  </Section>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

const DetailCard = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'text-blue-500 bg-blue-500/5 border-blue-500/10',
    green: 'text-green-500 bg-green-500/5 border-green-500/10',
    amber: 'text-amber-500 bg-amber-500/5 border-amber-500/10',
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all hover:scale-[1.02] ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2 font-black uppercase tracking-[0.2em] text-[10px] opacity-70">
        {icon}
        {label}
      </div>
      <p className="text-lg font-black tracking-tight">{value || 'N/A'}</p>
    </div>
  );
};

const Section = ({ icon, title, children }) => (
  <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-notion-border dark:border-white/5">
        {icon}
      </div>
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-notion-text dark:text-white/80">
        {title}
      </h3>
    </div>
    {children}
  </div>
);

const TaskItem = ({ text, completed }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl bg-black/[0.01] dark:bg-white/[0.01] border border-notion-border dark:border-white/5 group transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
    <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${completed ? 'bg-green-500 border-green-500 text-white' : 'border-notion-border dark:border-white/10'}`}>
      {completed && <CheckSquare className="w-3.5 h-3.5" />}
    </div>
    <span className={`text-sm font-medium ${completed ? 'text-notion-text-secondary line-through' : 'text-notion-text dark:text-white/80'}`}>
      {text}
    </span>
  </div>
);

export default SideDrawer;
