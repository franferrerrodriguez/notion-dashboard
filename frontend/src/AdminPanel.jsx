import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Mail,
  Pencil,
  Settings,
  Shield,
  Trash2,
  UserPlus,
  XCircle,
  AppWindow,
  FolderOpen
} from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from './components/ConfirmModal';
import SettingsModal from './components/SettingsModal';
import ThemeToggle from './components/ThemeToggle';
import UserDropdown from './components/UserDropdown';
import UserModal from './components/UserModal';
import { ROLES } from './constants/auth';
import { useLanguage } from './context/LanguageContext';
import { settingsService, appService } from './services/api';
import { useAdminUsers } from './hooks/useAdminUsers';

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    users,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    isDeleteModalOpen,
    setIsDeleteModalOpen,
    editingUser,
    userToDelete,
    setUserToDelete,
    handleOpenCreate,
    handleOpenEdit,
    handleModalSubmit,
    deleteUser
  } = useAdminUsers();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  });

  const { data: availableApps = [] } = useQuery({
    queryKey: ['apps-all'],
    queryFn: () => appService.getAll(),
  });

  const isConfigured = 
    settings?.notion_integration_token && 
    settings?.notion_projects_database_id &&
    settings?.notion_offers_database_id &&
    settings?.notion_invoices_database_id &&
    settings?.notion_tasks_database_id;

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-notion-light dark:bg-notion-dark gap-4 transition-colors">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-black text-notion-text-secondary animate-pulse uppercase tracking-[0.2em]">
          {t('loading_users')}
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-notion-light dark:bg-notion-dark text-notion-text dark:text-white p-8 font-sans selection:bg-blue-500/30 transition-colors">
      <header className="max-w-6xl mx-auto mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="flex justify-between items-end mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 shadow-inner">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight mb-1">{t('admin_panel')}</h1>
              <p className="text-notion-text-secondary font-bold uppercase text-[10px] tracking-[0.3em]">
                {t('access_mgmt')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
        <div className="flex justify-between items-center mb-6 px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
            <span className="text-[10px] font-black text-notion-text-secondary uppercase tracking-[0.2em]">
              {t('user_list')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isConfigured ? (
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ring-2 ring-blue-500/10"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {t('new_user')}
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                  {t('config_required')}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 ${
                !isConfigured
                  ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20 animate-bounce'
                  : 'bg-white dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 border-notion-border dark:border-white/10 text-notion-text-secondary dark:text-white/40 hover:text-blue-500 hover:border-blue-500/30'
              }`}
              title={t('notion_config')}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-white/2 border border-notion-border dark:border-notion-border-dark backdrop-blur-md shadow-2xl transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-notion-border dark:border-notion-border-dark bg-notion-bg-light dark:bg-white/3">
                <th className="py-5 px-8 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest">
                  {t('col_email')}
                </th>
                <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                  {t('col_role')}
                </th>
                <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                  {t('col_status')}
                </th>
                <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                  {t('col_apps')}
                </th>
                <th className="py-5 px-8 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-right">
                  {t('col_actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border dark:divide-white/5">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-black/2 dark:hover:bg-white/4 transition-all group"
                >
                  <td className="py-6 px-8">
                    <div className="flex items-center gap-4">
                      {u.logo_url ? (
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-notion-border dark:border-white/5 bg-white flex items-center justify-center shrink-0 shadow-sm">
                          <img
                            src={u.logo_url}
                            alt="Logo"
                            className="max-w-full max-h-full object-contain p-1"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-notion-border dark:border-white/5 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-notion-text-secondary dark:text-gray-500" />
                        </div>
                      )}
                      <span className="font-bold text-sm text-notion-text dark:text-white/90">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <span
                      className={`text-[9px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                        u.email === 'root@root.com'
                          ? 'bg-purple-500/10 border-purple-500/20 text-purple-400'
                          : u.role === ROLES.ADMIN
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                      }`}
                    >
                      {u.email === 'root@root.com' ? 'Root' : u.role}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <div className="flex justify-center">
                      {u.is_active ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500/50" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500/50" />
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-4 text-center">
                    <div className="flex justify-center gap-2">
                      {u.role === ROLES.CLIENT ? (
                        u.app_ids.length > 0 ? (
                          u.app_ids.map(appId => {
                            const app = availableApps.find(a => a.id === appId);
                            if (!app) return null;
                            const shortName = app.slug === 'notion-dashboard' ? 'Project DB' : t('app_files_short');
                            return (
                              <div key={appId} className="relative group/app">
                                <span className="text-[9px] font-black px-3 py-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 text-blue-500 uppercase tracking-widest transition-all hover:bg-blue-500 hover:text-white cursor-default">
                                  {shortName}
                                </span>
                                
                                {/* Custom Tooltip (Optional now but kept for description) */}
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover/app:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl translate-y-1 group-hover/app:translate-y-0">
                                  {app.name}
                                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-white"></div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-[10px] font-bold text-notion-text-secondary/30 uppercase tracking-widest">{t('none')}</span>
                        )
                      ) : (
                        <span className="text-[9px] font-black px-3 py-1.5 rounded-lg border border-notion-border dark:border-white/10 bg-black/5 dark:bg-white/5 text-notion-text-secondary dark:text-white/30 uppercase tracking-widest">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex justify-end gap-3 transition-all relative">
                      {u.role === ROLES.CLIENT && u.external_client_id && (
                        <button
                          onClick={() => {
                            const baseUrl = window.location.origin;
                            const routerBasename = import.meta.env.VITE_ROUTER_BASENAME || '';
                            const path = `${baseUrl}${routerBasename.endsWith('/') ? routerBasename.slice(0, -1) : routerBasename}/view-as/${u.id}`;
                            window.open(path, '_blank');
                          }}
                          title={t('view_as_client')}
                          className="p-2.5 bg-blue-500/5 hover:bg-blue-500/10 rounded-xl border border-blue-500/10 transition-colors text-blue-500/50 hover:text-blue-400"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-notion-border dark:border-white/5 transition-colors text-notion-text-secondary dark:text-white/50 hover:text-notion-text dark:hover:text-white"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      {u.email !== 'root@root.com' && (
                        <button
                          onClick={() => {
                            setUserToDelete(u);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-2.5 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 transition-colors text-red-500/50 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingUser={editingUser}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          setIsSettingsOpen(false);
          queryClient.invalidateQueries(['settings']);
        }}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={() => deleteUser(userToDelete?.id)}
        title={t('delete_user_title')}
        message={t('delete_user_confirm').replace('{email}', userToDelete?.email || '')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
      />
    </div>
  );
};

export default AdminPanel;
