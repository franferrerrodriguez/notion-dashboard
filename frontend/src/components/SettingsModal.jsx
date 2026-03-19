import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { settingsService } from '../services/api';
// Lucide icons removed for diagnosis

const SettingsModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    notion_token: '',
    database_id: '',
  });
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await settingsService.get();
      setSettings({
        notion_token: data.notion_token || '',
        database_id: data.database_id || '',
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await settingsService.update(settings);
      setMessage({ type: 'success', text: t('settings_save_success') });
      setTimeout(() => {
        onClose();
        setMessage({ type: '', text: '' });
      }, 2000);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-notion-dark border border-notion-border dark:border-white/10 rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-notion-border dark:border-white/5 flex justify-between items-center bg-notion-bg-light dark:bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-500">
              <span data-testid="settings-icon">⚙️</span>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-notion-text dark:text-white">
                Configuración Global
              </h2>
              <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-widest">
                Notion API & Dashboard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-notion-text-secondary"
          >
            <span data-testid="x-icon">✕</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p
              className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-[0.2em]"
              data-testid="loading-text"
            >
              Obteniendo ajustes
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
                  Notion Integration Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={settings.notion_token}
                    onChange={(e) => setSettings({ ...settings, notion_token: e.target.value })}
                    className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white"
                    placeholder="secret_..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    aria-label="Toggle Token Visibility"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-notion-text-secondary hover:text-indigo-500"
                  >
                    {showToken ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
                  Database ID
                </label>
                <input
                  type="text"
                  value={settings.database_id}
                  onChange={(e) => setSettings({ ...settings, database_id: e.target.value })}
                  className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white"
                  placeholder="32 chars ID..."
                />
              </div>
            </div>

            {message.text && (
              <div
                className={`p-4 rounded-xl text-xs font-bold text-center animate-in slide-in-from-top-2 ${
                  message.type === 'success'
                    ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-notion-text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest border border-notion-border"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
              >
                {isSaving ? 'Guardando...' : 'Aplicar Cambios'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
