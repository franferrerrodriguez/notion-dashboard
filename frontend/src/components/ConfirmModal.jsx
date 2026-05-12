import { Loader2 } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

/**
 * A reusable, minimalist confirmation modal component.
 * Uses React Portal to ensure it renders above all other elements.
 */
const ConfirmModal = React.memo(({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, isLoading = false }) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-10000 flex items-center justify-center p-4 overflow-hidden">
      {/* Subtle Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Minimalist Modal Content */}
      <div className="relative bg-white dark:bg-notion-dark w-full max-w-[380px] rounded-3xl shadow-2xl border border-notion-border dark:border-white/5 p-8 transform transition-all animate-in zoom-in-95 duration-200">
        
        <div className="text-center mb-8">
          <h3 className="text-lg font-black tracking-tight text-notion-text dark:text-white uppercase mb-2">
            {title}
          </h3>
          <p className="text-xs font-medium text-notion-text-secondary dark:text-white/40 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions - Minimalist Row */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-notion-text-secondary dark:text-white/40 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-white bg-red-600 hover:bg-red-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
});

ConfirmModal.displayName = 'ConfirmModal';

export default ConfirmModal;
