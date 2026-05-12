import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LogOut, ChevronDown, Shield, Globe, Check, Lock } from 'lucide-react';
import { ROLES } from '../constants/auth';
import ConfirmModal from './ConfirmModal';
import ChangePasswordModal from './ChangePasswordModal';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Trigger Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 bg-white dark:bg-white/5 px-3 py-1.5 rounded-2xl border border-notion-border dark:border-white/10 transition-all duration-300 group shadow-sm ${
            isOpen ? 'ring-4 ring-blue-500/10 border-blue-500/50' : 'hover:border-notion-text-secondary/30 dark:hover:border-white/20'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] font-black shadow-lg ring-2 ring-white/5 transform group-hover:scale-105 transition-transform">
            {(user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col items-start mr-1">
            <span className="text-[11px] font-bold text-notion-text dark:text-white/90 leading-tight max-w-[120px] truncate">{user.email}</span>
            <span className="text-[8px] font-black text-notion-text-secondary uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Shield className={`w-2 h-2 ${user.role === ROLES.ADMIN ? 'text-amber-400' : 'text-blue-400'}`} />
              {user.role}
            </span>
          </div>
          <ChevronDown className={`w-3 h-3 text-notion-text-secondary dark:text-white/20 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-500' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-notion-dark border border-notion-border dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 backdrop-blur-xl">
            <div className="px-4 py-3 border-b border-notion-border dark:border-white/5 mb-2">
              <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest mb-1">Account</p>
              <p className="text-xs font-bold text-notion-text dark:text-white/90 truncate">{user.email}</p>
            </div>

            <div className="px-2 py-1.5 border-b border-notion-border dark:border-white/5 mb-1">
              <div className="px-2 py-1 text-[9px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <Globe className="w-2.5 h-2.5" />
                {t('select_lang')}
              </div>
              <div className="flex flex-col gap-0.5 mt-1">
                <button 
                  onClick={() => setLang('es')}
                  className={`flex items-center justify-between w-full px-2 py-1.5 text-xs rounded-md transition-colors ${lang === 'es' ? 'bg-blue-500/10 text-blue-500 font-bold' : 'text-notion-text-secondary hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px]">🇪🇸</span> {t('spanish')}
                  </span>
                  {lang === 'es' && <Check className="w-3 h-3" />}
                </button>
                <button 
                  onClick={() => setLang('en')}
                  className={`flex items-center justify-between w-full px-2 py-1.5 text-xs rounded-md transition-colors ${lang === 'en' ? 'bg-blue-500/10 text-blue-500 font-bold' : 'text-notion-text-secondary hover:bg-black/5 dark:hover:bg-white/5'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[10px]">🇬🇧</span> {t('english')}
                  </span>
                  {lang === 'en' && <Check className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="px-2 py-1 border-b border-notion-border dark:border-white/5 mb-1">
              {user.role === ROLES.ADMIN && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all group mb-1"
                >
                  <Shield className="w-3.5 h-3.5" />
                  {t('admin_panel')}
                </Link>
              )}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setShowChangePassword(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-xs font-bold text-notion-text dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all group"
              >
                <Lock className="w-3.5 h-3.5 text-notion-text-secondary dark:text-gray-500 group-hover:text-blue-500 transition-colors" />
                {t('change_password_title')}
              </button>
            </div>

            <div className="mt-2 pt-1 border-notion-border dark:border-white/5 px-2">
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setShowLogoutConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all group"
              >
                <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                {t('logout')}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        title={t('logout_confirm_title')}
        message={t('logout_confirm_desc')}
        confirmText={t('logout')}
        cancelText={t('cancel')}
      />

      <ChangePasswordModal 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </>
  );
};

export default UserDropdown;
