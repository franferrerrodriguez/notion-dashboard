import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
// Lucide icons removed for diagnosis

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-notion-bg-light dark:bg-notion-dark p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] border border-notion-border dark:border-white/10 rounded-3xl shadow-2xl p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
            <span data-testid="lock-icon">🔒</span>
          </div>
          <div className="flex gap-2">
            {['es', 'en'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === l
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-black/5 dark:bg-white/5 text-notion-text-secondary'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-black text-notion-text dark:text-white mb-2 tracking-tight">
          {t('login.title')}
        </h1>
        <p className="text-notion-text-secondary dark:text-gray-400 text-sm font-medium mb-8">
          {t('login.subtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="admin@example.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
              {t('login.password')}
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 mt-4"
          >
            {isLoading ? t('login.loading') : t('login.button')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
