import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { userService } from '../services/api';
import { useToast } from '../context/NotificationContext';

/**
 * Custom hook to manage Admin Users state and API mutations.
 * Centralizes all React Query logic and local modal state for User management.
 */
export const useAdminUsers = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Local State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Queries
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-apps']);
      setIsModalOpen(false);
      toast.success('Usuario creado correctamente');
    },
    onError: () => {
      toast.error('Error al crear el usuario');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => userService.update(editingUser.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      queryClient.invalidateQueries(['user-apps']);
      setIsModalOpen(false);
      setEditingUser(null);
      toast.success('Usuario actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el usuario');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      toast.success('Usuario eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el usuario');
    }
  });

  // Handlers
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

  return {
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
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    deleteUser: deleteMutation.mutate
  };
};
