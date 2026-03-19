import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ChevronDown, 
  LogOut, 
  Languages, 
  KeyRound,
  Shield,
  User as UserIcon
} from 'lucide-react';
import ConfirmModal from './ConfirmModal';
import ChangePasswordModal from './ChangePasswordModal';

const UserDropdown = () => {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-4 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 group border border-transparent hover:border-notion-border dark:hover:border-white/10"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
          <UserIcon className="w-4.5 h-4.5" />
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-black text-notion-text dark:text-white leading-tight">
            {user.email.split('@')[0]}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Shield className="w-2.5 h-2.5 text-blue-500" />
            <p className="text-[9px] font-bold text-notion-text-secondary uppercase tracking-widest leading-none">
              {user.role}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-notion-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-64 bg-white dark:bg-[#1a1a1a] border border-notion-border dark:border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-4 py-3 border-b border-notion-border dark:border-white/5 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-3.5 h-3.5 text-blue-500" />
                <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pt-0.5">
                  {t('select_lang')}
                </p>
              </div>
              <div className="flex gap-1.5">
                {['es', 'en'].map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      setIsOpen(false);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-widest ${
                      lang === l
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/10'
                        : 'bg-black/5 dark:bg-white/5 text-notion-text-secondary hover:text-notion-text dark:hover:text-white'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowPasswordModal(true);
                }}
                className="w-full px-3.5 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-notion-text-secondary dark:text-white/60 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/5 rounded-xl transition-all flex items-center gap-3.5 group"
              >
                <div className="p-1.5 bg-blue-500/5 rounded-lg group-hover:bg-blue-500/10 border border-blue-500/0 group-hover:border-blue-500/10 transition-all">
                  <KeyRound className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                </div>
                {t('change_password_title')}
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full px-3.5 py-2.5 text-left text-[11px] font-black uppercase tracking-widest text-red-500/80 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all flex items-center gap-3.5 group mt-1"
              >
                <div className="p-1.5 bg-red-500/5 rounded-lg group-hover:bg-red-500/10 border border-red-500/0 group-hover:border-red-500/10 transition-all">
                  <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                </div>
                {t('logout')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title={t('logout_confirm_title')}
        message={t('logout_confirm_desc')}
      />

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};

export default UserDropdown;
