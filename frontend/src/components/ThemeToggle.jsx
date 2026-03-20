import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group relative overflow-hidden"
      aria-label="Alternar tema"
    >
      <div className="relative w-5 h-5">
        <Sun 
          className={`w-5 h-5 text-amber-400 absolute transition-all duration-500 transform ${
            theme === 'dark' ? 'translate-y-10 opacity-0 rotate-90' : 'translate-y-0 opacity-100 rotate-0'
          }`} 
        />
        <Moon 
          className={`w-5 h-5 text-blue-400 absolute transition-all duration-500 transform ${
            theme === 'light' ? '-translate-y-10 opacity-0 -rotate-90' : 'translate-y-0 opacity-100 rotate-0'
          }`} 
        />
      </div>
      
      {/* Subtle hover glow */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none blur-xl ${
        theme === 'dark' ? 'bg-blue-500/20' : 'bg-amber-500/10'
      }`}></div>
    </button>
  );
};

export default ThemeToggle;
