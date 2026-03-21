import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MessageSquare, Clock, ChevronRight, X } from 'lucide-react';
import { projectService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ProgressBar from './ProgressBar';

const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => 
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all">
        {part}
      </a>
    ) : part
  );
};

const SideDrawer = ({ projectId, onClose }) => {
  const { t } = useLanguage();
  
  const { data, isLoading: loading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId),
    enabled: !!projectId,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isInteractionsOpen, setIsInteractionsOpen] = useState(true);
  const [isDeliveriesOpen, setIsDeliveriesOpen] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const toggleGroup = (status) => {
    setCollapsedGroups(prev => ({ ...prev, [status]: !prev[status] }));
  };

  if (!projectId) return null;

  const project = data?.project || {};
  const { identification = {}, status = {}, client = {}, financials = {}, assets = {}, metadata = [] } = project;

  // Unified rendering for Interactions and Deliveries
  const renderUnifiedTimeline = (content, sectionIcon) => {
    if (!content || content.length === 0) return null;

    // Group blocks by date
    const groups = [];
    let currentGroup = null;

    content.forEach((block) => {
      const text = block.text.trim();
      // Detect date (flexible: YYYY-MM-DD, ISO, etc.)
      const dateMatch = text.match(/^(\d{4}-\d{2}-\d{2})/);
      
      if (dateMatch) {
         const dateObj = new Date(dateMatch[1]);
         const formattedDate = dateObj.toLocaleDateString('es-ES', { 
           day: '2-digit', 
           month: '2-digit', 
           year: 'numeric' 
         });
         currentGroup = { date: formattedDate, items: [] };
         groups.push(currentGroup);
      } else if (text) {
         if (!currentGroup) {
            currentGroup = { date: null, items: [] };
            groups.push(currentGroup);
         }
         // Clean bullets or prefixes if any
         const cleanText = text.replace(/^[•\-*]\s?/, '');
         if (cleanText) currentGroup.items.push(cleanText);
      }
    });

    return (
      <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-notion-border dark:before:bg-white/5 animate-in fade-in slide-in-from-left-2 duration-1000">
        {groups.map((group, idx) => (
          <div key={idx} className="relative">
            {/* Timeline Node Icon */}
            <div className="absolute -left-[26px] top-0 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] z-10 border-2 border-white dark:border-notion-dark ring-4 ring-blue-500/10">
               <Calendar className="w-2 h-2 text-white" />
            </div>
            
            <div className="space-y-5">
              {group.date && (
                <div className="inline-flex items-center gap-2 -mt-1 group/date transition-transform hover:scale-105">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-sm backdrop-blur-sm">
                    {group.date}
                  </span>
                </div>
              )}
              
              <div className="grid gap-3">
                {group.items.map((itemText, i) => (
                  <div key={i} className="group/card relative p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-notion-border dark:border-white/5 hover:border-blue-500/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-0.5">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1 rounded-lg bg-gray-100 dark:bg-white/5 opacity-40 group-hover/card:opacity-100 group-hover/card:bg-blue-500/10 transition-all duration-500">
                        {sectionIcon === '🔄' ? 
                          <MessageSquare className="w-3 h-3 text-notion-text-secondary group-hover/card:text-blue-500" /> : 
                          <Clock className="w-3 h-3 text-notion-text-secondary group-hover/card:text-blue-500" />
                        }
                      </div>
                      <div className="grow space-y-1">
                        <p className="text-[13px] text-notion-text dark:text-white/90 leading-relaxed font-medium">
                          {renderTextWithLinks(itemText)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300" 
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-notion-dark shadow-2xl transform transition-transform duration-500 ease-out border-l border-notion-border dark:border-white/10 ${projectId ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-notion-dark/95 backdrop-blur-sm border-b border-notion-border dark:border-white/10 px-8 py-6 flex justify-between items-center text-notion-text dark:text-white">
          <div className="flex items-center gap-3">
             <span className="text-2xl grayscale brightness-150">📄</span>
             <h2 className="text-xl font-bold truncate max-w-md">
               {loading ? t('loading') : (identification.name || 'Project Details')}
             </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors group"
            aria-label={t('close')}
          >
            <X className="w-5 h-5 text-notion-text-secondary dark:text-gray-400 group-hover:text-notion-text dark:group-hover:text-white" />
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-88px)] p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-notion-text-secondary animate-in fade-in duration-500">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('loading')}</p>
            </div>
          ) : data && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-500 pb-20">
              
              {/* Properties Section */}
              <div className="space-y-1.5">
                <PropertyRow icon="👥" label={t('prop_client')} value={client.details?.name} isTag tagColor={client.details?.color} />
                <PropertyRow icon="⚙️" label={t('prop_status')} value={status.main?.name} isTag tagColor={status.main?.color} />
                
                {/* Progress Row */}
                <div className="flex items-start gap-4 py-1.5 group/prop">
                  <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                    <span className="text-sm opacity-70">📈</span>
                    <span className="text-xs font-medium">{t('prop_progress')}</span>
                  </div>
                  <div className="grow flex items-center gap-4">
                    <span className="text-xs font-medium text-notion-text dark:text-white/80 w-12 shrink-0">{(status.progress || 0).toFixed(0)}%</span>
                    <div className="grow max-w-[120px]">
                      <ProgressBar value={status.progress || 0} color="#238636" />
                    </div>
                  </div>
                </div>

                <PropertyRow icon="🔍" label={t('prop_offer_code')} value={assets.offerCode} isLink />
                <PropertyRow 
                  icon="📄" 
                  label={t('prop_project_sheet')} 
                  value={assets.projectSheet} 
                  isNotionFile 
                  t={t}
                />
                <PropertyRow 
                  icon="📄" 
                  label={t('prop_offer')} 
                  value={assets.offerFile} 
                  isNotionFile 
                  t={t}
                />
                
                <PropertyRow icon="💰" label={t('prop_total_offered')} value={formatCurrency(financials.totalOffered)} isCurrency />
                <PropertyRow icon="💰" label={t('prop_total_billed')} value={formatCurrency(financials.totalBilled)} isCurrency />
                <PropertyRow icon="Σ" label={t('prop_total_pend')} value={formatCurrency(financials.totalPending)} isCurrency />
                
                <div className="flex items-start gap-4 py-1.5 group/prop">
                  <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                    <span className="text-sm opacity-70">Σ</span>
                    <span className="text-xs font-medium">{t('prop_billed_pct')}</span>
                  </div>
                  <div className="grow flex items-center gap-4">
                    <span className="text-xs font-medium text-notion-text dark:text-white/80 w-12 shrink-0">{(financials.billingPercentage || 0).toFixed(0)}%</span>
                    <div className="grow max-w-[120px]">
                      <ProgressBar value={financials.billingPercentage || 0} color="#2ea043" />
                    </div>
                  </div>
                </div>

                <PropertyRow icon="⚖️" label={t('prop_phase')} value={status.phase?.name} isTag tagColor={status.phase?.color} />

                <PropertyRow icon="↗️" label={t('prop_offer_ref')} value={assets.offerLink} isLink />

                <div className="pt-2">
                   <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2 text-xs text-notion-text-secondary hover:text-notion-text dark:hover:text-gray-300 transition-colors py-1 group"
                   >
                      <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-90'}`} />
                      {isExpanded ? 'Show fewer' : 'More properties'}
                   </button>
                </div>

                {isExpanded && (
                  <div className="pt-2 space-y-1.5 border-t border-notion-border dark:border-white/5 mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    {metadata.map((prop) => (
                      <PropertyRow 
                        key={prop.label} 
                        icon="📄" 
                        label={prop.label} 
                        value={Array.isArray(prop.value) ? prop.value.join(', ') : prop.value} 
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Related Tasks Section - COLLAPSIBLE */}
              <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                <button 
                  onClick={() => setIsTasksOpen(!isTasksOpen)}
                  className="flex items-center gap-2 mb-6 group w-full text-left"
                >
                  <ChevronRight className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isTasksOpen ? 'rotate-90' : 'rotate-0'}`} />
                  <span className="text-xl">✅</span>
                  <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('tasks')}</h3>
                </button>

                {isTasksOpen && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
                    {(() => {
                      const groups = data.related_tasks?.reduce((acc, task) => {
                        const status = task.properties?.Estado?.status?.name || 'Sin estado';
                        const color = task.properties?.Estado?.status?.color || 'default';
                        if (!acc[status]) acc[status] = { name: status, color, tasks: [] };
                        acc[status].tasks.push(task);
                        return acc;
                      }, {}) || {};

                      const notionColors = {
                        default: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
                        gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-400',
                        brown: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
                        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
                        yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                        green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
                        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                        purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
                        pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
                        red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                      };

                      if (Object.keys(groups).length === 0) {
                        return (
                          <div className="flex flex-col items-center py-10 gap-3 border-2 border-dashed border-notion-border dark:border-white/5 rounded-3xl opacity-40 ml-6">
                            <Clock className="w-8 h-8 text-notion-text-secondary" />
                            <p className="text-xs font-bold uppercase tracking-widest">{t('no_tasks')}</p>
                          </div>
                        );
                      }

                      return Object.values(groups).map((group) => {
                        const isCollapsed = collapsedGroups[group.name];
                        return (
                          <div key={group.name} className="ml-4">
                            <button 
                              onClick={() => toggleGroup(group.name)}
                              className="flex items-center gap-2 mb-3 hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 -ml-2 rounded transition-colors group/header"
                            >
                              <ChevronRight className={`w-3 h-3 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`} />
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${notionColors[group.color] || notionColors.default}`}>
                                {group.name}
                              </span>
                            </button>

                            {!isCollapsed && (
                              <div className="overflow-x-auto ml-5 animate-in fade-in slide-in-from-left-1 duration-300">
                                <table className="w-full text-left border-collapse min-w-[500px]">
                                  <thead>
                                    <tr className="border-b border-notion-border dark:border-white/5">
                                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider w-1/3">
                                        <div className="flex items-center gap-1.5 leading-none">
                                          <span className="text-[10px]">Aa</span> {t('task_name')}
                                        </div>
                                      </th>
                                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5 leading-none">
                                          <span className="text-[10px]">🔆</span> {t('task_status')}
                                        </div>
                                      </th>
                                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5 leading-none">
                                          <Calendar className="w-2.5 h-2.5" /> {t('task_due_date')}
                                        </div>
                                      </th>
                                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center gap-1.5 leading-none">
                                          <span className="text-[10px]">⊙</span> {t('task_priority')}
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {group.tasks.map((task) => {
                                      const name = task.properties?.['Nombre de la tarea']?.title?.[0]?.plain_text || t('linked_task');
                                      const status = task.properties?.Estado?.status?.name;
                                      const statusColor = task.properties?.Estado?.status?.color;
                                      const dueDate = task.properties?.['Fecha límite']?.date?.start;
                                      const priority = task.properties?.Prioridad?.select?.name;
                                      const priorityColor = task.properties?.Prioridad?.select?.color;

                                      return (
                                        <tr key={task.id} className="border-b border-notion-border/30 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/2 transition-colors group/row">
                                          <td className="py-3 pr-4">
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm opacity-60">📄</span>
                                              <span className="text-sm font-medium text-notion-text dark:text-white/90 truncate max-w-[200px]">
                                                {name}
                                              </span>
                                            </div>
                                          </td>
                                          <td className="py-3 pr-4">
                                            {status && (
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${notionColors[statusColor] || notionColors.default}`}>
                                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                                                {status}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-3 pr-4">
                                            {dueDate && (
                                              <span className="text-[11px] text-notion-text-secondary dark:text-gray-400">
                                                {new Date(dueDate).toLocaleDateString()}
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-3">
                                            {priority && (
                                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${notionColors[priorityColor] || notionColors.default}`}>
                                                {priority}
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </section>

              {/* Interacciones Section - COLLAPSIBLE */}
              {data.interactions_content?.length > 0 && (
                <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                  <button 
                    onClick={() => setIsInteractionsOpen(!isInteractionsOpen)}
                    className="flex items-center gap-2 mb-8 group w-full text-left"
                  >
                    <ChevronRight className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isInteractionsOpen ? 'rotate-90' : 'rotate-0'}`} />
                    <span className="text-xl">🔄</span>
                    <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('interactions')}</h3>
                  </button>
                  
                  {isInteractionsOpen && renderUnifiedTimeline(data.interactions_content, '🔄')}
                </section>
              )}

              {/* Entregas Section - COLLAPSIBLE */}
              {data.deliveries_content?.length > 0 && (
                <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                  <button 
                    onClick={() => setIsDeliveriesOpen(!isDeliveriesOpen)}
                    className="flex items-center gap-2 mb-8 group w-full text-left"
                  >
                    <ChevronRight className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isDeliveriesOpen ? 'rotate-90' : 'rotate-0'}`} />
                    <span className="text-xl">📦</span>
                    <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('prop_deliveries')}</h3>
                  </button>
                  
                  {isDeliveriesOpen && renderUnifiedTimeline(data.deliveries_content, '📦')}
                </section>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PropertyRow = ({ icon, label, value, isTag, tagColor, isLink, isCurrency, isUser, isNotionFile, t }) => {
  if (!value && value !== 0 && value !== 'Empty') return null;
  
  return (
    <div className="flex items-start gap-4 py-1.5 group/prop">
      <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
        <span className="text-sm opacity-70 group-hover/prop:opacity-100 transition-opacity">{icon}</span>
        <span className="text-xs font-medium capitalize">{label}</span>
      </div>
      <div className="grow flex items-center">
        {isTag ? (
          <span 
            className="px-2 py-0.5 rounded text-[11px] font-medium"
            style={{ 
              background: getNotionColor(tagColor, true),
              color: getNotionColor(tagColor, false)
            }}
          >
            {value}
          </span>
        ) : isUser ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-notion-bg-light dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-notion-text-secondary dark:text-gray-300 uppercase shadow-inner">
               {(value || '?').charAt(0)}
            </div>
            <span className="text-[13px] text-notion-text dark:text-white/85 font-medium">{value}</span>
          </div>
        ) : isNotionFile ? (
          <a 
            href={value?.file?.url || value?.external?.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] font-bold bg-notion-bg-light dark:bg-white/5 border border-notion-border dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all px-3 py-1.5 rounded-lg flex items-center gap-2 text-notion-text-secondary dark:text-gray-400 hover:text-blue-500"
          >
            <span>📄</span>
            <span className="truncate max-w-[180px]">{value?.name || t('view_file')}</span>
          </a>
        ) : isLink ? (
          <span className="text-[13px] text-notion-text dark:text-white/90 border-b border-notion-border dark:border-white/20 hover:border-notion-text dark:hover:border-white transition-colors cursor-pointer inline-flex items-center gap-1.5 font-bold">
             {value}
          </span>
        ) : (
          <span className={`text-[13px] font-medium ${isCurrency ? 'text-notion-text dark:text-white/95' : 'text-notion-text dark:text-white/85'} ${value === 'Empty' ? 'text-notion-text-secondary/40' : ''}`}>{value}</span>
        )}
      </div>
    </div>
  );
};

const getNotionColor = (color, isBg) => {
  const map = {
    'blue': { bg: '#28456c33', text: '#5297ff' },
    'yellow': { bg: '#89632a33', text: '#ffdc49' },
    'green': { bg: '#2b593f33', text: '#529e72' },
    'orange': { bg: '#854c1d33', text: '#ffa344' },
    'brown': { bg: '#603b2c33', text: '#937264' },
    'pink': { bg: '#69314c33', text: '#ff5c97' },
    'red': { bg: '#6e363033', text: '#ff7369' },
    'purple': { bg: '#49306b33', text: '#9a6dd7' },
    'gray': { bg: '#373737', text: '#9b9b9b' },
    'default': { bg: '#373737', text: '#ffffff' }
  };
  const val = map[color] || map['default'];
  return isBg ? val.bg : val.text;
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return null;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
};

export default SideDrawer;
