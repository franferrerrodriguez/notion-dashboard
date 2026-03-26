import { ChevronRight } from 'lucide-react';
import { PHASE_COLORS } from '../../constants/theme';
import { getMetaValue, resolveAllLinkedInvoices, resolveRelationNames } from '../../utils/notionHelpers';
import ProgressBar from '../ProgressBar';
import { StatusBadge } from './DashboardUI';

const OffersListView = ({ 
  grouped, 
  onSelectProject, 
  projects,
  invoices,
  reverseInvoiceMap,
  t 
}) => {
  const columns = [
    { key: 'code', label: t('col_code'), align: 'left', width: 'w-[200px]' },
    { key: 'project', label: t('col_project'), align: 'left', width: 'w-[250px]' },
    { key: 'date', label: t('col_date'), align: 'center', width: 'w-[110px]' },
    { key: 'status', label: t('col_status'), align: 'center', width: 'w-[150px]' },
    { key: 'amount_net', label: t('col_amount_net'), align: 'right', width: 'w-[120px]' },
    { key: 'progress', label: '%', align: 'center', width: 'w-[110px]' },
    { key: 'linked_invoices', label: t('col_linked_invoices'), align: 'left', width: 'w-[220px]' },
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
                {items.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-notion-light dark:hover:bg-white/5 cursor-pointer transition-colors group"
                    onClick={() => onSelectProject(offer.id)}
                  >
                    <td className="py-5 px-8">
                      <span className="font-bold text-sm text-notion-text dark:text-white/90 group-hover:text-blue-500 transition-colors truncate block">
                        {offer.identification?.name || t('unnamed')}
                      </span>
                    </td>
                    <td className="py-5 px-4 truncate max-w-[250px]" title={offer.identification?.project_name || resolveRelationNames(offer.identification?.project_relation, 'project', projects)}>
                       <span className="text-[11px] font-bold uppercase tracking-tight text-notion-text-secondary dark:text-white/40 truncate block">
                         {offer.identification?.project_name || resolveRelationNames(offer.identification?.project_relation, 'project', projects)}
                       </span>
                    </td>
                    <td className="py-5 px-4 text-center text-[10px] font-bold text-notion-text-secondary dark:text-white/30 tracking-widest">
                       {getMetaValue(offer, 'Fecha') || '-'}
                    </td>
                    <td className="py-5 px-4 text-center">
                      <StatusBadge
                        name={offer.status?.main?.name || '-'}
                        color={PHASE_COLORS[offer.status?.main?.name] || '#64748b'}
                      />
                    </td>
                    <td className="py-5 px-4 text-right text-xs font-bold text-notion-text/80 dark:text-white/60">
                      {formatCurrency(getMetaValue(offer, 'Importe neto'))}
                    </td>
                    <td className="py-5 px-4">
                      <ProgressBar
                        value={offer.financials?.billingPercentage || 0}
                        color="#2ea043"
                        showText
                      />
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex flex-wrap gap-1.5 pl-6">
                        {resolveAllLinkedInvoices(offer, invoices, reverseInvoiceMap)
                          .split(', ')
                          .map((text, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-blue-500/5 text-blue-500/80 dark:text-blue-400/80 rounded-md text-[9px] font-black border border-blue-500/10 uppercase tracking-tighter"
                            >
                              {text}
                            </span>
                          ))}
                      </div>
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

export default OffersListView;
