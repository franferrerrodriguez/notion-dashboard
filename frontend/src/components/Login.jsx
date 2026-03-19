import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck,
  Languages,
  AlertCircle
} from 'lucide-react';

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
    } catch (err) {
      setError(err.message || t('login_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-notion-bg-light dark:bg-notion-dark p-6 transition-colors duration-500">
      <div className="w-full max-w-[440px] bg-white dark:bg-[#1a1a1a] border border-notion-border dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] p-10 animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
        
        {/* Background Accent */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center mb-10 relative">
          <div className="p-3.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 shadow-inner group transition-all hover:scale-105">
            <Lock className="w-8 h-8 text-blue-500 group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-black/5 dark:bg-white/5 rounded-xl border border-notion-border dark:border-white/5">
            {['es', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-widest ${
                  lang === l
                    ? 'bg-white dark:bg-[#252525] text-blue-500 shadow-sm border border-notion-border dark:border-white/10'
                    : 'text-notion-text-secondary hover:text-notion-text dark:hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-10">
          <h1 className="text-3xl font-black text-notion-text dark:text-white mb-2 tracking-tight">
            {t('login_title') || 'Panel de Gestión'}
          </h1>
          <p className="text-notion-text-secondary dark:text-white/50 text-[11px] font-bold uppercase tracking-[0.2em]">
            {t('login_subtitle') || 'Acceso Clientes Notion'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
              <Mail className="w-3 h-3" />
              Email
            </label>
            <div className="relative group">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-notion-bg-light dark:bg-white/[0.02] border border-notion-border dark:border-white/5 rounded-2xl px-5 py-4 text-sm text-notion-text dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all placeholder:text-notion-text-secondary/30"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3" />
              {t('password') || 'Contraseña'}
            </label>
            <div className="relative group">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-notion-bg-light dark:bg-white/[0.02] border border-notion-border dark:border-white/5 rounded-2xl px-5 py-4 text-sm text-notion-text dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all placeholder:text-notion-text-secondary/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-notion-text-secondary hover:text-blue-500 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98] mt-6 flex items-center justify-center gap-3 group"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {t('login_button') || 'Iniciar Sesión'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-notion-border dark:border-white/5 flex flex-col items-center gap-3 text-center opacity-60">
          <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-notion-text-secondary">
            <Languages className="w-3 h-3" />
            Sistema Seguro e Internacionalizado
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
