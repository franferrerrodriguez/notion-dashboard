import { useTheme } from '../../context/ThemeContext';

export const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2.5 py-4 px-2 border-b-2 transition-all cursor-pointer relative ${
      active
        ? 'border-blue-500 text-blue-500'
        : 'border-transparent text-notion-text-secondary hover:text-notion-text dark:hover:text-white'
    }`}
  >
    <span
      className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100 opacity-50'}`}
    >
      {icon}
    </span>
    <span className="text-xs font-black uppercase tracking-widest text-left whitespace-nowrap">{label}</span>
  </button>
);

export const StatusBadge = ({ name, color, className = '' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border inline-flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${className}`}
      style={{
        backgroundColor: isDark ? `${color}15` : `${color}10`,
        color: isDark ? color : `color-mix(in srgb, ${color}, black 15%)`,
        borderColor: isDark ? `${color}30` : `${color}25`,
      }}
    >
      {name}
    </span>
  );
};

export const LegendItem = ({ color, label, count, icon, t }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="flex items-center gap-4 group cursor-default">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all border"
        style={{
          backgroundColor: isDark ? `${color}15` : `${color}10`,
          color: isDark ? color : `color-mix(in srgb, ${color}, black 15%)`,
          borderColor: isDark ? `${color}30` : `${color}25`,
        }}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest leading-none mb-1 group-hover:text-notion-text dark:group-hover:text-white/70 transition-colors">
          {label}
        </span>
        <span className="text-xs font-bold text-notion-text-secondary/50 dark:text-white/50">
          {count} {t('total').toLowerCase()}
        </span>
      </div>
    </div>
  );
};
