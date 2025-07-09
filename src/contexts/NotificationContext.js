// src/contexts/NotificationContext.js
import React, { useState, useContext, createContext, useCallback } from 'react';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import { uuidv4 } from '../utils/uuid';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {  
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = uuidv4();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);
  
  const toastStyles = {
    success: 'bg-emerald-500 border-emerald-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-amber-500 border-amber-600',
    info: 'bg-sky-500 border-sky-600',
  };
  
  const toastIcons = {
    success: <CheckCircle className="w-5 h-5"/>,
    error: <XCircle className="w-5 h-5"/>,
    warning: <AlertCircle className="w-5 h-5"/>,
    info: <Info className="w-5 h-5"/>,
  }

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 z-50 space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className={`flex items-center gap-3 text-white text-sm font-semibold px-4 py-3 rounded-lg shadow-lg border-b-4 ${toastStyles[toast.type]}`}>
             {toastIcons[toast.type]}
            {toast.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
