import React, { useState } from 'react';
import { X, Lock, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { authService } from '../services/api';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error'

  if (!isOpen) return null;

  const generatePassword = () => {
    const charset = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%&*";
    let retVal = "";
    for (let i = 0; i < 12; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setPassword(retVal);
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await authService.updatePassword(password);
      setStatus('success');
      setTimeout(() => {
        onClose();
        setStatus(null);
        setPassword('');
      }, 2000);
    } catch (error) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-notion-light dark:bg-[#202020] border border-notion-border dark:border-white/10 rounded-3xl w-full max-w-[400px] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-notion-border dark:border-white/5 flex justify-between items-center bg-notion-bg-light dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <Lock className="w-4 h-4 text-blue-500" />
             </div>
             <h2 className="text-sm font-black tracking-tight text-notion-text dark:text-white uppercase">
               Cambiar Contraseña
             </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-notion-text-secondary dark:text-white/20">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center pr-1">
              <label className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1 flex items-center gap-2">
                Nueva Contraseña
              </label>
              <button 
                type="button"
                onClick={generatePassword}
                className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all active:scale-95"
              >
                <RefreshCw className="w-2.5 h-2.5" /> Generar
              </button>
            </div>
            <input 
              type="text"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setStatus(null);
              }}
              className="w-full bg-white dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-xl px-4 py-3 text-sm text-notion-text dark:text-white placeholder:text-notion-text-secondary/30 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          {status === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <p className="text-xs font-bold text-green-500">Contraseña actualizada con éxito</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <p className="text-xs font-bold text-red-500">Error al actualizar la contraseña</p>
            </div>
          )}

          <div className="pt-2 flex gap-3">
             <button 
               type="button" 
               onClick={onClose}
               className="flex-1 py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-notion-text-secondary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
             >
                Cancelar
             </button>
             <button 
               type="submit"
               disabled={!password || loading || status === 'success'}
               className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-95"
             >
                {loading ? 'Guardando...' : 'Actualizar'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
