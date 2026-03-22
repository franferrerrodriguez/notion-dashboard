import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Calendar = ({ tasks = [], projects = [], onSelectTask }) => {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredTask, setHoveredTask] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const navigateWeek = (weeks) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + weeks * 7);
    setCurrentDate(nextDate);
  };

  const getStatusStyles = (status) => {
    switch (status?.toLowerCase()) {
      case 'completado':
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
      case 'en progreso':
      case 'in progress':
        return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border border-gray-500/20';
    }
  };

  const getPriorityStyles = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'alta':
      case 'high':
        return 'bg-red-500/10 text-red-500 border border-red-500/20';
      case 'media':
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-500 border border-slate-500/20';
    }
  };

  const { weekDays, monthYearLabel, todayStr } = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setHours(0, 0, 0, 0);
    // Adjust to Monday as start of week
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    const days = [];
    const tempDate = new Date(startOfWeek);

    for (let i = 0; i < 7; i++) {
      // Use localized YYYY-MM-DD format to avoid timezone shifts
      const y = tempDate.getFullYear();
      const m = String(tempDate.getMonth() + 1).padStart(2, '0');
      const d = String(tempDate.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;

      const dayTasks = tasks.filter((task) => {
        const taskDate = task.date; // Use the direct date field from the API
        const isCompleted =
          task.status?.main?.name?.toLowerCase() === 'completado' ||
          task.status?.main?.name?.toLowerCase() === 'completed';

        return taskDate === dateStr && !isCompleted;
      });

      days.push({
        dateStr,
        dayNum: tempDate.getDate(),
        dayName: tempDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
          weekday: 'short',
        }),
        tasks: dayTasks,
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }

    const monthLabel = currentDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-US', {
      month: 'long',
      year: 'numeric',
    });

    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    return {
      weekDays: days,
      monthYearLabel: monthLabel,
      todayStr,
    };
  }, [currentDate, tasks, projects, lang]);
  return (
    <div className="w-full bg-white dark:bg-notion-dark text-notion-text dark:text-white font-sans rounded-3xl mb-12 select-none border-2 border-notion-border dark:border-white/10 shadow-xl overflow-hidden transition-all duration-300">
      {/* Notion Top Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-notion-border dark:border-white/5 bg-gray-50/30 dark:bg-white/2">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-black tracking-tight uppercase text-notion-text dark:text-gray-100">
            {t('calendar_title') || 'Calendario'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateWeek(-1)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-notion-text-secondary dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-all active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider hover:text-blue-500 transition-all px-4 py-1.5 bg-white dark:bg-white/5 rounded-full border border-notion-border dark:border-white/10 hover:border-blue-500/50 shadow-sm active:scale-95"
          >
            <Clock className="w-2.5 h-2.5 opacity-50 group-hover:text-blue-500 transition-colors" />
            {t('calendar_today') || 'Hoy'}
          </button>
          <button
            onClick={() => navigateWeek(1)}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl text-notion-text-secondary dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-all active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 pt-6">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-blue-500/80 dark:text-gray-500 px-1 flex items-center gap-2">
          <span className="w-6 h-px bg-current opacity-30"></span>
          {monthYearLabel}
        </p>

        {/* Week Header */}
        <div className="grid grid-cols-7 border border-notion-border dark:border-white/10 mb-2 bg-gray-50/50 dark:bg-white/2 rounded-xl">
          {weekDays.map((d) => (
            <div
              key={d.dayName}
              className="py-2 text-center text-[9px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-widest border-r border-notion-border dark:border-white/5 last:border-0 opacity-60"
            >
              {d.dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 min-h-[350px] gap-px bg-notion-border dark:bg-white/5 rounded-2xl overflow-hidden border border-notion-border dark:border-white/10">
          {weekDays.map((d, idx) => {
            const isToday = d.dateStr === todayStr;
            return (
              <div
                key={idx}
                className={`bg-white dark:bg-notion-dark relative flex flex-col pt-3 pb-4 min-h-[350px] ${isToday ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}
              >
                {/* Date Number */}
                <div className="flex justify-end pr-3 pb-2">
                  <div
                    className={`w-7 h-7 flex items-center justify-center text-[11px] font-bold rounded-lg transition-all ${isToday ? 'bg-blue-500 text-white shadow-lg' : 'text-notion-text-secondary dark:text-gray-500'}`}
                  >
                    {d.dayNum}
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-1.5 px-2 overflow-y-auto max-h-[400px]">
                  {d.tasks.map((task, tidx) => (
                    <div
                      key={tidx}
                      onClick={() => onSelectTask && onSelectTask(task.id)}
                      onMouseEnter={(e) => {
                        setHoveredTask(task);
                        setMousePos({ x: e.clientX, y: e.clientY });
                      }}
                      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
                      onMouseLeave={() => setHoveredTask(null)}
                      className="bg-white dark:bg-[#2a2a2a] rounded-lg p-2 border border-notion-border dark:border-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group/card relative border-l-2"
                      style={{ borderLeftColor: task.status?.main?.color || '#3b82f6' }}
                    >
                      <div className="flex flex-col gap-1">
                        {/* Name Row */}
                        <div className="flex items-center gap-1.5">
                          {task.has_unread_interactions && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0"></div>
                          )}
                          <h3 className="text-[10px] font-bold text-notion-text dark:text-gray-200 leading-tight truncate group-hover/card:text-blue-500">
                            {task.identification?.name}
                          </h3>
                        </div>

                        {/* Project Row */}
                        {(() => {
                          const projectIds =
                            task.identification?.project_relation ||
                            task.properties?.Proyecto?.relation?.map((r) => r.id) ||
                            task.properties?.Project?.relation?.map((r) => r.id) ||
                            task.properties?.['↗ Proyecto']?.relation?.map((r) => r.id);

                          const projectId = Array.isArray(projectIds) ? projectIds[0] : projectIds;
                          if (!projectId) return null;

                          const project = projects.find((p) => p.id === projectId);
                          const projectName = project?.identification?.name;
                          if (!projectName) return null;

                          return (
                            <div className="text-[7px] font-black uppercase text-blue-500/60 dark:text-blue-400/50 truncate tracking-tight">
                              {projectName}
                            </div>
                          );
                        })()}

                        {/* Priority Row */}
                        {task.status?.priority?.name && (
                          <div className="flex">
                            <span
                              className={`text-[7px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-tighter truncate ${getPriorityStyles(task.status.priority.name)}`}
                            >
                              {task.status.priority.name}
                            </span>
                          </div>
                        )}

                        {/* Status & Time Row */}
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[8px] font-black uppercase text-notion-text-secondary/60 dark:text-gray-500 truncate">
                            {task.status?.main?.name}
                          </span>
                          {task.time && (
                            <span className="text-[8px] font-bold text-blue-500/70 shrink-0">
                              {task.time}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hover Tooltip - Minimalist & Premium */}
      {hoveredTask && (
        <div
          className="fixed z-9999 pointer-events-none animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${mousePos.x + 15}px`,
            top: `${mousePos.y + 15}px`,
          }}
        >
          <div className="bg-white/90 dark:bg-notion-dark/95 backdrop-blur-xl border border-notion-border dark:border-white/10 rounded-2xl p-4 shadow-2xl w-64">
            <div className="flex flex-col gap-1 mb-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: hoveredTask.status?.main?.color || '#3b82f6' }}
                ></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-notion-text-secondary dark:text-gray-400">
                  {hoveredTask.status?.main?.name}
                </span>
              </div>
              {(() => {
                const projectIds =
                  hoveredTask.identification?.project_relation ||
                  hoveredTask.properties?.Proyecto?.relation?.map((r) => r.id) ||
                  hoveredTask.properties?.Project?.relation?.map((r) => r.id) ||
                  hoveredTask.properties?.['↗ Proyecto']?.relation?.map((r) => r.id);

                const projectId = Array.isArray(projectIds) ? projectIds[0] : projectIds;
                if (!projectId) return null;

                const project = projects.find((p) => p.id === projectId);
                return project?.identification?.name ? (
                  <div className="flex">
                    <span className="text-[8px] font-bold uppercase text-blue-500/80 dark:text-blue-400/60 tracking-tight px-2 py-0.5 bg-blue-500/5 dark:bg-blue-400/10 rounded-md border border-blue-500/10 dark:border-blue-400/10">
                      {project.identification.name}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>

            <h4 className="text-sm font-bold text-notion-text dark:text-gray-100 mb-4 leading-tight">
              {hoveredTask.identification?.name}
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between pt-2 border-t border-notion-border dark:border-white/5 mt-2">
                <div
                  className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${getPriorityStyles(hoveredTask.status?.priority?.name)}`}
                >
                  {hoveredTask.status?.priority?.name}
                </div>
                {hoveredTask.time && (
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    {hoveredTask.time}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
