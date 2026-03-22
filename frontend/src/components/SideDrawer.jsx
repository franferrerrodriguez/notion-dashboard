import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, MessageSquare, Clock, ChevronRight, X, Phone, Mail, User, FileText, Castle, Target, Receipt, CalendarDays } from 'lucide-react';
import { projectService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import ProgressBar from './ProgressBar';

const renderTextWithLinks = (text) => {
  if (!text) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, i) => 
    urlRegex.test(part) ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline break-all transition-colors">
        {part}
      </a>
    ) : part
  );
};

const SideDrawer = ({ itemId, type = 'project', onClose, projects = [] }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const { data, isLoading: loading } = useQuery({
    queryKey: [type, itemId],
    queryFn: () => projectService.getById(itemId),
    enabled: !!itemId,
  });

  useEffect(() => {
    if (data?.has_unread_interactions && itemId) {
      projectService.markRead(itemId, data.last_edited_time).catch(console.error);
    }
  }, [data, itemId]);

  const [isTasksOpen, setIsTasksOpen] = useState(false); // Default tasks closed as requested
  const [isInteractionsOpen, setIsInteractionsOpen] = useState(false);
  const [isDeliveriesOpen, setIsDeliveriesOpen] = useState(false);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleItem = (id) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGroup = (status) => {
    setCollapsedGroups(prev => ({ ...prev, [status]: !prev[status] }));
  };

  if (!itemId) return null;

  const item = data?.project || {}; // Backend still uses 'project' as key but content is generic
  const { identification = {}, status = {}, client = {}, financials = {}, assets = {}, metadata = [] } = item;

  // Unified rendering for Interactions and Deliveries
  const renderUnifiedTimeline = (content, sectionIcon) => {
    if (!content || content.length === 0) return null;

    const groups = [];
    let currentGroup = null;

    content.forEach((block) => {
      const text = block.text.trim();
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
         const cleanText = text.replace(/^[•\-*]\s?/, '');
         if (cleanText) currentGroup.items.push({ id: block.id, text: cleanText });
      }
    });

    return (
      <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-notion-border dark:before:bg-white/5 animate-in fade-in slide-in-from-left-2 duration-1000">
        {groups.map((group, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[26px] top-[6px] w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] z-10 border-2 border-white dark:border-notion-dark ring-4 ring-blue-500/10" />
            
            <div className="space-y-5">
              {group.date && (
                <div className="inline-flex items-center gap-2 -mt-1 group/date transition-transform hover:scale-105">
                  <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-sm backdrop-blur-sm">
                    {group.date}
                  </span>
                </div>
              )}
              
              <div className="grid gap-3">
                {group.items.map((item, i) => (
                  <div 
                    key={item.id || i} 
                    onClick={() => item.id && toggleItem(item.id)}
                    className="group/card relative p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-notion-border dark:border-white/5 hover:border-blue-500/30 hover:bg-white dark:hover:bg-white/10 transition-all duration-500 shadow-sm hover:shadow-xl hover:-translate-y-0.5 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 p-1 rounded-lg bg-gray-100 dark:bg-white/5 opacity-40 group-hover/card:opacity-100 group-hover/card:bg-blue-500/10 transition-all duration-500">
                        {sectionIcon === '🔄' ? 
                          <MessageSquare className="w-3 h-3 text-notion-text-secondary group-hover/card:text-blue-500" /> : 
                          <Clock className="w-3 h-3 text-notion-text-secondary group-hover/card:text-blue-500" />
                        }
                      </div>
                      <div className="grow space-y-1">
                        <p className={`text-[13px] text-notion-text dark:text-white/90 leading-relaxed font-medium transition-all ${expandedItems.has(item.id) ? '' : 'line-clamp-3'}`}>
                          {renderTextWithLinks(item.text)}
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

  const isTask = type === 'task';

  return (
    <div className="fixed inset-0 z-150 overflow-hidden font-sans">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 animate-in fade-in" 
        onClick={onClose}
      />
      
      {/* Drawer Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-4xl bg-white dark:bg-notion-dark shadow-2xl transform transition-transform duration-500 ease-out border-l border-notion-border dark:border-white/10 ${itemId ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-notion-dark/95 backdrop-blur-sm border-b border-notion-border dark:border-white/10 px-8 py-6 flex justify-between items-center text-notion-text dark:text-white">
          <div className="flex items-center gap-3">
             <h2 className="text-xl font-bold truncate max-w-md">
               {loading ? t('loading') : (identification.name || (isTask ? t('linked_task') : 'Details'))}
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
            <div className="flex flex-col items-center justify-center h-full gap-6 text-notion-text-secondary animate-in fade-in duration-700">
               <div className="relative">
                  <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/10 rounded-full animate-ping"></div>
                  <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin relative z-10 shadow-[0_0_15px_rgba(59,130,246,0.2)]"></div>
               </div>
               <p className="text-[12px] font-black text-notion-text-secondary dark:text-gray-400 uppercase tracking-[0.3em] animate-pulse">
                  {t('loading')}
               </p>
            </div>
          ) : data && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-500 pb-20">
              
              {/* Properties Section */}
              <div className="space-y-1.5">
                {isTask ? (
                  <>
                    <PropertyRow icon={<Castle className="w-4 h-4" />} label={t('task_status')} value={status.main?.name} isTag tagColor={status.main?.color} isDark={isDark} />
                    <PropertyRow icon={<Target className="w-4 h-4" />} label={t('task_priority')} value={status.priority?.name} isTag tagColor={status.priority?.color} isDark={isDark} />
                    <PropertyRow icon={<CalendarDays className="w-4 h-4" />} label={t('task_due_date')} value={item.date} />
                    <PropertyRow 
                        icon={<Castle className="w-4 h-4" />} 
                        label={t('col_project')} 
                        value={(() => {
                            const projectIds = identification.project_relation;
                            if (!projectIds || projectIds.length === 0) return null;
                            const found = projects.find(p => p.id === projectIds[0]);
                            return found?.identification?.name || t('no_project');
                        })()} 
                    />
                  </>
                ) : (
                  <>
                    <PropertyRow icon={<User className="w-4 h-4" />} label={t('prop_client')} value={client.details?.name} isTag tagColor={client.details?.color} isDark={isDark} />
                    <PropertyRow icon={<Target className="w-4 h-4" />} label={t('prop_status')} value={status.main?.name} isTag tagColor={status.main?.color} isDark={isDark} />
                    <PropertyRow icon={<Castle className="w-4 h-4" />} label={t('prop_phase')} value={status.phase?.name} isTag tagColor={status.phase?.color} isDark={isDark} />
                    
                    {/* Progress Row */}
                    <div className="flex items-start gap-4 py-1.5 group/prop">
                      <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                        <span className="text-xs font-medium">{t('prop_progress')}</span>
                      </div>
                      <div className="grow flex items-center gap-4">
                        <span className="text-xs font-medium text-notion-text dark:text-white/80 w-12 shrink-0">{(status.progress || 0).toFixed(0)}%</span>
                        <div className="grow max-w-[120px]">
                          <ProgressBar value={status.progress || 0} color="#238636" />
                        </div>
                      </div>
                    </div>

                    <PropertyRow icon={<FileText className="w-4 h-4" />} label={t('prop_project_sheet')} value={assets.projectSheet} isNotionFile t={t} />
                    <PropertyRow icon={<FileText className="w-4 h-4" />} label={t('prop_offer')} value={assets.offerFile} isNotionFile t={t} />
                    <PropertyRow icon={<Receipt className="w-4 h-4" />} label={t('prop_total_offered')} value={formatCurrency(financials.totalOffered)} isCurrency />
                    <PropertyRow icon={<Receipt className="w-4 h-4" />} label={t('prop_total_billed')} value={formatCurrency(financials.totalBilled)} isCurrency />
                    <PropertyRow icon={<Receipt className="w-4 h-4" />} label={t('prop_total_pend')} value={formatCurrency(financials.totalPending)} isCurrency />
                    
                    <div className="flex items-start gap-4 py-1.5 group/prop">
                      <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                        <span className="text-xs font-medium">{t('prop_billed_pct')}</span>
                      </div>
                      <div className="grow flex items-center gap-4">
                        <span className="text-xs font-medium text-notion-text dark:text-white/80 w-12 shrink-0">{(financials.billingPercentage || 0).toFixed(0)}%</span>
                        <div className="grow max-w-[120px]">
                          <ProgressBar value={financials.billingPercentage || 0} color="#2ea043" />
                        </div>
                      </div>
                    </div>

                    <PropertyRow icon={<Target className="w-4 h-4" />} label={t('prop_offer_ref')} value={assets.offerLink} isLink />
                  </>
                )}

                <div className="pt-4 space-y-1.5 border-t border-notion-border dark:border-white/10 mt-4 animate-in fade-in slide-in-from-top-1 duration-500">
                  {metadata
                    .filter(prop => !['margen (€)', 'coste interno (€)'].includes(prop.label.toLowerCase()))
                    .map((prop) => (
                    <PropertyRow 
                      key={prop.label} 
                      icon={<FileText className="w-4 h-4" />} 
                      label={prop.label} 
                      value={Array.isArray(prop.value) ? prop.value.join(', ') : prop.value} 
                      t={t}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>

              {/* Dynamic Sections (Only for Projects usually, but generic based on data) */}
              
              {!isTask && (
                <>
                  {/* Interacciones */}
                  {data.interactions_content?.length > 0 && (
                    <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                      <button onClick={() => setIsInteractionsOpen(!isInteractionsOpen)} className="flex items-center gap-2 mb-8 group w-full text-left">
                        <ChevronRight className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isInteractionsOpen ? 'rotate-90' : 'rotate-0'}`} />
                        <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('interactions')}</h3>
                      </button>
                      {isInteractionsOpen && renderUnifiedTimeline(data.interactions_content, '🔄')}
                    </section>
                  )}

                  {/* Entregas */}
                  {data.deliveries_content?.length > 0 && (
                    <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                      <button onClick={() => setIsDeliveriesOpen(!isDeliveriesOpen)} className="flex items-center gap-2 mb-8 group w-full text-left">
                        <ChevronRight className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isDeliveriesOpen ? 'rotate-90' : 'rotate-0'}`} />
                        <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('prop_deliveries')}</h3>
                      </button>
                      {isDeliveriesOpen && renderUnifiedTimeline(data.deliveries_content, '📦')}
                    </section>
                  )}

                  {/* Related Tasks */}
                  {data.related_tasks?.length > 0 && (
                    <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                      <button onClick={() => setIsTasksOpen(!isTasksOpen)} className="flex items-center gap-2 mb-6 group w-full text-left">
                        <ChevronRight className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isTasksOpen ? 'rotate-90' : 'rotate-0'}`} />
                        <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('tasks')}</h3>
                      </button>
                      {isTasksOpen && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-500">
                           {renderTasksTable(data.related_tasks, collapsedGroups, toggleGroup, t, isDark)}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Related Contacts */}
                  {data.project_contacts?.length > 0 && (
                    <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                      <button onClick={() => setIsContactsOpen(!isContactsOpen)} className="flex items-center gap-2 mb-8 group w-full text-left">
                        <ChevronRight className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isContactsOpen ? 'rotate-90' : 'rotate-0'}`} />
                        <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('contacts')}</h3>
                      </button>
                      {isContactsOpen && renderContactsTable(data.project_contacts, t, isDark)}
                    </section>
                  )}
                </>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const renderTasksTable = (tasks, collapsedGroups, toggleGroup, t, isDark) => {
    const notionColors = (color) => {
       const bg = getNotionColor(color, true, isDark);
       const text = getNotionColor(color, false, isDark);
       return { backgroundColor: bg, color: text };
    };

    const groups = tasks.reduce((acc, task) => {
      const status = task.properties?.Estado?.status?.name || 'Sin estado';
      const color = task.properties?.Estado?.status?.color || 'default';
      if (!acc[status]) acc[status] = { name: status, color, tasks: [] };
      acc[status].tasks.push(task);
      return acc;
    }, {});

    const statusOrder = {
      'Bloqueado': 1,
      'Por hacer': 2,
      'Programado': 3,
      'En espera': 4,
      'Completado': 5,
      'Sin estado': 6
    };

    const sortedGroups = Object.values(groups).sort((a, b) => {
      return (statusOrder[a.name] || 99) - (statusOrder[b.name] || 99);
    });

    return sortedGroups.map((group) => {
      const isCollapsed = collapsedGroups[group.name];
      return (
        <div key={group.name} className="ml-4">
          <button 
            onClick={() => toggleGroup(group.name)}
            className="flex items-center gap-2 mb-3 hover:bg-black/5 dark:hover:bg-white/5 px-2 py-1 -ml-2 rounded transition-colors group/header"
          >
            <ChevronRight className={`w-3 h-3 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-90'}`} />
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full`} style={notionColors(group.color)}>
              {group.name}
            </span>
          </button>

          {!isCollapsed && (
            <div className="overflow-x-auto ml-5">
              <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-notion-border dark:border-white/5">
                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider w-1/3">Aa {t('task_name')}</th>
                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider">🔆 {t('task_status')}</th>
                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider flex items-center gap-3"> {t('task_due_date')}</th>
                      <th className="py-2 text-[10px] font-bold text-notion-text-secondary dark:text-gray-500 uppercase tracking-wider">⊙ {t('task_priority')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.tasks.map((task) => (
                      <tr key={task.id} className="border-b border-notion-border/30 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/2 transition-colors group/row">
                        <td className="py-3 pr-4 text-sm font-medium">{task.properties?.['Nombre de la tarea']?.title?.[0]?.plain_text || t('linked_task')}</td>
                        <td className="py-3 pr-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full`} style={notionColors(task.properties?.Estado?.status?.color)}>
                                {task.properties?.Estado?.status?.name}
                            </span>
                        </td>
                        <td className="py-3 pr-4 text-[11px]">{task.properties?.['Fecha límite']?.date?.start || '-'}</td>
                        <td className="py-3">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md`} style={notionColors(task.properties?.Prioridad?.select?.color)}>
                                {task.properties?.Prioridad?.select?.name}
                            </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          )}
        </div>
      );
    });
};

const renderContactsTable = (contacts, t, isDark) => (
  <div className="overflow-x-auto rounded-2xl border border-notion-border dark:border-white/5 bg-black/2 dark:bg-white/1 animate-in fade-in slide-in-from-bottom-2 duration-500">
    <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-black/5 dark:bg-white/5">
            <th className="py-3 px-4 text-[9px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest border-b border-notion-border dark:border-white/10">{t('contact_name')}</th>
            <th className="py-3 px-4 text-[9px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest border-b border-notion-border dark:border-white/10">{t('contact_phone')}</th>
            <th className="py-3 px-4 text-[9px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest border-b border-notion-border dark:border-white/10">{t('contact_email')}</th>
            <th className="py-3 px-4 text-[9px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest border-b border-notion-border dark:border-white/10">{t('contact_role')}</th>
            <th className="py-3 px-4 text-[9px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest border-b border-notion-border dark:border-white/10">{t('contact_notes')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-notion-border dark:divide-white/5">
           {contacts.map(contact => (
              <tr key={contact.id} className="hover:bg-black/5 dark:hover:bg-white/2 transition-colors">
                 <td className="py-3 px-4 text-xs font-bold">{contact.name}</td>
                 <td className="py-3 px-4 text-[11px]">{contact.phone || '-'}</td>
                 <td className="py-3 px-4 text-[11px]">{contact.email || '-'}</td>
                 <td className="py-3 px-4">
                    {contact.role && (
                      <span className="px-1.5 py-0.5 rounded-sm text-[12px] font-medium" style={{ background: getNotionColor(contact.role.color, true, isDark), color: getNotionColor(contact.role.color, false, isDark) }}>
                        {contact.role.name}
                      </span>
                    )}
                 </td>
                 <td className="py-3 px-4 text-[11px] opacity-60 truncate max-w-[200px]">{contact.notes || '-'}</td>
              </tr>
           ))}
        </tbody>
    </table>
  </div>
);

const PropertyRow = ({ icon, label, value, isTag, tagColor, isLink, isCurrency, isUser, isNotionFile, t, isDark }) => {
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
            className="px-1.5 py-0.5 rounded-sm text-[12px] font-medium leading-none"
            style={{ 
              background: getNotionColor(tagColor, true, isDark),
              color: getNotionColor(tagColor, false, isDark)
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
            href={value?.url || value?.file?.url || value?.external?.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[11px] font-bold bg-notion-bg-light dark:bg-white/5 border border-notion-border dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all px-3 py-1.5 rounded-lg flex items-center gap-2 text-notion-text-secondary dark:text-gray-400 hover:text-blue-500"
          >
            <FileText className="w-3 h-3" />
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

const getNotionColor = (color, isBg, isDark) => {
  const map = {
    'blue': { 
        light: { bg: 'rgba(38, 103, 152, 0.1)', text: '#0066cc' },
        dark: { bg: 'rgba(38, 103, 152, 0.4)', text: '#5297ff' }
    },
    'yellow': { 
        light: { bg: 'rgba(137, 99, 42, 0.1)', text: '#804d00' },
        dark: { bg: 'rgba(137, 99, 42, 0.4)', text: '#ffdc49' }
    },
    'green': { 
        light: { bg: 'rgba(43, 89, 63, 0.1)', text: '#006600' },
        dark: { bg: 'rgba(43, 89, 63, 0.4)', text: '#529e72' }
    },
    'orange': { 
        light: { bg: 'rgba(133, 76, 29, 0.1)', text: '#994d00' },
        dark: { bg: 'rgba(133, 76, 29, 0.4)', text: '#ffa344' }
    },
    'brown': { 
        light: { bg: 'rgba(96, 59, 44, 0.1)', text: '#603b2c' },
        dark: { bg: 'rgba(96, 59, 44, 0.4)', text: '#937264' }
    },
    'pink': { 
        light: { bg: 'rgba(105, 49, 76, 0.1)', text: '#cc0066' },
        dark: { bg: 'rgba(105, 49, 76, 0.4)', text: '#ff5c97' }
    },
    'red': { 
        light: { bg: 'rgba(110, 54, 48, 0.1)', text: '#cc0000' },
        dark: { bg: 'rgba(110, 54, 48, 0.4)', text: '#ff7369' }
    },
    'purple': { 
        light: { bg: 'rgba(73, 48, 107, 0.1)', text: '#6600cc' },
        dark: { bg: 'rgba(73, 48, 107, 0.4)', text: '#9a6dd7' }
    },
    'gray': { 
        light: { bg: 'rgba(155, 155, 155, 0.1)', text: '#37352f' },
        dark: { bg: 'rgba(155, 155, 155, 0.15)', text: '#9b9b9b' }
    },
    'default': { 
        light: { bg: 'rgba(55, 53, 47, 0.05)', text: '#37352f' },
        dark: { bg: 'rgba(255, 255, 255, 0.1)', text: '#ffffff' }
    }
  };
  const val = (map[color] || map['default'])[isDark ? 'dark' : 'light'];
  return isBg ? val.bg : val.text;
};

const formatCurrency = (val) => {
  if (val === undefined || val === null) return null;
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val);
};

export default SideDrawer;
