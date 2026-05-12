import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages/Views
import AdminPanel from './AdminPanel.jsx';
import Login from './components/Login.jsx';
import { ROLES } from './constants/auth';
import Dashboard from './Dashboard.jsx';

import { NotificationProvider } from './context/NotificationContext';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-notion-dark">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const basename = import.meta.env.VITE_ROUTER_BASENAME || '/';

  return (
    <BrowserRouter basename={basename}>
      <NotificationProvider>
        <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />

        {/* Main Route: Conditional redirect based on role */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === ROLES.ADMIN ? (
              <Navigate to="/admin" replace />
            ) : (
              <Dashboard />
            )
          }
        />

        {/* Dashboard for Clients */}
        <Route
          path="/dashboard"
          element={user?.role === ROLES.CLIENT ? <Dashboard /> : <Navigate to="/" replace />}
        />

        {/* Admin Panel for Admins */}
        <Route
          path="/admin"
          element={user?.role === ROLES.ADMIN ? <AdminPanel /> : <Navigate to="/" replace />}
        />

        {/* View As Client functionality for Admins */}
        <Route
          path="/view-as/:viewUserId"
          element={user?.role === ROLES.ADMIN ? <Dashboard /> : <Navigate to="/" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;
