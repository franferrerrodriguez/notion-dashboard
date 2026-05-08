import { useState, useEffect } from 'react';
import { Upload, Trash2, File, Download, Loader2, Plus, X } from 'lucide-react';
import { fileService } from '../services/api';
import { useToast } from '../context/NotificationContext';

const UserFilesManager = ({ userId }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (userId) {
      loadFiles();
    }
  }, [userId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await fileService.getForUser(userId);
      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      await fileService.upload(userId, file);
      toast.success('Archivo subido correctamente');
      loadFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este archivo?")) return;

    try {
      await fileService.delete(fileId);
      toast.success('Archivo eliminado');
      loadFiles();
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error('Error al eliminar el archivo');
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (category) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('image')) return <div className="w-full h-full bg-purple-500 rounded-lg flex items-center justify-center text-white p-1.5"><ImageIcon className="w-full h-full" /></div>;
    if (cat.includes('pdf')) return <div className="w-full h-full bg-red-500 rounded-lg flex items-center justify-center text-white p-1.5"><FileText className="w-full h-full" /></div>;
    if (cat.includes('spreadsheet') || cat.includes('excel') || cat.includes('csv')) return <div className="w-full h-full bg-emerald-500 rounded-lg flex items-center justify-center text-white p-1.5"><Grid className="w-full h-full" /></div>;
    if (cat.includes('video')) return <div className="w-full h-full bg-indigo-500 rounded-lg flex items-center justify-center text-white p-1.5"><FileVideo className="w-full h-full" /></div>;
    if (cat.includes('archive') || cat.includes('zip')) return <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center text-white p-1.5"><Archive className="w-full h-full" /></div>;
    return <div className="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center text-white p-1.5"><File className="w-full h-full" /></div>;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest">Cargando archivos...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest pl-1">
          Archivos del Usuario ({files.length})
        </h3>
        <label className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
          Subir Archivo
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>

      {files.length === 0 ? (
        <label 
          className="flex flex-col items-center justify-center py-16 bg-black/2 dark:bg-white/2 rounded-[32px] border-2 border-dashed border-notion-border dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group"
          onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-500/10'); }}
          onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10'); }}
          onDrop={(e) => {
            e.preventDefault();
            e.currentTarget.classList.remove('border-blue-500', 'bg-blue-500/10');
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleUpload({ target: { files: e.dataTransfer.files } });
            }
          }}
        >
          <div className="p-4 bg-notion-bg-light dark:bg-white/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
            <Upload className="w-8 h-8 text-notion-text-secondary dark:text-white/20 group-hover:text-blue-500" />
          </div>
          <p className="text-xs font-black text-notion-text dark:text-white uppercase tracking-widest mb-1">Pulsa o arrastra archivos aquí</p>
          <p className="text-[10px] font-bold text-notion-text-secondary dark:text-white/20 uppercase tracking-widest">Sube documentos para este cliente</p>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {files.map(file => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-2xl border border-notion-border dark:border-white/10 group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-8 h-8 shrink-0">
                  {getFileIcon(file.category)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-notion-text dark:text-white truncate uppercase tracking-tight">
                    {file.original_name}
                  </p>
                  <p className="text-[9px] font-bold text-notion-text-secondary dark:text-white/30 uppercase tracking-widest">
                    {formatSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a 
                  href={fileService.getDownloadUrl(file.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 hover:bg-blue-500/10 rounded-lg text-notion-text-secondary dark:text-white/30 hover:text-blue-500 transition-colors"
                  title="Descargar"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button 
                  type="button"
                  onClick={() => handleDelete(file.id)}
                  className="p-2 hover:bg-red-500/10 rounded-lg text-notion-text-secondary dark:text-white/30 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFilesManager;
