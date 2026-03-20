import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { projectService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import ProgressBar from './ProgressBar';

const SideDrawer = ({ projectId, onClose }) => {
  const { t } = useLanguage();
  
  const { data, isLoading: loading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectService.getById(projectId),
    enabled: !!projectId,
  });

  const [isExpanded, setIsExpanded] = useState(false);
  
  // Collapse states for sections
  const [isTasksOpen, setIsTasksOpen] = useState(true);
  const [isInteractionsOpen, setIsInteractionsOpen] = useState(true);

  if (!projectId) return null;

  // Comprehensive list of properties to show by default
  const mainProps = [
    'Cliente', 'Estado', 'Progreso', 'Código oferta', 'Hoja Proyecto', 'ref Oferta', 
    'Total Ofertado', 'Total Facturado', 'Pendiente Facturar', '% Facturado', 'Fase',
    'Propietario', 'Periodo', 'Resumen', 'Vínculo Ofertas', 'Coste interno (€)', 
    'Control de horas', 'Margen (€)'
  ];

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
               {loading ? t('loading') : (data?.raw_properties?.['Nombre del proyecto']?.title?.[0]?.plain_text || 'Project Details')}
             </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors group"
            aria-label={t('close')}
          >
            <svg className="w-5 h-5 text-notion-text-secondary dark:text-gray-400 group-hover:text-notion-text dark:group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-88px)] p-8 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-notion-text-secondary animate-in fade-in duration-500">
              <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{t('loading')}</p>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-2 duration-500 pb-20">
              
              {/* Properties Section */}
              <div className="space-y-1.5">
                <PropertyRow icon="👥" label={t('prop_client')} value={data.raw_properties?.Cliente?.multi_select?.[0]?.name} isTag tagColor={data.raw_properties?.Cliente?.multi_select?.[0]?.color} />
                <PropertyRow icon="⚙️" label={t('prop_status')} value={data.raw_properties?.Estado?.status?.name} isTag tagColor={data.raw_properties?.Estado?.status?.color} />
                
                {/* Progress Row */}
                <div className="flex items-start gap-4 py-1.5 group/prop">
                  <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                    <span className="text-sm opacity-70">📈</span>
                    <span className="text-xs font-medium">{t('prop_progress')}</span>
                  </div>
                  <div className="grow flex items-center gap-4">
                    <span className="text-xs font-medium text-notion-text dark:text-white/80 w-12 shrink-0">{(data.raw_properties?.Progreso?.rollup?.number * 100 || 0).toFixed(0)}%</span>
                    <div className="grow max-w-[120px]">
                      <ProgressBar value={(data.raw_properties?.Progreso?.rollup?.number || 0) * 100} color="#238636" />
                    </div>
                  </div>
                </div>

                <PropertyRow icon="🔍" label={t('prop_offer_code')} value={data.raw_properties?.['Código oferta']?.rollup?.array?.[0]?.title?.[0]?.plain_text} isLink />
                <PropertyRow 
                  icon="📄" 
                  label={t('prop_project_sheet')} 
                  value={data.raw_properties?.['Hoja Proyecto']?.files?.[0]} 
                  isNotionFile 
                  t={t}
                />
                <PropertyRow icon="🔍" label={t('prop_offer_ref')} value={data.raw_properties?.['ref Oferta']?.rollup?.array?.[0]?.title?.[0]?.plain_text} isLink />
                
                <PropertyRow icon="💰" label={t('prop_total_offered')} value={formatCurrency(data.raw_properties?.['Total Ofertado']?.formula?.number || data.raw_properties?.['Total Ofertado']?.number)} isCurrency />
                <PropertyRow icon="💰" label={t('prop_total_offered')} value={formatCurrency(data.raw_properties?.['Total Facturado']?.formula?.number || data.raw_properties?.['Total Facturado']?.number)} isCurrency />
                <PropertyRow icon="Σ" label={t('prop_total_pend')} value={formatCurrency(data.raw_properties?.['Pendiente Facturar']?.formula?.number)} isCurrency />
                
                <div className="flex items-start gap-4 py-1.5 group/prop">
                  <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                    <span className="text-sm opacity-70">Σ</span>
                    <span className="text-xs font-medium">{t('prop_billed_pct')}</span>
                  </div>
                  <div className="grow flex items-center gap-4">
                    <span className="text-xs font-medium text-notion-text dark:text-white/80 w-12 shrink-0">{(data.raw_properties?.['% Facturado']?.formula?.number * 100 || 0).toFixed(0)}%</span>
                    <div className="grow max-w-[120px]">
                      <ProgressBar value={(data.raw_properties?.['% Facturado']?.formula?.number || 0) * 100} color="#2ea043" />
                    </div>
                  </div>
                </div>

                <PropertyRow icon="⚖️" label={t('prop_phase')} value={data.raw_properties?.Fase?.status?.name} isTag tagColor={data.raw_properties?.Fase?.status?.color} />

                <PropertyRow icon="👤" label={t('prop_responsable')} value={data.raw_properties?.Propietario?.people?.[0]?.name} isUser />
                
                <PropertyRow icon="🗓️" label="Periodo" value={data.raw_properties?.Periodo?.date ? `${data.raw_properties.Periodo.date.start}${data.raw_properties.Periodo.date.end ? ' → ' + data.raw_properties.Periodo.date.end : ''}` : 'Empty'} />

                <div className="flex items-start gap-4 py-1.5 group/prop">
                  <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                    <div className="relative">
                      <span className="text-sm opacity-70">📝</span>
                      <span className="absolute -top-1 -right-2 bg-purple-500/20 text-purple-400 text-[7px] font-black px-1 rounded-sm uppercase tracking-tighter border border-purple-400/20">AI</span>
                    </div>
                    <span className="text-xs font-medium">{t('summary')}</span>
                  </div>
                  <div className="grow">
                    <p className="text-[13px] text-notion-text dark:text-white/90 leading-relaxed font-medium">
                      {data.raw_properties?.Resumen?.rich_text?.[0]?.plain_text || t('no_summary')}
                    </p>
                  </div>
                </div>

                <PropertyRow icon="↗️" label={t('prop_offer_ref')} value={data.raw_properties?.['Vínculo Ofertas']?.rollup?.array?.[0]?.title?.[0]?.plain_text} isLink />
                
                <PropertyRow icon="Σ" label="Coste interno" value={formatCurrency(data.raw_properties?.['Coste interno (€)']?.formula?.number || data.raw_properties?.['Coste interno (€)']?.number)} isCurrency />

                <div className="flex items-start gap-4 py-1.5 group/prop">
                  <div className="flex items-center gap-2 w-36 shrink-0 text-notion-text-secondary dark:text-gray-400">
                    <span className="text-sm opacity-70">↗️</span>
                    <span className="text-xs font-medium">{t('tech_history')}</span>
                  </div>
                  <div className="grow space-y-1.5">
                    {data.raw_properties?.['Control de horas']?.relation?.length > 0 ? (
                      data.raw_properties['Control de horas'].relation.map((rel, idx) => (
                        <div key={idx} className="text-[13px] text-notion-text dark:text-white/90 border-b border-notion-border dark:border-white/10 hover:border-notion-text dark:hover:border-white transition-colors cursor-pointer inline-flex items-center gap-1.5 w-full">
                           📄 {t('linked_task')}: {rel.id.substring(0, 8)}...
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col gap-1.5 italic text-notion-text-secondary opacity-60">
                         {t('no_hours')}
                      </div>
                    )}
                  </div>
                </div>

                <PropertyRow icon="Σ" label="Margen" value={formatCurrency(data.raw_properties?.['Margen (€)']?.formula?.number)} isCurrency />

                <div className="pt-2">
                   <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="flex items-center gap-2 text-xs text-notion-text-secondary hover:text-notion-text dark:hover:text-gray-300 transition-colors py-1 group"
                   >
                     <svg className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-90'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 8l4 4 4-4H6z"/>
                      </svg>
                      {isExpanded ? 'Show fewer' : 'More properties'}
                   </button>
                </div>

                {isExpanded && (
                  <div className="pt-2 space-y-1.5 border-t border-notion-border dark:border-white/5 mt-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    {Object.entries(data.raw_properties || {})
                      .filter(([key]) => !mainProps.includes(key))
                      .map(([key, prop]) => (
                        <PropertyRow 
                          key={key} 
                          icon="📄" 
                          label={key} 
                          value={
                            prop.type === 'date' ? prop.date?.start :
                            prop.type === 'phone_number' ? prop.phone_number :
                            prop.type === 'email' ? prop.email :
                            prop.type === 'url' ? prop.url :
                            prop.type === 'rich_text' ? prop.rich_text?.[0]?.plain_text :
                            prop.type === 'number' ? prop.number :
                            null
                          } 
                        />
                      ))}
                  </div>
                )}
              </div>

              {/* Tareas Section - COLLAPSIBLE */}
              <section className="mt-6">
                <button 
                  onClick={() => setIsTasksOpen(!isTasksOpen)}
                  className="flex items-center gap-2 mb-4 group w-full text-left"
                >
                  <svg className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isTasksOpen ? 'rotate-90' : 'rotate-0'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 8l4 4 4-4H6z"/>
                  </svg>
                  <span className="text-xl">✅</span>
                  <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('tasks')}</h3>
                </button>
                
                {isTasksOpen && (
                  <div className="space-y-1 pl-6 border-l border-notion-border dark:border-white/10 animate-in fade-in slide-in-from-top-1 duration-300">
                     {data.related_tasks?.length > 0 ? (
                       data.related_tasks.map(task => (
                          <div key={task.id} className="flex items-center justify-between py-2 group hover:bg-black/5 dark:hover:bg-white/[0.03] px-2 -mx-2 rounded transition-colors cursor-default">
                              <div className="flex items-center gap-3">
                                <span className="text-lg opacity-40">📓</span>
                                <span className="text-[13px] text-notion-text dark:text-white/90 border-b border-notion-border dark:border-white/10 hover:border-notion-text dark:hover:border-white transition-colors">
                                  {task.properties?.['Nombre de la tarea']?.title?.[0]?.plain_text || t('unassigned')}
                                </span>
                                <span 
                                  className="px-2 py-0.5 rounded text-[10px] font-medium" 
                                  style={{ 
                                    background: getNotionColor(task.properties?.['Estado']?.status?.color, true),
                                    color: getNotionColor(task.properties?.['Estado']?.status?.color, false)
                                  }}
                                >
                                  {task.properties?.['Estado']?.status?.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-notion-bg-light dark:bg-gray-700 flex items-center justify-center text-[9px] font-bold text-notion-text-secondary dark:text-gray-300 uppercase">
                                      {(task.properties?.['Responsable']?.people?.[0]?.name || '?').charAt(0)}
                                    </div>
                                    <span className="text-[11px] text-notion-text-secondary dark:text-gray-500 whitespace-nowrap">
                                      {task.properties?.['Responsable']?.people?.[0]?.name || t('unassigned')}
                                    </span>
                                  </div>
                              </div>
                          </div>
                        ))
                     ) : (
                       <p className="text-xs text-notion-text-secondary dark:text-gray-500 italic py-2">{t('no_tasks')}</p>
                     )}
                  </div>
                )}
              </section>

              {/* Interacciones Section - COLLAPSIBLE */}
              <section className="mt-6 border-t border-notion-border dark:border-white/10 pt-6">
                <button 
                  onClick={() => setIsInteractionsOpen(!isInteractionsOpen)}
                  className="flex items-center gap-2 mb-4 group w-full text-left"
                >
                  <svg className={`w-4 h-4 text-notion-text-secondary dark:text-gray-500 transition-transform duration-200 ${isInteractionsOpen ? 'rotate-90' : 'rotate-0'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 8l4 4 4-4H6z"/>
                  </svg>
                  <span className="text-xl">🔄</span>
                  <h3 className="text-sm font-bold text-notion-text dark:text-white/80 tracking-tight">{t('interactions')}</h3>
                </button>
                
                {isInteractionsOpen && (
                  <div className="space-y-4 pl-6 border-l border-notion-border dark:border-white/10 animate-in fade-in slide-in-from-top-1 duration-300">
                    {data.page_content?.length > 0 ? (
                      data.page_content.map((block, i) => (
                        <div key={i} className="text-[13px] text-notion-text dark:text-white/80 leading-relaxed">
                          {block.text}
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-notion-text-secondary dark:text-gray-500 italic py-2">No notes.</p>
                    )}
                  </div>
                )}
              </section>
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
