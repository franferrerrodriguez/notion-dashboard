import { ChevronRight } from 'lucide-react';
import { PHASE_COLORS } from '../../constants/theme';
import ProgressBar from '../ProgressBar';
import { StatusBadge } from './DashboardUI';

const ProjectsListView = ({ 
  grouped, 
  onSelectProject, 
  t 
}) => {
  const columns = [
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

  if (!grouped || Object.keys(grouped).length === 0) return null;

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([phaseName, items]) => (
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

          <div className="overflow-x-auto rounded-3xl bg-white dark:bg-white/5 border border-notion-border dark:border-white/10 shadow-sm transition-all hover:shadow-md">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-notion-border dark:border-white/10 bg-gray-50/50 dark:bg-white/2">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`py-4 ${col.key === 'project' ? 'px-8' : 'px-4'} ${col.width} text-[10px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-[0.2em] ${col.align === 'center' ? 'text-center' : ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-notion-border dark:divide-white/5">
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-notion-light dark:hover:bg-white/5 cursor-pointer transition-colors group"
                    onClick={() => onSelectProject(p.id)}
                  >
                    <td className="py-5 px-8">
                      <span className="font-bold text-sm text-notion-text dark:text-white/90 group-hover:text-blue-500 transition-colors truncate block">
                        {p.identification?.name || t('unnamed')}
                      </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <StatusBadge
                        name={p.status?.phase?.name || '-'}
                        color={PHASE_COLORS[p.status?.phase?.name] || '#64748b'}
                      />
                    </td>
                    <td className="py-5 px-4 capitalize">
                       <ProgressBar
                          value={p.status?.progress || 0}
                          color="#238636"
                          showText
                        />
                    </td>
                    <td className="py-5 px-4">
                      <ProgressBar
                        value={p.financials?.billingPercentage || 0}
                        color="#2ea043"
                        showText
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
};

export default ProjectsListView;
