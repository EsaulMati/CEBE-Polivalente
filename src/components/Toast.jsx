import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

function ToastItem({ toast, onRemove }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />,
  };

  const bgClasses = {
    success: 'bg-emerald-900/90 border-emerald-700/50 text-emerald-100',
    error: 'bg-red-900/90 border-red-700/50 text-red-100',
    info: 'bg-slate-800/90 border-slate-600/50 text-slate-100',
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl min-w-[300px] max-w-md animate-toast-in ${bgClasses[toast.type] || bgClasses.info}`}
    >
      {icons[toast.type] || icons.info}
      <span className="text-sm font-semibold flex-1">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-white/50 hover:text-white/90 transition-colors cursor-pointer flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Contenedor flotante de toasts */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
