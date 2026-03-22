import { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user is already logged in
    authService
      .me()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    // Clear any previous data for the new user
    queryClient.clear();
    return data;
  };

  const logout = async () => {
    // 1. Optimistic UI update: Clear local state immediately for instant feedback
    setUser(null);
    queryClient.clear();

    try {
      // 2. Perform backend cleanup in the background
      await authService.logout();
    } catch (err) {
      // We log but don't block the UI, as the user is effectively "logged out" locally
      console.error('Background logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
