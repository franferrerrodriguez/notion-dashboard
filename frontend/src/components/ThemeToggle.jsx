import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-2xl bg-white/10 dark:bg-white/5 border border-notion-border dark:border-white/10 text-notion-text dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-90 group relative overflow-hidden"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative z-10 transition-transform duration-500 group-hover:rotate-12">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 fill-amber-400/20" />
        ) : (
          <Moon className="w-5 h-5 text-indigo-600 fill-indigo-600/10" />
        )}
      </div>

      {/* Background glow effect */}
      <div
        className={`absolute inset-0 opacity-20 blur-xl transition-all duration-500 ${
          theme === 'dark' ? 'bg-orange-500 scale-150' : 'bg-blue-500 scale-0'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
