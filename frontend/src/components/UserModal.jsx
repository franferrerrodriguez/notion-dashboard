import { useState, useEffect } from 'react';
import { X, Shield, Mail, Lock, Link as LinkIcon, RefreshCw, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { ROLE_IDS, ROLES } from '../constants/auth';
import { projectService } from '../services/api';

const UserModal = ({ isOpen, onClose, onSubmit, editingUser = null }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role_id: ROLE_IDS.CLIENT,
    external_client_id: '',
    logo_url: '',
    is_active: true
  });
  const [clientOptions, setClientOptions] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      console.error("Error loading client options:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (editingUser) {
      setFormData({
        email: editingUser.email || '',
        password: '', // Don't show old hash
        role_id: editingUser.role === ROLES.ADMIN ? ROLE_IDS.ADMIN : ROLE_IDS.CLIENT,
        external_client_id: editingUser.external_client_id || '',
        logo_url: editingUser.logo_url || '',
        is_active: !!editingUser.is_active
      });
    } else {
      setFormData({
        email: '',
        password: '',
        role_id: ROLE_IDS.CLIENT,
        external_client_id: '',
        logo_url: '',
        is_active: true
      });
    }
  }, [editingUser, isOpen]);

  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-notion-light dark:bg-[#202020] border border-notion-border dark:border-white/10 rounded-3xl w-full max-w-[480px] max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-notion-border dark:border-white/5 flex justify-between items-center bg-notion-bg-light dark:bg-white/2 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-500" />
             </div>
             <div>
                <h2 className="text-lg font-black tracking-tight text-notion-text dark:text-white">
                  {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-widest">
                  Acceso al Portal de Clientes
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
              <p className="text-sm font-black text-notion-text dark:text-white uppercase tracking-widest">Cargando datos</p>
              <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-[0.2em] animate-pulse">Sincronizando con Notion</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar" autoComplete="off">
            {/* Hidden fake fields to trick some password managers */}
            <input type="text" style={{display:'none'}} />
            <input type="password" style={{display:'none'}} />
            <div className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Mail className="w-3 h-3" /> Email
                </label>
                <input 
                  type="email" 
                  required
                  disabled={editingUser?.email === 'root@root.com'}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/30 transition-all font-medium"
                  placeholder="ejemplo@cliente.com"
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                    <Lock className="w-3 h-3" /> {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                  </label>
                  <button 
                    type="button"
                    onClick={generatePassword}
                    className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all active:scale-95"
                  >
                    <RefreshCw className="w-2.5 h-2.5" /> Generar
                  </button>
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'}
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

              {/* Role selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Rol
                </label>
                <select 
                  value={formData.role_id}
                  disabled={editingUser?.email === 'root@root.com'}
                  onChange={(e) => setFormData({...formData, role_id: e.target.value})}
                  className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none font-medium"
                >
                  <option value={ROLE_IDS.ADMIN}>Administrador</option>
                  <option value={ROLE_IDS.CLIENT}>Cliente</option>
                </select>
              </div>

               {/* External Client ID - Client Only */}
               {formData.role_id === ROLE_IDS.CLIENT && (
                 <div className="space-y-1.5 pt-2">
                    <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2">
                        <LinkIcon className="w-3 h-3" /> Cliente Notion (Tag)
                      </span>
                    </label>
                    <select 
                      required
                      value={formData.external_client_id}
                      onChange={(e) => setFormData({...formData, external_client_id: e.target.value})}
                      className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none font-medium"
                    >
                      <option value="">Seleccionar Cliente</option>
                      {clientOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                     <p className="text-[9px] text-notion-text-secondary font-medium pl-1 italic">
                       * Este ID filtrará automáticamente sus proyectos de Notion.
                     </p>
                  </div>
                )}

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
                    {formData.logo_url && (
                      <div className="mt-2 flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-xl border border-notion-border dark:border-white/5">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-notion-border dark:border-white/10 bg-white flex items-center justify-center shrink-0">
                          <img src={formData.logo_url} alt="Preview" className="max-w-full max-h-full object-contain" />
                        </div>
                        <span className="text-[9px] font-black text-notion-text-secondary uppercase tracking-widest">Vista previa del logotipo</span>
                      </div>
                    )}
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
                        <p className="text-[10px] font-black text-notion-text dark:text-white uppercase tracking-widest pl-1">Estado de la cuenta</p>
                        <p className="text-[9px] font-bold text-notion-text-secondary uppercase tracking-widest pl-1">
                          {formData.is_active ? 'El usuario puede acceder' : 'Acceso bloqueado'}
                        </p>
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

            <div className="pt-4 flex gap-3">
               <button 
                 type="button" 
                 onClick={onClose}
                 className="flex-1 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-notion-text-secondary dark:text-white/50 hover:text-notion-text dark:hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-notion-border dark:border-white/5 active:scale-95"
               >
                  Cancelar
               </button>
               <button 
                 type="submit"
                 className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
               >
                  {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserModal;
