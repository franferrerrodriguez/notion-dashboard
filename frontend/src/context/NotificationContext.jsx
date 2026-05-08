import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const toast = useMemo(() => {
    const t = (message, type) => addNotification(message, type);
    t.success = (message) => addNotification(message, 'success');
    t.error = (message) => addNotification(message, 'error');
    return t;
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
          <div 
            key={n.id}
            className={`pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl animate-in slide-in-from-right-8 duration-500 ${
              n.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                : 'bg-red-500/10 border-red-500/20 text-red-500'
            }`}
          >
            {n.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            <span className="text-[11px] font-black uppercase tracking-widest">{n.message}</span>
            <button 
              onClick={() => removeNotification(n.id)}
              className="ml-2 p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useToast must be used within a NotificationProvider');
  return context;
};
