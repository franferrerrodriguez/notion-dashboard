import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
// Lucide icons removed for diagnosis

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 group border border-transparent hover:border-notion-border dark:hover:border-white/10"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          {user.email[0].toUpperCase()}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-black text-notion-text dark:text-white leading-tight">
            {user.email.split('@')[0]}
          </p>
          <p className="text-[9px] font-bold text-notion-text-secondary uppercase tracking-widest">
            {user.role}
          </p>
        </div>
        <span data-testid="chevron-icon">▼</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1a1a1a] border border-notion-border dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-notion-border dark:border-white/5 mb-1">
              <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest mb-1">
                Idioma
              </p>
              <div className="flex gap-1">
                {['es', 'en'].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setIsOpen(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                      lang === l
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-black/5 dark:bg-white/5 text-notion-text-secondary hover:text-notion-text dark:hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-3"
            >
              <span data-testid="logout-icon">⏻</span>
              {t('common.logout')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default UserDropdown;
