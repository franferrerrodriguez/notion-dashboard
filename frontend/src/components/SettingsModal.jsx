import { useState, useEffect } from 'react';
import { X, Settings, Database, Key, Save, RefreshCw, CheckCircle2, AlertCircle, Eye, EyeOff, Target, Receipt, CalendarDays } from 'lucide-react';
import { settingsService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const SettingsModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    notion_integration_token: '',
    notion_projects_database_id: '',
    notion_offers_database_id: '',
    notion_invoices_database_id: '',
    notion_tasks_database_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await settingsService.get();
      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      await settingsService.save(settings);
      setStatus('success');
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setSaving(false);
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-notion-dark border border-notion-border dark:border-white/10 rounded-3xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-notion-border dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/1">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Settings className="w-5 h-5 text-indigo-500" />
             </div>
             <div>
                <h2 className="text-sm font-black tracking-tight text-notion-text dark:text-white uppercase px-1">
                  {t('settings_title')}
                </h2>
                <p className="text-[9px] font-bold text-notion-text-secondary uppercase tracking-widest pl-1">{t('settings_subtitle')}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-notion-text-secondary dark:text-white/20">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-6" autoComplete="off">
          {/* Hidden fake fields for accessibility/security */}
          <div style={{ position: 'absolute', top: '-1000px', left: '-1000px', height: '0', width: '0', overflow: 'hidden' }}>
            <input type="text" name="fake-email" tabIndex="-1" />
            <input type="password" name="fake-password" tabIndex="-1" />
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
               <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
               <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest animate-pulse">{t('settings_loading_msg')}</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {/* Integration Token */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Key className="w-3 h-3" /> {t('settings_token_label')}
                  </label>
                  <div className="relative">
                    <input 
                      type={showToken ? 'text' : 'password'}
                      value={settings.notion_integration_token || ''}
                      onChange={(e) => setSettings({...settings, notion_integration_token: e.target.value})}
                      className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono pr-12"
                      placeholder={t('settings_token_placeholder')}
                    />
                    <button
                      type="button"
                      aria-label={showToken ? "Hide password" : "Show password"}
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 text-notion-text-secondary dark:text-gray-500 hover:text-notion-text dark:hover:text-white transition-colors"
                    >
                      {showToken ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Project Database ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Database className="w-3 h-3" /> {t('settings_projects_db_id')}
                  </label>
                  <input 
                    type="text"
                    value={settings.notion_projects_database_id || ''}
                    onChange={(e) => setSettings({...settings, notion_projects_database_id: e.target.value})}
                    className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                    placeholder={t('settings_db_id_placeholder')}
                  />
                </div>

                {/* Offers Database ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Target className="w-3 h-3 text-indigo-500" /> {t('settings_offers_db_id')}
                  </label>
                  <input 
                    type="text"
                    value={settings.notion_offers_database_id || ''}
                    onChange={(e) => setSettings({...settings, notion_offers_database_id: e.target.value})}
                    className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                    placeholder={t('settings_db_id_placeholder')}
                  />
                </div>

                {/* Invoices Database ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Receipt className="w-3 h-3 text-emerald-500" /> {t('settings_invoices_db_id')}
                  </label>
                  <input 
                    type="text"
                    value={settings.notion_invoices_database_id || ''}
                    onChange={(e) => setSettings({...settings, notion_invoices_database_id: e.target.value})}
                    className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                    placeholder={t('settings_db_id_placeholder')}
                  />
                </div>

                {/* Tasks Database ID */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                    <CalendarDays className="w-3 h-3 text-blue-500" /> {t('settings_tasks_db_id')}
                  </label>
                  <input 
                    type="text"
                    value={settings.notion_tasks_database_id || ''}
                    onChange={(e) => setSettings({...settings, notion_tasks_database_id: e.target.value})}
                    className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-2xl px-5 py-3.5 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                  />
                </div>
              </div>

              {status === 'success' && (
                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-top-2 focus:outline-none">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <p className="text-xs font-bold text-emerald-500">{t('settings_save_success')}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-2 focus:outline-none">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-xs font-bold text-red-500">{t('settings_save_error')}</p>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                 <button 
                   type="button" 
                   onClick={onClose}
                   className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-notion-text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                 >
                    {t('close')}
                 </button>
                 <button 
                   type="submit"
                   disabled={saving}
                   className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
                 >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? t('applying') : t('save_changes')}
                 </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
