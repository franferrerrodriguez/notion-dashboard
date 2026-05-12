import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { projectService, appService, fileService } from '../services/api';
import { useToast } from '../context/NotificationContext';

export function useDashboardData(activeTab = null, viewUserId = null) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const clientId = user?.external_client_id;
  const userId = user?.id;
  
  const targetUserId = viewUserId || userId;

  // Projects Query
  const projectsQuery = useQuery({
    queryKey: ['projects', clientId, viewUserId],
    queryFn: ({ signal }) => projectService.getAll(clientId, 'projects', signal, viewUserId),
    enabled: !!(clientId || viewUserId),
  });

  // Offers Query
  const offersQuery = useQuery({
    queryKey: ['offers', clientId, viewUserId],
    queryFn: ({ signal }) => projectService.getAll(clientId, 'offers', signal, viewUserId),
    enabled: !!(clientId || viewUserId),
  });

  // Invoices Query
  const invoicesQuery = useQuery({
    queryKey: ['invoices', clientId, viewUserId],
    queryFn: ({ signal }) => projectService.getAll(clientId, 'invoices', signal, viewUserId),
    enabled: !!(clientId || viewUserId),
  });

  // Tasks Query
  const tasksQuery = useQuery({
    queryKey: ['tasks', clientId, viewUserId],
    queryFn: ({ signal }) => projectService.getAll(clientId, 'tasks', signal, viewUserId),
    enabled: !!(clientId || viewUserId),
  });

  // Apps Query
  const appsQuery = useQuery({
    queryKey: ['apps', targetUserId, viewUserId],
    queryFn: () => appService.getForUser(targetUserId, clientId, viewUserId),
    enabled: !!targetUserId,
  });

  // Files Query
  const filesQuery = useQuery({
    queryKey: ['files', targetUserId, viewUserId],
    queryFn: () => fileService.getForUser(targetUserId, clientId, viewUserId),
    enabled: !!targetUserId,
  });

  // Unread Status Query
  const unreadStatusQuery = useQuery({
    queryKey: ['unreadStatus', clientId, viewUserId],
    queryFn: ({ signal }) => projectService.getUnreadStatus(clientId, signal, viewUserId),
    enabled: !!(clientId || viewUserId),
    refetchInterval: 30000, // Refresh every 30s
  });

  // Client Info Query (for logo and branding if viewing as client)
  const clientInfoQuery = useQuery({
    queryKey: ['clientInfo', clientId, viewUserId],
    queryFn: ({ signal }) => projectService.getClientInfo(clientId, signal, viewUserId),
    enabled: !!(clientId || viewUserId),
  });

  // Mutations for notifications
  const markReadMutation = useMutation({
    mutationFn: (itemId) => projectService.markRead(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadStatus'] });
      toast.success('Notificación marcada como leída');
    },
    onError: () => {
      toast.error('Error al actualizar notificación');
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => projectService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreadStatus'] });
      toast.success('Todas las notificaciones marcadas como leídas');
    },
    onError: () => {
      toast.error('Error al actualizar notificaciones');
    }
  });

  return {
    projects: projectsQuery.data?.data || [],
    offers: offersQuery.data?.data || [],
    invoices: invoicesQuery.data?.data || [],
    tasks: tasksQuery.data?.data || [],
    apps: appsQuery.data || [],
    files: filesQuery.data || [],
    unreadStatus: unreadStatusQuery.data || { count: 0, has_unread: false, items: [] },
    unreadItems: unreadStatusQuery.data?.items || [],
    unreadCount: unreadStatusQuery.data?.count || 0,
    clientInfo: clientInfoQuery.data || null,
    isLoading:
      projectsQuery.isLoading ||
      offersQuery.isLoading ||
      invoicesQuery.isLoading ||
      tasksQuery.isLoading ||
      appsQuery.isLoading ||
      filesQuery.isLoading ||
      unreadStatusQuery.isLoading ||
      clientInfoQuery.isLoading,
    isTabLoading:
      (activeTab === 'PROJECTS' && projectsQuery.isLoading) ||
      (activeTab === 'OFFERS' && offersQuery.isLoading) ||
      (activeTab === 'INVOICES' && invoicesQuery.isLoading) ||
      (activeTab === 'CALENDAR' && (tasksQuery.isLoading || projectsQuery.isLoading)),
    isError:
      projectsQuery.isError ||
      offersQuery.isError ||
      invoicesQuery.isError ||
      tasksQuery.isError,
    handleMarkAllRead: markAllReadMutation.mutate,
    markNotificationAsRead: (item) => markReadMutation.mutate(item.id),
    refetchUnread: unreadStatusQuery.refetch,
    loadingUnread: unreadStatusQuery.isLoading || markReadMutation.isPending || markAllReadMutation.isPending,
    viewUserId,
    user,
  };
}
