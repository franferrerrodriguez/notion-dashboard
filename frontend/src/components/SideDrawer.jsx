import { useState, useEffect } from 'react';
import { projectService } from '../services/api';

const SideDrawer = ({ project, isOpen, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && project) {
      loadDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, project]);

  const loadDetails = async () => {
    setLoading(true);
    try {
      const data = await projectService.getProjectDetails(project.id);
      setDetails(data);
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white dark:bg-notion-dark shadow-2xl z-50 animate-in slide-in-from-right duration-500 overflow-y-auto">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-notion-text dark:text-white">
            {project?.name || 'Detalles del Proyecto'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/5 rounded-full transition-colors font-bold"
          >
            <span data-testid="x-icon">✕</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p
              className="text-[10px] font-bold text-notion-text-secondary uppercase tracking-widest"
              data-testid="loading-text"
            >
              Cargando...
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {details ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-black/5 rounded-2xl">
                    <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest mb-1">
                      Estado
                    </p>
                    <p className="text-sm font-bold text-notion-text">{details.status || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-black/5 rounded-2xl">
                    <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest mb-1">
                      Fecha
                    </p>
                    <p className="text-sm font-bold text-notion-text">{details.date || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-black/5 rounded-2xl">
                    <p className="text-[10px] font-black text-notion-text-secondary uppercase tracking-widest mb-1">
                      Prioridad
                    </p>
                    <p className="text-sm font-bold text-notion-text">
                      {details.priority || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-notion-text uppercase tracking-widest mb-4">
                    Descripción
                  </h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-notion-bg-light p-6 rounded-2xl border border-notion-border">
                    {details.description || 'Sin descripción'}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-notion-text-secondary py-10">
                No se pudieron cargar los detalles
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideDrawer;
