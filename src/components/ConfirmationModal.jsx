import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '¿Estás seguro?', 
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Eliminar',
  cancelText = 'Cancelar',
  variant = 'danger' // 'danger' | 'warning'
}) {
  if (!isOpen) return null;

  const variantClasses = {
    danger: {
      icon: 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400',
      button: 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500 focus:ring-red-500',
    },
    warning: {
      icon: 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-500 focus:ring-amber-500',
    }
  };

  const styles = variantClasses[variant] || variantClasses.danger;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-800 max-w-md w-full relative z-10 animate-scale-up transition-colors duration-300">
        {/* Cabecera */}
        <div className="p-6 pb-0 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${styles.icon}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">{message}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botones */}
        <div className="p-6 pt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold text-white ${styles.button} shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
