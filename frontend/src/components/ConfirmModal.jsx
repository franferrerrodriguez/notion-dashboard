import React from 'react';
import { X, LogOut } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-300">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-notion-dark w-full max-w-md rounded-3xl shadow-2xl border border-notion-border dark:border-white/10 p-8 transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Header/Icon */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-notion-text dark:text-white leading-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Message */}
        <p className="text-notion-text-secondary dark:text-gray-400 text-sm font-medium leading-relaxed mb-8">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-xl text-xs font-bold text-notion-text-secondary dark:text-gray-400 bg-notion-bg-light dark:bg-white/5 border border-notion-border dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-all shadow-lg shadow-red-500/20 active:scale-95"
          >
            {confirmText}
          </button>
        </div>

        {/* Close Button Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-notion-text-secondary dark:text-gray-500 hover:text-notion-text dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
