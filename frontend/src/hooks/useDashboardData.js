import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ROLES } from '../constants/auth';
import { useAuth } from '../context/AuthContext';
import { projectService } from '../services/api';

const TABS = {
  CALENDAR: 'CALENDAR',
  PROJECTS: 'PROJECTS',
  OFFERS: 'OFFERS',
  INVOICES: 'INVOICES',
};

export const useDashboardData = (activeTab) => {
  const { user } = useAuth();
  const { clientId } = useParams();

  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadItems, setUnreadItems] = useState([]);
  const [loadingUnread, setLoadingUnread] = useState(false);

  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const effectiveClientId = user?.role === ROLES.ADMIN && clientId ? clientId : null;

  const { data: projectsResponse, isLoading: loadingProjects } = useQuery({
    queryKey: ['notion_data', user?.id, effectiveClientId, TABS.PROJECTS],
    queryFn: ({ signal }) => projectService.getAll(effectiveClientId, TABS.PROJECTS.toLowerCase(), signal),
    enabled: !!user,
  });
  const projects = projectsResponse?.data || [];

  const { data: offersResponse, isLoading: loadingOffers } = useQuery({
    queryKey: ['notion_data', user?.id, effectiveClientId, TABS.OFFERS],
    queryFn: ({ signal }) => projectService.getAll(effectiveClientId, TABS.OFFERS.toLowerCase(), signal),
    enabled: !!user && (activeTab === TABS.OFFERS || activeTab === TABS.INVOICES),
  });
  const offers = offersResponse?.data || [];

  const { data: invoicesResponse, isLoading: loadingInvoices } = useQuery({
    queryKey: ['notion_data', user?.id, effectiveClientId, TABS.INVOICES],
    queryFn: ({ signal }) => projectService.getAll(effectiveClientId, TABS.INVOICES.toLowerCase(), signal),
    enabled: !!user && (activeTab === TABS.INVOICES || activeTab === TABS.OFFERS),
  });
  const invoices = invoicesResponse?.data || [];

  const { data: clientInfo } = useQuery({
    queryKey: ['client_info', effectiveClientId || user?.id],
    queryFn: ({ signal }) => projectService.getClientInfo(effectiveClientId, signal),
    enabled: !!user,
  });

  const refetchUnread = useCallback(async () => {
    setLoadingUnread(true);
    try {
      const status = await projectService.getUnreadStatus(effectiveClientId);
      const items = status.items || [];
      setUnreadItems(items);
      setUnreadCount(items.filter((i) => i.is_unread).length);
    } catch (err) {
      console.error('Failed to refetch unread:', err);
    } finally {
      setLoadingUnread(false);
    }
  }, [effectiveClientId]);

  const markNotificationAsRead = async (item) => {
    const previousItems = [...unreadItems];
    const previousCount = unreadCount;
    
    setUnreadItems(unreadItems.filter(i => i.id !== item.id));
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await projectService.markRead(item.id, item.last_edited_time);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      setUnreadItems(previousItems);
      setUnreadCount(previousCount);
      throw err;
    }
  };

  const handleMarkAllRead = async () => {
    const previousUnreadItems = [...unreadItems];
    const previousUnreadCount = unreadCount;
    
    // Calculate maxTime
    const maxTime = unreadItems.reduce((latest, item) => {
      if (!latest) return item.last_edited_time;
      return new Date(item.last_edited_time) > new Date(latest) ? item.last_edited_time : latest;
    }, null);

    setUnreadItems([]);
    setUnreadCount(0);
    
    try {
      await projectService.markAllRead(maxTime);
      refetchUnread();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      // Rollback
      setUnreadItems(previousUnreadItems);
      setUnreadCount(previousUnreadCount);
    }
  };

  useEffect(() => {
    if (user) refetchUnread();
  }, [user, effectiveClientId, refetchUnread]);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoadingTasks(true);
      try {
        const response = await projectService.getAll(effectiveClientId, 'tasks');
        const taskList = response?.data || response || [];
        setTasks(taskList);
      } catch (err) {
        console.error('Failed to fetch tasks manually:', err);
      } finally {
        setLoadingTasks(false);
      }
    };

    if (user) fetchTasks();
  }, [user, effectiveClientId]);

  const isTabLoading =
    activeTab === TABS.CALENDAR
      ? loadingTasks
      : activeTab === TABS.PROJECTS
        ? loadingProjects
        : activeTab === TABS.OFFERS
          ? loadingOffers || loadingInvoices
          : activeTab === TABS.INVOICES
            ? loadingInvoices || loadingOffers || loadingProjects
            : false;

  return {
    effectiveClientId,
    user,
    projects,
    offers,
    invoices,
    tasks,
    clientInfo,
    unreadItems,
    unreadCount,
    loadingUnread,
    isTabLoading,
    handleMarkAllRead,
    markNotificationAsRead,
    refetchUnread
  };
};
