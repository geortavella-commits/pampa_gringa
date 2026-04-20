import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const Journal = ({ onOpenModal }) => {
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState([]);

  useEffect(() => {
    fetchJournalData();
  }, []);

  const fetchJournalData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('*, socios(nombre, rol)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotas(data || []);
    } catch (error) {
      console.error('Error cargando diario:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto w-full space-y-12 h-full overflow-y-auto">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant/30 pb-8 gap-6">
        <div className="space-y-2">
          <p className="font-label font-bold text-xs uppercase tracking-[0.3em] text-on-surface-variant">Heritage Journal • {new Date().getFullYear()}</p>
          <h2 className="text-5xl lg:text-7xl font-headline font-black text-primary tracking-tighter">Diario de Estrategia</h2>
        </div>
        <button 
          onClick={() => onOpenModal()}
          className="bg-primary text-white px-8 py-3 rounded-xl font-headline font-bold flex items-center space-x-2 shadow-xl shadow-primary/10 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">edit_square</span>
          <span>Redactar Nota</span>
        </button>
      </div>

      {/* Bento Grid layout for Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
        {notas.length > 0 ? notas.map((nota, i) => (
          <div 
            key={nota.id}
            onClick={() => onOpenModal(nota)}
            className={`group bg-white dark:bg-slate-900/50 p-8 rounded-2xl border border-outline-variant/10 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col justify-between cursor-pointer ${i === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}
          >
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${nota.prioridad === 'alta' ? 'bg-tertiary text-on-tertiary shadow-lg shadow-tertiary/20' : 'bg-primary-container text-on-primary-container'}`}>
                  {nota.categoria || 'Estrategia'}
                </span>
                <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-tighter">
                  {new Date(nota.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 className={`font-headline font-extrabold text-primary leading-tight group-hover:text-secondary transition-colors ${i === 0 ? 'text-5xl' : 'text-2xl'}`}>
                {nota.titulo}
              </h3>
              <p className={`text-on-surface-variant font-body leading-relaxed line-clamp-6 ${i === 0 ? 'text-xl' : 'text-sm'}`}>
                {nota.contenido}
              </p>
            </div>
            
            <div className="mt-12 flex items-center justify-between border-t border-outline-variant/30 pt-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-primary ring-1 ring-outline-variant/20">
                  {nota.socios?.nombre?.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-primary dark:text-primary-fixed leading-none">{nota.socios?.nombre}</p>
                  <p className="text-[9px] text-on-surface-variant uppercase font-bold tracking-tighter mt-1">{nota.socios?.rol}</p>
                </div>
              </div>
              <button className="text-primary hover:text-secondary opacity-40 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                <span className="material-symbols-outlined">edit_note</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-on-surface-variant italic font-body">
            El diario está esperando la primera reflexión del curador...
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
