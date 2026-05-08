import { useState, useEffect } from 'react';
import { File, Download, Loader2, Search, Filter, Maximize2, Grid, List as ListIcon, FileText, Image as ImageIcon, FileVideo, Music, Archive, MoreVertical, Eye } from 'lucide-react';
import { fileService } from '../services/api';
import FilePreviewModal from './FilePreviewModal';

const FileDashboardView = ({ userId, externalClientId }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    loadFiles();
  }, [userId, externalClientId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const data = await fileService.getForUser(userId, externalClientId);
      setFiles(data || []);
    } catch (error) {
      console.error("Error loading files:", error);
    } finally {
      setLoading(false);
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
    
    if (cat.includes('image')) {
      return (
        <div className="w-full h-full bg-purple-500 rounded-lg flex items-center justify-center text-white p-2">
          <ImageIcon className="w-full h-full" />
        </div>
      );
    }
    if (cat.includes('pdf')) {
      return (
        <div className="w-full h-full bg-red-500 rounded-lg flex items-center justify-center text-white p-2">
          <FileText className="w-full h-full" />
        </div>
      );
    }
    if (cat.includes('spreadsheet') || cat.includes('excel') || cat.includes('csv')) {
      return (
        <div className="w-full h-full bg-emerald-500 rounded-lg flex items-center justify-center text-white p-2">
          <Grid className="w-full h-full" />
        </div>
      );
    }
    if (cat.includes('video')) {
      return (
        <div className="w-full h-full bg-indigo-500 rounded-lg flex items-center justify-center text-white p-2">
          <FileVideo className="w-full h-full" />
        </div>
      );
    }
    if (cat.includes('audio')) {
      return (
        <div className="w-full h-full bg-amber-500 rounded-lg flex items-center justify-center text-white p-2">
          <Music className="w-full h-full" />
        </div>
      );
    }
    if (cat.includes('archive') || cat.includes('zip')) {
      return (
        <div className="w-full h-full bg-gray-600 rounded-lg flex items-center justify-center text-white p-2">
          <Archive className="w-full h-full" />
        </div>
      );
    }
    
    // Default / Generic
    return (
      <div className="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center text-white p-2">
        <File className="w-full h-full" />
      </div>
    );
  };

  const filteredFiles = files.filter(f => 
    f.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-notion-text-secondary animate-in fade-in duration-700">
      <div className="relative">
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500/10 rounded-full animate-ping"></div>
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin relative z-10"></div>
      </div>
      <p className="text-[10px] font-black text-notion-text-secondary dark:text-gray-400 uppercase tracking-[0.3em] animate-pulse">
        Cargando tus documentos
      </p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Search & Filter & View Toggle */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white dark:bg-white/5 p-6 rounded-[32px] border border-notion-border dark:border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="relative w-full lg:w-[450px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-text-secondary dark:text-white/20" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-notion-bg-light dark:bg-notion-dark border border-notion-border dark:border-white/5 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-notion-text-secondary/40"
          />
        </div>
        
        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center gap-2 bg-notion-bg-light dark:bg-notion-dark p-1.5 rounded-2xl border border-notion-border dark:border-white/5">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-white/10 text-blue-500 shadow-lg' : 'text-notion-text-secondary hover:text-notion-text dark:hover:text-white'}`}
              title="Vista de cuadrícula"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-white/10 text-blue-500 shadow-lg' : 'text-notion-text-secondary hover:text-notion-text dark:hover:text-white'}`}
              title="Vista de lista"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="h-8 w-px bg-notion-border dark:bg-white/10 hidden lg:block"></div>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20">
              <Filter className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black text-notion-text dark:text-white uppercase tracking-widest">
              {filteredFiles.length} Archivos
            </span>
          </div>
        </div>
      </div>

      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 bg-white dark:bg-white/2 rounded-[48px] border border-notion-border dark:border-white/5 shadow-2xl">
          <div className="w-24 h-24 bg-blue-500/5 rounded-[40px] flex items-center justify-center mb-8 animate-bounce duration-3000">
            <File className="w-12 h-12 text-blue-500/10" />
          </div>
          <p className="text-base font-black text-notion-text dark:text-white uppercase tracking-[0.2em] mb-2">No hay resultados</p>
          <p className="text-[11px] font-bold text-notion-text-secondary dark:text-white/20 uppercase tracking-[0.3em]">Prueba con otro nombre o categoría</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredFiles.map(file => (
            <div 
              key={file.id} 
              className="bg-white dark:bg-linear-to-br dark:from-[#202020] dark:to-[#1a1a1a] rounded-[32px] p-6 border border-notion-border dark:border-white/10 shadow-xl hover:shadow-2xl hover:translate-y-[-4px] transition-all group relative overflow-hidden cursor-pointer"
              onClick={() => setSelectedFile(file)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform duration-700 group-hover:scale-150"></div>
              
              <div className="flex items-start justify-between mb-8 relative">
                <div className="w-10 h-10">
                  {getFileIcon(file.category)}
                </div>
                <div className="flex items-center gap-2 transition-opacity duration-300">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }}
                    className="p-3 bg-white dark:bg-white/10 hover:bg-blue-500 text-notion-text-secondary dark:text-gray-400 hover:text-white rounded-xl shadow-lg transition-all"
                    title="Previsualizar"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <a 
                    href={fileService.getDownloadUrl(file.id)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-3 bg-white dark:bg-white/10 hover:bg-blue-500 text-notion-text-secondary dark:text-gray-400 hover:text-white rounded-xl shadow-lg transition-all active:scale-90"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="space-y-2 relative">
                <h4 className="text-xs font-black text-notion-text dark:text-white uppercase tracking-tight line-clamp-1 group-hover:text-blue-500 transition-colors">
                  {file.original_name}
                </h4>
                <div className="flex items-center justify-between pt-2">
                   <span className="px-2 py-1 bg-notion-bg-light dark:bg-white/5 rounded-lg text-[8px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-widest border border-notion-border dark:border-white/5">
                     {file.category}
                   </span>
                   <span className="text-[9px] font-bold text-notion-text-secondary dark:text-white/20 uppercase tracking-widest">
                     {formatSize(file.file_size)}
                   </span>
                </div>
                <div className="pt-3 border-t border-notion-border/50 dark:border-white/5 flex justify-between items-center">
                  <p className="text-[8px] font-bold text-notion-text-secondary dark:text-white/10 uppercase tracking-widest">
                    {new Date(file.uploaded_at).toLocaleDateString()}
                  </p>
                  <MoreVertical className="w-3 h-3 text-notion-text-secondary/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-[40px] border border-notion-border dark:border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-notion-border dark:border-white/5 bg-notion-bg-light dark:bg-white/1">
                <th className="px-8 py-5 text-[10px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-[0.2em]">Nombre</th>
                <th className="px-6 py-5 text-[10px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-[0.2em] hidden sm:table-cell">Categoría</th>
                <th className="px-6 py-5 text-[10px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-[0.2em] hidden md:table-cell">Modificado</th>
                <th className="px-6 py-5 text-[10px] font-black text-notion-text-secondary dark:text-gray-500 uppercase tracking-[0.2em] hidden lg:table-cell text-right">Tamaño</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border dark:divide-white/5">
              {filteredFiles.map(file => (
                <tr 
                  key={file.id} 
                  className="hover:bg-blue-500/2 dark:hover:bg-blue-500/5 transition-colors cursor-pointer group"
                  onClick={() => setSelectedFile(file)}
                >
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 shrink-0">
                        {getFileIcon(file.category)}
                      </div>
                      <div>
                        <p className="text-xs font-black text-notion-text dark:text-white uppercase tracking-tight group-hover:text-blue-500 transition-colors">
                          {file.original_name}
                        </p>
                        <p className="text-[9px] font-bold text-notion-text-secondary dark:text-white/20 sm:hidden">
                          {file.category} • {formatSize(file.file_size)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className="px-2.5 py-1 bg-notion-bg-light dark:bg-white/5 rounded-lg text-[9px] font-black text-notion-text-secondary dark:text-gray-400 uppercase tracking-widest border border-notion-border dark:border-white/5">
                      {file.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-[10px] font-bold text-notion-text-secondary dark:text-white/20 uppercase tracking-widest">
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-right">
                    <p className="text-[10px] font-bold text-notion-text-secondary dark:text-white/20 uppercase tracking-widest">
                      {formatSize(file.file_size)}
                    </p>
                  </td>
                  <td className="px-8 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 transition-all">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(file); }}
                        className="p-2 hover:bg-blue-500/10 rounded-lg text-notion-text-secondary dark:text-gray-400 hover:text-blue-500 transition-all"
                        title="Ver"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a 
                        href={fileService.getDownloadUrl(file.id)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 hover:bg-blue-500/10 rounded-lg text-notion-text-secondary dark:text-gray-400 hover:text-blue-500 transition-all"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Preview Modal */}
      {selectedFile && (
        <FilePreviewModal 
          file={selectedFile} 
          onClose={() => setSelectedFile(null)} 
        />
      )}
    </div>
  );
};

export default FileDashboardView;

