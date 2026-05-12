import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Shield, Mail, Lock, Link as LinkIcon, RefreshCw, Eye, EyeOff, ExternalLink, AppWindow, FolderOpen, Plus } from 'lucide-react';
import { ROLE_IDS, ROLES } from '../constants/auth';
import { projectService, appService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import UserFilesManager from './UserFilesManager';

const UserModal = ({ isOpen, onClose, onSubmit, editingUser = null }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    role_id: ROLE_IDS.CLIENT,
    external_client_id: '',
    logo_url: '',
    is_active: true,
    app_ids: []
  });
  const [clientOptions, setClientOptions] = useState([]);
  const [availableApps, setAvailableApps] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('info'); // 'info', 'apps', 'files'

  useEffect(() => {
    if (isOpen) {
      loadOptions();
      setActiveTab('info');
    }
  }, [isOpen]);

  const loadOptions = async () => {
    try {
      setLoadingOptions(true);
      const [options, apps] = await Promise.all([
        projectService.getClientOptions(),
        appService.getAll()
      ]);
      setClientOptions(options || []);
      setAvailableApps(apps || []);
    } catch (error) {
      console.error("Error loading options:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email || '',
        name: editingUser.name || '',
        password: '', // Don't show old hash
        role_id: editingUser.role === ROLES.ADMIN ? ROLE_IDS.ADMIN : ROLE_IDS.CLIENT,
        external_client_id: editingUser.external_client_id || '',
        logo_url: editingUser.logo_url || '',
        is_active: !!editingUser.is_active,
        app_ids: editingUser.app_ids || []
      });
    } else {
      setFormData({
        email: '',
        name: '',
        password: '',
        role_id: ROLE_IDS.CLIENT,
        external_client_id: '',
        logo_url: '',
        is_active: true,
        app_ids: availableApps.map(a => a.id) // Default all apps
      });
    }
  }, [editingUser, isOpen, availableApps]);

  useEffect(() => {
    const fileAppId = availableApps.find(a => a.slug === 'file-dashboard')?.id;
    if (activeTab === 'files' && (!formData.app_ids.includes(fileAppId))) {
      setActiveTab('apps');
    }
  }, [formData.app_ids, activeTab, availableApps]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generatePassword = () => {
    const charset = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*";
    let retVal = "";
    for (let i = 0; i < 12; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password: retVal });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-notion-light dark:bg-[#202020] border border-notion-border dark:border-white/10 rounded-3xl w-full max-w-[480px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-notion-border dark:border-white/5 flex justify-between items-center bg-notion-bg-light dark:bg-white/2 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-500" />
             </div>
             <div>
                <h2 className="text-lg font-black tracking-tight text-notion-text dark:text-white">
                  {editingUser ? t('user_edit') : t('user_new')}
                </h2>
                <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-widest">
                  {t('login_subtitle')}
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-notion-text-secondary dark:text-white/20 hover:text-notion-text dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadingOptions ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-black text-notion-text dark:text-white uppercase tracking-widest">{t('loading_data')}</p>
              <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-[0.2em] animate-pulse">{t('settings_loading_msg')}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Tabs */}
            <div className="flex px-8 border-b border-notion-border dark:border-white/5 bg-notion-bg-light dark:bg-white/1">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'info' ? 'border-blue-500 text-blue-500' : 'border-transparent text-notion-text-secondary hover:text-notion-text dark:hover:text-white'}`}
              >
                <Mail className="w-3 h-3" /> {t('summary')}
              </button>
              {formData.role_id === ROLE_IDS.CLIENT && (
                <button
                  type="button"
                  onClick={() => setActiveTab('apps')}
                  className={`py-4 px-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${activeTab === 'apps' ? 'border-blue-500 text-blue-500' : 'border-transparent text-notion-text-secondary hover:text-notion-text dark:hover:text-white'}`}
                >
                  <AppWindow className="w-3 h-3" /> {t('col_apps')}
                </button>
              )}
            </div>

            <div className="p-8 space-y-6 overflow-y-auto custom-scrollbar flex-1">
              {activeTab === 'info' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  {/* Hidden fake fields to trick some password managers */}
                  <input type="text" name="fake-user" style={{display:'none'}} tabIndex="-1" />
                  <input type="password" name="fake-pass" style={{display:'none'}} tabIndex="-1" />
                  <div className="space-y-4">
                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Mail className="w-3 h-3" /> Email
                      </label>
                      <input 
                        type="email" 
                        name="email"
                        required
                        disabled={editingUser?.email === 'root@root.com'}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium"
                        placeholder="ejemplo@cliente.com"
                        autoComplete="username"
                      />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center pr-1">
                        <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                          <Lock className="w-3 h-3" /> {editingUser ? t('user_password_new') : t('user_password')}
                        </label>
                        <button 
                          type="button"
                          onClick={generatePassword}
                          className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all active:scale-95"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> {t('user_generate')}
                        </button>
                      </div>
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          required={!editingUser}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium font-mono pr-12"
                          placeholder="••••••••"
                          autoComplete="new-password"
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

                    {/* Client Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Plus className="w-3 h-3" /> {t('col_name')}
                      </label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium"
                        placeholder="Nombre comercial o personal"
                      />
                    </div>

                    {/* Role selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                        <Shield className="w-3 h-3" /> Rol
                      </label>
                      <select 
                        value={formData.role_id}
                        disabled={editingUser?.email === 'root@root.com'}
                        onChange={(e) => {
                          const newRole = e.target.value;
                          setFormData({...formData, role_id: newRole});
                          if (newRole === ROLE_IDS.ADMIN) {
                            setActiveTab('info');
                          }
                        }}
                        className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none font-medium"
                      >
                        <option value={ROLE_IDS.ADMIN}>{t('admin')}</option>
                        <option value={ROLE_IDS.CLIENT}>{t('prop_client')}</option>
                      </select>
                    </div>


                      {/* Logo URL - Client Only */}
                      {formData.role_id === ROLE_IDS.CLIENT && (
                        <div className="space-y-1.5 pt-2">
                          <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                            <ExternalLink className="w-3 h-3" /> URL del Logotipo
                          </label>
                          <input 
                            type="url" 
                            value={formData.logo_url}
                            onChange={(e) => setFormData({...formData, logo_url: e.target.value})}
                            className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium"
                            placeholder="https://ejemplo.com/logo.png"
                          />
                        </div>
                      )}

                      {/* Status Toggle */}
                      {editingUser && editingUser.email !== 'root@root.com' && (
                        <div className="pt-4 flex items-center justify-between bg-notion-bg-light dark:bg-white/2 p-4 rounded-2xl border border-notion-border dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg border transition-colors ${formData.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                              {formData.is_active ? <Shield className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </div>
                            <div>
                              <p className="text-[10px] font-black text-notion-text dark:text-white uppercase tracking-widest pl-1">{t('col_status')}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ring-2 ring-offset-2 ring-offset-notion-light dark:ring-offset-notion-dark ring-transparent ${formData.is_active ? 'bg-emerald-500' : 'bg-red-500/40'}`}
                            aria-label="Toggle user status"
                          >
                            <span
                              className={`${
                                formData.is_active ? 'translate-x-6' : 'translate-x-1'
                              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {activeTab === 'apps' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-[0.2em] mb-2 pl-1">
                      Selecciona las aplicaciones habilitadas
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {availableApps.map(app => (
                        <div key={app.id} className="space-y-3">
                          <label 
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${formData.app_ids.includes(app.id) ? 'bg-blue-500/5 border-blue-500/30' : 'bg-white dark:bg-white/5 border-notion-border dark:border-white/10 hover:border-notion-text-secondary/30'}`}
                          >
                            <div className={`p-2.5 rounded-xl transition-colors ${formData.app_ids.includes(app.id) ? 'bg-blue-500 text-white' : 'bg-notion-bg-light dark:bg-white/5 text-notion-text-secondary'}`}>
                              {app.slug === 'notion-dashboard' ? <AppWindow className="w-5 h-5" /> : <FolderOpen className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-black text-notion-text dark:text-white uppercase tracking-tight">{app.name}</p>
                              <p className="text-[10px] font-bold text-notion-text-secondary dark:text-white/30 uppercase tracking-widest">{app.description}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${formData.app_ids.includes(app.id) ? 'bg-blue-500 border-blue-500' : 'border-notion-border dark:border-white/20'}`}>
                              {formData.app_ids.includes(app.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                            </div>
                            <input 
                              type="checkbox" 
                              className="hidden" 
                              checked={formData.app_ids.includes(app.id)}
                              onChange={() => {
                                const newAppIds = formData.app_ids.includes(app.id)
                                  ? formData.app_ids.filter(id => id !== app.id)
                                  : [...formData.app_ids, app.id];
                                setFormData({ ...formData, app_ids: newAppIds });
                              }}
                            />
                          </label>

                          {/* Notion Config - Only if app is selected */}
                          {app.slug === 'notion-dashboard' && formData.app_ids.includes(app.id) && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <select 
                                required
                                value={formData.external_client_id}
                                onChange={(e) => setFormData({...formData, external_client_id: e.target.value})}
                                className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-notion-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none font-medium"
                              >
                                <option value="">{t('user_select_client')} (Tag)</option>
                                {clientOptions.map(opt => (
                                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Files App Config - Management directly here */}
                          {app.slug === 'file-dashboard' && formData.app_ids.includes(app.id) && editingUser && (
                            <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-[32px] space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                               <div className="flex items-center justify-between border-b border-blue-500/10 pb-4">
                                  <div className="flex items-center gap-3">
                                     <div className="p-2 bg-blue-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                                        <FolderOpen className="w-4 h-4" />
                                     </div>
                                     <h4 className="text-[10px] font-black text-notion-text dark:text-white uppercase tracking-widest">
                                        {t('mgmt_assets')}
                                     </h4>
                                  </div>
                               </div>
                               <UserFilesManager userId={editingUser.id} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}


            </div>

            {/* Action Buttons - Moved outside scrollable area */}
            <div className="px-8 py-6 border-t border-notion-border dark:border-white/5 bg-notion-bg-light dark:bg-white/2 flex gap-3 shrink-0">
               <button 
                 type="button" 
                 onClick={onClose}
                 className="flex-1 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-notion-text-secondary dark:text-white/50 hover:text-notion-text dark:hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-notion-border dark:border-white/5 active:scale-95"
               >
                  {t('cancel')}
               </button>
               <button 
                 type="submit"
                 className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/20 active:scale-95"
               >
                  {editingUser ? t('save_changes') : t('new_user')}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default UserModal;
