import { useLanguage } from '../context/LanguageContext';
import { AlertCircle, X, Trash2 } from 'lucide-react';

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  confirmText,
  cancelText,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 overflow-hidden animate-in fade-in duration-300">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[4px] transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-notion-dark w-full max-w-md rounded-3xl shadow-2xl border border-notion-border dark:border-white/10 p-8 transform transition-all animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`w-12 h-12 rounded-2xl ${type === 'danger' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'} flex items-center justify-center border`}
          >
            {type === 'danger' ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tight text-notion-text dark:text-white leading-tight">
              {title}
            </h3>
          </div>
        </div>

        <p className="text-notion-text-secondary dark:text-gray-400 text-sm font-medium leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-xl text-xs font-bold text-notion-text-secondary dark:text-gray-400 bg-notion-bg-light dark:bg-white/5 border border-notion-border dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all active:scale-95"
          >
            {cancelText || t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest text-white ${type === 'danger' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'} transition-all shadow-lg active:scale-95`}
          >
            {confirmText || t('confirm')}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-notion-text-secondary dark:text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ConfirmModal;
