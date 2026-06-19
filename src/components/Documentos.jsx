import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import DocumentoViewerModal from './DocumentoViewerModal';

const Documentos = ({ onOpenModal }) => {
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedDocForViewer, setSelectedDocForViewer] = useState(null);

  useEffect(() => {
    fetchDocumentos();
  }, []);

  const fetchDocumentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setDocumentos(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (doc) => {
    if (window.confirm("¿Eliminar este documento?")) {
      try {
        const { error: storageError } = await supabase.storage
          .from('documentos')
          .remove([doc.storage_path]);
        if (storageError) throw storageError;

        const { error: dbError } = await supabase
          .from('documentos')
          .delete()
          .eq('id', doc.id);
        if (dbError) throw dbError;

        fetchDocumentos();
      } catch (error) {
        console.error(error);
        alert('Error al eliminar el documento');
      }
    }
  };

  const handleDownload = async (path) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .createSignedUrl(path, 60);
      if (error) throw error;
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error(error);
      alert('Error al obtener el enlace de descarga');
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateString;
  };

  const getIcon = (categoria, mimeType) => {
    if (categoria === 'contrato' || (mimeType && mimeType.includes('pdf'))) return 'description';
    if (categoria === 'factura') return 'receipt';
    if (categoria === 'escritura') return 'home_work';
    if (categoria === 'impuesto') return 'receipt_long';
    if (categoria === 'seguro') return 'security';
    return 'folder';
  };

  const getBadgeClass = (categoria) => {
    switch (categoria) {
      case 'factura':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'contrato':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'escritura':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'impuesto':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300';
      case 'seguro':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800/30 dark:text-slate-300';
    }
  };

  const filteredDocs = documentos.filter(doc => {
    const matchesSearch = doc.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.descripcion && doc.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === '' || doc.categoria === categoryFilter;
    const matchesDate = dateFilter === '' || doc.fecha === dateFilter;
    return matchesSearch && matchesCategory && matchesDate;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12 h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/30 pb-8 gap-6">
        <div className="space-y-2">
          <p className="font-label font-bold text-xs uppercase tracking-[0.3em] text-on-surface-variant">Heritage Journal • {new Date().getFullYear()}</p>
          <h2 className="text-5xl lg:text-7xl font-headline font-black text-primary tracking-tighter">Archivo de Documentos</h2>
        </div>
        <button
          onClick={() => onOpenModal()}
          className="bg-primary text-white px-8 py-3 rounded-xl font-headline font-bold flex items-center space-x-2 shadow-xl shadow-primary/10 active:scale-95 transition-all animate-in fade-in"
        >
          <span className="material-symbols-outlined">upload</span>
          <span>Subir Documento</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900/40 p-4 rounded-2xl border border-outline-variant/15">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all appearance-none"
          >
            <option value="">Todas las Categorías</option>
            <option value="factura">Factura</option>
            <option value="contrato">Contrato</option>
            <option value="escritura">Escritura</option>
            <option value="impuesto">Impuesto</option>
            <option value="seguro">Seguro</option>
            <option value="otro">Otro</option>
          </select>
        </div>
        <div className="w-full md:w-56 flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary transition-all"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-850 flex items-center justify-center border border-outline-variant/20">
                    <span className="material-symbols-outlined text-2xl text-primary">{getIcon(doc.categoria, doc.mime_type)}</span>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getBadgeClass(doc.categoria)}`}>
                    {doc.categoria}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-headline font-bold text-xl text-primary leading-tight">
                    {doc.nombre}
                  </h3>
                  <p className="text-on-surface-variant font-body text-sm leading-relaxed line-clamp-2">
                    {doc.descripcion || 'Sin descripción'}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-outline-variant/30 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-tighter">
                    {formatDate(doc.fecha)}
                  </span>
                  {doc.size_bytes && (
                    <span className="text-[9px] font-bold text-slate-400 mt-1">
                      {formatSize(doc.size_bytes)}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedDocForViewer(doc)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">visibility</span>
                  </button>
                  <button
                    onClick={() => handleDownload(doc.storage_path)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                  </button>
                  <button
                    onClick={() => onOpenModal(doc)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-850 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-slate-400">folder_open</span>
          </div>
          <p className="text-on-surface-variant italic font-body text-center">
            No se encontraron documentos en el archivo.
          </p>
        </div>
      )}
      <DocumentoViewerModal
        isOpen={!!selectedDocForViewer}
        doc={selectedDocForViewer}
        onClose={() => setSelectedDocForViewer(null)}
      />
    </div>
  );
};

export default Documentos;
