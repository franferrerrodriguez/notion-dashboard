import React, { useState, useMemo, useEffect } from 'react';
import { projectService } from '../services/api';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Castle,
  Target,
  Receipt,
  Clock,
  MessageSquare,
  Plus,
  FileText,
  User,
  Mail,
  Phone,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const Calendar = ({ tasks = [], projects = [], onSelectTask }) => {
  const { t, lang } = useLanguage();
  const { theme } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

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

  const getProjectName = (projectIds) => {
    if (!projectIds || projectIds.length === 0) return t('no_project') || 'Sin Proyecto';
    const projectId = Array.isArray(projectIds) ? projectIds[0] : projectIds;
    const project = projects.find((p) => p.id === projectId);
    return project?.identification?.name || t('unknown_project') || 'Proyecto desconocido';
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
        return taskDate === dateStr;
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
      <div className="flex items-center justify-between px-8 py-8 border-b border-notion-border dark:border-white/5 bg-gray-50/30 dark:bg-white/2">
         <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tighter uppercase">{t('calendar_title') || 'Calendario'}</h1>
         </div>
         
         <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <button 
              onClick={() => navigateWeek(-1)} 
              className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl text-notion-text-secondary dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-all active:scale-90"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => setCurrentDate(new Date())} 
              className="group flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] hover:text-blue-500 transition-all px-6 py-2 bg-white dark:bg-white/5 rounded-full border border-notion-border dark:border-white/10 hover:border-blue-500/50 shadow-sm active:scale-95"
            >
               <Clock className="w-3 h-3 opacity-50 group-hover:text-blue-500 transition-colors" />
               {t('calendar_today') || 'Hoy'}
            </button>
            <button 
              onClick={() => navigateWeek(1)} 
              className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl text-notion-text-secondary dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-all active:scale-90"
            >
               <ChevronRight className="w-6 h-6" />
            </button>
         </div>
      </div>

      <div className="px-8 pb-10 pt-8 animate-in fade-in zoom-in-95 duration-700">
        <p className="text-xs font-black uppercase tracking-[0.3em] mb-8 text-blue-500/80 dark:text-gray-500 px-2 flex items-center gap-3">
           <span className="w-8 h-px bg-current opacity-30"></span>
           {monthYearLabel}
        </p>
        
        {/* Week Header */}
        <div className="grid grid-cols-7 border-t border-b border-notion-border dark:border-white/10 mb-4 bg-gray-50/50 dark:bg-white/2 rounded-2xl">
          {weekDays.map(d => (
            <div key={d.dayName} className="py-4 text-center text-[10px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-widest border-r border-notion-border dark:border-white/5 last:border-0 opacity-60">
              {d.dayName}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 min-h-[500px] gap-px bg-notion-border dark:bg-white/5 rounded-3xl overflow-hidden border border-notion-border dark:border-white/10">
          {weekDays.map((d, idx) => {
            const isToday = d.dateStr === todayStr;
            return (
              <div key={idx} className="bg-white dark:bg-notion-dark relative flex flex-col pt-6 min-h-[500px]">
                {/* Date Number Overlay */}
                <div className="flex justify-end pr-5 pb-5">
                   <div className={`w-9 h-9 flex items-center justify-center text-sm font-black rounded-2xl transition-all duration-500 ${isToday ? 'bg-[#ff5d5d] text-white shadow-xl shadow-red-500/40 scale-110 rotate-3' : 'text-notion-text-secondary dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                      {d.dayNum}
                   </div>
                </div>

                <div className="flex-1 flex flex-col gap-5 px-4 pb-8">
                   {d.tasks.map((task, tidx) => (
                      <div 
                        key={tidx} 
                        onClick={() => onSelectTask && onSelectTask(task.id)}
                        className="bg-white dark:bg-[#242424] rounded-3xl p-5 border border-notion-border dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer group/card relative"
                        style={{
                          borderLeft: `4px solid ${task.status?.main?.color || '#3b82f6'}`
                        }}
                      >
                        {task.has_unread_interactions && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-white dark:border-[#1a1a1a] shadow-[0_0_12px_rgba(59,130,246,0.8)] z-20 shrink-0"></div>
                        )}
                        <div className="flex justify-between items-start mb-4">
                           <h3 className="text-sm font-bold text-notion-text dark:text-gray-100 leading-tight group-hover/card:text-blue-500 transition-colors">
                              {task.identification?.name}
                           </h3>
                           {task.time && (
                             <span className="text-[10px] font-black text-blue-500 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg ml-2">{task.time}</span>
                           )}
                        </div>

                        {/* Status Badge */}
                        <div className="flex mb-5">
                           <div className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-2.5 ${getStatusStyles(task.status?.main?.name)} shadow-sm`}>
                             <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                             {task.status?.main?.name}
                           </div>
                        </div>

                        {/* Project Relation */}
                        <div className="flex items-center gap-3 text-[10px] font-black text-notion-text-secondary dark:text-gray-400 mb-5 bg-black/3 dark:bg-white/3 p-3 rounded-2xl border border-notion-border dark:border-white/5 group-hover/card:bg-blue-500/5 transition-colors">
                           <Castle className="w-4 h-4 shrink-0 text-blue-500/60 dark:text-gray-500" />
                           <span className="truncate tracking-tight">{getProjectName(task.identification?.project_relation)}</span>
                        </div>

                        {/* Priority Badge */}
                        <div className="flex">
                           <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] ${getPriorityStyles(task.status?.priority?.name)} shadow-xs scale-90 -ml-1`}>
                              {task.status?.priority?.name}
                           </span>
                        </div>
                      </div>
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
