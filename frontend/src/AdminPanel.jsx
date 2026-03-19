import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, settingsService } from './services/api';
import {
  UserPlus,
  Trash2,
  Shield,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Pencil,
  Settings,
  AlertTriangle,
} from 'lucide-react';
import UserDropdown from './components/UserDropdown';
import UserModal from './components/UserModal';
import SettingsModal from './components/SettingsModal';
import ConfirmModal from './components/ConfirmModal';
import ThemeToggle from './components/ThemeToggle';
import { ROLES } from './constants/auth';

const AdminPanel = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.get,
  });

  const isConfigured = settings?.notion_integration_token && settings?.notion_database_id;

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => userService.update(editingUser.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsModalOpen(false);
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => queryClient.invalidateQueries(['users']),
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data) => {
    if (editingUser) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-notion-light dark:bg-notion-dark gap-4 transition-colors">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-notion-text-secondary animate-pulse uppercase tracking-widest">
          Cargando Usuarios
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
              <h1 className="text-4xl font-black tracking-tight mb-1">Panel de Administración</h1>
              <p className="text-notion-text-secondary font-medium uppercase text-[10px] tracking-[0.3em]">
                Gestión de Accesos & Usuarios
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
              Listado de Acceso
            </span>
          </div>
          <div className="flex items-center gap-4">
            {isConfigured ? (
              <button
                onClick={handleOpenCreate}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl ring-2 ring-blue-500/10"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Nuevo Usuario
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">
                  Configuración Requerida
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
              title="Configuración de Notion"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="overflow-hidden rounded-3xl bg-white dark:bg-white/[0.02] border border-notion-border dark:border-white/5 backdrop-blur-md shadow-2xl transition-colors">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-notion-border dark:border-white/5 bg-notion-bg-light dark:bg-white/[0.03]">
                <th className="py-5 px-8 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest">
                  Email
                </th>
                <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                  Rol
                </th>
                <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                  Estado
                </th>
                <th className="py-5 px-4 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-center">
                  Vinculación Notion
                </th>
                <th className="py-5 px-8 text-[11px] font-black text-notion-text-secondary dark:text-white/40 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border dark:divide-white/5">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all group"
                >
                  <td className="py-6 px-8">
                    <span className="font-bold text-sm text-notion-text dark:text-white/90">
                      {u.email}
                    </span>
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
                    {u.role === ROLES.CLIENT ? (
                      <div className="flex flex-col items-center gap-1">
                        <code className="text-[10px] font-bold text-blue-500 bg-blue-500/5 px-3 py-1 rounded-lg border border-blue-500/10 uppercase tracking-wider">
                          {u.external_client_id || '-'}
                        </code>
                      </div>
                    ) : (
                      <span className="text-notion-text-secondary/20 dark:text-white/10 text-xs">
                        -
                      </span>
                    )}
                  </td>
                  <td className="py-6 px-8 text-right">
                    <div className="flex justify-end gap-3 transition-all">
                      {u.role === ROLES.CLIENT && u.external_client_id && (
                        <button
                          onClick={() => {
                            const isProd = import.meta.env.PROD;
                            const path = isProd
                              ? `/test/frontend/view-as/${u.external_client_id}`
                              : `/view-as/${u.external_client_id}`;
                            window.open(path, '_blank');
                          }}
                          title="Ver Dashboard como Cliente"
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
        onConfirm={() => {
          if (userToDelete) {
            deleteMutation.mutate(userToDelete.id);
            setIsDeleteModalOpen(false);
            setUserToDelete(null);
          }
        }}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario ${userToDelete?.email}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default AdminPanel;
