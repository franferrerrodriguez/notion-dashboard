import { useState, useEffect, useMemo } from 'react';
import { Upload, Trash2, File, Download, Loader2, Plus, X, Folder, ChevronRight, ChevronLeft, FileText, Image as ImageIcon, FileVideo, Music, Archive, Grid } from 'lucide-react';
import { fileService } from '../services/api';
import { useToast } from '../context/NotificationContext';

const UserFilesManager = ({ userId }) => {
  const { toast } = useToast();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPath, setCurrentPath] = useState([]); // Current Path (Array)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [localFolders, setLocalFolders] = useState(new Set());

  const currentPathString = useMemo(() => {
    return Array.isArray(currentPath) ? currentPath.join('/') : '';
  }, [currentPath]);

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
      const pathString = (Array.isArray(currentPath) && currentPath.length > 0) ? currentPath.join('/') : 'General';
      await fileService.upload(userId, file, pathString);
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

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const newPath = [...(Array.isArray(currentPath) ? currentPath : []), newFolderName].join('/');
    setLocalFolders(prev => new Set([...prev, newPath]));
    setNewFolderName('');
    setShowNewFolderInput(false);
    toast.success('Carpeta creada virtualmente (se confirmará al subir archivos)');
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName, category) => {
    const name = fileName?.toLowerCase() || '';
    const cat = category?.toLowerCase() || '';
    
    if (name.endsWith('.pdf')) return <div className="w-full h-full bg-red-500 rounded-lg flex items-center justify-center text-white p-1.5"><FileText className="w-full h-full" /></div>;
    if (/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name)) return <div className="w-full h-full bg-purple-500 rounded-lg flex items-center justify-center text-white p-1.5"><ImageIcon className="w-full h-full" /></div>;
    if (/\.(mp4|mov|avi|wmv)$/i.test(name)) return <div className="w-full h-full bg-indigo-500 rounded-lg flex items-center justify-center text-white p-1.5"><FileVideo className="w-full h-full" /></div>;
    if (/\.(mp3|wav|ogg)$/i.test(name)) return <div className="w-full h-full bg-amber-500 rounded-lg flex items-center justify-center text-white p-1.5"><Music className="w-full h-full" /></div>;
    if (/\.(zip|rar|7z|tar|gz)$/i.test(name)) return <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center text-white p-1.5"><Archive className="w-full h-full" /></div>;
    if (/\.(xls|xlsx|csv|ods)$/i.test(name)) return <div className="w-full h-full bg-emerald-500 rounded-lg flex items-center justify-center text-white p-1.5"><Grid className="w-full h-full" /></div>;
    
    if (cat.includes('image')) return <div className="w-full h-full bg-purple-500 rounded-lg flex items-center justify-center text-white p-1.5"><ImageIcon className="w-full h-full" /></div>;
    if (cat.includes('pdf')) return <div className="w-full h-full bg-red-500 rounded-lg flex items-center justify-center text-white p-1.5"><FileText className="w-full h-full" /></div>;
    
    return <div className="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center text-white p-1.5"><File className="w-full h-full" /></div>;
  };

  // Directory Logic
  const folders = new Set();
  const currentFiles = [];

  // Add virtual local folders
  localFolders.forEach(path => {
    if (path.startsWith(currentPathString + (currentPathString ? '/' : ''))) {
      const remainingPath = path.slice(currentPathString.length + (currentPathString ? 1 : 0));
      const parts = remainingPath.split('/');
      if (parts[0]) folders.add(parts[0]);
    }
  });

  files.forEach(file => {
    const category = file.category || 'General';
    if (category === currentPathString || (category === 'General' && currentPathString === '')) {
      currentFiles.push(file);
    } else if (category.startsWith(currentPathString + (currentPathString ? '/' : ''))) {
      const remainingPath = category.slice(currentPathString.length + (currentPathString ? 1 : 0));
      const parts = remainingPath.split('/');
      if (parts[0]) folders.add(parts[0]);
    }
  });

  const enterFolder = (name) => {
    setCurrentPath(prev => Array.isArray(prev) ? [...prev, name] : [name]);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest">Cargando archivos...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-black/2 dark:bg-white/2 p-4 rounded-2xl border border-notion-border dark:border-white/5 space-y-4">
        {/* Row 1: Simplified Navigation */}
        <div className="flex items-center gap-4">
          {Array.isArray(currentPath) && currentPath.length > 0 && (
            <button 
              type="button"
              onClick={() => setCurrentPath(prev => Array.isArray(prev) ? prev.slice(0, -1) : [])}
              className="p-2 bg-white dark:bg-white/5 rounded-xl border border-notion-border dark:border-white/10 text-notion-text-secondary hover:text-blue-500 transition-all active:scale-90"
              title="Volver"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h3 className="text-sm font-black text-notion-text dark:text-white uppercase tracking-tight">
              {(Array.isArray(currentPath) && currentPath.length > 0) ? currentPath[currentPath.length - 1] : 'Inicio'}
            </h3>
            {Array.isArray(currentPath) && currentPath.length > 0 && (
              <p className="text-[9px] font-bold text-notion-text-secondary uppercase tracking-widest opacity-60">
                {currentPath.join(' / ')}
              </p>
            )}
          </div>
        </div>

        <div className="h-px bg-notion-border/50 dark:bg-white/5"></div>

        {/* Row 2: Actions */}
        <div className="flex items-center justify-end gap-2">
          {showNewFolderInput ? (
              <div className="flex items-center gap-2 animate-in slide-in-from-right-2">
                <input 
                  autoFocus
                  type="text"
                  placeholder="Nombre carpeta..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  className="bg-white dark:bg-notion-dark border border-notion-border dark:border-white/10 rounded-lg px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest w-32 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                />
                <button type="button" onClick={handleCreateFolder} className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
                  <Plus className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => setShowNewFolderInput(false)} className="p-1.5 bg-notion-bg-light dark:bg-white/5 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => setShowNewFolderInput(true)}
                className="flex items-center gap-2 bg-notion-bg-light dark:bg-white/5 hover:bg-blue-500/10 text-notion-text-secondary hover:text-blue-500 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all"
              >
                <Folder className="w-3 h-3" />
                Nueva Carpeta
              </button>
            )}

            <label className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              Subir
              <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
        </div>

        {currentFiles.length === 0 && folders.size === 0 ? (
        <label 
          className="flex flex-col items-center justify-center py-16 bg-black/2 dark:bg-white/2 rounded-[32px] border-2 border-dashed border-notion-border dark:border-white/10 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group"
        >
          <div className="p-4 bg-notion-bg-light dark:bg-white/5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-500">
            <Upload className="w-8 h-8 text-notion-text-secondary dark:text-white/20 group-hover:text-blue-500" />
          </div>
          <p className="text-xs font-black text-notion-text dark:text-white uppercase tracking-widest mb-1">Pulsa o arrastra archivos aquí</p>
          <p className="text-[10px] font-bold text-notion-text-secondary dark:text-white/20 uppercase tracking-widest">Sube documentos a esta ubicación</p>
          <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      ) : (
        <div className="grid grid-cols-1 gap-2">
          {/* Folders */}
          {Array.from(folders).map(name => (
            <div key={name} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-2xl border border-notion-border dark:border-white/10 group hover:border-blue-500/30 transition-all cursor-pointer" onClick={() => enterFolder(name)}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 shrink-0 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 relative">
                  <Folder className="w-4 h-4 fill-current opacity-20" />
                  <Folder className="w-4 h-4 absolute" />
                </div>
                <div>
                  <p className="text-xs font-black text-notion-text dark:text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                    {name}
                  </p>
                  <p className="text-[8px] font-bold text-notion-text-secondary dark:text-white/20 uppercase tracking-widest">
                    Directorio
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-notion-text-secondary/20 group-hover:text-blue-500/50 transition-colors" />
            </div>
          ))}

          {/* Files */}
          {currentFiles.map(file => (
            <div key={file.id} className="flex items-center justify-between p-3 bg-white dark:bg-white/5 rounded-2xl border border-notion-border dark:border-white/10 group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 shrink-0">
                  {getFileIcon(file.original_name, file.category)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-notion-text dark:text-white truncate uppercase tracking-tight">
                    {file.original_name}
                  </p>
                  <p className="text-[8px] font-bold text-notion-text-secondary dark:text-white/30 uppercase tracking-widest">
                    {formatSize(file.file_size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a 
                  href={fileService.getDownloadUrl(file.id)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-1.5 hover:bg-blue-500/10 rounded-lg text-notion-text-secondary dark:text-white/30 hover:text-blue-500 transition-colors"
                  title="Descargar"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
                <button 
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                  className="p-1.5 hover:bg-red-500/10 rounded-lg text-notion-text-secondary dark:text-white/30 hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
