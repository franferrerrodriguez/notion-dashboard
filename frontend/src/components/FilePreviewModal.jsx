import { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, ImageIcon, Maximize2 } from 'lucide-react';
import { fileService } from '../services/api';

const FilePreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const isImage = file.file_type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.original_name);
  const isPDF = file.file_type === 'application/pdf' || /\.pdf$/i.test(file.original_name);
  const downloadUrl = fileService.getDownloadUrl(file.id);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(isPDF);

  useEffect(() => {
    if (isPDF) {
      setLoadingPdf(true);
      fetch(downloadUrl, { credentials: 'include' })
        .then(res => res.blob())
        .then(blob => {
          // Create a blob URL that forces browser to view it
          const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
          setPdfUrl(url);
          setLoadingPdf(false);
        })
        .catch(err => {
          console.error("Error loading PDF preview:", err);
          setLoadingPdf(false);
        });
    }

    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [isPDF, downloadUrl]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-notion-dark/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-full max-h-[90vh] bg-notion-light dark:bg-[#1a1a1a] rounded-[40px] shadow-2xl border border-notion-border dark:border-white/10 overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-notion-border dark:border-white/5 flex items-center justify-between bg-white dark:bg-white/2">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
              {isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-notion-text dark:text-white uppercase tracking-tight truncate max-w-[200px] sm:max-w-md">
                {file.original_name}
              </h3>
              <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-widest">
                {file.category} • {new Date(file.uploaded_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a 
              href={downloadUrl}
              download={file.original_name}
              className="p-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20 active:scale-90"
              title="Descargar"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-3 bg-notion-bg-light dark:bg-white/5 hover:bg-red-500/10 text-notion-text-secondary hover:text-red-500 rounded-xl transition-all ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Body */}
        <div className="flex-1 bg-black/5 dark:bg-black/20 flex items-center justify-center overflow-auto custom-scrollbar p-4 sm:p-12">
          {isImage ? (
            <img 
              src={downloadUrl} 
              alt={file.original_name} 
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-700"
            />
          ) : isPDF ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {loadingPdf ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest">Preparando vista previa...</p>
                </div>
              ) : pdfUrl ? (
                <iframe 
                  src={`${pdfUrl}#toolbar=0`} 
                  className="w-full h-full rounded-2xl border-none shadow-2xl bg-white"
                  title={file.original_name}
                />
              ) : (
                <p className="text-sm font-bold text-red-400">Error al cargar la vista previa</p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 text-center animate-in slide-in-from-bottom-4">
              <div className="w-32 h-32 bg-white dark:bg-white/5 rounded-[40px] shadow-2xl flex items-center justify-center border border-notion-border dark:border-white/10">
                <FileText className="w-16 h-16 text-notion-text-secondary/20" />
              </div>
              <div>
                <p className="text-lg font-black text-notion-text dark:text-white uppercase tracking-widest mb-2">Vista previa no disponible</p>
                <p className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-[0.2em] mb-8">Este tipo de archivo no admite previsualización directa</p>
                <a 
                  href={downloadUrl}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
                >
                  <Download className="w-5 h-5" /> Descargar para ver
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
