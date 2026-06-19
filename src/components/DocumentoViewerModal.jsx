import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const DocumentoViewerModal = ({ isOpen, doc, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen && doc) {
      fetchSignedUrl();
    } else {
      setUrl('');
    }
  }, [isOpen, doc]);

  const fetchSignedUrl = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUrl(doc.storage_path, 120);
      if (error) throw error;
      setUrl(data.signedUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !doc) return null;

  const isImage = doc.mime_type?.startsWith('image/') || 
    ['jpg', 'jpeg', 'png', 'webp'].includes(doc.storage_path.split('.').pop().toLowerCase());

  const isPdf = doc.mime_type === 'application/pdf' || 
    doc.storage_path.split('.').pop().toLowerCase() === 'pdf';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-950 w-full max-w-4xl h-[85vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-350">
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/30">
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-primary-container text-on-primary-container">
              {doc.categoria}
            </span>
            <h3 className="text-xl font-headline font-bold text-primary truncate max-w-lg md:max-w-xl">
              {doc.nombre}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {url && (
              <a
                href={url}
                download
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-primary transition-colors"
                title="Descargar"
              >
                <span className="material-symbols-outlined text-xl">download</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-50 dark:bg-slate-900/20 p-6 overflow-auto flex items-center justify-center">
          {loading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          ) : url ? (
            isImage ? (
              <img
                src={url}
                alt={doc.nombre}
                className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-md border border-slate-250 dark:border-slate-800"
              />
            ) : isPdf ? (
              <iframe
                src={url}
                className="w-full h-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white"
                title={doc.nombre}
              />
            ) : (
              <div className="text-center space-y-4 max-w-sm">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl text-slate-400">description</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                    Vista previa no disponible
                  </p>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Los archivos con formato <strong>{doc.storage_path.split('.').pop().toUpperCase()}</strong> no pueden visualizarse directamente en el navegador.
                  </p>
                </div>
                <a
                  href={url}
                  download
                  className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/10 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  <span>Descargar Archivo</span>
                </a>
              </div>
            )
          ) : (
            <p className="text-sm text-slate-400 italic">No se pudo cargar la vista previa.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentoViewerModal;
