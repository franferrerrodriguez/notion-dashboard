import { ChevronRight } from 'lucide-react';
import { PHASE_COLORS } from '../../constants/theme';
import { getMetaValue, resolveRelationNames, resolveProjectFromOffer } from '../../utils/notionHelpers';
import { StatusBadge } from './DashboardUI';

const InvoicesListView = ({ 
  grouped, 
  onSelectProject, 
  projects,
  offers,
  t 
}) => {
  const columns = [
    { key: 'code', label: t('col_code'), align: 'left', width: 'w-[180px]' },
    { key: 'offer_link', label: t('col_offer_link'), align: 'left', width: 'w-[200px]' },
    { key: 'project_link', label: t('col_project_link'), align: 'left', width: 'w-[280px]' },
    { key: 'date', label: t('col_date'), align: 'center', width: 'w-[130px]' },
    { key: 'total', label: t('col_amount_invoice'), align: 'right', width: 'w-[140px]' },
    { key: 'status', label: t('col_status'), align: 'center', width: 'w-[160px]' },
    { key: 'quarter', label: t('col_quarter'), align: 'center', width: 'w-[130px]' },
  ];

  if (!grouped || Object.keys(grouped).length === 0) return null;

  const formatCurrency = (value) => 
    new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value || 0);

  return (
    <div className="space-y-12">
      {Object.entries(grouped).map(([statusName, items]) => (
        <section key={statusName} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-4 mb-5">
            <div className="flex items-center gap-2">
              <StatusBadge name={statusName} color={PHASE_COLORS[statusName] || '#64748b'} />
              <span className="text-[10px] font-bold text-notion-text-secondary dark:text-white/20 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-lg border border-notion-border dark:border-white/5">
                {items.length}
              </span>
            </div>
            <div className="h-px bg-notion-border dark:bg-white/5 grow"></div>
            <ChevronRight className="w-4 h-4 text-notion-text-secondary/20" />
          </div>

          <div className="overflow-x-auto rounded-3xl bg-white dark:bg-white/5 border border-notion-border dark:border-white/10 shadow-sm transition-all hover:shadow-md">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-notion-border dark:border-white/10 bg-gray-50/50 dark:bg-white/2">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`py-4 ${col.key === 'code' ? 'px-8' : 'px-4'} ${col.width} text-[10px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-[0.2em] ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''}`}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-notion-border dark:divide-white/5">
                {items.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-notion-light dark:hover:bg-white/5 cursor-pointer transition-colors group"
                    onClick={() => onSelectProject(invoice.id)}
                  >
                    <td className="py-5 px-8">
                      <span className="font-bold text-sm text-notion-text dark:text-white/90 group-hover:text-blue-500 transition-colors truncate block">
                        {invoice.identification?.name || t('unnamed')}
                      </span>
                    </td>
                    <td className="py-5 px-4 truncate max-w-[200px]" title={resolveRelationNames(invoice.identification?.offer_relation, 'offer', projects, offers)}>
                       <span className="text-[11px] font-bold uppercase tracking-tight text-notion-text-secondary dark:text-white/40 truncate block">
                         {resolveRelationNames(invoice.identification?.offer_relation, 'offer', projects, offers)}
                       </span>
                    </td>
                    <td className="py-5 px-4 truncate max-w-[280px]" title={invoice.identification?.project_name || resolveProjectFromOffer(invoice.identification?.offer_relation, projects, offers)}>
                       <span className="text-[11px] font-bold uppercase tracking-tight text-notion-text-secondary dark:text-white/40 truncate block">
                         {invoice.identification?.project_name || resolveProjectFromOffer(invoice.identification?.offer_relation, projects, offers)}
                       </span>
                    </td>
                    <td className="py-5 px-4 text-center text-[10px] font-bold text-notion-text-secondary dark:text-white/50 tracking-widest">
                       {getMetaValue(invoice, 'Fecha factura') || '-'}
                    </td>
                    <td className="py-5 px-4 text-right">
                       <span className="text-xs font-black text-notion-text dark:text-white">
                         {formatCurrency(invoice.financials?.totalOffered)}
                       </span>
                    </td>
                    <td className="py-5 px-4 text-center">
                      <StatusBadge
                        name={invoice.status?.main?.name || '-'}
                        color={PHASE_COLORS[invoice.status?.main?.name] || '#64748b'}
                      />
                    </td>
                    <td className="py-5 px-4 text-center">
                       <span className="text-[10px] font-bold bg-blue-500/5 text-blue-500/80 px-2.5 py-1 rounded-lg border border-blue-500/10 uppercase">
                        {getMetaValue(invoice, 'Trimestre') || '-'}
                       </span>
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

export default InvoicesListView;
