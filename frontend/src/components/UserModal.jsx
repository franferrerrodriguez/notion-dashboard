import { useState, useEffect } from 'react';
import { ROLE_IDS, ROLES } from '../constants/auth';
import { projectService } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Shield, X, RefreshCw, Eye, EyeOff } from 'lucide-react';

const UserModal = ({ isOpen, onClose, onSubmit, editingUser = null }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role_id: ROLE_IDS.CLIENT,
    external_client_id: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadClientOptions();
    }
  }, [isOpen]);

  const loadClientOptions = async () => {
    try {
      setLoadingOptions(true);
      const options = await projectService.getClientOptions();
      setClientOptions(options || []);
    } catch (error) {
      console.error('Error loading client options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email || '',
        password: '',
        role_id: editingUser.role === ROLES.ADMIN ? ROLE_IDS.ADMIN : ROLE_IDS.CLIENT,
        external_client_id: editingUser.external_client_id || '',
      });
    } else {
      setFormData({
        email: '',
        password: '',
        role_id: ROLE_IDS.CLIENT,
        external_client_id: '',
      });
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const generatePassword = () => {
    const charset = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*';
    let retVal = '';
    for (let i = 0; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData({ ...formData, password: retVal });
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-notion-dark border border-notion-border dark:border-white/10 rounded-3xl w-full max-w-[480px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-notion-border dark:border-white/5 flex justify-between items-center bg-notion-bg-light dark:bg-white/[0.01]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-notion-text dark:text-white">
              {editingUser ? t('user_edit') : t('user_new')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-notion-text-secondary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadingOptions ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p
              className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest"
              data-testid="loading-title"
            >
              {t('user_loading_data')}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6" autoComplete="off">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
                  {t('user_email')}
                </label>
                <input
                  type="email"
                  required
                  disabled={editingUser?.email === 'root@root.com'}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white"
                  placeholder="ejemplo@cliente.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
                    {editingUser ? t('user_password_new') : t('user_password')}
                  </label>
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {t('user_generate')}
                  </button>
                </div>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 pr-16 py-3 text-sm text-notion-text dark:text-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-notion-text-secondary/40 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
                  {t('user_role')}
                </label>
                <select
                  value={formData.role_id}
                  disabled={editingUser?.email === 'root@root.com'}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white appearance-none cursor-pointer"
                >
                  <option value={ROLE_IDS.ADMIN}>Administrador</option>
                  <option value={ROLE_IDS.CLIENT}>Cliente</option>
                </select>
              </div>

              {formData.role_id === ROLE_IDS.CLIENT && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
                    {t('user_client_tag')}
                  </label>
                  <select
                    required
                    value={formData.external_client_id}
                    onChange={(e) =>
                      setFormData({ ...formData, external_client_id: e.target.value })
                    }
                    className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">{t('user_select_client')}</option>
                    {clientOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-notion-text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest border border-notion-border dark:border-white/5 transition-all active:scale-95"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                aria-label="Submit User"
                className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
              >
                {editingUser ? t('save_changes') : t('user_new')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserModal;
