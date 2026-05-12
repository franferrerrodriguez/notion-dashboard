import { X, LogOut, Loader2 } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

/**
 * A reusable, accessible confirmation modal component.
 * Uses React Portal to ensure it renders above all other elements.
 */
const ConfirmModal = React.memo(({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isLoading = false }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Overlay with high backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white dark:bg-[#1a1a1a] w-full max-w-md rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-notion-border dark:border-white/10 p-8 transform transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        
        {/* Header/Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-[28px] bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-6 shadow-inner">
            <LogOut className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-notion-text dark:text-white leading-tight mb-3">
            {title}
          </h3>
          <p className="text-notion-text-secondary dark:text-gray-400 text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full py-4 px-6 flex items-center justify-center gap-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-white bg-red-600 hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
            {confirmText}
          </button>
          
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-[0.2em] text-notion-text-secondary dark:text-gray-400 bg-black/5 dark:bg-white/5 border border-notion-border dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>
        </div>

        {/* Close Button Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-notion-text-secondary dark:text-gray-500 hover:text-notion-text dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal;
