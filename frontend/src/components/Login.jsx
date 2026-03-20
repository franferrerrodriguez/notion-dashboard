import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Eye, EyeOff } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      await login(email, password);
    } catch {
      setError(t('login_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-notion-bg-light dark:bg-notion-dark flex flex-col items-center justify-center p-6 selection:bg-blue-500/30 transition-colors duration-300">
      
      {/* Top Navbar for Language/Theme */}
      <div className="fixed top-6 right-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
        <div className="flex bg-white dark:bg-white/5 border border-notion-border dark:border-white/10 rounded-xl p-1 shadow-sm">
          <button 
            onClick={() => setLang('es')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${lang === 'es' ? 'bg-blue-500 text-white shadow-lg' : 'text-notion-text-secondary hover:text-notion-text dark:hover:text-white'}`}
          >
            ES
          </button>
          <button 
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${lang === 'en' ? 'bg-blue-500 text-white shadow-lg' : 'text-notion-text-secondary hover:text-notion-text dark:hover:text-white'}`}
          >
            EN
          </button>
        </div>
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[400px] animate-in fade-in zoom-in duration-500">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-white dark:bg-white/5 border border-notion-border dark:border-white/10 rounded-2xl flex items-center justify-center text-3xl shadow-2xl">
            🚀
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-2xl font-black tracking-tight text-notion-text dark:text-white mb-2">{t('login_title')}</h1>
          <p className="text-notion-text-secondary text-sm font-medium uppercase tracking-[0.2em] transition-colors">{t('login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">{t('login_email')}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white dark:bg-[#202020] border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white/90 placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">{t('login_password')}</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-[#202020] border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white/90 placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium pr-12"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-notion-text-secondary dark:text-gray-500 hover:text-notion-text dark:hover:text-white transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs font-bold text-red-400 animate-in shake duration-500">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : t('login_button')}
          </button>
        </form>

        <div className="mt-12 text-center">
           <p className="text-[10px] text-notion-text-secondary font-bold uppercase tracking-widest opacity-30">
             © 2026 • Notion-Client Dashboard
           </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
