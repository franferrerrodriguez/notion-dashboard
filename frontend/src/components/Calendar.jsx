import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Castle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Calendar = ({ tasks = [], projects = [], onSelectTask }) => {
  const { t, language } = useLanguage();
  const locale = language === 'es' ? 'es-ES' : 'en-US';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isExpanded, setIsExpanded] = useState(false);

  const getProjectName = (ids) => {
    if (!ids || ids.length === 0) return t('no_project') || '---';
    const id = ids[0];
    const found = projects.find(p => p.id === id);
    return found?.identification?.name || t('no_project') || '---';
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const startOfWeek = useMemo(() => getStartOfWeek(currentDate), [currentDate]);

  const todayStr = useMemo(() => new Date().toLocaleDateString('sv-SE'), []);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toLocaleDateString('sv-SE');
      const dayTasks = tasks.filter(task => task.date === dateStr);
      days.push({ 
        date: d, 
        dateStr, 
        dayName: d.toLocaleDateString(locale, { weekday: 'short' }),
        dayNum: d.getDate(),
        tasks: dayTasks 
      });
    }
    return days;
  }, [startOfWeek, tasks, locale]);

  const monthYearLabel = startOfWeek.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getPriorityStyles = (priority) => {
    const p = priority?.toLowerCase() || '';
    if (p.includes('alta') || p.includes('high')) return 'bg-[#402020] text-[#ff7070] shadow-md shadow-red-900/10';
    if (p.includes('media') || p.includes('medium')) return 'bg-[#403520] text-[#ffb040] shadow-md shadow-amber-900/10';
    return 'bg-gray-200 dark:bg-[#252525] text-gray-500 dark:text-gray-400';
  };

  const getStatusStyles = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('completado') || s.includes('hecho') || s.includes('done')) {
      return 'bg-[#e7f5ed] dark:bg-[#1e3a2f] text-[#059669] dark:text-[#4ade80]';
    }
    if (s.includes('proceso') || s.includes('haciendo') || s.includes('doing')) {
      return 'bg-[#e0f2fe] dark:bg-[#1e2a3a] text-[#0284c7] dark:text-[#60a5fa] animate-pulse';
    }
    return 'bg-gray-100 dark:bg-[#25252d] text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="w-full bg-white dark:bg-notion-dark text-notion-text dark:text-white font-sans rounded-3xl mb-12 select-none border-2 border-notion-border dark:border-white/10 shadow-xl overflow-hidden transition-all duration-300">
      {/* Notion Top Header */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-8 py-8 cursor-pointer hover:bg-black/2 dark:hover:bg-white/2 transition-colors"
      >
         <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black tracking-tighter uppercase">{t('calendar_title') || 'Calendario'}</h1>
            <div className={`p-2 rounded-full transition-all duration-300 ${isExpanded ? 'bg-blue-500 text-white rotate-180' : 'bg-gray-100 dark:bg-white/5 text-gray-400'}`}>
               {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
         </div>
         
         {isExpanded && (
           <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500" onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={(e) => { e.stopPropagation(); navigateWeek(-1); }} 
                className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl text-notion-text-secondary dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-all active:scale-90"
              >
                 <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setCurrentDate(new Date()); }} 
                className="text-xs font-black uppercase tracking-[0.2em] hover:text-blue-500 transition-colors px-6 py-2 bg-gray-50 dark:bg-white/5 rounded-full"
              >
                 {t('calendar_today') || 'Today'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); navigateWeek(1); }} 
                className="p-3 hover:bg-black/5 dark:hover:bg-white/10 rounded-2xl text-notion-text-secondary dark:text-gray-400 hover:text-notion-text dark:hover:text-white transition-all active:scale-90"
              >
                 <ChevronRight className="w-6 h-6" />
              </button>
           </div>
         )}
      </div>

      {isExpanded && (
        <div className="px-8 pb-10 animate-in fade-in zoom-in-95 duration-700">
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
                          className="bg-gray-50 dark:bg-[#242424] rounded-3xl p-5 border border-notion-border dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer group/card border-l-4 border-l-blue-500"
                        >
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
      )}
    </div>
  );
};

export default Calendar;
